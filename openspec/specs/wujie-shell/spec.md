# wujie-shell

微前端主壳基座能力：在 frontend-scaffold 就地承接 wujie 主壳，提供子应用挂载、类型化通信桥与共享基座契约。

## 接口与契约

### 子应用挂载

- 主壳经 `<WujieVue>`（wujie-vue3）按路由 `meta.subappUrl` 挂载子应用；`AppLayout` 的 `<RouterView>` 即为主壳挂载槽。
- 主壳向子应用下传 props：`{ user, perms, theme }`，子应用经 `window.$wujie.props` 读取。

### 跨子应用通信（wujieBridge）

- 事件总线 `WujieBus` 强类型：`$emit/$on/$off<T extends keyof WujieEventMap>`。
- 事件集 `WujieEventMap`：map-fly-to / map-focus / emergency-event-changed / theme-changed / perm-changed。
- 禁止 `window as any` 直读 `window.$wujie`（S1 禁 any）；仅经 `getWujieBus()` 类型化访问。

### 共享基座契约（src/shared）

- auth / permission / realtime / http / token / audit / logger / bridge 单一真源，主壳与子应用共同 import。
- 设计 token 由 `styles/tokens.css` 单一入口注入全局 CSS 变量。

## 约束

- 零下行控制红线：bridge 仅承载监视/导航类事件，不得定义硬控写事件。
- 样式隔离：wujie 沙箱 + Vue scoped + CSS Modules；token 单一真源。
- 等保：CSP / XSS / 脱敏 / 禁 any 门禁覆盖子应用构建与运行。

## 验证

- `src/shell/wujieBridge.spec.ts`：事件契约（TDD）。
- `src/router/menu.subapp.spec.ts`：dashboard 路由 subappUrl 映射（TDD）。
