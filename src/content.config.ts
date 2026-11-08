import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 数据模型:作品 → 录音版本 → 唱片专辑 三层分离
 * 实体间用文件名 slug 互相引用,引用完整性由 src/utils/data.ts 在构建期断言
 */

// 串流平台(大陆可访问的排前面)
const streamingPlatform = z.enum([
  'apple-music',
  'netease',
  'qq-music',
  'spotify',
  'youtube-music',
  'qobuz',
  'tidal',
]);

// 作曲家
const composers = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/composers' }),
  schema: z.object({
    name: z.string(),
    name_en: z.string(),
    period: z.enum(['baroque', 'classical', 'romantic', 'late-romantic', 'modern']),
    birth: z.string(),
    death: z.string().optional(),
    monogram: z.string().max(2), // 版式头像(姓氏首字),无肖像图时回退用
    portrait: z.string().optional(), // 肖像图路径,如 /portraits/<slug>.jpg(须为公有领域)
    portrait_credit: z.string().optional(), // 肖像来源说明
    intro: z.string(),
  }),
});

// 音乐作品
const works = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string(),
    composer: z.string(), // composers slug
    genre: z.string(), // 交响曲/钢琴奏鸣曲/…
    catalog_no: z.string().optional(), // Op.67 / BWV 988
    composed_year: z.string(),
    movements: z.array(z.object({ title: z.string(), note: z.string().optional() })).default([]),
    background: z.string(), // 创作背景
    why_classic: z.string(), // 为什么经典
  }),
});

// 指挥家、演奏家、乐团
const performers = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/performers' }),
  schema: z.object({
    name: z.string(),
    name_en: z.string(),
    type: z.enum(['conductor', 'pianist', 'violinist', 'cellist', 'singer', 'orchestra', 'ensemble']),
    intro: z.string(),
    style_tags: z.array(z.string()).default([]),
  }),
});

// 录音版本:具体演奏阵容 + 录音信息;聆听指南时间轴挂在这里(绑定具体录音,不跨版本)
const recordings = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/recordings' }),
  schema: z.object({
    works: z.array(z.string()).min(1), // works slugs
    conductor: z.string().optional(), // performers slug
    orchestra: z.string().optional(), // performers slug
    soloists: z.array(z.object({ person: z.string(), role: z.string() })).default([]),
    recording_year: z.string(),
    venue: z.string().optional(),
    style_tags: z.array(z.string()).default([]),
    sound_notes: z.string().optional(),
    guide: z
      .array(
        z.object({
          movement: z.string(),
          key: z.string().optional(), // 乐章调性,如 "c小调"
          tempo: z.string().optional(), // 乐章速度
          duration: z.string().optional(), // 参考时长
          sections: z.array(
            z.object({
              cue: z.string(), // 时间点或结构位置,如 "0:00" / "展开部"
              title: z.string(),
              note: z.string(),
              key: z.string().optional(), // 段落调性 → 彩色圆盘
              dynamic: z.string().optional(), // 力度标记,如 p / ff
              contour: z.array(z.number()).optional(), // 旋律轮廓(0-100,越高音越高) → 胶囊内折线
              instruments: z.array(z.string()).optional(), // 主要乐器声部 → 编号标注
            }),
          ),
        }),
      )
      .default([]),
  }),
});

// 唱片专辑
const albums = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/albums' }),
  schema: z.object({
    title: z.string(),
    title_en: z.string().optional(),
    label: z.string(),
    release_year: z.union([z.string(), z.number()]),
    cover: z.string().optional(), // /covers/<slug>.jpg,缺省用版式占位封面
    recordings: z.array(z.string()).min(1), // recordings slugs
    rating: z.number().min(0).max(10), // 编辑推荐指数
    essence: z.string(), // 一句话推荐
    background: z.string(), // 专辑与录音背景
    editorial: z.string(), // 编辑导读
    streaming_links: z
      .array(
        z.object({
          platform: streamingPlatform,
          url: z.string().url(),
          verified: z.boolean().default(false), // 是否已人工核对为精确专辑链接
        }),
      )
      .default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false), // 首页编辑精选
    notes: z.string().optional(),
  }),
});

// 专业乐评引用:只存出处+短引用+自写摘要,不转载全文
const reviews = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/reviews' }),
  schema: z.object({
    album: z.string(), // albums slug
    media: z.string(),
    author: z.string().optional(),
    title: z.string(),
    url: z.string().url(),
    date: z.string().optional(),
    quote: z.string().optional(), // 原文短引用(须真实可溯)
    summary_zh: z.string(), // 自写中文摘要
  }),
});

// 专题:必听榜单、入门路线等
const features = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/collections' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    intro: z.string(),
    items: z.array(z.object({ album: z.string(), note: z.string().optional() })),
  }),
});

export const collections = {
  composers,
  works,
  performers,
  recordings,
  albums,
  reviews,
  collections: features,
};
