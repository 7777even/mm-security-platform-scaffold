## Status

进行中 · 2026-09-01 启动

## 1. 文档与提案

- [x] 1.1 编写 `openspec/changes/mgmt-redesign-migration/proposal.md`。
- [x] 1.2 编写 `openspec/changes/mgmt-redesign-migration/tasks.md`。

## 2. token 补齐（单一真源先行）

- [ ] 2.1 在 `src/styles/tokens.css` 的 `[data-theme='mgmt']` 块新增顶栏 tab 系列 token（`--mgmt-tab-bg` / `--mgmt-tab-fg` / `--mgmt-tab-on-bg` / `--mgmt-tab-hover-bg`）。
- [ ] 2.2 新增侧栏分组 tone token（`--mgmt-tone-red/orange/amber/navy/indigo/cyan/purple/slate` 各 soft + fg 配对）。
- [ ] 2.3 新增 badge / tag 状态色 token（与 §7 同源，浅底 + 同色深字，双态）。
- [ ] 2.4 IconTile 尺寸档 token（`--mgmt-tile-sm/md/lg` + `--mgmt-tile-radius`）。

## 3. 组件迁移

- [ ] 3.1 新增 `apps/mgmt/components/MgmtIconTile.vue`（size / variant / tone 三态）。
- [ ] 3.2 新增 `apps/mgmt/components/MgmtTablePage.vue`（页头 + tabs + 筛选工具栏 + 表格 + 分页）。
- [ ] 3.3 新增 `apps/mgmt/views/module.vue`（数据驱动列表 / 详情 / 表单三态）。
- [ ] 3.4 升级 `apps/mgmt/views/workbench.vue`（stats 横卡 + 模块卡片网格）。

## 4. 布局壳升级

- [ ] 4.1 `apps/mgmt/App.vue` 升级为多 tab 页签（tabstrip，浏览器标签样式）+ 分组折叠侧栏（彩色 tone 图标 + 子菜单展开/收回）+ 顶栏消息气泡。
- [ ] 4.2 `apps/mgmt/router.ts` 升级为数据驱动（遍历 `mgmtMenus` 自动生成路由）。

## 5. 菜单数据

- [ ] 5.1 新增 `src/data/mgmtMenus.ts`：迁移 pcMenus 数据结构 + 类型定义（`MgmtMenuGroup` / `MgmtMenuLeaf` / `MgmtTab` / `Cell`）。

## 6. 验证

- [ ] 6.1 `npm run type-check` 0 error。
- [ ] 6.2 改动文件 `eslint` 0 error。
- [ ] 6.3 视觉走查：顶栏 tab / 侧栏分组折叠 / 工作台卡片 / MgmtIconTile（各 tone）/ 表格页。
- [ ] 6.4 验收：无硬编码色 / 字号 / 尺寸，全部走 `--mgmt-*` token。
