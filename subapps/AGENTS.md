# AGENTS.md — wujie 微前端子应用（subapps/）

改动本目录前，先读根 `AGENTS.md` §1–§8，再读本文档。子应用运行在大屏壳内，视觉语言遵循 `docs/UI规范-大屏端.md`。

## 结构

每个子应用一个目录：`subapps/<name>/{index.html, main.ts}`，另有构建产物 `dist/`（不入版本库）。当前 18 个：`dashboard`、`extreme-weather`、`fire-alarm`、`fm-communication`、`fm-emergency`、`fm-fire`、`fm-major-hazard`、`fm-production`、`fm-production-area`、`fm-rescue`、`fm-security`、`fm-tv`、`fm-typhoon`、`fm-video-control`、`fm-video-wall`、`industrial-video`、`ops-monitor`、`security-anti-terror`。

## 构建：必须打成 IIFE（最容易踩的坑）

**禁止用 `vite build` 的多 HTML 入口构建子应用。** vite 产出 ESM module script，而 wujie（import-html-entry）不会把 module script 当可执行入口执行，结果是子应用 `#app` 永不挂载——表现为大屏中间空白、只显示主壳 header/footer。

子应用必须走 `npm run build:subapps`（`scripts/build-subapps.mjs`），输出 IIFE 到 `subapps/<name>/dist/{index.html, subapp.iife.js, style.css}`。该脚本自动扫描 `subapps/` 下的目录，新增子应用无需登记。

## 与主壳的契约

1. **设计 token 由主壳注入**：经 `src/shell/wujieTokens.ts` 在 wujie 沙箱内下发，子应用**不要再打包 `src/styles/tokens.css`**。需要新 token 时改主壳的 `tokens.css`，子应用自动获得。
2. **共享态经 `window.$wujie.props` 下传**：auth / perm / theme 由主壳提供，子应用不自建全局态。
3. **每个子应用独立 Pinia**，与主壳的 store 不共享实例。
4. **跨应用导航委托主壳**：用 `createSubappRouter`（`src/shell/subappRouter.ts`），它把 `router.push` 转成 wujie 总线上的 `route-navigate` 事件交给主壳处理。子应用内的空 router 仅为兜底 `useRouter()` 调用，不要往里加真实路由。
5. **焦点陷阱兜底**：入口必须调用 `installWujieDocumentShim()`（`src/shell/wujieDocumentShim.ts`），为 element-plus 在沙箱内补全 `document.activeElement`。

## 页面复用

子应用入口通常直接复用主壳已验证的页面，例如 `dashboard` 复用 `@/views/dashboard/index.vue`。**同一份页面被主壳与子应用共用时，改动要同时考虑两种运行环境**（独立路由 vs 沙箱内无路由）。

## 样式

子应用引入 `@/styles/global.css`（大屏深色底）与 `@/styles/element-dark.css`，与主壳保持一致。Element Plus 由主配置按需自动引入。

## 调试

- dev 下由 `vite.config.ts` 的 `serveSubappDist` 中间件直传 `subapps/<name>/dist/index.html`，因此**首次调试前必须先 `npm run build:subapps`**，否则页面 404。
- `VITE_USE_DEV_MOCK=true` 时启用自包含 mock；http 实例被主壳与子应用共享，装一次即对该子应用生效。

## 目标验证

- 改动子应用入口或新增子应用：`npm run build:subapps`（必须实际构建通过，IIFE 产物是唯一能证明可挂载的证据）。
- 只改样式：`npx eslint subapps/<name>/main.ts` 或 `npm run type-check`。
- 判定等级与流程见根 `AGENTS.md` §7.2；验证矩阵见 §7.3。
- Git 提交 scope 固定为 `screen`（含 `subapps/`，见根 `AGENTS.md` §6）。
