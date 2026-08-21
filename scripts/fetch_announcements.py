"""从巨潮资讯拉取核心白酒公司的近期公告元数据（标题/日期/链接），存 data/announcements.json。

只取元数据，不下载 PDF。供 build_local_data.py 合并进 local-data.js。
用法：python3 scripts/fetch_announcements.py [起始日期 默认2026-05-21]
"""

import json
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parent.parent / "data" / "announcements.json"
ORGID_CACHE = Path(__file__).resolve().parent.parent / "data" / ".orgid_cache.json"

STOCKS = {"600519": "贵州茅台", "000858": "五粮液", "000568": "泸州老窖"}
QUERY_URL = "http://www.cninfo.com.cn/new/hisAnnouncement/query"
HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
}


def get_orgids() -> dict:
    """获取并缓存股票代码与 orgId 映射（szse_stock.json 覆盖全部 A 股）。"""
    if ORGID_CACHE.exists():
        return json.loads(ORGID_CACHE.read_text(encoding="utf-8"))
    resp = requests.get("http://www.cninfo.com.cn/new/data/szse_stock.json", headers=HEADERS, timeout=15)
    org_map = {item["code"]: item["orgId"] for item in resp.json().get("stockList", [])}
    ORGID_CACHE.write_text(json.dumps(org_map), encoding="utf-8")
    return org_map


def fetch_one(code: str, name: str, org_id: str, start: str, end: str, pages: int = 2) -> list[dict]:
    """分页拉取单只股票的全类型公告元数据。"""
    items = []
    for page in range(1, pages + 1):
        query = {
            "pageNum": str(page), "pageSize": "30", "column": "szse", "tabName": "fulltext",
            "plate": "", "stock": f"{code},{org_id}", "searchkey": "", "secid": "",
            "category": "", "trade": "", "seDate": f"{start}~{end}",
            "sortName": "time", "sortType": "desc", "isHLtitle": "true",
        }
        resp = requests.post(QUERY_URL, data=query, headers=HEADERS, timeout=15)
        data = json.loads(resp.content)
        if not data.get("announcements"):
            break
        for value in data["announcements"]:
            title = value.get("announcementTitle", "")
            if "摘要" in title or "英文" in title:
                continue
            ts = value.get("announcementTime")
            items.append({
                "code": code,
                "company": name,
                "title": title,
                "date": datetime.fromtimestamp(ts / 1000).strftime("%Y-%m-%d") if ts else "",
                "url": f"http://static.cninfo.com.cn/{value.get('adjunctUrl', '')}",
            })
        time.sleep(0.3)
    return items


def main() -> None:
    start = sys.argv[1] if len(sys.argv) > 1 else "2026-05-21"
    end = datetime.now().strftime("%Y-%m-%d")
    org_map = get_orgids()
    all_items = []
    for code, name in STOCKS.items():
        items = fetch_one(code, name, org_map[code], start, end)
        print(f"{name}({code}): {len(items)} 条")
        all_items.extend(items)
    all_items.sort(key=lambda x: x["date"], reverse=True)
    OUT.write_text(json.dumps({"asOf": end, "since": start, "source": "巨潮资讯网 hisAnnouncement/query", "items": all_items}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"written {OUT} ({len(all_items)} 条)")


if __name__ == "__main__":
    main()
