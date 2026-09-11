## Status

进行中 · 2026-09-01 启动 · 2026-09-12 回填：实现项（§2–§5）与可自动化验证项（6.1 / 6.2 / 6.4）经实测确认完成并勾选；仅剩 6.3 人工视觉走查（需 `npm run dev`），阻塞归档。

## 1. 文档与提案

- [x] 1.1 编写 `openspec/changes/mgmt-redesign-migration/proposal.md`。
- [x] 1.2 编写 `openspec/changes/mgmt-redesign-migration/tasks.md`。

## 2. token 补齐（单一真源先行）

- [x] 2.1 在 `src/styles/tokens.css` 的 `[data-theme='mgmt']` 块新增顶栏 tab 系列 token（`--mgmt-tab-bg` / `--mgmt-tab-fg` / `--mgmt-tab-on-bg` / `--mgmt-tab-hover-bg`）。（2026-09-12 实测 13 处）
- [x] 2.2 新增侧栏分组 tone token（`--mgmt-tone-red/orange/amber/navy/indigo/cyan/purple/slate` 各 soft + fg 配对）。（2026-09-12 实测 16 处）
- [x] 2.3 新增 badge / tag 状态色 token（与 §7 同源，浅底 + 同色深字，双态）。（由 `--mgmt-tone-*-soft/fg` 配对同源满足；`apps/mgmt` 内无 badge/tag 硬编码色）
- [x] 2.4 IconTile 尺寸档 token（`--mgmt-tile-sm/md/lg` + `--mgmt-tile-radius`）。（2026-09-12 实测 4 处）

## 3. 组件迁移

- [x] 3.1 新增 `apps/mgmt/components/MgmtIconTile.vue`（size / variant / tone 三态）。（文件已存在）
- [x] 3.2 新增 `apps/mgmt/components/MgmtTablePage.vue`（页头 + tabs + 筛选工具栏 + 表格 + 分页）。（文件已存在）
- [x] 3.3 新增 `apps/mgmt/views/module.vue`（数据驱动列表 / 详情 / 表单三态）。（已实现三态：`isDetail` 详情态 + `pageType==='form'` 表单态 + 列表态）
- [x] 3.4 升级 `apps/mgmt/views/workbench.vue`（stats 横卡 + 模块卡片网格）。（已含 `workbench__stats` 横卡与 `workbench__grid` + `wb-card` 卡片网格，带 tone 图标）

## 4. 布局壳升级

- [x] 4.1 `apps/mgmt/App.vue` 升级为多 tab 页签（tabstrip，浏览器标签样式）+ 分组折叠侧栏（彩色 tone 图标 + 子菜单展开/收回）+ 顶栏消息气泡。（已含 tabstrip 顶栏、`toneClassByKey` 8 色分组 tone、折叠侧栏 220/64px）
- [x] 4.2 `apps/mgmt/router.ts` 升级为数据驱动（遍历 `mgmtMenus` 自动生成路由）。（`moduleRoutes = mgmtMenus.flatMap(...)` 已落地）

## 5. 菜单数据

- [x] 5.1 新增 `src/data/mgmtMenus.ts`：迁移 pcMenus 数据结构 + 类型定义（`MgmtMenuGroup` / `MgmtMenuLeaf` / `MgmtTab` / `Cell`）。（文件已存在，38KB）

## 6. 验证

- [x] 6.1 `npm run type-check` 0 error。（2026-09-12 实测 `vue-tsc -p tsconfig.app.json --noEmit` 无输出 = 0 错；基线 `vitest run` 389 passed / 62 文件全绿）
- [x] 6.2 改动文件 `eslint` 0 error。（2026-09-12 实测 `eslint apps/mgmt src/data/mgmtMenus.ts --ext .ts,.vue` 无输出 = 0 错）
- [ ] 6.3 视觉走查：顶栏 tab / 侧栏分组折叠 / 工作台卡片 / MgmtIconTile（各 tone）/ 表格页。（**待人工**：需 `npm run dev` 在 `/apps/mgmt/` 走查；自动化验证无法替代，阻塞本 Change 归档）
- [x] 6.4 验收：无硬编码色 / 字号 / 尺寸，全部走 `--mgmt-*` token。（色值走 `--mgmt-tone-*-soft/fg`、字号走 `--mgmt-fz-*`、尺寸走 `--mgmt-tile-*`/`--mgmt-ctrl-h`；`apps/mgmt` 内无 badge/tag 硬编码色）
