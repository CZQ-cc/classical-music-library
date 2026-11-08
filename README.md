# 聆听经典 · The Art of Listening

以经典录音为核心的古典音乐鉴赏与唱片指南网站:精选 100 张起步,中文导读 + 可溯源乐评 + 分乐章聆听指南 + 串流导流(Apple Music / 网易云 / QQ音乐)。

## 技术栈

- **Astro 5** 纯静态生成,零 JS 默认输出(仅唱片馆筛选与搜索页有少量脚本)
- **双主题**:「夜馆」(黑底音乐杂志 × 数字唱片馆,默认)与「纸页」(米白纸张阅读风),全站统一切换;色彩全部走 `html[data-theme]` CSS 变量,选择存 localStorage
- **内容即数据库**:`src/content/` 下的 YAML 文件,无数据库、无 CMS;构建期做 schema 校验与引用完整性断言(死引用直接构建失败)
- **Pagefind** 客户端全文搜索(构建后索引,UI 色彩随主题)
- **Python 脚本**:MusicBrainz 元数据草稿、串流链接生成
- 部署目标:**Cloudflare Pages**(大陆可访问、免备案)

## 目录结构

```
├── scripts/                    # 数据脚本
│   ├── fetch_musicbrainz.py    # MusicBrainz → 专辑草稿(限速 1req/s)
│   └── gen_stream_links.py     # 生成串流搜索链接片段
├── src/
│   ├── content/                # ← 内容即数据库,全部 YAML
│   │   ├── composers/          # 作曲家
│   │   ├── works/              # 作品(乐章结构/背景/为何经典)
│   │   ├── performers/         # 指挥/演奏家/乐团
│   │   ├── recordings/         # 录音版本(阵容+聆听指南时间轴挂这里)
│   │   ├── albums/             # 唱片专辑(背景/编辑导读/串流链接)
│   │   ├── reviews/            # 乐评引用(出处+短引用+自写摘要)
│   │   └── collections/        # 专题(入门路线等)
│   ├── components/             # Cover/AlbumCard/Stars/StreamingButtons…
│   ├── layouts/ pages/ styles/ #
│   └── utils/data.ts           # 引用完整性断言 + 联表工具
└── public/covers/              # 唱片封面(可选;缺省用版式占位封面)
```

## 核心数据模型

```
作品 Work ──< 录音版本 Recording >── 演奏者/乐团 Performer
                    │
                    └──< 唱片专辑 Album ──< 串流链接 / 乐评引用
```

**三层必须分离**:同一部贝五,卡拉扬/克莱伯/加德纳是三个录音版本,各挂各的聆听指南(时间轴绑定具体录音,不跨版本);同一录音可有不同再版专辑。

## 内容生产工作流(加一张唱片)

1. `python scripts/fetch_musicbrainz.py --query "演奏家 曲名"` 生成元数据草稿(或手写)
2. 补写三类 YAML:`albums/<slug>.yaml`(背景+编辑导读)、`recordings/<slug>.yaml`(阵容+指南)、关联 `works/`/`performers/`(不存在则新建)
3. `python scripts/gen_stream_links.py --album <slug>` 生成串流搜索链接 → **人工点开核对到精确专辑页**,替换 url 并置 `verified: true`
4. 乐评:只录真实来源(媒体/作者/原文链接/短引用 ≤2 句 + 自写中文摘要),禁止虚构
5. `npm run build` —— 构建即质检:schema 不合、死引用都会报错
6. 本地 `npm run dev` 验收页面 → 提交

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器(搜索页不可用,属正常:索引构建后生成)
npm run build      # 构建 + Pagefind 索引(质检门禁)
npm run preview    # 预览构建产物
```

## 版权立场

- 不存储、不内嵌任何商业录音音频;串流按钮指向各平台公开页面
- 乐评版权归原媒体与作者,本站仅出处标注 + 短引用 + 自写摘要,不转载全文
- 唱片封面仅作非商业推介;无封面时使用版式占位封套

## 部署(Cloudflare Pages)

1. 将本目录推送到独立 Git 仓库(已 `git init`,与父仓库分离)
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → 连接仓库
3. 构建配置:框架预设 `Astro`;构建命令 `npm run build`;输出目录 `dist`
4. 上线后把 `astro.config.mjs` 里的 `site` 改为实际域名

## 路线图

- [ ] 首批 10 张(已完成)→ 扩展至 100 张(按作曲家配额:贝多芬 15 / 巴赫 10 / 莫扎特 10 …)
- [ ] 真实唱片封面接入(Cover Art Archive + 人工核对)
- [ ] 每张唱片的分乐章聆听指南补全
- [ ] 作曲家肖像、时期筛选强化
