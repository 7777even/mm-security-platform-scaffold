# AGENTS.md — AI 编码必读

面向 AI 助手 / 自动化编码的项目级约束入口。**动手前先按 §1 判定改动等级（L0–L4）；L1 及以上在生成或修改 UI 代码前，必须读完本文 §6 既有项目约束与目标端规范文档，再动手。**

## 1. 分级工作流（L0–L4 决策树）

动手前先判定等级，并在回复中用一句话说明判定与理由。**分级只决定流程重量，不豁免 §6 红线、§2 验证矩阵与 §3 API 契约。**

### 1.1 决策树（按"是否改代码 → 是否改业务能力 → 是否高风险"逐级下沉）

- **不改代码**（解释 / 评审 / 状态汇报 / 只读检查 / 文本润色）→ **L0**：直接完成；不建文件、不起子 Agent、不调 openspec。
- **改代码但不改业务能力 / 接口契约 / 权限语义，且 L1 四门槛全满足** → **L1**：说明范围 → 直接改 → 跑最小验证（§2 矩阵对应行）→ 输出结果。
- **改代码但属依赖 / 构建 / 脚手架 / lint / 非业务技术债，或 L1 门槛缺一** → **L2**：说明方案与影响 → 执行 → 跑受影响目标验证。
- **改业务能力**（页面能力 / 交互规则 / 状态流转 / 权限语义）→ **L3**：openspec 提案 → 人工确认 → TDD 实施 → 验收 → 归档。
- **高风险**（跨端协议 / Cesium 内核 / wujie 壳 / token 体系 / 构建部署链路 / 权限模型；具体硬门禁清单见 §8）→ **L4**：按 L3 执行，且实施前取得人工确认。

### 1.2 L1 四条门槛（缺一即升 L2 / L3）

① 不新增或改变业务能力、接口契约、权限语义；② 改动不超过 3 个文件；③ 目标明确、可逆，验证可在 5 分钟内完成；④ 不新增生产依赖。L1 / L2 禁止创建 openspec Change、计划文档或子 Agent。

### 1.3 规则优先级仲裁

规则冲突时从高到低执行，低阶规则不得覆盖高阶：

1. 平台安全策略与人工当场指令。
2. 本文档（含 §6 红线、§3 API 契约）与目标端 `docs/UI规范-*.md`。
3. 已确认的 `openspec/changes/<name>/` 与 `openspec/specs/`。
4. 当前 Change 的 `tasks.md` 中正在执行的 Task。
5. Skill / 插件自带的工作方法（含 superpowers）。

任何 skill 或插件不得绕过上级规则、自行扩大需求、新增平行任务源或改写既有契约。

## 2. 最小验证矩阵 + 测试金字塔

### 2.1 最小验证矩阵

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

### 2.2 测试金字塔策略（基线 = 关键集成测试，先红后绿，回归闭环）

- **基线定义**：测试金字塔的底座是「关键 composable + 移动端 bridge + http 拦截器」的前端 Vitest 集成测试。仓库已有 48 例覆盖 composable 与 http 拦截器，缺口仅移动端 `apps/mobile/bridges`；不照搬 training 的全量测试金字塔 / Testcontainers / 162+16 例，按项目节奏增量扩充。
- **先红后绿（TDD）**：新增 / 修改能力的任务标注 `[TDD]`，先写失败 / 期望测试再实现；实现已存在则验其契约，发现缺陷仅在所属模块内修正。
- **回归闭环**：`npm test`（vitest run）为回归门禁。改动 `apps/mobile` 或 `bridges` 时 `npx vitest run apps/mobile` 必绿；改动 `src/services/http.ts` 时 `npx vitest run src/services/http.spec.ts` 必绿。L3 / L4 按 `tasks.md` 验收标准全量，不得以 L1 / L2 降级。

## 3. API 契约规则

（提炼自 `openspec/config.yaml` + `src/services/http.ts` + `hardControlGuard` + `deviceCode`）

1. **零下行控制红线**：前端只监不控，`services` 不得定义硬控写接口；任何出站请求命中硬控路径由 `guardHardControl` 在 http 拦截器统一拦截。
2. **B3 统一响应包络**：所有响应经 `unwrapBody<T>` 解包，`code=0` 返回 `data`，非 0 抛业务错误；service 调用方只消费 `data`。
3. **20 位中石化 MDM 设备编码**：设备物理主键固定 20 位 MDM 编码，禁止自创物理主键。
4. **防重放签名**：生产环境（gateway-bypass=false）http 拦截器强制 HMAC-SHA256 签名头（timestamp / nonce / signature）；Dev 可经 gateway-bypass 挂起。
5. **令牌内存态**：访问令牌走 HttpOnly Cookie / 内存态（`getAccessToken`），禁止 localStorage 明文。
6. **目录与分层**：按功能模块为第一级；`services` 与 `adapter` 分离，跨端公共服务置于 `src/`。

## 4. 工程记录闭环

实施任务的唯一真源是 `openspec/changes/<name>/tasks.md`。

- 会话内进度跟踪只作临时备忘，不写入仓库；任务状态只回填 `tasks.md` 勾选框。
- 禁止在 `openspec/` 之外建立第二套需求规格或任务清单（含 skill 生成的计划文件、持久化待办）。
- superpowers 定位为**可组合的工程辅助，而非常驻流程**：沿用其 `test-driven-development`、`systematic-debugging`、`verification-before-completion` 的方法要求；其 `brainstorming`、`writing-plans`、子 Agent 调度与第二套 Review，在已确认 Change 的 `proposal.md` / `tasks.md` 已覆盖同一职责时不得重复启用。
- L0 / L1 / L2 不默认起子 Agent、不写计划文档；仅在任务复杂度或用户要求达到阈值时升级为 L3。

三类目录职责不重叠：

| 目录           | 回答的问题           | 特征                                 |
| -------------- | -------------------- | ------------------------------------ |
| `docs/`        | 系统**现在**是什么样 | 长期共识，跨版本有效，改了要同步代码 |
| `openspec/`    | 系统**将要**怎么变   | 唯一业务规格来源                     |
| `engineering/` | 这次**做得怎么样**   | 短期过程记录：计划、QA、复盘         |

- 短期开发记录放 `engineering/`，**不放 `docs/`**；QA 结果、发布检查、复盘同理。
- 实施任务只在 `openspec/changes/<name>/tasks.md`（见 §1.3 仲裁第 4 条）。
- 详见 `docs/AGENTS.md` 与 `engineering/README.md`。

## 5. 完成标准（Definition of Done）

任一 L3 / L4 改动在声称完成前，必须满足：

1. **验收标准达成**：`openspec/changes/<name>/tasks.md` 全部勾选，验收标准逐条满足。
2. **回归全绿**：受影响目标 `npm test` / `npm run type-check` / `eslint` 0 error（按 §2 矩阵对应行）。
3. **文档同步**：代码改动若改变既有契约 / 行为，同步更新 `docs/` 与对应 `docs/UI规范-*.md`；禁止把短期记录写进 `docs/`。
4. **提交按 scope 拆分**：`type(scope): 描述`（conventional commits + 端 scope），跨影响面拆多提交，提交信息单行成句、禁止分点列表；禁止提交临时输出文件（如 `tsc-out.txt`、`vitest-out.txt`）。

## 6. 既有项目约束（压缩自原 §1–§8 + §9 分层）

### 6.1 项目概览

安全管控指挥系统前端基座：Vue 3 + TypeScript + Vite + Pinia + wujie 微前端（子应用见 `subapps/`）+ Cesium GIS 一张图。三端形态：**大屏可视化端（`:root`）、后台管理端（`[data-theme='mgmt']`）、移动端（`[data-theme='mobile']`）**。后台 / 移动端为**独立应用入口** `apps/`（独立 index.html / 路由 / 布局壳，多入口构建见 `vite.config.ts`；dev 访问 `/apps/mgmt/`），与大屏壳层互不依赖，仅共享 `src/styles/tokens.css` 与公共服务。移动端按详设 V1.5 §5.3 为 Android 原生应用（hybrid 壳），本仓库 H5 规范约束内嵌业务页；集成方式待与设计方确认（详见 `docs/详细设计V1.5偏差分析.md`）。

### 6.2 UI 规范文档（按目标端强制阅读）

| 目标端       | 必读规范                    | 主题挂载              |
| ------------ | --------------------------- | --------------------- |
| 大屏可视化端 | `docs/UI规范-大屏端.md`     | `:root`（不挂属性）   |
| 后台管理端   | `docs/UI规范-后台管理端.md` | `data-theme="mgmt"`   |
| 移动端       | `docs/UI规范-移动端.md`     | `data-theme="mobile"` |

跨端需求逐端分别阅读对应文档。端与端之间**禁止**迁移视觉语言：玻璃 / 发光 / 渐变仅限大屏；浅色白卡 / 浅底标签仅限后台与移动。

### 6.3 绝对红线（任何端、任何改动都适用）

1. **禁止硬编码**颜色 / 字号 / 间距 / 圆角 / 尺寸，一律引用 `src/styles/tokens.css` 中的 `var(--token)`；新增或调整 token 只改 `tokens.css` 单一真源，**禁止**在组件内重定义。
2. **状态 / 报警等级 / 设备状态着色只用规范文档中的映射表**（枚举可直接复制），禁止自造色阶或文案。
3. **z-index 只用五层 token**：`--z-base(0) / --z-marker(5) / --z-chrome(10) / --z-overlay(30) / --z-toast(40)`。
4. **主题挂载正确**：大屏 `:root` 不挂属性，后台 / 移动按上表挂 `data-theme`；组件内不写端特异硬编码分支，用 token 自然区分。
5. 状态标签用全局 `.tag-success / -warning / -danger / -info` 类（后台 / 移动端浅底同色深字；大屏直接用语义色）。
6. **存量补位例外（`src/screen`）**：`src/screen/**` 为 fire-monitoring 迁入存量，规范 / token 已覆盖项必须用 `var(--token)`；未覆盖项可沿用 `src/screen/styles/variables.css` 源体系，新增页面不得新增未入 token 的硬编码值。

改动任何端前，先读 6.2 对应端 UI 规范。

### 6.4 高频踩坑速查

- 大屏主按钮是**渐变**（`--btn-bg-primary`），后台是实色 `#0b69d7`，移动是实色胶囊 `#1677ff`——三端不要混。
- 大屏禁止出现白底卡片 / 浅灰页面底 / `#0b69d7` / `#1677ff` / `.tag-*` 浅底标签。
- 后台 / 移动端禁止出现玻璃质感（`--glass-*`）、科技青 `#00d8ff`、发光边框、深蓝黑底。
- 移动端触控热区严格 48–56px（详设 V1.5 §3.4）；底部主操作条预留 `var(--mb-bottom-safe)` 安全区；户外正文 ≥15 / 标题 ≥18；户外强光模式切 `data-skin="outdoor"` 纯黑白高反差皮肤。
- 后台向导用水平步骤条、详情轨迹用垂直时间轴、页内切换用下划线页签，三者不混用。

### 6.5 项目内既有能力（优先复用，不要重造）

- 权限显隐：`v-permission` 指令（`src/directives/permission.ts`），数据权限由服务端过滤。
- 离线操作缓存：`src/composables/useOfflineOutbox.ts`（移动端现场作业场景）。
- 移动端桥接层：`apps/mobile/bridges/`（定位 / 离线落盘 / 令牌注入的接口 + H5 降级实现）。移动端页面**只允许经桥接实例访问原生能力**，禁止直调 `navigator.geolocation`、Web Storage 写死实现；hybrid 决策落地后仅在 `bridges/index.ts` 换 JSBridge 适配器，业务页零改动。
- 告警元数据：`src/composables/useAlarmMeta.ts`。
- 全局样式：`src/styles/tokens.css`（token 真源）、`global.css`、`element-dark.css`。

### 6.6 工程约定（Git / 提交 / 钩子 / 性能）

- 路由与菜单：`src/router/`（含子应用路由 `shell/subappRouter.ts`）。
- **Git 提交规范：`type(scope): 描述`（conventional commits + 端 scope）**。scope 固定枚举，禁止自造：`screen`（大屏壳 + `subapps/`）、`mgmt`（`apps/mgmt`）、`mobile`（`apps/mobile`）、`shared`（`src/` 跨端公共服务、`src/styles/tokens.css`、`vite.config.ts`）、`docs`、`chore`。跨端改动**按影响面拆成多个提交**：共享文件（token、公共服务）先行，端内跟随；确属一个原子改动且拆不开时才允许双 scope（如 `feat(mgmt,shared):`），不得常态化。提交信息**只写一句总结性语句**，简洁扼要，禁止写一长段描述或用 `- ` 等分点列表展开。禁止提交临时输出文件（如 `tsc-out.txt`、`vitest-out.txt`）。
- 提交前钩子（husky + lint-staged）会执行 eslint / prettier / stylelint，遵循现有 `.prettierrc.json`、`.stylelintrc.json` 配置，不新增例外。
- 性能基线与验收记录见 `docs/perf/`；架构决策与规格见 `openspec/`。

### 6.7 品牌规范对齐（中石化 / 《石化智云 UI 规范》）

中石化品牌方对三端 UI 与前端代码的硬性要求，AI 生成 / 修改代码时必须对齐。各条已分别落到三端 UI 规范（见 §6.2），此处汇总为红线清单；偏离需回规范文档确认，不得擅自降级：

1. **Logo 回主页**：品牌 Logo 置页面左上角，点击返回主页。落点：大屏（`docs/UI规范-大屏端.md` 顶栏 `.brand`）、后台（顶栏）、移动端（`apps/mobile/components/MobileHeader.vue` brand 变体）。
2. **弹性间距**：推荐外边距 16 / 内边距 24、标题 16 / 正文 14 为基线，可按分辨率与视距动态适配（不刚性硬卡）。落点：后台间距基线段、大屏间距档 `4/8/16/24`、移动端页边距 `16px`，均经 token 承载。
3. **隔行变色**：表格 / 数据列表开斑马纹，提升高压阅读舒适度。落点：后台数据表格、大屏数据列表（复用 `--row-alt-bg`）；移动端由 `--row-alt-bg-mobile` 承载。
4. **字体与配色**：中文默认 Microsoft YaHei（微软雅黑）优先；大屏深蓝科技、移动 / 后台白底，配色少即是多、高对比高易读。落点：三端规范字体段 + `--font-family-zh` 首位。
5. **移动端户外高反差皮肤**：强光 / 户外锁死 `data-skin="outdoor"` 纯黑白高反差皮肤（WCAG AAA，对比 >7:1），停用渐变 / 投影 / 毛玻璃 / 浅灰线；状态标签 / 警情通知改为**高饱和纯色色块 + 白字 + 2px 黑硬描边**（`.tag` 类 `border: var(--mb-border-w) solid var(--tag-stroke)`，户外 `--tag-stroke:#000; --mb-border-w:2px`）。落点：移动端 §6 + `src/styles/tokens.css` 户外块。
6. **适老 / 高易用性**：移动端「我的 → 适老与无障碍」一键适老 + 细项调节，与户外高对比可叠加；适老行高弹升至 `1.8` 倍字号（`--mb-line-height` 覆写），只放大字号 / 控件 / 间距，不改变流程与字段；后台适老同步放大侧栏 / 筛选 / 行高 / 主按钮。落点：移动端 §7、后台 §6。
7. **代码基线（HTML5 / 缩进）**：前端代码（Vue / HTML / TS / CSS）统一 **2 空格缩进**；根 HTML 必须 `<!DOCTYPE html>` + `UTF-8` 字符集。由 `.prettierrc.json`（`tabWidth:2`）+ `index.html` 实际保证，提交前 prettier / stylelint 钩子兜底，禁止新增例外（见 §6.6）。

### 6.8 分层规则与目录职责

改哪个目录，就从根往下读到那一层，**不必全读**：

| 目标目录                                                    | 读取链                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/mgmt/**`                                              | 根 §1–§6 → `apps/mgmt/AGENTS.md` → `docs/UI规范-后台管理端.md` |
| `apps/mobile/**`                                            | 根 §1–§6 → `apps/mobile/AGENTS.md` → `docs/UI规范-移动端.md`   |
| `src/screen/**`（大屏存量）                                 | 根 §1–§6 → `src/screen/AGENTS.md` → `docs/UI规范-大屏端.md`    |
| `subapps/**`（wujie 子应用）                                | 根 §1–§6 → `subapps/AGENTS.md` → `docs/UI规范-大屏端.md`       |
| 大屏壳其余部分（`src/` 非 screen、`src/styles/tokens.css`） | 根 §1–§6 → `docs/UI规范-大屏端.md`                             |
| `docs/**`                                                   | `docs/AGENTS.md`                                               |

分层文件与本文件冲突时按 §1.3 仲裁：**根 `AGENTS.md` 高于分层 `AGENTS.md`**，分层文件只能加严、不得放宽。新增分层文件时必须在本表登记。三类目录职责见 §4。

## 7. L3 / L4 四件套、QA/Retro 即刻记录与模板体系

### 7.1 L3 / L4 强制 OpenSpec 四件套

L3 / L4 改动动手前必须完成并闭环以下四件套（位于 `openspec/changes/<name>/`），且经末尾「人工确认关卡」确认后才允许写代码：

- `proposal.md`（Why / What / Capabilities / Impact + 人工确认关卡）
- `design.md`（架构、决策 ADR、风险、依赖）
- `tasks.md`（≤2h 可勾选任务，[TDD] 先写失败测试；任务状态只回填此处，禁止在 `engineering/` 另立清单）
- `spec-delta.md`（新增 / 修改 / 移除 三段，与 `spec.md` 同构）

四者须闭环：`proposal` 的 Capabilities ↔ `spec-delta` 的 Requirement ↔ `tasks` 的验收标准一一对应；人工确认（L3 须过、L4 实施前须过）后方可动手。禁止 L1 / L2 建立 OpenSpec Change。

**归档闭环（全勾必归档）**：`tasks.md` 全部勾选后，必须在**同一次交付内**完成收尾，不允许滞留 `changes/`：

1. **spec 回填**：将 `spec-delta.md` 合入 `openspec/specs/<capability>/spec.md`。
2. **归档**：`git mv openspec/changes/<name> openspec/archive/<YYYY-MM-DD>-<name>`（日期前缀必带）。
3. **命名与元数据**：进行中 Change 也建议带 `YYYY-MM-DD-` 前缀，且每个 Change 含 `.openspec.yaml`（`schema: spec-driven` + `created: <YYYY-MM-DD>`）；CI 跑 `node scripts/check-openspec-hygiene.mjs` 守门（全勾未归档 / 归档缺日期前缀即失败，四件套缺失与命名前缀为告警）。

### 7.2 QA / Retro 即刻记录

L3 / L4 任务完成后**即刻**写 `engineering/qa/` 与 `engineering/retro/`，不允许攒到最后补；L0–L2 不写。

- QA：范围、验收口径、实际执行命令与用例数、未运行项、结论；**截图证据是结论必要附件**（UI 改动附页面截图、关键验证附终端输出快照，置于同目录引用文件名）。
- Retro：做得好 / 问题 / 原因 / 改进方案四段式。

### 7.3 模板体系（位于 `templates/`）

新建上述四件套与 QA/Retro 时，复制对应模板填充，避免格式漂移：

| 模板                                         | 用途                   |
| -------------------------------------------- | ---------------------- |
| `templates/_openspec-proposal_template.md`   | 四件套 · proposal      |
| `templates/_openspec-design_template.md`     | 四件套 · design        |
| `templates/_openspec-tasks_template.md`      | 四件套 · tasks         |
| `templates/_openspec-spec-delta_template.md` | 四件套 · spec-delta    |
| `templates/_qa_template.md`                  | engineering/qa 记录    |
| `templates/_retro_template.md`               | engineering/retro 记录 |
| `templates/api-contract-writing-guide.md`    | §3 API 契约编写手册    |

`templates/README.md` 为索引与用法说明。

## 8. L4 硬门禁清单

以下任一类改动命中即升 **L4**（按 §1.1 取得人工确认后才实施），不得按 L1 / L2 直接动手：

- **微前端壳层**：`wujieBridge` / `subappRouter` / `wujieTokens` 接口变更。
- **设计令牌真源**：`src/styles/tokens.css` 变量重命名 / 删除 / 层级重构（含 z-index 五层 token、状态着色映射）。
- **http 拦截器**：`src/services/http.ts` 的拦截器签名、认证头、错误码映射改动。
- **主题挂载机制**：`data-theme` / `data-skin` / `data-elder` 挂载逻辑变更。
- **三端共享 composable 破坏性变更**：`src/composables/` 等跨端公共能力的破坏性 API 调整。
- **依赖与框架**：生产依赖新增 / UI 库更换 / 微前端框架更换。

> 以上任一项同时触及 §3 API 契约或 §6 红线的，按 §1.3 仲裁以高阶规则为准。

## 9. Review 结论三选一

任何代码评审 / 变更评审的结论必须为以下三者之一，**禁止含糊带过**：

- **通过**：无需修改，可直接合入。
- **需修改**：明确指出修改点，修改后无需再全员评审。
- **需人工决策**：存在高风险 / 规范冲突 / 范围扩散等需拍板事项，转交人工确认（对应 L4 关卡）。

> 不得出现「基本可以」「再看下」「问题不大」等模糊结论；评审人须从三选一中明确给出一项。

## 10. 测试金字塔起步（长期）

测试策略基线见 §2.2，长期保持以下约束，不漂移：

- **不照搬 training 的全量测试金字塔 / Testcontainers / 162+16 例**；按项目节奏增量扩充。
- 起步基线只做「关键 composable + 移动端 bridge + http 拦截器」的前端 Vitest 集成测试。
- 坚持 **先红后绿（TDD）** + **回归闭环**（`npm test` 为回归门禁）；新增 / 修改能力标注 `[TDD]` 先写失败测试。
