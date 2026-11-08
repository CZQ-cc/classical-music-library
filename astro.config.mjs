// @ts-check
import { defineConfig } from 'astro/config';

// 上线 Cloudflare Workers 静态资产,正式域名
export default defineConfig({
  site: 'https://classical-music-library.zq295349287.workers.dev',
  build: {
    inlineStylesheets: 'auto',
  },
});
