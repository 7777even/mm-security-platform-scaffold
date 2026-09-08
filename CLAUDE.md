# Claude Code 项目规则 — 安全管控指挥系统前端脚手架

> 本文件是 Claude Code 在本仓库的入口。**完整约束以根目录 `AGENTS.md` 及其分层 `AGENTS.md` 为准**；本文件只补充 Claude 动手前必须在脑中建立的"优先级与红线"，不替代 `AGENTS.md`。
> 核心定位：**AI 是规格执行者，不是自由设计者**——所有设计 / 接口 / 流程决策都有唯一真相源，AI 必须读取并服从，不得自行创造平行体系。

## 1. 规则入口与层级

- 动手前**先读根 `AGENTS.md`**（含 §1 分级 L0–L4、§2 验证矩阵、§3 API 契约、§6 既有约束与 UI 规范、§8 L4 硬门禁）。
- 改子目录时按 §6.8 读取链**向下读到对应层**：`apps/mgmt/AGENTS.md`、`apps/mobile/AGENTS.md`、`src/screen/AGENTS.md`、`subapps/AGENTS.md`、`docs/AGENTS.md`。
- 优先级（冲突时从高到低）：平台/人工指令 > 根 `AGENTS.md`（含 §6 红线、§3 契约）+ 目标端 `docs/UI规范-*.md` > 已确认 `openspec/changes|specs` > 当前 Change 的 `tasks.md` > Skill/插件方法。分层 `AGENTS.md` 只能加严、不得放宽。

## 2. 改动分级（先判级，再动手）

- **L0 问答/只读** → 直接完成；不建文件、不起子 Agent、不调 openspec。
- **L1 微小修改**（四门槛全满足：不改业务能力/接口契约/权限语义、≤3 文件、5 分钟内可验证、不新增生产依赖）→ 直接改 + 最小验证。
- **L2 工程维护**（依赖/构建/脚手架/lint/非业务技术债，或 L1 门槛缺一）→ 说明方案与影响 → 执行 → 跑受影响目标验证。
- **L3 业务能力**（页面能力/交互规则/状态流转/权限语义）→ openspec 提案 → 人工确认 → TDD 实施 → 验收 → 归档。
- **L4 高风险**（wujie 壳层 / `tokens.css` 真源 / `http.ts` 拦截器 / 主题挂载 / 跨端 composable 破坏性 / 依赖框架更换）→ 按 L3 且**实施前取得人工确认**。
- L1/L2 **禁止**创建 openspec Change、计划文档或子 Agent；分级只决定流程重量，不豁免 §6 红线、§2 验证矩阵与 §3 契约。

## 3. 真相源（唯一，禁止平行体系）

- 业务规格与任务：`openspec/changes/<name>/`（proposal/design/tasks/spec-delta 四件套，`tasks.md` 是唯一任务真源，状态只回填勾选框）。
- 系统现状：`docs/`（长期共识）；短期过程记录：`engineering/`（qa/retro/ship/plans），二者职责不混。
- 禁止在 `openspec/` 之外建第二套需求规格 / 任务清单 / issue 体系。

## 4. 绝对红线（任何端、任何改动）

1. **禁止硬编码**颜色/字号/间距/圆角/尺寸，一律 `var(--token)`，真源 `src/styles/tokens.css`；新增/调整 token 只改 `tokens.css`。
2. 状态/报警等级/设备状态着色只用 `docs/UI规范-*.md` 映射表，禁止自造色阶/文案。
3. z-index 只用五层 token：`--z-base(0)/--z-marker(5)/--z-chrome(10)/--z-overlay(30)/--z-toast(40)`。
4. 主题挂载正确：大屏 `:root` 不挂属性；后台 `data-theme="mgmt"`；移动 `data-theme="mobile"`；用 token 区分，不写端特异硬编码分支。
5. 状态标签用全局 `.tag-success/-warning/-danger/-info` 类。
6. 三端视觉语言不互迁：玻璃/发光/渐变仅大屏；浅色白卡/浅底标签仅后台与移动。
7. **零下行控制**：前端只监不控，`services` 不得定义硬控写接口；硬控路径由 `guardHardControl` 在 http 拦截器统一拦截。
   > 改任何端 UI 前，先读 §6.2 对应端 `docs/UI规范-*.md`。

## 5. 工程约定

- **Git 提交**：`type(scope): 描述`，scope 固定枚举 `screen/mgmt/mobile/shared/docs/chore`，禁止自造；跨端按影响面拆多提交，共享文件（token、公共服务）先行；提交信息单行成句、禁止分点列表；禁止提交临时输出（`tsc-out.txt`、`vitest-out.txt`）。
- **验证矩阵**（改动后只跑对应一行，禁止 L1/L2 后连跑 lint+type-check+build+build:subapps 四套）：文档 `git diff --check`；单文件组件/样式 `eslint` 或 `type-check`；`tokens.css`/composables `type-check`+`eslint`；关键路径 `vitest run <spec>`；构建配置 `npm run build`（dist 清空触发守卫时用 `npx vite build --emptyOutDir=false`）；subapps `npm run build:subapps`；L3/L4 按 tasks 验收全量。
- **测试**：`npm test`（vitest run）为回归门禁；关键 composable / 移动端 bridge / http 拦截器须绿。
- **Review 结论三选一**：通过 / 需修改 / 需人工决策（禁止"基本可以"等模糊结论）。

## 6. 范围边界（脚手架定位）

- 本仓库是**前端基座/脚手架**，**无后端**；AI 不得自行引入后端服务、数据库或自创 API 契约。前后端接口以 §3 契约规则 + 已确认 openspec 为准。
- AI 负责需求分析/技术设计/编码/测试/Review/文档；业务确认、架构决策、权限确认、最终合并由人负责。AI 禁止操作生产、改生产数据、自造业务规则、自建权限模型、自改 DB 结构、未确认引依赖。

## 7. OpenSpec 可执行命令（可选）

本仓库已启用 openspec（`schema: spec-driven`）。Cursor 侧可用 `openspec` CLI，见 `.cursor/commands/opsx-*.md`（需本地安装 `openspec` CLI）。WorkBuddy/Claude 侧直接按 `AGENTS.md` §7 四件套执行。

## 8. 开工前必读（路线图 / 进度台账 / 归档纪律）

L3 / L4 开工前，按序读取：

1. **跨库路线图**：`../backend-scaffold/docs/architecture/roadmap.md`（能力依赖顺序与阶段完成判据；跨库共享，本库不复制）。
2. **进度台账**：`engineering/plans/end-to-end-development-progress-tracker.md`（各能力域状态与证据）。
3. **当前已确认 Change**：`openspec/changes/<name>/`——其 `tasks.md` 是唯一实施依据；路线图只规定依赖顺序，不授权跳过已确认范围。

收尾纪律：

- `tasks.md` 全勾后**同一次交付内**完成 spec 回填（→ `openspec/specs/<capability>/`）并归档到 `openspec/archive/<YYYY-MM-DD>-<name>/`（详见 AGENTS §7.1 同名纪律）。
- 更新进度台账：状态、Change、日期、验收证据（QA 文件链接）、阻塞项、行更新时间。
- 判据：**Mock、桩服务、占位页面、单层代码，不得作为能力「已完成」的依据**；只有端到端验收 + 回归全绿（vitest + type-check）+ 文档同步通过才可关闭。
