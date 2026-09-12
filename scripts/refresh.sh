#!/bin/bash
# 一键刷新本地数据：重建本地库数据文件 + 拉取巨潮公告
# 用法：bash scripts/refresh.sh
set -e
cd "$(dirname "$0")/.."

echo "==> 重建本地库数据（宏观/财报/估值/基金重仓）"
python3 scripts/build_local_data.py

echo "==> 拉取巨潮资讯近三个月公告"
python3 scripts/fetch_announcements.py

echo "==> 完成，刷新页面即可看到最新数据"
