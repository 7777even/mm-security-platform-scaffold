# AGENTS 工作流优先重构 + 移动端桥接测试地基

## Why

当前 AGENTS.md 以"阅读约束 + 红线清单"为主（§1–§8），AI 读到的是"不许做什么"，缺少"当前任务该走哪条路"的决策入口；L0–L4 分级与验证矩阵埋在 §7，易被忽略。同时测试地基有缺口：仓库虽有 48 例，但移动端桥接层 `apps/mobile/bridges` 零覆盖，且无显式的"测试金字塔 + 回归闭环"策略。本变更将 AGENTS.md 重构为分级工作流优先，并把测试金字塔策略与 bridge 测试补齐全。

## What Changes

- 重构 `AGENTS.md`：§1 分级工作流（L0–L4 决策树 + 一句话判定）、§2 最小验证矩阵 + 测试金字塔策略、§3 API 契约规则、§4 工程记录闭环、§5 完成标准（DoD）、§6 既有项目约束（压缩原 §1–§8 + §9 分层，绝对红线保留为 §6.3 醒目子节）。
- 新增 `apps/mobile/bridges/bridges.spec.ts`（jsdom 环境）：覆盖 `H5LocationBridge` / `H5OfflineBridge` / `H5TokenSource` 契约与 `index.ts` 装配点。
- 在 AGENTS §2 写明回归门禁：改动 `apps/mobile` 或 `bridges` 时 `npx vitest run apps/mobile` 必绿。

## Capabilities

### New Capabilities

- `test-pyramid-policy`：AGENTS 中定义"关键 composable + bridge + http 拦截器 的 Vitest 集成测试为基线，先红后绿，npm test 为回归门禁"的策略。
- `mobile-bridge-tests`：移动端桥接层 Vitest 集成测试（jsdom）。

### Modified Capabilities

- `agent-workflow`：AGENTS.md 由约束清单升级为分级决策优先。

## Impact

- `AGENTS.md`：结构重写，约束内容不增删只重组，红线不稀释。
- `apps/mobile/bridges/bridges.spec.ts`：新增约 8–12 条用例。
- 不改动既有 48 例、不新增生产依赖（jsdom 已为 devDependency）。
