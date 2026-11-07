// @ts-check
import { defineConfig } from 'astro/config';

// 上线 Cloudflare Pages 后替换为实际域名
export default defineConfig({
  site: 'https://classical-music-library.pages.dev',
  build: {
    inlineStylesheets: 'auto',
  },
});
