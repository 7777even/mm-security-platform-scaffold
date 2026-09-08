# Proposal: mgmt 工作台数据驱动迁移

## Why

上一轮壳层迁移只手写了一个 `workbench.vue` 静态外壳：8 大模块内容、子页标签、页面数全部写死，且唯一带路由的「报警记录」路径写错（`/alarm-records` 真实为 `/alarm-record`），模块卡与子页均不可跳转。原型 `Workbench.vue` 是 `pcMenus` 驱动的导航门户，点模块卡/子页真实跳转到对应业务页。脚手架已有结构等价的 `mgmtMenus`（title/key/children+path），但工作台未复用，导致用户感知「工作台没迁移、交互是断的」。

## What Changes

- 改写 `apps/mgmt/views/workbench.vue`：遍历 `mgmtMenus` 渲染 8 大模块卡片（图标/色调按 group key 映射、`页面数=leafCount(g)`、列前 4 子页 +N）。
- 模块卡可点击跳 `firstLeafPath(g)`；子页标签为 `RouterLink` 真实路由（覆盖此前占位 span 与错误路径）。
- 统计卡保留 4 项，`子系统` 数动态取 `mgmtMenus.length`。
- 样式全程走 `--mgmt-*` token，不新增硬编码；保留原型「扁平白卡 + 描边 + 浅底标签」语言。

## Capabilities

- `mgmt-workbench`：数据驱动导航门户，模块卡与子页直达真实业务页（含嵌入的二级原型页）。

## Impact

- 仅改 `apps/mgmt/views/workbench.vue`；不动 `mgmtMenus`、路由、原型包、UI 规范/openspec/superpowers 约束。
- 风险：低（纯展示层重写，复用既有 `firstLeafPath`/`leafCount`）。
