# AI 协作速查指南（跨工具通用）

> 面向任何在本仓库工作的 AI 助手（Claude / Cursor / Codex / WorkBuddy 等）。动手前先花 1 分钟读这一页，再读对应的 `docs/` 真源。**本文不是规范本身，是索引与速记**；冲突以被引用的真源文件为准。

## 0. 一句话定位

中石化安全管控指挥系统**前端基座**（Vue3 + TS + Vite + wujie 微前端 + Cesium 一张图），纯前端无 Node 后端。本仓库的「工程化约束」密度极高（分级工作流、UI 红线、API 契约红线），AI 改动必须先判定等级再动手。

## 1. 五级真源（信息去哪找）

| 真源                                        | 回答什么                                 | 何时读                       |
| ------------------------------------------- | ---------------------------------------- | ---------------------------- |
| `AGENTS.md`（根）                           | 分级工作流 L0–L4、验证矩阵、红线总入口   | 每次动手前                   |
| `docs/UI规范-{大屏端,后台管理端,移动端}.md` | 该端 token / 主题 / 状态映射 / 自检清单  | 改任何端 UI 前（必读对应端） |
| `docs/api/*.openapi.json`                   | 机器可读 API 契约（单一真源）            | 改接口 / 服务 / 生成类型前   |
| `openspec/changes/<name>/`                  | 业务「将要」怎么变（唯一业务规格源）     | 业务变更 L3/L4               |
| `engineering/`                              | 本次「做得怎么样」（QA/Retro/Ship/进度） | 验收、复盘、进度查询         |
| `docs/architecture/` `docs/requirement/`    | 系统「现在」是什么（架构/业务域）        | 理解上下文、权限、数据流     |

分层读取链：`AGENTS.md` → `apps/mgmt`/`apps/mobile` 端内 AGENTS → `docs/UI规范-*.md` → `src/screen` 存量 → `subapps/AGENTS.md`。

## 2. 动手前先分级（L0–L4 速记）

- **L0 不改代码**（解释/评审/只读/文档/文本）→ 直接完成，不建文件、不起子 Agent。
- **L1 改代码但不改业务能力**，且满足四门槛（① 不改业务能力/契约/权限 ② ≤3 文件 ③ 可逆、5 分钟内可验证 ④ 不新增生产依赖）→ 说明范围 → 直接改 → 跑矩阵对应行。
- **L2 依赖/构建/脚手架/lint/非业务技术债，或 L1 门槛缺一** → 说明方案与影响 → 执行 → 跑受影响目标验证。
- **L3 改业务能力**（页面能力/交互/状态流转/权限语义）→ openspec 提案 → 人工确认 → TDD 实施 → 验收 → 归档。
- **L4 高风险**（跨端协议/Cesium 内核/wujie 壳/token 体系/构建部署/权限模型）→ 按 L3 执行且实施前取得人工确认。

> 分级只决定流程重量，不豁免 §5/§6 红线与 API 契约。回复中先用一句话说明判定与理由。

## 3. 最小验证矩阵（改完跑哪条，只跑对应一行）

| 改动范围                                         | 必跑                                        |
| ------------------------------------------------ | ------------------------------------------- |
| 文档 / 规范 / AGENTS                             | `git diff --check`                          |
| 单端单文件组件或样式                             | `npx eslint <path>` 或 `npm run type-check` |
| 跨端公共服务 / `tokens.css` / `composables`      | `npm run type-check` + `npx eslint <path>`  |
| 关键路径 `deviceCode`/`usePermission`/`realtime` | `npx vitest run <spec>`                     |
| 构建配置 / 依赖 / `vite.config.ts` / 多入口      | `npm run build`                             |
| `subapps/**`                                     | `npm run build:subapps`                     |
| L3/L4                                            | 按 `tasks.md` 验收标准全量                  |

> `vite build` 清空 `dist/` 会触发批量删除守卫而失败：验证编译用 `npx vite build --emptyOutDir=false`。

## 4. API 契约红线（零容忍，AGENTS §3）

1. **零下行控制**：前端只监不控，`services` 不得定义硬控写接口；硬控路径由 `guardHardControl` 在 http 拦截器统一拦截。
2. **B3 统一包络**：`unwrapBody<T>` 解包，`code=0` 返回 `data`，非 0 抛错；调用方只消费 `data`。
3. **20 位中石化 MDM 设备编码**：设备物理主键固定 20 位，禁止自创。
4. **防重放签名**：生产环境 HMAC-SHA256（`X-Timestamp`/`X-Nonce`/`X-Signature`，有效窗 10s）；Dev 可 `gateway-bypass` 挂起。
5. **令牌内存态**：访问令牌走 HttpOnly Cookie / 内存态，禁止 `localStorage` 明文。

## 5. UI 红线（任何端、任何改动适用）

- **禁止硬编码**颜色/字号/间距/圆角/尺寸，一律 `var(--token)`；新增/调整 token 只改 `src/styles/tokens.css` 单一真源。
- **状态/等级/设备状态着色只用规范映射表**（枚举见 `docs/glossary.md`），禁止自造色阶或文案。
- **z-index 只用五层**：`--z-base(0)/--z-marker(5)/--z-chrome(10)/--z-overlay(30)/--z-toast(40)`。
- **主题挂载正确**：大屏 `:root` 不挂属性；后台 `data-theme="mgmt"`；移动 `data-theme="mobile"`；组件内不写端特异硬编码分支。
- **状态标签**用全局 `.tag-success/-warning/-danger/-info`（后台/移动浅底深字；大屏用语义色）。
- **视觉语言禁止跨端迁移**：玻璃/发光/渐变仅限大屏；浅色白卡/浅底标签仅限后台与移动。

## 6. 目录职责（不重叠）

- `src/` 跨端公共服务（`services` 与 `adapter` 分离）；`apps/mgmt` `apps/mobile` 独立入口；`src/screen/` 迁入存量；`subapps/` wujie 子应用（IIFE 构建）。
- 三类目录：`docs/`=现在是什么（长期共识）、`openspec/`=将要怎么变（唯一业务规格）、`engineering/`=本次做得怎么样（短期过程）。

## 7. OpenSpec 工作流（业务变更走这里）

- CLI：`@fission-ai/openspec`（`new change` / `status --json` / `instructions` / `archive [-y --skip-specs]` / `list` / `validate`）。全局未装时用 `npx`。
- 跨工具入口：`opsx-*` 命令（`.cursor/commands/`）、`CLAUDE.md`、本指南；技能版 `.cursor/skills/openspec-*`（自动触发，固化 L3/L4 人工确认闸 + doc-only `--skip-specs` 归档）。
- L3/L4 业务变更 → 提案 → 人工确认 → TDD → 验收 → 归档到 `openspec/specs/`。

## 8. 机器消费闭环（契约 → 类型）

统一由 `scripts/gen-api-types.mjs` 处理「`_shared.json` 跨文件 `$ref` 合并 + 类型生成」，不要对单文件直跑 `openapi-typescript`（跨文件引用会失败）：

```bash
npm run gen:api-types          # 生成 src/types/generated/<domain>.ts + index.ts
```

消费：`import type { Alarm } from '@/types/generated'` → `Alarm.components['schemas']['AlarmItem']`。生成物为自动代码，**请勿手改**；契约变更后重跑并一并提交。契约↔代码一致性四同步见 `docs/api/README.md`。

## 9. 提交规范

- 格式 `type(scope): 描述`（conventional commits + 端 scope）。scope 固定枚举，禁止自造：`screen` / `mgmt` / `mobile` / `shared` / `docs` / `chore`。
- 跨端按影响面拆多提交（共享文件先行）；单行总结句，禁止分点列表；禁止提交临时输出文件（`tsc-out.txt` 等）。
- 提交前 husky + lint-staged 跑 eslint/prettier/stylelint，不 `--no-verify`。

## 10. 跨工具适配层（本仓库已就绪）

- `CLAUDE.md`：镜像 `AGENTS.md` 核心约束，供 Claude 系读取。
- `.cursor/`：`rules/`（核心纪律 / UI token / API 契约）、`commands/opsx-*`（裸 openspec 调用）、`skills/openspec-*`（自动触发技能）、`README.md`（安装与排错）。
- 三端配置一致性约定：以 `AGENTS.md` 为单一真源，其余为投影。

## 11. 本地提交流程提醒

本仓库存在自动化进程（`scaffold-bot`）会重放/重置分支历史。**提交后务必验证落库**：`git cat-file -e HEAD:<path>` 或 `git log -1 -- <path>` 确认文件已进入 HEAD；未跟踪文件在 `git reset --hard` 下不会被删，被冲掉后按原样重提即可。建议重要提交及时 `push` 规避本地重置风险。
