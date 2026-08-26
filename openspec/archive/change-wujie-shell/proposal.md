## Why

M0 评审已拍板：前端架构由"单体 SPA"切换为"微前端"，框架确定 **wujie**（与 mm-safety-master 实验一致、Vue3 契合、API 极简）。本变更在 frontend-scaffold 就地落地**最小可运行主壳**：把 dashboard 模块作为首个 wujie 子应用接入，建立"主壳 + 子应用"骨架，并保留已验证资产（设计 token / RBAC 权限 / realtime 只读中枢 / 32 spec·148 用例）。同时修正 mm-safety-master 既有桥接中 5+ 处 `window as any` 反模式（违 S1 禁 any）。

## What Changes

- 引入 `wujie-vue3`；`main.ts` 注册 `WujieVue` 全局组件。
- 新增 `src/shell/`：类型化 `wujieBridge`（强类型事件总线，消除 any）+ `WujieHost.vue`（封装 `<WujieVue>`，自读路由 `meta.subappUrl` 挂载子应用，下传 user/perm/theme props）。
- 新增 `src/shared/index.ts` 共享基座桶（auth/permission/realtime/http/token/audit/logger/bridge 单一真源），主壳与子应用共同 import。
- 路由改造：`router/menu.ts` 中 dashboard 的 `component` 改为懒加载 `WujieHost`，`meta.subappUrl` 指向子应用地址；其余 5 模块维持本地 RouterView（渐进迁移）。
- 子应用试点：新增 `subapps/dashboard/`（独立 index.html + main.ts 挂载现有 `views/dashboard/index.vue`），配 `vite.subapp.dashboard.config.ts`（cors:true，独立端口）+ `dev:subapp:dashboard` / `dev:all` 脚本。

## Capabilities

### New Capabilities

- `wujie-shell`：wujie 主壳基座（子应用挂载、类型化通信桥、共享基座契约）。

### Modified Capabilities

- `scaffold-foundation`：路由/主壳由单体扩展为微前端主壳（`<RouterView>` 经 WujieHost 成为子应用挂载槽）。

## Impact

- `package.json`：+wujie-vue3、+concurrently；新增 dev:subapp:dashboard、dev:all 脚本。
- `src/main.ts`：注册 WujieVue。
- `src/shell/{wujieBridge.ts, WujieHost.vue}`：新增。
- `src/shared/index.ts`：新增（共享基座单一真源）。
- `src/router/menu.ts`：dashboard 路由改为 WujieHost + subappUrl。
- `subapps/dashboard/*` + `vite.subapp.dashboard.config.ts`：新增。
- `src/**/*.spec.ts`：新增 wujieBridge / subappUrl 映射单测（TDD）。
