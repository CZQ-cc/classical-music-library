# -*- coding: utf-8 -*-
"""
fetch_musicbrainz.py — 从 MusicBrainz 拉取唱片元数据,生成专辑草稿 YAML

用法:
  python scripts/fetch_musicbrainz.py --query "Kleiber Beethoven 5" [--limit 5]
  python scripts/fetch_musicbrainz.py --mbid <release-group-id> [--limit 5]

产出:src/content/_drafts/<时间戳>-<slug>.yaml(草稿,人工核对后才移入 src/content/albums/)

合规:MusicBrainz API 免费非商业使用,限每秒 1 次请求,须带 User-Agent。
"""
import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "ClassicalMusicLibrary/0.1 (personal editorial site; contact: editor@example.com)"
API = "https://musicbrainz.org/ws/2"
DRAFTS_DIR = Path(__file__).resolve().parent.parent / "src" / "content" / "_drafts"


def http_get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower(), flags=re.UNICODE)
    return re.sub(r"[-\s]+", "-", s).strip("-")[:60]


def search_release(query: str, limit: int) -> list[dict]:
    q = urllib.parse.quote(query)
    url = f"{API}/release/?query={q}&limit={limit}&fmt=json"
    return http_get_json(url).get("releases", [])


def make_draft(release: dict) -> dict:
    """从 MusicBrainz release 生成专辑草稿字段(供人工核对)"""
    label_names = []
    for li in release.get("label-info-list", []) or []:
        lbl = (li.get("label") or {}).get("name")
        if lbl:
            label_names.append(lbl)
            break
    date = release.get("date") or ""
    year = date[:4] if date[:4].isdigit() else ""
    artists = ", ".join(a["artist"]["name"] for a in release.get("artist-credit", []) if isinstance(a, dict))
    return {
        "_source": f"https://musicbrainz.org/release/{release.get('id', '')}",
        "_status": "草稿:字段由 MusicBrainz 预填,人工核对后方可入库",
        "title": release.get("title", ""),
        "title_en": release.get("title", ""),
        "label": label_names[0] if label_names else "(待核对)",
        "release_year": year or "(待核对)",
        "recordings": [],  # 待关联 recordings slug
        "rating": "(待定,0-10)",
        "essence": "(一句话推荐,待写)",
        "background": "(专辑与录音背景,待写)",
        "editorial": "(编辑导读,待写)",
        "streaming_links": [],
        "tags": [],
        "notes": f"MusicBrainz 演奏者字段:{artists}",
    }


def yaml_dump(data: dict) -> str:
    """极简 YAML 序列化(草稿足够用,复杂数组人工编辑)"""
    lines = []
    for k, v in data.items():
        if isinstance(v, str) and (":" in v or v.startswith("(")):
            lines.append(f'{k}: "{v}"')
        else:
            lines.append(f"{k}: {v}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="MusicBrainz 唱片元数据草稿生成")
    parser.add_argument("--query", help="检索词,如 'Kleiber Beethoven 5'")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()

    if not args.query:
        parser.print_help()
        return 1

    releases = search_release(args.query, args.limit)
    if not releases:
        print("未找到结果,请调整检索词(建议:演奏家 + 作曲家 + 曲名)")
        return 0

    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"找到 {len(releases)} 条,生成草稿:\n")
    for rel in releases:
        title = rel.get("title", "untitled")
        date = rel.get("date", "?")
        country = rel.get("country", "?")
        slug = slugify(f"{args.query}-{title}")
        draft = make_draft(rel)
        out = DRAFTS_DIR / f"{slug}.yaml"
        out.write_text(yaml_dump(draft), encoding="utf-8")
        print(f"  [{date}] {title} ({country}) -> {out}")
        time.sleep(1.1)  # MusicBrainz 限速:每秒最多 1 次请求
    print("\n下一步:人工核对草稿 → 补写中文导读/背景 → 移入 src/content/albums/<slug>.yaml")
    return 0


if __name__ == "__main__":
    sys.exit(main())
