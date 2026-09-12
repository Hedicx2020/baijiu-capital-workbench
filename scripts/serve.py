"""带禁缓存头的本地静态服务，避免浏览器缓存旧版页面。

启动时自动把 index.html 中的 ?v= 版本号替换为启动时间戳，
即使浏览器或中间层忽略了 no-store 头也能拿到最新静态资源。

用法：python3 scripts/serve.py [端口，默认 8766]
"""

import http.server
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION = time.strftime("%Y%m%d.%H%M")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        if self.path.split("?")[0] in ("/", "/index.html"):
            self._serve_index()
            return
        super().do_GET()

    def _serve_index(self) -> None:
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        html = re.sub(r"\?v=[0-9A-Za-z.\-]+", f"?v={VERSION}", html)
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args) -> None:  # noqa: A002
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    print(f"http://127.0.0.1:{port}/ (no-store, v={VERSION})")
    server.serve_forever()
