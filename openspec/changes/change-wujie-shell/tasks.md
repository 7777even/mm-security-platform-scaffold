## 1. OpenSpec 文档

- [x] 1.1 编写 `openspec/changes/change-wujie-shell/{proposal.md, tasks.md}`。
- [x] 1.2 新增能力 spec `openspec/specs/wujie-shell/spec.md`。

## 2. 共享基座

- [x] 2.1 [TDD] 编写 `src/shell/wujieBridge.spec.ts`：强类型事件 emit/on/off 契约（mock bus）。
- [x] 2.2 实现 `src/shell/wujieBridge.ts`：WujieEventMap + WujieBus 接口 + Window.$wujie 声明（禁 any），使测试转绿。
- [x] 2.3 新增 `src/shared/index.ts`：re-export auth/permission/realtime/http/token/audit/logger/bridge 单一真源。

## 3. 主壳骨架

- [x] 3.1 `package.json`：+wujie-vue3、+concurrently；新增 dev:subapp:dashboard、dev:all 脚本。
- [x] 3.2 `src/main.ts`：注册 WujieVue 全局组件（app.use）。
- [x] 3.3 新增 `src/shell/WujieHost.vue`：封装 `<WujieVue>`，自读 meta.subappUrl 挂载，下传 user/perm/theme props，含 loading 兜底。

## 4. 路由改造

- [x] 4.1 [TDD] 编写 `src/router/menu.subapp.spec.ts`：断言 dashboard 路由携带 subappUrl 且 component 为 WujieHost 懒加载。
- [x] 4.2 `src/router/menu.ts`：dashboard 的 component 改为 `() => import('@/shell/WujieHost.vue')`，meta 加 subappUrl/subapp；导出 MENU_ROUTE_SPECS。
- [x] 4.3 `src/router/index.ts`：守卫对 subapp 入口仍按 meta.perm 统一拦截（兼容，无需改动）。

## 5. dashboard 子应用试点

- [x] 5.1 新增 `subapps/dashboard/index.html` + `main.ts`（挂载现有 views/dashboard/index.vue，独立 Pinia + 空 router 兜底 useRouter）。
- [x] 5.2 **同源模型（关键运行时决策）**：wujie 强约束子应用须与主应用同源。改为**单 Vite dev server 多 HTML 入口**——主壳(`/`)与子应用(`/subapps/dashboard/`)由 5173 同源托管，`subappUrl` 用同源相对路径 `/subapps/dashboard/`；`vite.config.ts` 的 `build.rollupOptions.input` 同时登记两个入口。已删冗余的 `vite.subapp.dashboard.config.ts` 与 `dev:all`/`dev:subapp:dashboard` 脚本（避免双 server 跨源）。验证：`npm run test` 全绿；`vite build` 双入口产出；dev 下 `/` 与 `/subapps/dashboard/` 均 200。
- [x] 5.3 **CSP 放行 wujie blob 沙箱帧**：开发态 CSP（`vite.config.ts` 的 `csp` + `index.html` 的 `<meta>` 兜底）原缺 `frame-src`，致 wujie 注入的同源 blob 沙箱 iframe 被 `default-src 'self'` 拦截，且连带触发跨源 `location.href` 读取错误。两处均补 `frame-src 'self' blob:`，验证 dev 响应头已含该指令、blob 帧放行。
- [x] 5.4 **生产 CSP 同步**：`deploy/csp.conf` 的 OpenResty Lua 示例与静态备用 `add_header` 均补 `frame-src 'self' blob:`（wujie 同源 blob 沙箱帧），保持与生产/dev 一致，避免部署后重现 blob 帧拦截。
- [x] 5.5 **WebGL 降级提示（无动作决策）**：预览环境报"当前环境不支持 WebGL"。定位为 `BaseMap.vue:113` 的 `detectWebGL()` 返回 false 触发 S1 §9.3 降级路径，属环境性（IDE 无头预览缺 GPU/WebGL），非 wujie 回归，Cesium 2D 也强依赖 WebGL 故无法经 2D 兜底。用户确认**暂不处理**（待确认是预览环境缺 WebGL 后再定）。防御性加 `<WujieVue :sandbox="'allow-scripts allow-same-origin'">`（等同默认值，排除 iframe 沙箱拦截 WebGL 隐患，不影响行为）。
- [x] 5.6 **地图数据请求 Network Error（开发态无后端）**：`sandbox` 使 WebGL 可用后，地图 `renderAll()` 发起 `fetchAlarmPoints/fetchDevicePoints/fetchRiskZones`（`/api/v1/map/...`、`/api/v1/dashboard/risk-heatmap`），开发态无后端、vite 未配 `/api` 代理 → `AxiosError: Network Error` → `BaseMap` catch 整块崩溃。根因**非 wujie 回归**（请求目标同主壳），而是 `map.ts` 已定义的 `FALLBACK_*` 静态兜底常量未接线。修复：三函数在 `request` 失败时 `catch` 回退 `FALLBACK_*`（符合"不白屏"设计）并 `logger.warn`；同步修正 `menu.subapp.spec.ts` 断言（同源相对路径 `/subapps/`）。验证：全量 154 用例 153 通过，仅该测试断言因改 URL 失败、修正后 3/3 通过；`map.spec` 4 例、`BaseMap.spec` 4 例、`cesium.spec` 5 例均通过。
- [x] 5.7 **dashboard 子应用接入内置 devMock（免外部 8787）**：`.env.development` 同时置 `VITE_USE_DEV_MOCK=true` 与 `VITE_API_BASE=http://localhost:8787/api/v1`；shell 主应用 `src/main.ts` 在 devMock 下经 `installDevMock(http)` 拦截所有请求，但 `subapps/dashboard/main.ts` 此前未装 → 子应用地图请求真连 8787 才触发 Network Error。修复：子应用入口 `if (DEV && VITE_USE_DEV_MOCK==='true') { useAuthStore().login(); installDevMock(http, pinia) }`，复用 `@/services/http` 单例 adapter 拦截，与主壳一致（无需另起 8787 mock 服务）。`login()` 写入内存令牌使 mock 注入 Authorization（S1 §5.3）。验证：lint 0 错误；全量测试全绿（含 `devMock.spec` 8 例）；`useAuthStore().login()` 签名与 shell 一致已确认。

## 6. 验证

- [x] 6.1 `npm install` → `npm run test`（新增 2 spec 共 6 例全绿，既有 154 用例无回归）。
- [x] 6.2 `npm run lint` 0 错误（禁 any、类型严格；2 个预存 warning 与本次无关）。
- [x] 6.3 `npx vite build` 主壳可构建（WujieHost 正确分包）；`vue-tsc -b` 中仅余 9 个预存无关类型错误（EmergencyEventCrudPanel/plans/fire-alarm/industrial-video/security-anti-terror），非本次改动。

## 7. 待办（非本次范围，建议后续）

- [x] 运行 `npm run dev` 实跑（单 Vite 多入口，主壳 5173 同源托管 `/subapps/dashboard/`）：验证 wujie 实际挂载与 props 下传。DEBUG 浮层已确认 `dash=dashboard-map 1244x736`、`dash.children=3`、`devMock=true`，证明子应用挂载、布局与 mock 拦截均生效；验证后已移除临时 DEBUG 浮层（`subapps/dashboard/main.ts`）。
- [x] 消除 `vue-tsc -b` 9 个预存类型错误（scaffold 基线，与微前端无关）：已修复 `EmergencyEventCrudPanel.vue`（`viewing?.` 防空）、`plans.vue`（补全 `updatedAt`、收窄 `LEVEL_TONE` 字面量联合）、`fire-alarm/index.vue`（补 `formatTime`）、`fire-alarm/records.vue`（行断言 `AlarmItem`）、`industrial-video/index.vue`（移除 `as const`）、`security-anti-terror/records.vue`（索引断言 `AccessLevel`）。`vue-tsc -b` 现已 0 错误。
- [x] 设计 token 经 wujie 沙箱注入子应用：已确认并采用「单一真源 + 沙箱注入」策略。wujie 子应用运行于独立 iframe 沙箱 document，与主壳 style 隔离，无法读取主壳 `:root` 变量，故原先各子应用需各自 `import tokens.css`。现改为：主壳经 `<WujieVue>` 的 `beforeMount` 生命周期（`src/shell/WujieHost.vue` → `src/shell/wujieTokens.ts` 的 `injectDesignTokens`）把 `tokens.css`（`?raw` 读为字符串）注入子应用沙箱 `document.head`（固定 id `wujie-design-tokens`，幂等）；子应用（`subapps/dashboard/main.ts`）移除 `import '@/styles/tokens.css'`，不再打包 token，由主壳统一下发。`global.css`（子应用自身布局重置/工具类）仍由子应用自带。非 dark 主题会在沙箱 `documentElement` 置 `data-theme` 激活覆盖块。配套 `wujieTokens.spec.ts` 已覆盖注入/幂等/主题逻辑。
- [ ] 渐进迁移其余 5 模块为子应用（复用同 WujieHost 机制；fire-alarm / industrial-video / security-anti-terror / plans / system-users）。
