# Capability: Mgmt Redesign Migration

## ADDED Requirements

### Requirement: 后台管理端 PC 视觉体系迁移

将 ui-redesign PC 后台管理端的可复用布局形态、组件与样式语言迁移到 `apps/mgmt`，并统一走 `src/styles/tokens.css` 中 `[data-theme='mgmt']` 的 `--mgmt-*` token 体系，满足后台 53 项功能页的标准化开发底座。

#### Scenario: 顶栏 tabstrip + 分组折叠侧栏

- **WHEN** 渲染 `apps/mgmt` 任意页面
- **THEN** 顶栏呈现浏览器标签式多页签（`openTabs` 维护当前打开页，支持点击切换、关闭），侧栏呈现可折叠分组菜单（彩色 tone 分组图标 + 子菜单小图标 + 分组展开/收回），侧栏支持折叠到 64px；全部颜色 / 字号 / 尺寸 / 圆角引用 `--mgmt-*` token，组件内不写死。

#### Scenario: 工作台 stats 横卡 + 模块卡片网格

- **WHEN** 访问 `/workbench`
- **THEN** 顶部出现 stats 横卡（关键指标数字 + 标签），下方呈现模块卡片网格；每张卡片含浅底圆形图标、模块名、页面数、子页面直达入口浅底标签、余量胶囊；hover 浮现阴影；全部色板走 `--mgmt-tone-*-soft/fg` 等 token。

#### Scenario: 通用列表页组件

- **WHEN** 渲染任意模块列表路由
- **THEN** `MgmtTablePage` 提供页头 + tabs + 筛选工具栏 + 表格 + 分页的通用结构；表格列、筛选条件、分页由 `mgmtMenus.ts` 中的页面 `Cell` 配置数据驱动。

#### Scenario: 模块动态页（列表 / 详情 / 表单三态）

- **WHEN** 访问模块详情或表单路由
- **THEN** `module.vue` 按 `pageType` 渲染列表态、详情态或表单态；详情态支持返回列表，表单态支持提交/取消。

#### Scenario: 图标瓦片组件

- **WHEN** 使用 `MgmtIconTile`
- **THEN** 支持 `size`（sm/md/lg）、`variant`（soft/solid/ghost）、`tone`（red/orange/amber/navy/indigo/cyan/purple/slate）三态组合；颜色由 `--mgmt-tone-*` token 驱动，禁止硬编码。

#### Scenario: Token 单一真源

- **WHEN** 在 `apps/mgmt/**` 中检视颜色 / 字号 / 尺寸 / 圆角
- **THEN** 不存在裸 `rgb()/rgba()/#hex` 字面量；所有视觉值经 `var(--mgmt-*)` 取自 `src/styles/tokens.css`，新增 token 只在该文件 `[data-theme='mgmt']` 块补充。
