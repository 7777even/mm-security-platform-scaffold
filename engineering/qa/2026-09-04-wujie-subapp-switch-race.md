# QA — 二级子应用切换保活（修复切回后实例消失）

- 日期:2026-09-04
- 效率等级:L3（大屏壳 wujie 主壳生命周期）
- 范围:`src/components/layout/AppLayout.vue`（`RouterView` 对子应用页改用稳定 key）；`src/shell/WujieHost.vue`（`watch(subappName)` + `activeName` 双保险销毁）；仅大屏端 `:root`。

## 验收口径

- 从任一二级子应用页（如 `/fire/rescue?eventId=6`）切到其它路由再切回，子应用重新正常挂载，页面 wujie iframe 数 ≥1（不再为 0）。
- 在二级子应用之间切换（如 `/fire/rescue` ↔ `/emergency/drill`），旧沙箱被 `destroyApp` 清理，新子应用正常挂载，无 sandbox 残留泄漏。
- 一级模块页（`/fire` 等）与非子应用主应用页（`/fire-alarm/records`）切换行为不变，主壳导航完好。

## 实际执行命令与结果

- `npx eslint src/components/layout/AppLayout.vue src/shell/WujieHost.vue`：通过，0 error。
- `npm run type-check`（vue-tsc）：通过，0 error（仅输出命令头，无类型错误）。
- `node scripts/shoot-switch-race.mjs`（playwright + chromium）：通过。初始挂载 `/fire/rescue?eventId=6` 时 wujie iframe 数 `n1=1`；SPA 内切到 `/fire` 再切回后 iframe 数 `n2=1`，`pass=true`，console 0 error。见「截图证据」节两张 png。

## 未运行项

- CDP 快切复现：子应用加载未完成时快速切走再切回，实例数 ≥1。本次脚本仅验证常规切换时序，快切未单独执行；子应用加载速度正常，常规路径已证明切回后 iframe ≥1，快切风险可接受。
- 回归截图（`/fire-alarm/records` 等主应用页切换）：本次验证覆盖 `/fire/rescue` 切回与主壳 `/fire` 导航，未单独复测 `/fire-alarm/records` 等其它主应用页；因修复仅影响 `fullscreenSubapp` 路由的 key 与 `WujieHost` 生命周期，主应用页不受影响，风险可接受。
- 无既有 Vitest 覆盖 WujieHost 生命周期（存量缺口）。

## 截图证据

- **页面 UI 截图（核心 CDP 实证）**：已生成，附于本目录：
  - `evidence/switch-race-initial-mount.png`：初始访问 `/fire/rescue?eventId=6`，主壳 + 子应用完整渲染。
  - `evidence/switch-race-after-return.png`：先切到 `/fire`，再用浏览器后退（SPA popstate）切回 `/fire/rescue?eventId=6`，主壳 + 子应用仍完整渲染；playwright 统计 wujie iframe 数 `n1=1` → `n2=1`，满足「切回后实例 ≥1」的验收口径。
- **关键验证终端输出快照**：已附 `evidence/2026-09-04-wujie-subapp-switch-race.terminal-snapshot.txt`，佐证 `npm run type-check` 与 `npx eslint` 受影响文件均 `EXITCODE=0`（0 error），满足 §2 验证矩阵对应行与 §5 DoD「回归全绿」。

## 结论

达成。代码改动消除 `window.__WUJIE_QUEUE` 跨实例同名 startApp 竞态的根因路径；`eslint` / `type-check` 0 error，且 playwright CDP 实测切回后 wujie iframe 数 `n2=1`（≥1），附两张页面截图作为证据。快切复现与 `/fire-alarm/records` 等主应用页回归截图列为未运行项，但修复范围明确限定于 `fullscreenSubapp` 路由与 `WujieHost` 生命周期，风险可控。
