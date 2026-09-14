## Why

ui-redesign 参考项目（`D:\feishu\ui-redesign.zip`）中的 PC 后台管理端已实现：深蓝顶栏浏览器标签多页签（tabstrip）、可折叠分组侧栏（彩色 tone 图标 + 子菜单）、MasterGo 风格工作台（stats + 模块卡片）、表格页通用组件（筛选栏 + 原生表格 + 分页）、详情页 / 表单页 / 标签页（tabs）。当前脚手架 `apps/mgmt` 仅有基础 T 型布局 + 2 个占位视图，无法覆盖后台 53 项功能页面的标准化开发。本变更将 ui-redesign PC 端的可复用布局形态、组件与样式语言迁移进 `apps/mgmt`，并统一走 `src/styles/tokens.css` 的 `[data-theme='mgmt']` token 体系，对齐 AGENTS.md 红线与 `mgmt-scaffold` spec。

## What Changes

- 在 `src/styles/tokens.css` 的 `[data-theme='mgmt']` 块新增 PC 端缺位 token（顶栏 tab、侧栏分组 tone、badge / tag 浅底色系），作为真源。
- 新增 `apps/mgmt/components/MgmtIconTile.vue`：图标瓦片（size 档 / variant soft|solid / tone 色板），取代 ui-redesign 的 `IconTile.vue`，色板走 mgmt tone token。
- 新增 `apps/mgmt/components/MgmtTablePage.vue`：通用列表页（页头 + tabs + 筛选工具栏 + 表格 + 分页），对齐规范 §4 核心组件规则。
- 新增 `apps/mgmt/views/module.vue`：模块动态页（列表 / 详情 / 表单三态），对齐规范 §5 页面模板。
- 升级 `apps/mgmt/views/workbench.vue`：引入 stats 横卡 + 模块卡片网格 hover 态，对齐原型视觉。
- 升级 `apps/mgmt/App.vue`：增加多 tab 页签（tabstrip）、分组折叠侧栏（彩色 tone 分组图标 + 子菜单展开/收回）、顶栏时间 / 消息 / 用户。
- 在 `src/styles/tokens.css` 的 `[data-theme='mgmt']` 块补 `--mgmt-tone-*` 系列 tone token（8 业务色调），供 IconTile / 侧栏分组 / 工作台卡片复用。
- 新增 `src/data/mgmtMenus.ts`（既有 `pcMenus.ts` 的 menu 数据结构迁移 + 类型定义），提供数据驱动路由与侧栏。

## Capabilities

### New Capabilities

- `mgmt-table-page`：后台通用列表页（页头 + 筛选工具栏 + 表格 + 分页 + 多 tabs）。
- `mgmt-icon-tile`：图标瓦片组件（尺寸档 × 变体 × tone 色板）。
- `mgmt-module-dynamic`：模块动态页（数据驱动：列表 / 详情 / 表单三态）。

### Modified Capabilities

- `mgmt-scaffold`：升级为多 tab 页签 + 分组折叠侧栏的原生布局壳。

## Impact

- `src/styles/tokens.css`（`[data-theme='mgmt']` 块）：新增约 20 个 token。
- `apps/mgmt/components/`：新增 `MgmtIconTile.vue`、`MgmtTablePage.vue`。
- `apps/mgmt/views/`：新增 `module.vue`；升级 `workbench.vue`。
- `apps/mgmt/App.vue`：升级为多 tab + 分组折叠侧栏。
- `apps/mgmt/router.ts`：升级为数据驱动路由（pcMenus → mgmtMenus）。
- `src/data/mgmtMenus.ts`：新增菜单数据 + 类型。
