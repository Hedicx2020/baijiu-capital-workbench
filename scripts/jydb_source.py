"""JYDB（JyPy 连接的聚源数据库）拉取层。

连接串获取顺序（均不落盘到本仓库）：
  1. 环境变量 JYDB_ENGINE_PRIMARY（格式 user:password@host:port/database，无协议头）
  2. ~/gh_quant_ui/.env 中的 JYDB_ENGINE_PRIMARY（gh_quant_ui 本机配置）

注意：主库强制 TLS（gh_quant_ui 桌面端同样对 primary 启用 TLS REQUIRED），
本模块使用 TLS 但不校验 CA（内网镜像库，无公开 CA 证书）。

所有拉取按块容错：任一块失败返回 None，调用方回退到本地 parquet。
查询一律走 InnerCode（有索引），避免 SecuCode 全表扫描。
"""

from __future__ import annotations

import os
import re
import ssl
import time
from pathlib import Path

import sqlalchemy

# 六家公司 + 中证白酒指数的聚源 InnerCode（已用 SecuMain 核对名称；改动公司时需重新核对）
INNER_CODES = {
    "maotai": 1679,
    "wuliangye": 496,
    "guojiao": 256,
    "fenjiu": 2044,
    "yanghe": 9033,
    "gujing": 282,
}
INDEX_INNER = {"industry": 50238}  # 中证白酒 399997
COMPANY_NAMES = ["茅台", "五粮液", "泸州老窖", "汾酒", "洋河", "古井"]

KLINE_SINCE = "2023-01-01"


def get_engine_string() -> str:
    """从环境变量或 gh_quant_ui/.env 读取主库连接串。"""
    eng = os.environ.get("JYDB_ENGINE_PRIMARY", "").strip()
    if eng:
        return eng
    env_file = Path.home() / "gh_quant_ui" / ".env"
    if env_file.exists():
        m = re.search(r"^JYDB_ENGINE_PRIMARY=(.+)$", env_file.read_text(encoding="utf-8"), re.M)
        if m:
            return m.group(1).strip()
    return ""


def connect():
    """建立 TLS MySQL 连接（不校验 CA）。失败返回 None。"""
    eng_str = get_engine_string()
    if not eng_str:
        print("  jydb: 未配置 JYDB_ENGINE_PRIMARY，跳过")
        return None
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        eng = sqlalchemy.create_engine(
            f"mysql+pymysql://{eng_str}",
            connect_args={"ssl": ctx, "connect_timeout": 10},
            pool_pre_ping=True,
        )
        with eng.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
        return eng
    except Exception as e:  # noqa: BLE001
        print(f"  jydb: 连接失败（{type(e).__name__}），回退本地 parquet")
        return None


def _q(conn, sql: str, params: dict | None = None) -> list[sqlalchemy.engine.Row]:
    t = time.time()
    rows = conn.execute(sqlalchemy.text(sql), params or {}).fetchall()
    print(f"    [{time.time() - t:5.1f}s] {sql.splitlines()[0][:72]}... -> {len(rows)} 行")
    return rows


def _f(v, digits=2):
    return round(float(v), digits) if v is not None else None


def fetch_kline(conn) -> dict | None:
    """六家股票日K（QT_DailyQuote，InnerCode 有索引）。

    中证白酒指数行情在 QT_CSIIndexQuote（IndexCode 列，镜像库该列无索引、查询过慢），
    由 build_local_data.py 用本地 parquet（ashare_index_price，终端同步）补齐。
    """
    try:
        out = {}
        rows = _q(conn, """
            SELECT InnerCode, TradingDay, OpenPrice, HighPrice, LowPrice, ClosePrice
            FROM QT_DailyQuote
            WHERE InnerCode IN :codes AND TradingDay >= :since
            ORDER BY TradingDay
        """, {"codes": tuple(INNER_CODES.values()), "since": KLINE_SINCE})
        by_code: dict[int, list] = {}
        for ic, day, o, h, l, c in rows:
            by_code.setdefault(ic, []).append([day.strftime("%Y-%m-%d"), _f(o), _f(h), _f(l), _f(c)])
        for key, ic in INNER_CODES.items():
            if ic in by_code:
                out[key] = {"code": ic, "rows": by_code[ic]}
        return out or None
    except Exception as e:  # noqa: BLE001
        print(f"    kline 失败: {type(e).__name__} {e}")
        return None


def _recent_quarter_ends(n: int = 4) -> list[str]:
    """最近 n 个季末日期字符串（YYYY-MM-DD）。"""
    today = time.strftime("%Y-%m-%d")
    year = int(today[:4])
    ends = []
    for y in (year, year - 1):
        ends += [f"{y}-12-31", f"{y}-09-30", f"{y}-06-30", f"{y}-03-31"]
    return [d for d in ends if d <= today][:n]


def fetch_fund_holding(conn) -> dict | None:
    """基金重仓（mf_keystockportfolio），最近两个有数据的季末对比。"""
    try:
        candidates = _recent_quarter_ends(4)
        rows = _q(conn, """
            SELECT StockInnerCode, ReportDate, COUNT(*) AS n, SUM(MarketValue) AS mv
            FROM mf_keystockportfolio
            WHERE ReportDate IN :dates AND StockInnerCode IN :codes
            GROUP BY StockInnerCode, ReportDate
        """, {"dates": tuple(candidates), "codes": tuple(INNER_CODES.values())})
        by_date: dict[str, dict] = {}
        for ic, rd, n, mv in rows:
            by_date.setdefault(rd.strftime("%Y-%m-%d"), {})[ic] = {"funds": int(n), "mv": float(mv or 0) / 1e8}
        used = [d for d in candidates if d in by_date][:2]
        if len(used) < 2:
            return None
        cur_d, prev_d = used
        companies = {}
        for key, ic in INNER_CODES.items():
            cur = by_date.get(cur_d, {}).get(ic, {"funds": 0, "mv": 0.0})
            prev = by_date.get(prev_d, {}).get(ic, {"funds": 0, "mv": 0.0})
            companies[key] = {
                "funds": cur["funds"], "marketValue": round(cur["mv"], 1),
                "prevFunds": prev["funds"], "prevMarketValue": round(prev["mv"], 1),
                "mvChange": round(cur["mv"] / prev["mv"] - 1, 4) if prev["mv"] else None,
            }
        return {
            "period": cur_d,
            "prevPeriod": prev_d,
            "source": "JYDB mf_keystockportfolio（基金重仓股）",
            "companies": companies,
        }
    except Exception as e:  # noqa: BLE001
        print(f"    fundHolding 失败: {type(e).__name__} {e}")
        return None


def fetch_forecast(conn) -> dict | None:
    """一致预期（C_EX_ProForStat）：每家公司最近统计日的 2026/27/28E。

    镜像库 JOIN+GROUP BY 过慢，改为逐公司 ORDER BY EndDate DESC LIMIT 12 后在内存去重。
    """
    try:
        by_company: dict = {}
        for key, ic in INNER_CODES.items():
            rows = _q(conn, """
                SELECT EndDate, ForecastYear, EPSAvg, NPAvg, MainIncomeAvg,
                       EPSInstNumber, NPInstNumber, MIInstNumber, IncomeGR, NPYOY
                FROM C_EX_ProForStat
                WHERE InnerCode = :ic
                ORDER BY EndDate DESC
                LIMIT 12
            """, {"ic": ic})
            if not rows:
                continue
            latest = rows[0][0]
            years = []
            seen = set()
            for r in rows:
                end_date, fy, eps, np_, mi, eps_n, np_n, mi_n, igr, npyoy = r
                if end_date != latest:
                    continue
                fy_year = fy.year if hasattr(fy, "year") else int(str(fy)[:4])
                if fy_year in seen or fy_year not in (2026, 2027, 2028):
                    continue
                seen.add(fy_year)
                years.append({
                    "year": str(fy_year),
                    "epsAvg": _f(eps),
                    # 聚源口径：NPAvg 为元（/1e8→亿元），MainIncomeAvg 为万元（/1e4→亿元），两列单位不同
                    "npAvgYi": _f(float(np_) / 1e8, 1) if np_ is not None else None,
                    "revenueAvgYi": _f(float(mi) / 1e4, 1) if mi is not None else None,
                    "npOrgs": int(np_n) if np_n is not None else None,
                    "revOrgs": int(mi_n) if mi_n is not None else None,
                })
            if years:
                by_company[key] = {"asOf": latest.strftime("%Y-%m-%d"), "years": sorted(years, key=lambda y: y["year"])}
        return {"source": "JYDB C_EX_ProForStat 一致预期（机构均值）", "companies": by_company} if by_company else None
    except Exception as e:  # noqa: BLE001
        print(f"    forecast 失败: {type(e).__name__} {e}")
        return None


def fetch_target_price(conn) -> dict | None:
    """目标价统计（C_EX_TargetPrice）：最近统计日的 30/90/180 日窗口（逐公司查询）。"""
    try:
        by_company: dict = {}
        for key, ic in INNER_CODES.items():
            rows = _q(conn, """
                SELECT EndDate, StatisPeriod, TargetPriceAvg, TargetPriceMax,
                       TargetPriceMin, TargetPriceMedian, NOrgTargetPrice, NResearcher
                FROM C_EX_TargetPrice
                WHERE InnerCode = :ic
                ORDER BY EndDate DESC
                LIMIT 12
            """, {"ic": ic})
            if not rows:
                continue
            latest = rows[0][0]
            windows = []
            seen = set()
            for end_date, period, avg, mx, mn, med, norg, nres in rows:
                if end_date != latest or period in seen or int(period) not in (30, 90, 180):
                    continue
                seen.add(period)
                windows.append({
                    "period": int(period), "avg": _f(avg), "max": _f(mx), "min": _f(mn),
                    "median": _f(med), "orgs": int(norg) if norg is not None else None,
                    "researchers": int(nres) if nres is not None else None,
                })
            if windows:
                by_company[key] = {"asOf": latest.strftime("%Y-%m-%d"), "windows": sorted(windows, key=lambda w: w["period"])}
        return {"source": "JYDB C_EX_TargetPrice 目标价统计", "companies": by_company} if by_company else None
    except Exception as e:  # noqa: BLE001
        print(f"    targetPrice 失败: {type(e).__name__} {e}")
        return None


def fetch_trading_activity(conn) -> dict | None:
    """交易活跃度（QT_DailyQuote）：近 40 日成交额与收盘价。

    注：QT_Performance（换手率/市值）在镜像库止步 2023-05，不可用；
    成交额用 QT_DailyQuote（随行情日更），换手率待接入自由流通股本后补充。
    """
    try:
        since = time.strftime("%Y-%m-%d", time.localtime(time.time() - 45 * 86400))
        rows = _q(conn, """
            SELECT InnerCode, TradingDay, ClosePrice, TurnoverValue
            FROM QT_DailyQuote
            WHERE InnerCode IN :codes AND TradingDay >= :since
            ORDER BY TradingDay
        """, {"codes": tuple(INNER_CODES.values()), "since": since})
        by_company: dict = {}
        for ic, day, close, tv in rows:
            key = next((k for k, v in INNER_CODES.items() if v == ic), None)
            if not key:
                continue
            by_company.setdefault(key, []).append({
                "date": day.strftime("%Y-%m-%d"),
                "close": _f(close),
                "turnoverValueYi": _f(float(tv) / 1e8) if tv is not None else None,
            })
        return {"source": "JYDB QT_DailyQuote（成交额）", "companies": by_company} if by_company else None
    except Exception as e:  # noqa: BLE001
        print(f"    trading 失败: {type(e).__name__} {e}")
        return None


def fetch_research_reports(conn, days: int = 75) -> list | None:
    """最新研报（C_RR_ResearchReport）：标题含六家公司名或白酒/食品饮料关键词。"""
    try:
        likes = " OR ".join(["Title LIKE :kw%d" % i for i in range(len(COMPANY_NAMES) + 2)])
        params = {f"kw{i}": f"%{name}%" for i, name in enumerate(COMPANY_NAMES)}
        params[f"kw{len(COMPANY_NAMES)}"] = "%白酒%"
        params[f"kw{len(COMPANY_NAMES) + 1}"] = "%食品饮料%"
        params["since"] = time.strftime("%Y-%m-%d", time.localtime(time.time() - days * 86400))
        rows = _q(conn, f"""
            SELECT InfoPublDate, OrgName, Title, ReportType, ResearchDepth, PageNum
            FROM C_RR_ResearchReport
            WHERE InfoPublDate >= :since AND ({likes})
            ORDER BY InfoPublDate DESC
            LIMIT 60
        """, params)
        out = []
        for pub, org, title, rtype, depth, pages in rows:
            out.append({
                "date": pub.strftime("%Y-%m-%d") if pub else None,
                "org": (org or "").replace("股份有限公司", ""),
                "title": title,
                "depth": int(depth) if depth is not None else None,
                "pages": int(pages) if pages is not None else None,
            })
        return out or None
    except Exception as e:  # noqa: BLE001
        print(f"    researchReports 失败: {type(e).__name__} {e}")
        return None


def fetch_all() -> dict | None:
    """连接 JYDB 并拉取全部数据块；连接失败返回 None（整体回退本地 parquet）。"""
    eng = connect()
    if eng is None:
        return None
    print("  jydb: 已连接（TLS），开始拉取")
    out: dict = {"source": "JYDB（JyPy MySQL 主库, TLS）"}
    with eng.connect() as conn:
        # 单条 SELECT 超时 150s（镜像库部分表无索引，慢查询宁缺毋滥、超时的块自动回退 parquet）
        conn.execute(sqlalchemy.text("SET SESSION max_execution_time = 150000"))
        for name, fn in [
            ("kline", fetch_kline),
            ("fundHolding", fetch_fund_holding),
            ("forecast", fetch_forecast),
            ("targetPrice", fetch_target_price),
            ("trading", fetch_trading_activity),
            ("researchReports", fetch_research_reports),
        ]:
            try:
                out[name] = fn(conn)
            except Exception as e:  # noqa: BLE001
                print(f"    {name} 异常中断: {type(e).__name__}")
                out[name] = None
    eng.dispose()
    return out


if __name__ == "__main__":
    result = fetch_all()
    if result:
        for k, v in result.items():
            if k == "source":
                continue
            print(k, "->", "OK" if v else "FAILED")
