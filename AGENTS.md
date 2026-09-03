# AGENTS.md — AI 编码必读

面向 AI 助手 / 自动化编码的项目级约束入口。**动手前先按 §7.2 判定改动等级（L0–L4）；L1 及以上在生成或修改 UI 代码前，必须读完本文 §1–§6 与目标端规范文档，再动手。**

## 1. 项目概览

安全管控指挥系统前端基座：Vue 3 + TypeScript + Vite + Pinia + wujie 微前端（子应用见 `subapps/`）+ Cesium GIS 一张图。三端形态：**大屏可视化端（`:root`）、后台管理端（`[data-theme='mgmt']`）、移动端（`[data-theme='mobile']`）**。后台 / 移动端为**独立应用入口** `apps/`（独立 index.html / 路由 / 布局壳，多入口构建见 `vite.config.ts`；dev 访问 `/apps/mgmt/`），与大屏壳层互不依赖，仅共享 `src/styles/tokens.css` 与公共服务。移动端按详设 V1.5 §5.3 为 Android 原生应用（hybrid 壳），本仓库 H5 规范约束内嵌业务页；集成方式待与设计方确认（详见 `docs/详细设计V1.5偏差分析.md`）。

## 2. UI 规范文档（按目标端强制阅读）

| 目标端       | 必读规范                    | 主题挂载              |
| ------------ | --------------------------- | --------------------- |
| 大屏可视化端 | `docs/UI规范-大屏端.md`     | `:root`（不挂属性）   |
| 后台管理端   | `docs/UI规范-后台管理端.md` | `data-theme="mgmt"`   |
| 移动端       | `docs/UI规范-移动端.md`     | `data-theme="mobile"` |

跨端需求逐端分别阅读对应文档。端与端之间**禁止**迁移视觉语言：玻璃 / 发光 / 渐变仅限大屏；浅色白卡 / 浅底标签仅限后台与移动。

## 3. 绝对红线（任何端、任何改动都适用）

1. **禁止硬编码**颜色 / 字号 / 间距 / 圆角 / 尺寸，一律引用 `src/styles/tokens.css` 中的 `var(--token)`；新增或调整 token 只改 `tokens.css` 单一真源，**禁止**在组件内重定义。
2. **状态 / 报警等级 / 设备状态着色只用规范文档中的映射表**（枚举可直接复制），禁止自造色阶或文案。
3. **z-index 只用五层 token**：`--z-base(0) / --z-marker(5) / --z-chrome(10) / --z-overlay(30) / --z-toast(40)`。
4. **主题挂载正确**：大屏 `:root` 不挂属性，后台 / 移动按上表挂 `data-theme`；组件内不写端特异硬编码分支，用 token 自然区分。
5. 状态标签用全局 `.tag-success / -warning / -danger / -info` 类（后台 / 移动端浅底同色深字；大屏直接用语义色）。
6. **存量补位例外（src/screen）**：`src/screen/**` 为 fire-monitoring 迁入存量，规范/token 已覆盖项必须用 `var(--token)`；未覆盖项可沿用 `src/screen/styles/variables.css` 源体系，新增页面不得新增未入 token 的硬编码值。

## 4. 高频踩坑速查

- 大屏主按钮是**渐变**（`--btn-bg-primary`），后台是实色 `#0b69d7`，移动是实色胶囊 `#1677ff`——三端不要混。
- 大屏禁止出现白底卡片 / 浅灰页面底 / `#0b69d7` / `#1677ff` / `.tag-*` 浅底标签。
- 后台 / 移动端禁止出现玻璃质感（`--glass-*`）、科技青 `#00d8ff`、发光边框、深蓝黑底。
- 移动端触控热区严格 48–56px（详设 V1.5 §3.4）；底部主操作条预留 `var(--mb-bottom-safe)` 安全区；户外正文 ≥15 / 标题 ≥18；户外强光模式切 `data-skin="outdoor"` 纯黑白高反差皮肤。
- 后台向导用水平步骤条、详情轨迹用垂直时间轴、页内切换用下划线页签，三者不混用。

## 5. 项目内既有能力（优先复用，不要重造）

- 权限显隐：`v-permission` 指令（`src/directives/permission.ts`），数据权限由服务端过滤。
- 离线操作缓存：`src/composables/useOfflineOutbox.ts`（移动端现场作业场景）。
- 移动端桥接层：`apps/mobile/bridges/`（定位/离线落盘/令牌注入的接口 + H5 降级实现）。移动端页面**只允许经桥接实例访问原生能力**，禁止直调 `navigator.geolocation`、Web Storage 写死实现；hybrid 决策落地后仅在 `bridges/index.ts` 换 JSBridge 适配器，业务页零改动。
- 告警元数据：`src/composables/useAlarmMeta.ts`。
- 全局样式：`src/styles/tokens.css`（token 真源）、`global.css`、`element-dark.css`。

## 6. 其他工程约定

- 路由与菜单：`src/router/`（含子应用路由 `shell/subappRouter.ts`）。
- **Git 提交规范：`type(scope): 描述`（conventional commits + 端 scope）**。scope 固定枚举，禁止自造：`screen`（大屏壳 + `subapps/`）、`mgmt`（`apps/mgmt`）、`mobile`（`apps/mobile`）、`shared`（`src/` 跨端公共服务、`src/styles/tokens.css`、`vite.config.ts`）、`docs`、`chore`。跨端改动**按影响面拆成多个提交**：共享文件（token、公共服务）先行，端内跟随；确属一个原子改动且拆不开时才允许双 scope（如 `feat(mgmt,shared):`），不得常态化。提交信息**只写一句总结性语句**，简洁扼要，禁止写一长段描述或用 `- ` 等分点列表展开。禁止提交临时输出文件（如 `tsc-out.txt`、`vitest-out.txt`）。
- 提交前钩子（husky + lint-staged）会执行 eslint / prettier / stylelint，遵循现有 `.prettierrc.json`、`.stylelintrc.json` 配置，不新增例外。
- 性能基线与验收记录见 `docs/perf/`；架构决策与规格见 `openspec/`。

## 7. AI 协同执行流程（三端通用）

### 7.1 规则优先级仲裁

规则冲突时从高到低执行，低阶规则不得覆盖高阶：

1. 平台安全策略与人工当场指令。
2. 本文档（含 §3 红线、§6 工程约定）与目标端 `docs/UI规范-*.md`。
3. 已确认的 `openspec/changes/<name>/` 与 `openspec/specs/`。
4. 当前 Change 的 `tasks.md` 中正在执行的 Task。
5. Skill / 插件自带的工作方法（含 superpowers）。

任何 skill 或插件不得绕过上级规则、自行扩大需求、新增平行任务源或改写既有契约。

### 7.2 效率分级 L0–L4

动手前先判定等级，并在回复中用一句话说明判定与理由。**分级只决定流程重量，不豁免 §3 红线、§2 目标端规范和 §6 提交规范。**

| 级  | 适用                                                                                        | 流程                                            |
| --- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| L0  | 解释、评审、状态汇报、只读检查、文本润色                                                    | 直接完成；不建文件、不起子 Agent、不调 openspec |
| L1  | 微小修改（四条门槛须同时满足）                                                              | 说明范围 → 直接改 → 跑最小验证 → 输出结果       |
| L2  | 依赖调整、构建配置、脚手架、lint / 格式化、非业务技术债                                     | 说明方案与影响 → 执行 → 跑受影响目标的验证      |
| L3  | 业务能力（新增或改变页面能力、交互规则、状态流转、权限语义）                                | openspec → 人工确认 → TDD 实施 → 验收 → 归档    |
| L4  | 高风险（跨端协议、Cesium / 地图内核、wujie 微前端壳、token 体系、构建与部署链路、权限模型） | 按 L3 执行，且实施前取得人工确认                |

**L1 四条门槛**（缺一即升为 L2 或 L3）：① 不新增或改变业务能力、接口契约、权限语义；② 改动不超过 3 个文件；③ 目标明确、可逆，验证可在 5 分钟内完成；④ 不新增生产依赖。L1 / L2 禁止创建 openspec Change、计划文档或子 Agent。

L3 / L4 的 openspec 流程：改动若对应既有 capability，按 `openspec/specs/` 实现；若是新能力或破坏性变更，先在 `openspec/changes/<name>/` 建 `proposal.md`（含 Why / What Changes / Capabilities / Impact，≤500 字、聚焦单一变更），并拆可勾选任务清单（单条 ≤2h，[TDD] 任务先写失败测试）；实现完成并验证后归档至 `openspec/archive/`。`openspec/config.yaml` 的 proposal / tasks 规则为强制门禁，不得跳过。

### 7.3 最小验证矩阵

| 改动范围                                             | 必跑验证                                         |
| ---------------------------------------------------- | ------------------------------------------------ |
| 文档、规范、AGENTS                                   | `git diff --check`                               |
| 单端单文件组件或样式                                 | `npx eslint <path>` 或 `npm run type-check`      |
| 跨端公共服务、`tokens.css`、`src/composables/`       | `npm run type-check` + `npx eslint <受影响路径>` |
| 关键路径 `deviceCode` / `usePermission` / `realtime` | `npx vitest run <spec 路径>`                     |
| 构建配置、依赖、`vite.config.ts`、多入口             | `npm run build`                                  |
| `subapps/**`                                         | `npm run build:subapps`                          |
| L3 / L4                                              | 按 `tasks.md` 验收标准全量，不得以 L1 / L2 降级  |

禁止为形式化验证在每次 L1 / L2 后连跑 lint + type-check + build + build:subapps 四套；只跑矩阵中对应的一行。

环境注记：本机 `vite build` 清空 `dist/` 会触发批量删除守卫而失败，验证编译是否通过时用 `npx vite build --emptyOutDir=false`，或指到全新的 `--outDir`。

### 7.4 单一任务源

实施任务的唯一真源是 `openspec/changes/<name>/tasks.md`。

- 会话内的进度跟踪工具只作临时备忘，不得写入仓库；任务状态只回填到 `tasks.md` 的勾选框。
- 禁止在 `openspec/` 之外建立第二套需求规格或任务清单（含 skill 自动生成的计划文件、持久化的待办列表）。
- superpowers 定位为**可组合的工程辅助，而非常驻流程**：沿用其 `test-driven-development`（先红后绿）、`systematic-debugging`、`verification-before-completion` 的方法要求；其 `brainstorming`、`writing-plans`、子 Agent 调度与第二套 Review，在已确认 Change 的 `proposal.md` / `tasks.md` 已覆盖同一职责时不得重复启用。
- L0 / L1 / L2 不默认起子 Agent、不写计划文档；仅在任务复杂度或用户要求达到阈值时升级为 L3。

### 7.5 三端一致适用

大屏、后台、移动端任一端的 L3 / L4 改动都执行同一流程，不因某端"体量小"或"只是页面"而豁免；反过来，任一端的 L0–L2 改动也不得反向升级为 L3。

## 8. 品牌规范对齐（中石化 / 《石化智云 UI 规范》）

中石化品牌方对三端 UI 与前端代码的硬性要求，AI 生成 / 修改代码时必须对齐。各条已分别落到三端 UI 规范（见 §2），此处汇总为红线清单；偏离需回规范文档确认，不得擅自降级：

1. **Logo 回主页**：品牌 Logo 置页面左上角，点击返回主页。落点：大屏（`docs/UI规范-大屏端.md` 顶栏 `.brand`）、后台（顶栏）、移动端（`apps/mobile/components/MobileHeader.vue` brand 变体）。
2. **弹性间距**：推荐外边距 16 / 内边距 24、标题 16 / 正文 14 为基线，可按分辨率与视距动态适配（不刚性硬卡）。落点：后台间距基线段、大屏间距档 `4/8/16/24`、移动端页边距 `16px`，均经 token 承载。
3. **隔行变色**：表格 / 数据列表开斑马纹，提升高压阅读舒适度。落点：后台数据表格、大屏数据列表（复用 `--row-alt-bg`）；移动端由 `--row-alt-bg-mobile` 承载。
4. **字体与配色**：中文默认 Microsoft YaHei（微软雅黑）优先；大屏深蓝科技、移动 / 后台白底，配色少即是多、高对比高易读。落点：三端规范字体段 + `--font-family-zh` 首位。
5. **移动端户外高反差皮肤**：强光 / 户外锁死 `data-skin="outdoor"` 纯黑白高反差皮肤（WCAG AAA，对比 >7:1），停用渐变 / 投影 / 毛玻璃 / 浅灰线；状态标签 / 警情通知改为**高饱和纯色色块 + 白字 + 2px 黑硬描边**（`.tag` 类 `border: var(--mb-border-w) solid var(--tag-stroke)`，户外 `--tag-stroke:#000; --mb-border-w:2px`）。落点：移动端 §6 + `src/styles/tokens.css` 户外块。
6. **适老 / 高易用性**：移动端「我的 → 适老与无障碍」一键适老 + 细项调节，与户外高对比可叠加；适老行高弹升至 `1.8` 倍字号（`--mb-line-height` 覆写），只放大字号 / 控件 / 间距，不改变流程与字段；后台适老同步放大侧栏 / 筛选 / 行高 / 主按钮。落点：移动端 §7、后台 §6。
7. **代码基线（HTML5 / 缩进）**：前端代码（Vue / HTML / TS / CSS）统一 **2 空格缩进**；根 HTML 必须 `<!DOCTYPE html>` + `UTF-8` 字符集。由 `.prettierrc.json`（`tabWidth:2`）+ `index.html` 实际保证，提交前 prettier / stylelint 钩子兜底，禁止新增例外（见 §6）。

## 9. 分层规则与目录职责

### 9.1 分层 AGENTS 与读取链

改哪个目录，就从根往下读到那一层，**不必全读**：

| 目标目录                                                    | 读取链                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/mgmt/**`                                              | 根 §1–§8 → `apps/mgmt/AGENTS.md` → `docs/UI规范-后台管理端.md` |
| `apps/mobile/**`                                            | 根 §1–§8 → `apps/mobile/AGENTS.md` → `docs/UI规范-移动端.md`   |
| `src/screen/**`（大屏存量）                                 | 根 §1–§8 → `src/screen/AGENTS.md` → `docs/UI规范-大屏端.md`    |
| `subapps/**`（wujie 子应用）                                | 根 §1–§8 → `subapps/AGENTS.md` → `docs/UI规范-大屏端.md`       |
| 大屏壳其余部分（`src/` 非 screen、`src/styles/tokens.css`） | 根 §1–§8 → `docs/UI规范-大屏端.md`                             |
| `docs/**`                                                   | `docs/AGENTS.md`                                               |

分层文件与本文件冲突时按 §7.1 仲裁：**根 `AGENTS.md` 高于分层 `AGENTS.md`**，分层文件只能加严、不得放宽。新增分层文件时必须在本表登记。

### 9.2 三类目录，职责不重叠

| 目录           | 回答的问题           | 特征                                 |
| -------------- | -------------------- | ------------------------------------ |
| `docs/`        | 系统**现在**是什么样 | 长期共识，跨版本有效，改了要同步代码 |
| `openspec/`    | 系统**将要**怎么变   | 唯一业务规格来源                     |
| `engineering/` | 这次**做得怎么样**   | 短期过程记录：计划、QA、复盘         |

- 短期开发记录放 `engineering/`，**不放 `docs/`**；QA 结果、发布检查、复盘同理。
- 实施任务只在 `openspec/changes/<name>/tasks.md`（见 §7.4）。
- 详见 `docs/AGENTS.md` 与 `engineering/README.md`。
