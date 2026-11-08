import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * 图解聆听指南海报(矢量 SVG,固定纸页印刷配色)
 * 版式参考图解式乐谱指南:调性圆盘 · 乐器盘 · 主题胶囊(旋律轮廓)· 力度圈 · 编号声部
 * 数据驱动生成,中文标注与音乐事实完全一致;每份含指南的录音一张。
 */

export async function getStaticPaths() {
  const recs = (await getCollection('recordings')).filter((r) => r.data.guide.length > 0);
  return recs.map((rec) => ({ params: { slug: rec.id }, props: { rec } }));
}

const PALETTE = ['#e2574c', '#e88c3a', '#f0c24b', '#7fb77e', '#58a8a2', '#5b8fd9', '#35548c', '#9a6fb0'];
const ENUM = '①②③④⑤⑥⑦⑧';
const ABBR: Record<string, string> = {
  第一小提琴: '小提', 第二小提琴: '小提', 中提琴: '中提', 大提琴: '大提',
  低音弦乐: '低音', 低音提琴: '贝斯', 定音鼓: '定鼓', 全体乐队: '全奏',
  双簧管: '双簧', 单簧管: '单簧', 大管: '大管', 短笛: '短笛', 长笛: '长笛',
  圆号: '圆号', 小号: '小号', 长号: '长号',
};

function hashColor(s: string): string {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 中文按宽度粗略折行(maxChars ≈ 行宽 / 字号) */
function wrap(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, '');
  const lines: string[] = [];
  let cur = '';
  for (const ch of clean) {
    cur += ch;
    if (cur.length >= maxChars) {
      lines.push(cur);
      cur = '';
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** contour(0-100)→ 海报坐标 path */
function contourToPath(arr: number[], x0: number, x1: number, yTop: number, h: number): string {
  const n = arr.length;
  return arr
    .map((y, i) => {
      const x = (n === 1 ? (x0 + x1) / 2 : x0 + (i * (x1 - x0)) / (n - 1)).toFixed(1);
      const yv = (yTop + 6 + ((100 - y) * (h - 12)) / 100).toFixed(1);
      return `${i === 0 ? 'M' : 'L'}${x},${yv}`;
    })
    .join(' ');
}

const SERIF = "'Noto Serif SC','Source Han Serif SC','STZhongsong','SimSun',serif";
const SANS = "'Noto Sans SC','Source Han Sans SC','PingFang SC','Microsoft YaHei',sans-serif";
const W = 920;
const X0 = 60;

export async function GET({ props }: { props: { rec: CollectionEntry<'recordings'> } }) {
  const { rec } = props as { rec: CollectionEntry<'recordings'> };
  const [works, performers] = await Promise.all([getCollection('works'), getCollection('performers')]);
  const nameOf = (slug: string) => performers.find((p) => p.id === slug)?.data.name ?? '';
  const title = rec.data.works
    .map((w: string) => works.find((x) => x.id === w)?.data.title ?? w)
    .join(' / ');
  const names: string[] = [];
  if (rec.data.conductor) names.push(nameOf(rec.data.conductor));
  for (const s of rec.data.soloists ?? []) names.push(`${nameOf(s.person)}(${s.role})`);
  if (rec.data.orchestra) names.push(nameOf(rec.data.orchestra));
  const lineup = names.join(' · ');

  let y = 0;
  const el: string[] = [];

  // ---- 页头 ----
  y = 96;
  el.push(`<text x="${X0}" y="${y - 34}" font-family="${SANS}" font-size="12" letter-spacing="6" fill="#9a7b3f">LISTENING GUIDE · 图解聆听指南</text>`);
  el.push(`<text x="${X0}" y="${y}" font-family="${SERIF}" font-size="34" font-weight="700" fill="#1d1a15">${esc(title)}</text>`);
  el.push(`<text x="${X0}" y="${y + 34}" font-family="${SANS}" font-size="14.5" fill="#46413a">${esc(lineup || '录音 ' + rec.data.recording_year)} · 录音 ${rec.data.recording_year}</text>`);
  el.push(`<text x="${X0}" y="${y + 62}" font-family="${SANS}" font-size="12" fill="#8a8478">图例:彩色圆盘 = 调性 / 时间点 · 圆盘内 = 乐器声部 · 胶囊 = 主题旋律轮廓 · 〇 = 力度 · ①②③ = 声部顺序</text>`);
  el.push(`<line x1="${X0}" y1="${y + 86}" x2="${W - X0}" y2="${y + 86}" stroke="#ddd5c2"/>`);
  y += 122;

  // ---- 乐章区块 ----
  for (const m of rec.data.guide) {
    const mvColor = hashColor(m.key ?? m.movement);
    // 乐章头
    y += 36;
    el.push(`<circle cx="${X0 + 14}" cy="${y - 8}" r="8" fill="${mvColor}"/>`);
    el.push(`<text x="${X0 + 32}" y="${y}" font-family="${SERIF}" font-size="21" font-weight="700" fill="#1d1a15">${esc(m.movement)}</text>`);
    const badges = [m.key, m.tempo, m.duration].filter(Boolean) as string[];
    let bx = X0 + 32 + m.movement.length * 22 + 18;
    for (const b of badges) {
      const bw = b.length * 13 + 24;
      el.push(`<rect x="${bx}" y="${y - 20}" width="${bw}" height="24" rx="12" fill="none" stroke="#ddd5c2"/>`);
      el.push(`<text x="${bx + bw / 2}" y="${y - 3}" font-family="${SANS}" font-size="12" text-anchor="middle" fill="#46413a">${esc(b)}</text>`);
      bx += bw + 10;
    }
    y += 26;

    // 段落行
    for (const s of m.sections) {
      const hasContour = Array.isArray(s.contour) && s.contour.length > 1;
      const discColor = s.key ? hashColor(s.key) : '#8a8478';
      const pillColor = hashColor(s.title);
      const pillX = X0 + 170;
      const pillW = W - X0 - 170 - 10;
      const pillH = 48;

      // 主题标签(仅轮廓胶囊需要;标题居中胶囊自身已含文字)
      if (hasContour) {
        el.push(`<text x="${pillX + 18}" y="${y}" font-family="${SANS}" font-size="12.5" font-weight="700" fill="#1d1a15">${esc(s.title)}</text>`);
      }

      // 胶囊
      const py = y + 8;
      el.push(`<rect x="${pillX}" y="${py}" width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${pillColor}33" stroke="${pillColor}80"/>`);
      if (hasContour) {
        el.push(`<path d="${contourToPath(s.contour, pillX + 44, pillX + pillW - 20, py + 4, pillH - 8)}" fill="none" stroke="#2a2620" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);
      } else {
        el.push(`<text x="${pillX + pillW / 2}" y="${py + pillH / 2 + 6}" font-family="${SERIF}" font-size="15" font-weight="700" text-anchor="middle" fill="#1d1a15">${esc(s.title)}</text>`);
      }

      // 调性盘 / cue 盘(行左侧)
      const dcx = X0 + 30;
      const dcy = py + pillH / 2;
      el.push(`<circle cx="${dcx}" cy="${dcy}" r="23" fill="${discColor}"/>`);
      if (s.key) {
        const keyLines = s.key.length > 3 ? [s.key.slice(0, 2), s.key.slice(2)] : [s.key];
        keyLines.forEach((k, i) => {
          el.push(`<text x="${dcx}" y="${dcy + 4 - (keyLines.length - 1) * 7 + i * 14}" font-family="${SANS}" font-size="12" font-weight="600" text-anchor="middle" fill="#fffdf8">${esc(k)}</text>`);
        });
      } else {
        el.push(`<text x="${dcx}" y="${dcy + 4}" font-family="${SANS}" font-size="10.5" font-weight="600" text-anchor="middle" fill="#fffdf8">${esc(s.cue.slice(0, 4))}</text>`);
      }

      // 乐器盘(调性盘右侧)
      const insts = s.instruments ?? [];
      insts.slice(0, 3).forEach((inst, i) => {
        const icx = X0 + 78 + i * 40;
        const abbr = ABBR[inst] ?? inst.slice(0, 2);
        el.push(`<circle cx="${icx}" cy="${dcy}" r="17" fill="#eae4d4" stroke="#d8d0bc"/>`);
        el.push(`<text x="${icx}" y="${dcy + 4}" font-family="${SANS}" font-size="${abbr.length > 2 ? 9 : 11}" text-anchor="middle" fill="#46413a">${esc(abbr)}</text>`);
      });

      // 力度圈(胶囊内左端)
      if (s.dynamic) {
        el.push(`<circle cx="${pillX + 22}" cy="${py + pillH / 2}" r="10" fill="#fffdf8" stroke="#1d1a15"/>`);
        el.push(`<text x="${pillX + 22}" y="${py + pillH / 2 + 4}" font-family="${SERIF}" font-size="11.5" font-style="italic" font-weight="700" text-anchor="middle" fill="#1d1a15">${esc(s.dynamic)}</text>`);
      }

      // 声部编号 + 注释折行
      let ny = py + pillH + 24;
      if (insts.length > 0) {
        el.push(`<text x="${pillX + 2}" y="${ny}" font-family="${SANS}" font-size="12.5" fill="#46413a">${insts.map((n, i) => `${ENUM[i] ?? '·'} ${esc(n)}`).join('　')}</text>`);
        ny += 22;
      }
      y = ny;
      // 行宽 = W - X0 - 170 - 10 - 右边距 60 ≈ 628px,13px/字 → 47 字/行
      for (const ln of wrap(s.note, 47)) {
        el.push(`<text x="${pillX + 2}" y="${y}" font-family="${SANS}" font-size="13" fill="#46413a">${esc(ln)}</text>`);
        y += 21;
      }
      y += 18;
    }
    y += 26;
  }

  // ---- 页脚 ----
  y += 30;
  el.push(`<line x1="${X0}" y1="${y}" x2="${W - X0}" y2="${y}" stroke="#ddd5c2"/>`);
  el.push(`<text x="${X0}" y="${y + 26}" font-family="${SANS}" font-size="11.5" fill="#8a8478">聆听经典 · The Art of Listening — 时间轴与段落绑定本录音版本(${esc(rec.data.recording_year)}),不可套用于其他版本。</text>`);
  y += 66;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.ceil(y)}" viewBox="0 0 ${W} ${Math.ceil(y)}" font-family="${SANS}">
<rect width="${W}" height="${Math.ceil(y)}" fill="#faf8f1"/>
${el.join('\n')}
</svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
}
