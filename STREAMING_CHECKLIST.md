# 串流链接人工核对清单

状态:`✓` 已核对为精确专辑页 · `□` 待人工核对 · `—` 平台目录无此版本(保留搜索页)

## 网易云音乐(7/10 已自动核对)

| 专辑 | 状态 | 链接 |
|---|---|---|
| 贝多芬五&七(克莱伯/VPO/DG) | ✓ 自动 | [album?id=152843763](https://music.163.com/#/album?id=152843763) |
| 贝多芬五&六(卡拉扬/BPO/DG) | ✓ 自动 | [album?id=3170490](https://music.163.com/#/album?id=3170490) |
| 哥德堡 1955(古尔德/索尼) | ✓ 自动 | [album?id=3301231](https://music.163.com/#/album?id=3301231) |
| 哥德堡 1981(古尔德/索尼) | ✓ 自动 | [album?id=1655318](https://music.163.com/#/album?id=1655318) |
| 莫扎特 40&41(伯姆/VPO/DG) | ✓ 自动 | [album?id=35381632](https://music.163.com/#/album?id=35381632) |
| 柴四五六(穆拉文斯基/DG) | ✓ 自动 | [album?id=34479335](https://music.163.com/#/album?id=34479335) |
| 德沃夏克大提琴(罗斯特罗波维奇/DG) | ✓ 自动 | [album?id=35382637](https://music.163.com/#/album?id=35382637) |
| 贝多芬五&七(加德纳/Archiv) | — | 网易云目录无 Archiv 1994 版;QQ 搜索核对 |
| 肯普夫三奏鸣曲(DG) | — | 网易云只有分册(1-6 / 13-19 / 20-26 …),无「悲怆+月光+热情」合册;人工找最接近分册或保留搜索页 |
| 肖邦夜曲全集(鲁宾斯坦/RCA) | — | 网易云为 Sony 分册化(如 [Op.27-62&72](https://music.163.com/#/album?id=72119406)),无全集;可人工搜「Rubinstein Collection」确认是否有 Vol.49 夜曲册 |

## QQ 音乐(10/10 待人工核对)

核对方法:点开各专辑页的 QQ 搜索链接 → 在结果里找**厂牌为「环球音乐/索尼音乐」的官方版本**(避开翻录)→ 核对**演奏家与曲目数** → 把浏览器地址栏的专辑页 URL 填入对应 YAML 的 `qq-music` 条目并把 `verified: false` 改为 `true`。

| 专辑 | 搜索入口(已配好词) | 核对要点 |
|---|---|---|
| 贝多芬五&七(克莱伯) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Carlos%20Kleiber%20Beethoven%205%207) | 维也纳爱乐 / 5+7 两部 / 环球 |
| 贝多芬五&六(卡拉扬 1963) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Karajan%20Beethoven%20Symphonies%205%206) | 柏林爱乐 / 1961-62 录音 |
| 贝多芬五&七(加德纳) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Gardiner%20Beethoven%20Symphonies%205%207) | Archiv / 古乐器 |
| 哥德堡 1955(古尔德) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Glenn%20Gould%20Goldberg%20Variations%201955) | 标注 1955 / 索尼 |
| 哥德堡 1981(古尔德) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Glenn%20Gould%20Goldberg%20Variations%201981) | 标注 1981 Digital / 索尼 |
| 悲怆·月光·热情(肯普夫) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Kempff%20Beethoven%20Pathetique%20Moonlight) | DG / 三首俱全 |
| 夜曲全集(鲁宾斯坦) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Rubinstein%20Chopin%20Nocturnes) | RCA/索尼 / Op.9 起全集 |
| 莫扎特 40&41(伯姆) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Bohm%20Mozart%20Symphonies%2040%2041) | 维也纳爱乐 / Jupiter |
| 柴四五六(穆拉文斯基) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Mravinsky%20Tchaikovsky%20Symphonies) | 列宁格勒爱乐 / DG |
| 德沃夏克大提琴(罗斯特罗波维奇) | [搜索](https://y.qq.com/n/ryqq/search.html?w=Rostropovich%20Karajan%20Dvorak%20Cello%20Concerto) | 柏林爱乐 / 含洛可可变奏曲 |

## Apple Music(大陆区)

10 张在**大陆区曲库均无此版本**(实测 iTunes cn 区全部空结果),`apple-music` 链接保留为大陆区搜索页。若确认某张大陆区有上架,把大陆区专辑页 URL 填入即可。

## 给用户的操作方式

核对完一条后,把精确 URL 发给我(或直接编辑 `src/content/albums/<slug>.yaml` 里对应平台的 `url` 并把 `verified: false` → `true`),我来批量更新与重建。
