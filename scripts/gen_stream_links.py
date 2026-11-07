# -*- coding: utf-8 -*-
"""
gen_stream_links.py — 为专辑生成各串流平台的搜索链接(待人工核对版)

用法:
  python scripts/gen_stream_links.py --album beethoven-5-kleiber
  python scripts/gen_stream_links.py --all-missing

行为:
  读取 src/content/albums/<slug>.yaml,按专辑标题与主要演奏者生成
  Apple Music(大陆店)/网易云音乐/QQ音乐 的搜索链接 YAML 片段。
  生成的是「搜索入口」(verified: false);人工点开核对到精确专辑页后,
  替换 url 并把 verified 改为 true —— 这是串流链接的固定工作流。

注意:本脚本只做字符串拼接,不发请求;搜索词策略 = 演奏者 + 标题核心词。
"""
import argparse
import re
import sys
import urllib.parse
from pathlib import Path

ALBUMS_DIR = Path(__file__).resolve().parent.parent / "src" / "content" / "albums"

PLATFORM_TEMPLATES = {
    "apple-music": "https://music.apple.com/cn/search?l=zh&term={q}",
    "netease": "https://music.163.com/#/search/m/?s={q}&type=1",
    "qq-music": "https://y.qq.com/n/ryqq/search.html?w={q}",
}
PLATFORM_ORDER = ["apple-music", "netease", "qq-music"]


def read_album(path: Path) -> dict:
    """极简 YAML 读取:仅提取 title / streaming_links 已有平台(够用即可)"""
    text = path.read_text(encoding="utf-8")
    title_m = re.search(r'^title:\s*"?(.+?)"?\s*$', text, flags=re.M)
    title = title_m.group(1).strip('"') if title_m else path.stem
    existing = set(re.findall(r"platform:\s*(\S+)", text))
    return {"title": title, "existing": existing, "text": text}


def build_query(title: str) -> str:
    """从中文标题抽搜索词:优先保留拉丁字母部分(演奏家名),否则用整标题"""
    latin = re.findall(r"[A-Za-z][A-Za-z.\s&'-]{1,40}", title)
    if latin:
        return " ".join(s.strip() for s in latin[:3])
    return title


def gen_links(query: str) -> list[str]:
    q = urllib.parse.quote(query)
    lines = []
    for p in PLATFORM_ORDER:
        url = PLATFORM_TEMPLATES[p].format(q=q)
        lines.append(f'  - platform: {p}\n    url: "{url}"\n    verified: false')
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description="生成串流平台搜索链接片段")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--album", help="专辑 slug,如 beethoven-5-kleiber")
    group.add_argument("--all-missing", action="store_true", help="为所有缺链接的专辑生成")
    args = parser.parse_args()

    paths = (
        [ALBUMS_DIR / f"{args.album}.yaml"] if args.album else sorted(ALBUMS_DIR.glob("*.yaml"))
    )
    for path in paths:
        if not path.exists():
            print(f"未找到专辑:{path}")
            continue
        album = read_album(path)
        missing = [p for p in PLATFORM_ORDER if p not in album["existing"]]
        if not missing:
            if args.album:
                print(f"{path.stem}:三大平台链接已齐,如需重置请手工编辑")
            continue
        query = build_query(album["title"])
        print(f"\n# {path.stem}(搜索词:{query})")
        print("streaming_links:")
        print("\n".join(gen_links(query)))
        print("# 人工核对精确专辑页后:url 替换 + verified: true")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
