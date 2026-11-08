# 部署指南:Cloudflare Pages(大陆可访问、免备案)

站点为纯静态产物(`dist/`),无服务器无数据库,Cloudflare Pages 免费额度绰绰有余。

## 前置条件

- 一个 [GitHub](https://github.com) 账号(免费)
- 一个 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号(免费)

## 步骤一:推送到 GitHub

```bash
# 在本项目目录下
git remote add origin https://github.com/<你的用户名>/classical-music-library.git
git branch -M main
git push -u origin main
```

(先在 GitHub 网页上建一个空仓库 `classical-music-library`,不要初始化 README。)

## 步骤二:Cloudflare Pages 连接仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub 并选择 `classical-music-library` 仓库
3. 构建设置:
   - **框架预设**:选 `Astro`(会自动填入下面的值;若无则手填)
   - **构建命令**:`npm run build`
   - **构建输出目录**:`dist`
   - Node 版本:环境变量加一条 `NODE_VERSION` = `20`(或 22)
4. **Save and Deploy** —— 首次构建约 1–2 分钟,得到 `https://<项目名>.pages.dev`

## 步骤三:收尾

- 把 `astro.config.mjs` 里的 `site` 改为实际 pages.dev 域名(或绑定的自定义域名),提交推送一次
- **自定义域名**(可选):Pages 项目 → Custom domains → 添加你的域名(若域名 DNS 在 Cloudflare,自动配 CNAME;大陆访问 pages.dev 一般可用,自定义域无需备案的前提是不走国内 CDN)
- 以后每次 `git push`,Cloudflare 自动重建上线

## 大陆访问说明

- `*.pages.dev` 默认在大陆**通常可访问**(无需备案),个别运营商偶发波动
- 若未来接入自定义域名并希望大陆速度更优,可考虑 Cloudflare 中国网络合作(需企业版)或国内托管+备案 —— 当前阶段不必

## 更新内容的工作流

日常加唱片/改内容与部署无关:本地改 YAML → `npm run build` 验证 → `git push` → Cloudflare 自动上线。
