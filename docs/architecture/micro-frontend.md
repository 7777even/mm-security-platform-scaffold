# wujie 微前端架构（docs/architecture/micro-frontend.md）

> 大屏壳（`src/`）内嵌 18 个业务子应用（`subapps/`），共享设计 token 与登录态，各子应用**独立 Pinia**。更细的改动约束见 `subapps/AGENTS.md`。

## 1. 子应用清单（18 个）

`dashboard`、`extreme-weather`、`fire-alarm`、`industrial-video`、`ops-monitor`、`security-anti-terror`、`fm-emergency`、`fm-fire`、`fm-rescue`、`fm-security`、`fm-typhoon`、`fm-communication`、`fm-production`、`fm-production-area`、`fm-major-hazard`、`fm-video-control`、`fm-video-wall`、`fm-tv`

## 2. 构建铁律（最容易踩的坑）

- **必须打成 IIFE**：`npm run build:subapps`（`scripts/build-subapps.mjs`，自动扫描 `subapps/`，新增子应用无需登记）。
- **禁止 vite 多 HTML 入口构建子应用**：vite 产出 ESM module script，而 wujie（`import-html-entry`）不会把 module script 当可执行入口执行 → 子应用 `#app` 永不挂载 → 大屏中间空白。
- 产物为 `subapps/<name>/dist/{index.html, subapp.iife.js, style.css}`（不入版本库）。

## 3. 装载机制

- 路由 `meta.subappUrl` 存在时，`AppLayout` 的 `<RouterView/>` 渲染 `src/shell/WujieHost.vue` 作为装载槽。
- `WujieHost.vue`：`<WujieVue :url="subappUrl" :props="sharedProps" :before-mount="onBeforeMount" .../>`。

### 实例命名与生命周期

- 实例名 = `slug::path[?sortedQuery]`（slug 由 `subappUrl` 派生，如 `/subapps/fm-rescue/` → `fm-rescue`）。不同路径/参数/查询各自独立 wujie 实例，避免 props/模式错乱。
- 切换子应用（`watch(subappName)`）显式 `destroyApp(prev)`；`onBeforeUnmount` 兜底清理当前沙箱。
- **刻意不设 `alive`**：每个 URL 实例用完即毁，避免 iframe / WebGL / Cesium 上下文累积。
- `sandbox="allow-scripts allow-same-origin"`：Cesium 强依赖 WebGL，需同源 blob 沙箱才能创建 WebGL 上下文。

## 4. 主壳 → 子应用的契约

1. **设计 token 由主壳注入**：`src/shell/wujieTokens.ts` 的 `injectDesignTokens` 在沙箱 `document` 注入 `:root` 变量。子应用**不要再打包 `src/styles/tokens.css`**；新 token 改主壳 `tokens.css` 即自动生效。
2. **共享态经 `window.$wujie.props` 下传**（`WujieHost.sharedProps`）：`user` / `perms` / `theme` / `routeParams` / `routeName` / `routePath` / `query`。子应用不自建全局态。
3. **每个子应用独立 Pinia**，与主壳 store 不共享实例。
4. **跨应用导航委托主壳**：`createSubappRouter`（`src/shell/subappRouter.ts`）把 `router.push` 转成 wujie 总线上的 `route-navigate` 事件交给主壳处理；子应用内空 router 仅为兜底 `useRouter()` 调用。
5. **焦点陷阱兜底**：入口必须调用 `installWujieDocumentShim()`（`src/shell/wujieDocumentShim.ts`），为 element-plus 在沙箱内补全 `document.activeElement`。

## 5. 调试

- dev 下 `vite.config.ts` 的 `serveSubappDist` 中间件直传 `subapps/<name>/dist/index.html`；**首次调试前必须先 `npm run build:subapps`**，否则 404。
- `VITE_USE_DEV_MOCK=true` 启用自包含 mock；http 实例主壳与子应用共享，装一次对该子应用生效。

## 6. 承载的业务场景

大屏一级页（如消防报警 `fire-alarm`、极端天气 `extreme-weather`、安全生产 `ops-monitor`、安防反恐 `security-anti-terror`、工业视频 `industrial-video`）多为大屏壳内页面；子应用主要承载**二级详情页**（演练 `fm-rescue`、台风 `fm-typhoon`、事故救援 `fm-fire-rescue`、生产区域/重大危险源 `fm-production-area`/`fm-major-hazard`、生产通信 `fm-communication`、视频控制/墙 `fm-video-control`/`fm-video-wall` 等），路由 `meta.subapp=true` 经 WujieHost 装载。

## 相关文档

- [README.md](./README.md) — 架构总览（三端 / 数据流）
- [auth-token.md](./auth-token.md) — 令牌内存态与权限（子应用经 `props` 拿到的即为已解析的 perms）
- `subapps/AGENTS.md` — 子应用改动约束与验证矩阵
