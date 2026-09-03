# AGENTS.md — 后台管理端（apps/mgmt）

改动本目录前，先读根 `AGENTS.md` §1–§8，再读本文档，最后读 `docs/UI规范-后台管理端.md`。

## 入口与主题

- 独立应用入口：`apps/mgmt/index.html` + `main.ts`，多入口构建见根 `vite.config.ts`；dev 访问 `/apps/mgmt/`。
- `data-theme="mgmt"` 由 `index.html` **静态挂载**，不要在 JS 里动态设置属性；`src/styles/tokens.css` 的 mgmt 块随之生效。
- 基座样式只引 `./styles/mgmt.css` 与 `@/styles/tokens.css`。**禁止引入 `src/styles/global.css`**——其 `body` 是大屏深色底语言，混入会污染后台白底。
- Element Plus 由 unplugin-vue-components + ElementPlusResolver 按需自动引入（配置已全局生效），**禁止 `app.use(ElementPlus)` 全量注册**。

## 与大屏壳的关系

与大屏壳层互不依赖，只共享 `src/styles/tokens.css` 与 `src/` 下跨端公共服务。**禁止**从 `src/screen/**` 导入任何存量组件或样式。

## 既有组件（优先复用，不要重造）

| 组件                           | 用途                        |
| ------------------------------ | --------------------------- |
| `components/MgmtProTable.vue`  | 数据表格（含分页、查询区）  |
| `components/MgmtTablePage.vue` | 表格页容器（查询区 + 表格） |
| `components/MgmtFilterBar.vue` | 筛选工具条                  |
| `components/MgmtIconTile.vue`  | 图标宫格入口                |

页面落在 `views/`，当前有 `workbench` / `module` / `module-embed` / `form-wizard`。

## 端特异红线

1. **白底卡片 / 浅灰页面底**，禁止玻璃质感（`--glass-*`）、发光边框、科技青 `#00d8ff`、深蓝黑底——这些仅限大屏。
2. 主按钮是**实色**（对应 `#0b69d7`，一律走 token），不是大屏渐变，也不是移动端的实色胶囊。
3. 状态标签用全局 `.tag-success / -warning / -danger / -info`（浅底同色深字）。
4. **三种切换控件不混用**：向导用水平步骤条、详情轨迹用垂直时间轴、页内切换用下划线页签。
5. 表格 / 数据列表开斑马纹（品牌规范隔行变色），复用 `--row-alt-bg`。
6. 适老模式同步放大侧栏 / 筛选 / 行高 / 主按钮，只放大不改变流程与字段。

## 表单与列表约定

- Element Plus 全部用户可见文案必须中文：标签、占位、空态、确认、错误、校验提示；必填与格式规则显式写中文 `message`，不依赖组件默认文案。
- 分页初始页大小走统一常量，不散落在页面里。
- 契约枚举用于下拉 / 单选 / 状态筛选时，必须定义 `{ label: '中文文案', value: 'ENUM' }` 映射，界面不得直接把英文枚举值当可见文案。
- 查询区的下拉 / 树选择必须给明确宽度，避免在行内表单里收缩成图标宽度。

## 目标验证

- 单文件改动：`npx eslint apps/mgmt/<path>` 或 `npm run type-check`。
- 涉及跨端公共服务（`src/composables/`、`src/styles/tokens.css`）：`npm run type-check` + `npx eslint <受影响路径>`。
- 判定等级与流程见根 `AGENTS.md` §7.2；验证矩阵见 §7.3。
- Git 提交 scope 固定为 `mgmt`；共享文件改动拆出 `shared` 提交先行。
