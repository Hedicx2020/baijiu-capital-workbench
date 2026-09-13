"""从本地 parquet 数据库提取白酒研究网页所需数据，生成 data/local-data.js。

真实数据：宏观（GDP/CPI/M2/PPI/固投）、三家公司季度财务、估值、基金重仓。
本地缺口：社零、地产、区域结构 —— 用固定种子随机数模拟，统一标注 DEMO。
用法：python3 scripts/build_local_data.py
"""

import json
import os
import random
import time
from pathlib import Path

import pandas as pd

LD = Path.home() / "local_data"
OUT = Path(__file__).resolve().parent.parent / "data" / "local-data.js"

COMPANIES = {
    "maotai": {"code": "600519", "name": "贵州茅台"},
    "wuliangye": {"code": "000858", "name": "五粮液"},
    "guojiao": {"code": "000568", "name": "泸州老窖"},
    "fenjiu": {"code": "600809", "name": "山西汾酒"},
    "yanghe": {"code": "002304", "name": "洋河股份"},
    "gujing": {"code": "000596", "name": "古井贡酒"},
}

# A股上市白酒公司（总览表用；珍酒李渡为港股，待接入）
LISTED_BAIJIU = [
    ("600519", "贵州茅台"), ("000858", "五粮液"), ("000568", "泸州老窖"), ("600809", "山西汾酒"),
    ("002304", "洋河股份"), ("000596", "古井贡酒"), ("603369", "今世缘"), ("603198", "迎驾贡酒"),
    ("600702", "舍得酒业"), ("600779", "水井坊"), ("000799", "酒鬼酒"), ("603589", "口子窖"),
    ("600559", "老白干酒"), ("600199", "金种子酒"), ("603919", "金徽酒"), ("600197", "伊力特"),
]

MACRO_REAL = [
    ("gdp", "macro_gdp", "GDP(不变价):累计同比:季", "GDP 不变价累计同比", "%", "季度"),
    ("cpi", "macro_cpi", "CPI:当期同比:月", "CPI 当月同比", "%", "月度"),
    ("m2", "macro_money_supply", "货币和准货币(M2):同比:月", "M2 同比", "%", "月度"),
    ("ppi", "macro_ppi", "PPI:全部工业品:当期同比:月", "PPI 当月同比", "%", "月度"),
    ("fai", "macro_fixed_asset_investment", "固定资产投资额(不含农户):累计同比:月", "固定资产投资累计同比", "%", "月度"),
]


def extract_macro() -> list[dict]:
    """提取宏观指标真实序列（近 14 期）。"""
    out = []
    for key, table, indicator, label, unit, freq in MACRO_REAL:
        df = pd.read_parquet(LD / f"{table}.parquet", columns=["date", "indicator_name", "data_value"])
        sub = (
            df[df.indicator_name == indicator]
            .sort_values("date")
            .drop_duplicates("date", keep="last")
            .tail(14)
        )
        series = [
            {"date": d.strftime("%Y-%m-%d"), "value": round(float(v), 2)}
            for d, v in zip(sub.date, sub.data_value)
            if pd.notna(v)
        ]
        if not series:
            continue
        out.append({
            "key": key,
            "name": label,
            "unit": unit,
            "freq": freq,
            "asOf": series[-1]["date"],
            "latest": series[-1]["value"],
            "prev": series[-2]["value"] if len(series) > 1 else None,
            "series": series,
            "source": f"本地库 {table}",
            "demo": False,
        })
    return out


def simulate_macro_demo() -> list[dict]:
    """本地库缺口指标：统计局已核验值（部分序列），完整月度序列待接入 iFinD/统计局批量接口。

    数值来自国家统计局 2026-08-17 发布稿（社零/餐饮/地产）与消费者信心指数月度发布
    （东方财富数据中心整理，统计局口径）。不再使用随机模拟；序列仅含已核验月份。
    """
    specs = [
        ("retail", "社零总额当月同比", "%", "月度", "国家统计局 2026-08-17发布 · 序列待接入",
         [("2026-06-30", 1.0), ("2026-07-31", 0.6)]),
        ("catering", "餐饮收入当月同比", "%", "月度", "国家统计局 2026-08-17发布 · 序列待接入",
         [("2026-06-30", 1.2), ("2026-07-31", 1.4)]),
        ("estate", "房地产开发投资累计同比", "%", "月度", "国家统计局 2026-08-17发布 · 序列待接入",
         [("2026-06-30", -18.0), ("2026-07-31", -19.2)]),
        ("confidence", "消费者信心指数", "点", "月度", "国家统计局口径（东方财富整理）· 序列待接入",
         [("2026-01-31", 90.6), ("2026-02-28", 91.6), ("2026-03-31", 90.0),
          ("2026-04-30", 89.0), ("2026-05-31", 89.9), ("2026-06-30", 89.4),
          ("2026-07-31", 89.2)]),
    ]
    out = []
    for key, label, unit, freq, source, points in specs:
        series = [{"date": d, "value": v} for d, v in points]
        out.append({
            "key": key,
            "name": label,
            "unit": unit,
            "freq": freq,
            "asOf": series[-1]["date"],
            "latest": series[-1]["value"],
            "prev": series[-2]["value"] if len(series) > 1 else None,
            "series": series,
            "source": source,
            "demo": False,
            "partial": True,
        })
    return out


def load_quarters() -> dict[str, pd.DataFrame]:
    """读取三家公司单季度利润表（去重取最新版本）。"""
    cols = ["stock_code", "end_date", "total_operating_revenue", "operating_revenue",
            "operating_cost", "operating_expense", "operating_tax_surcharges",
            "administration_expense", "net_profit", "np_parent_company_owners", "basic_eps"]
    inc = pd.read_parquet(LD / "ashare_stock_income_q.parquet", columns=cols)
    return {
        key: (inc[inc.stock_code == cfg["code"]]
              .sort_values("end_date")
              .drop_duplicates("end_date", keep="last")
              .reset_index(drop=True))
        for key, cfg in COMPANIES.items()
    }


def load_balance_flow() -> tuple[dict, dict]:
    bal_cols = ["stock_code", "end_date", "if_merged", "contract_liability", "inventories", "total_shareholder_equity"]
    cf_cols = ["stock_code", "end_date", "net_operate_cash_flow"]
    bal = pd.read_parquet(LD / "ashare_stock_balance.parquet", columns=bal_cols)
    bal = bal[bal.if_merged == 1]  # 合并报表口径
    cf = pd.read_parquet(LD / "ashare_stock_cashflow_q.parquet", columns=cf_cols)
    bal_d = {k: bal[bal.stock_code == c["code"]].sort_values("end_date").drop_duplicates("end_date", keep="last") for k, c in COMPANIES.items()}
    cf_d = {k: cf[cf.stock_code == c["code"]].sort_values("end_date").drop_duplicates("end_date", keep="last") for k, c in COMPANIES.items()}
    return bal_d, cf_d


def y1e8(v) -> float | None:
    return round(float(v) / 1e8, 1) if pd.notna(v) else None


def build_quarterly(inc: dict, bal: dict, cf: dict) -> dict:
    """组装近 9 个单季：收入/归母及同比、盈利率、合同负债、存货、经营现金流。"""
    result = {}
    for key, cfg in COMPANIES.items():
        df = inc[key].tail(9).reset_index(drop=True)
        b, c = bal[key], cf[key]
        quarters = []
        for i, row in df.iterrows():
            end = row.end_date.strftime("%Y-%m-%d")
            prev = df[(df.end_date.dt.month == row.end_date.month) & (df.end_date.dt.year == row.end_date.year - 1)]
            prev_row = prev.iloc[-1] if len(prev) else None
            rev_yoy = (row.total_operating_revenue / prev_row.total_operating_revenue - 1) if prev_row is not None else None
            np_yoy = (row.np_parent_company_owners / prev_row.np_parent_company_owners - 1) if prev_row is not None else None
            brow = b[b.end_date == row.end_date]
            crow = c[c.end_date == row.end_date]
            rev = row.total_operating_revenue
            quarters.append({
                "date": end,
                "revenue": y1e8(rev),
                "revenueYoY": round(float(rev_yoy), 4) if rev_yoy is not None and pd.notna(rev_yoy) else None,
                "netProfit": y1e8(row.np_parent_company_owners),
                "netProfitYoY": round(float(np_yoy), 4) if np_yoy is not None and pd.notna(np_yoy) else None,
                "grossMargin": round(float(1 - row.operating_cost / row.operating_revenue), 4) if pd.notna(row.operating_cost) else None,
                "netMargin": round(float(row.net_profit / rev), 4) if pd.notna(row.net_profit) else None,
                "salesExpenseRatio": round(float(row.operating_expense / rev), 4) if pd.notna(row.operating_expense) else None,
                "taxRatio": round(float(row.operating_tax_surcharges / rev), 4) if pd.notna(row.operating_tax_surcharges) else None,
                "contractLiability": y1e8(brow.contract_liability.iloc[0]) if len(brow) else None,
                "inventories": y1e8(brow.inventories.iloc[0]) if len(brow) else None,
                "operatingCashFlow": y1e8(crow.net_operate_cash_flow.iloc[0]) if len(crow) else None,
                "eps": round(float(row.basic_eps), 2) if pd.notna(row.basic_eps) else None,
            })
        result[key] = {
            "company": cfg["name"],
            "asOf": quarters[-1]["date"],
            "unit": "亿元（单季度口径）",
            "quarters": quarters,
        }
    return result


def build_valuation() -> dict:
    v = pd.read_parquet(LD / "ashare_stock_value.parquet", columns=["stock_code", "date", "pe_ttm", "pb_lf", "dv"])
    latest = v[v.stock_code.isin([c["code"] for c in COMPANIES.values()])]
    as_of = latest.date.max().strftime("%Y-%m-%d")
    latest = latest[latest.date == latest.date.max()]
    out = {"asOf": as_of, "source": "本地库 ashare_stock_value", "companies": {}}
    for key, cfg in COMPANIES.items():
        row = latest[latest.stock_code == cfg["code"]].iloc[0]
        out["companies"][key] = {
            "peTtm": round(float(row.pe_ttm), 1),
            "pb": round(float(row.pb_lf), 2),
            "dividendYield": round(float(row.dv), 2),
        }
    return out


def build_fund_holding() -> dict:
    fk = pd.read_parquet(LD / "fund_keystock.parquet", columns=["date", "stock_code", "market_value", "ration_in_nv"])
    period, prev_period = pd.Timestamp("2026-06-30"), pd.Timestamp("2026-03-31")
    out = {"period": "2026-06-30", "prevPeriod": "2026-03-31", "source": "本地库 fund_keystock（基金重仓股）", "companies": {}}
    for key, cfg in COMPANIES.items():
        cur = fk[(fk.date == period) & (fk.stock_code == cfg["code"])]
        prev = fk[(fk.date == prev_period) & (fk.stock_code == cfg["code"])]
        cur_mv, prev_mv = cur.market_value.sum() / 1e8, prev.market_value.sum() / 1e8
        out["companies"][key] = {
            "funds": int(len(cur)),
            "marketValue": round(float(cur_mv), 1),
            "prevFunds": int(len(prev)),
            "prevMarketValue": round(float(prev_mv), 1),
            "mvChange": round(float(cur_mv / prev_mv - 1), 4) if prev_mv else None,
        }
    return out


def build_region_demo() -> dict:
    """区域收入结构：固定种子随机扰动锚定值，归一化为 100（DEMO）。"""
    rng = random.Random(20260821)
    anchors = {
        "maotai": [("华东", 31), ("华北", 19), ("华南", 17), ("西南", 14), ("华中", 10)],
        "wuliangye": [("华东", 33), ("西南", 24), ("华北", 14), ("华南", 13), ("华中", 9)],
        "guojiao": [("西南", 38), ("华北", 19), ("华东", 16), ("华中", 12), ("华南", 8)],
    }
    out = {"type": "DEMO 随机模拟", "note": "区域结构为演示用随机模拟值，待年报分地区口径替换", "companies": {}}
    for key, pairs in anchors.items():
        jittered = [max(a + rng.uniform(-3, 3), 1) for _, a in pairs]
        total = sum(jittered)
        shares = [round(v / total * 100) for v in jittered]
        shares[0] += 100 - sum(shares)
        out["companies"][key] = [{"region": r, "share": s} for (r, _), s in zip(pairs, shares)]
    return out


def build_listed_overview(inc_all: pd.DataFrame, val: pd.DataFrame, fk: pd.DataFrame) -> dict:
    """16 家 A 股上市酒企总览：最新单季收入/利润及同比、毛利率、PE、股息率、重仓基金。"""
    rows = []
    for code, name in LISTED_BAIJIU:
        sub = inc_all[inc_all.stock_code == code].sort_values("end_date").drop_duplicates("end_date", keep="last")
        if sub.empty:
            continue
        latest = sub.iloc[-1]
        prev = sub[(sub.end_date.dt.month == latest.end_date.month) & (sub.end_date.dt.year == latest.end_date.year - 1)]
        prev_row = prev.iloc[-1] if len(prev) else None
        v = val[val.stock_code == code]
        vrow = v[v.date == v.date.max()].iloc[0] if len(v) else None
        f = fk[(fk.date == pd.Timestamp("2026-06-30")) & (fk.stock_code == code)]
        rows.append({
            "code": code,
            "name": name,
            "period": latest.end_date.strftime("%Y-%m-%d"),
            "revenue": y1e8(latest.total_operating_revenue),
            "revenueYoY": round(float(latest.total_operating_revenue / prev_row.total_operating_revenue - 1), 4) if prev_row is not None else None,
            "netProfit": y1e8(latest.np_parent_company_owners),
            "netProfitYoY": round(float(latest.np_parent_company_owners / prev_row.np_parent_company_owners - 1), 4) if prev_row is not None else None,
            "grossMargin": round(float(1 - latest.operating_cost / latest.operating_revenue), 4) if pd.notna(latest.operating_cost) else None,
            "peTtm": round(float(vrow.pe_ttm), 1) if vrow is not None and pd.notna(vrow.pe_ttm) else None,
            "dividendYield": round(float(vrow.dv), 2) if vrow is not None and pd.notna(vrow.dv) else None,
            "funds": int(len(f)),
            "fundMarketValue": round(float(f.market_value.sum() / 1e8), 1),
        })
    return {"unit": "亿元（单季度）", "valuationAsOf": "2026-08-18", "fundPeriod": "2026-06-30", "rows": rows}


def build_extra_metrics(inc: dict, bal: dict) -> dict:
    """三家核心公司补充指标：管理费用率（最新季）与 ROE TTM（近四季归母/净资产）。"""
    out = {}
    for key in COMPANIES:
        df, b = inc[key], bal[key]
        latest = df.iloc[-1]
        ttm_np = df.tail(4).np_parent_company_owners.sum()
        equity = b.iloc[-1].total_shareholder_equity
        out[key] = {
            "adminExpenseRatio": round(float(latest.administration_expense / latest.total_operating_revenue), 4) if pd.notna(latest.administration_expense) else None,
            "roeTtm": round(float(ttm_np / equity), 4) if pd.notna(equity) else None,
            "asOf": latest.end_date.strftime("%Y-%m-%d"),
        }
    return out


def load_announcements() -> dict:
    """合并巨潮公告元数据（需先运行 fetch_announcements.py）。"""
    path = Path(__file__).resolve().parent.parent / "data" / "announcements.json"
    if not path.exists():
        return {"asOf": None, "items": []}
    return json.loads(path.read_text(encoding="utf-8"))


KLINE_SINCE = "2023-01-01"
LIQUOR_INDEX = {"code": "399997", "name": "中证白酒指数"}


def build_kline() -> dict:
    """复盘模块K线：中证白酒指数 + 三家个股日线（开高低收，2023年以来）。"""
    def to_rows(df: pd.DataFrame) -> list[list]:
        return [
            [d.strftime("%Y-%m-%d"), round(float(o), 2), round(float(h), 2), round(float(lo), 2), round(float(c), 2)]
            for d, o, h, lo, c in zip(df.date, df.open, df.high, df.low, df.close)
        ]

    stocks = pd.read_parquet(
        LD / "ashare_stock_price.parquet",
        columns=["stock_code", "date", "open", "high", "low", "close"],
        filters=[("stock_code", "in", [v["code"] for v in COMPANIES.values()])],
    )
    stocks = stocks[stocks.date >= pd.Timestamp(KLINE_SINCE)].sort_values("date")
    idx = pd.read_parquet(
        LD / "ashare_index_price.parquet",
        columns=["index_code", "date", "open", "high", "low", "close"],
        filters=[("index_code", "==", LIQUOR_INDEX["code"])],
    )
    idx = idx[idx.date >= pd.Timestamp(KLINE_SINCE)].sort_values("date")

    out: dict = {"since": KLINE_SINCE, "industry": {**LIQUOR_INDEX, "rows": to_rows(idx)}}
    for key, meta in COMPANIES.items():
        out[key] = {"code": meta["code"], "name": meta["name"],
                    "rows": to_rows(stocks[stocks.stock_code == meta["code"]])}
    return out


def main() -> None:
    macro = extract_macro() + simulate_macro_demo()
    inc = load_quarters()
    bal, cf = load_balance_flow()
    # 总览与补充指标用的全量表
    inc_all = pd.read_parquet(LD / "ashare_stock_income_q.parquet",
                              columns=["stock_code", "end_date", "total_operating_revenue", "operating_revenue", "operating_cost", "np_parent_company_owners"])
    val_all = pd.read_parquet(LD / "ashare_stock_value.parquet", columns=["stock_code", "date", "pe_ttm", "dv"])
    fk_all = pd.read_parquet(LD / "fund_keystock.parquet", columns=["date", "stock_code", "market_value"])

    # JYDB（JyPy 连接的聚源数据库）优先：行情/重仓/一致预期/目标价/交易活跃度/研报
    jydb = None
    try:
        import jydb_source
        jydb = jydb_source.fetch_all()
    except Exception as e:  # noqa: BLE001
        print(f"  jydb 模块不可用: {type(e).__name__} {e}")

    kline = build_kline()
    if jydb and jydb.get("kline"):
        for key, block in jydb["kline"].items():
            if key in kline and block.get("rows"):
                kline[key]["rows"] = block["rows"]
        kline_source = "JYDB QT_DailyQuote（个股）+ 本地库 ashare_index_price（指数）"
    else:
        kline_source = "本地库 ashare_stock_price / ashare_index_price"
    kline["source"] = kline_source

    fund_holding = (jydb or {}).get("fundHolding") or build_fund_holding()

    payload = {
        "schemaVersion": 2,
        "generatedAt": time.strftime("%Y-%m-%d"),
        "dataSource": "JYDB优先，本地parquet回退",
        "macro": macro,
        "companyQuarterly": build_quarterly(inc, bal, cf),
        "quarterlySource": "本地库 ashare_stock_income_q / balance / cashflow_q（单季度口径，合并报表，去重取最新版本）",
        "extraMetrics": build_extra_metrics(inc, bal),
        "listedOverview": build_listed_overview(inc_all, val_all, fk_all),
        "valuation": build_valuation(),
        "fundHolding": fund_holding,
        "regionDemo": build_region_demo(),
        "announcements": load_announcements(),
        "kline": kline,
        "forecast": (jydb or {}).get("forecast"),
        "targetPrice": (jydb or {}).get("targetPrice"),
        "trading": (jydb or {}).get("trading"),
        "researchReports": (jydb or {}).get("researchReports"),
    }
    # 一致预期的同比基准：用本地财报库 2025 年四个单季加总（与一致预期分列，口径为报表口径）
    if payload["forecast"] and payload["forecast"].get("companies"):
        for key, fc in payload["forecast"]["companies"].items():
            quarters = payload["companyQuarterly"].get(key, {}).get("quarters", [])
            q2025 = [q for q in quarters if q["date"].startswith("2025")]
            if len(q2025) == 4:
                rev = sum(q["revenue"] for q in q2025 if q.get("revenue"))
                np_ = sum(q["netProfit"] for q in q2025 if q.get("netProfit"))
                fc["base2025"] = {"revenue": round(rev, 1), "netProfit": round(np_, 1), "source": "本地库 2025 四季加总"}
    js = "window.WHITE_LIQUOR_LOCAL = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    js = "window.WHITE_LIQUOR_LOCAL = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"written {OUT} ({len(js)} bytes)")
    for m in macro:
        print(f"  {m['key']}: {m['latest']} @ {m['asOf']} demo={m['demo']}")
    for key in COMPANIES:
        q = payload["companyQuarterly"][key]["quarters"][-1]
        print(f"  {key} 最新季 {q['date']}: 收入{q['revenue']}亿 归母{q['netProfit']}亿 毛利率{q['grossMargin']}")
    print("  extraMetrics:", payload["extraMetrics"])
    print("  listedOverview rows:", len(payload["listedOverview"]["rows"]))
    print("  valuation:", payload["valuation"]["companies"])
    print("  fundHolding:", payload["fundHolding"]["companies"])
    print("  announcements:", len(payload["announcements"].get("items", [])))
    print("  kline:", {k: len(v["rows"]) for k, v in payload["kline"].items() if isinstance(v, dict)})


if __name__ == "__main__":
    main()
