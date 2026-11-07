import { getEntry, type CollectionEntry } from 'astro:content';

/** 串流平台显示名(大陆可访问的排前面) */
export const PLATFORM_NAMES: Record<string, { zh: string; en: string }> = {
  'apple-music': { zh: 'Apple Music', en: 'Apple' },
  netease: { zh: '网易云音乐', en: 'NetEase' },
  'qq-music': { zh: 'QQ音乐', en: 'QQ Music' },
  spotify: { zh: 'Spotify', en: 'Spotify' },
  'youtube-music': { zh: 'YouTube Music', en: 'YouTube' },
  qobuz: { zh: 'Qobuz', en: 'Qobuz' },
  tidal: { zh: 'TIDAL', en: 'TIDAL' },
};

/** 时期显示名 */
export const PERIOD_NAMES: Record<string, string> = {
  baroque: '巴洛克',
  classical: '古典主义',
  romantic: '浪漫主义',
  'late-romantic': '晚期浪漫主义',
  modern: '现代',
};

/** 人物类型显示名 */
export const PERFORMER_TYPES: Record<string, string> = {
  conductor: '指挥家',
  pianist: '钢琴家',
  violinist: '小提琴家',
  cellist: '大提琴家',
  singer: '歌唱家',
  orchestra: '乐团',
  ensemble: '室内乐团',
};

/**
 * 断言实体存在:构建期死引用直接报错(内容即数据库的完整性门禁)
 */
export async function must<T extends CollectionEntry<any>>(
  collection: T extends never ? never : string,
  slug: string,
): Promise<CollectionEntry<any>> {
  const entry = await getEntry(collection as any, slug);
  if (!entry) {
    throw new Error(`[数据完整性] 集合「${collection}」中不存在 slug「${slug}」,请检查引用拼写`);
  }
  return entry;
}

/** 专辑 → 关联录音(带完整性断言) */
export async function albumRecordings(album: CollectionEntry<'albums'>) {
  return Promise.all(album.data.recordings.map((slug: string) => must('recordings', slug)));
}

/** 录音 → 关联作品 + 指挥 + 乐团 + 独奏 */
export async function recordingDetail(rec: CollectionEntry<'recordings'>) {
  const works = await Promise.all(rec.data.works.map((slug: string) => must('works', slug)));
  const conductor = rec.data.conductor ? await must('performers', rec.data.conductor) : undefined;
  const orchestra = rec.data.orchestra ? await must('performers', rec.data.orchestra) : undefined;
  const soloists = await Promise.all(
    (rec.data.soloists ?? []).map(async (s: { person: string; role: string }) => ({
      ...s,
      entry: await must('performers', s.person),
    })),
  );
  return { works, conductor, orchestra, soloists };
}

/** 作品 → 全部录音版本(全库扫描,百张规模无性能问题) */
export async function recordingsOfWork(workSlug: string) {
  const { getCollection } = await import('astro:content');
  const all = await getCollection('recordings');
  return all.filter((r) => r.data.works.includes(workSlug));
}

/** 录音 → 所属专辑 */
export async function albumsOfRecording(recSlug: string) {
  const { getCollection } = await import('astro:content');
  const all = await getCollection('albums');
  return all.filter((a) => a.data.recordings.includes(recSlug));
}

/** 唱片公司 slug(用于封面色带) */
export function labelClass(label: string): string {
  const map: Record<string, string> = {
    'Deutsche Grammophon': 'label-dg',
    DG: 'label-dg',
    Archiv: 'label-archiv',
    'Archiv Produktion': 'label-archiv',
    Columbia: 'label-columbia',
    CBS: 'label-cbs',
    'CBS Masterworks': 'label-cbs',
    RCA: 'label-rca',
    'RCA Victor': 'label-rca',
    'RCA Red Seal': 'label-rca',
    'Sony Classical': 'label-sony',
  };
  return map[label] ?? '';
}

/** 评分转五星(半星向下取整) */
export function ratingStars(rating: number): number {
  return Math.round(rating / 2);
}

/** 一条录音的阵容一行字(解析 performer 引用取显示名) */
export async function lineupOfRecording(rec: CollectionEntry<'recordings'>): Promise<string> {
  const { conductor, orchestra, soloists } = await recordingDetail(rec);
  const parts: string[] = [];
  if (conductor) parts.push(conductor.data.name);
  for (const s of soloists) parts.push(`${s.entry.data.name}(${s.role})`);
  if (orchestra) parts.push(orchestra.data.name);
  return parts.join(' · ');
}
