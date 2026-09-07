# 设计文档：大屏数据接入接线（mock→service）

> 与 `proposal.md` / `tasks.md` / `spec-delta.md` 四者闭环，人工确认后才动手（AGENTS.md §1.1 / 用户规则 §5）。

## 目标与约束

- 目标：大屏组件消费统一 `src/services/*` 层（真实调用 + dev 降级），替换 `src/screen/lib/data/*Mock.ts` 直引，使大屏从演示态进入联调态。
- 硬约束：AGENTS.md §3（零下行控制 / B3 包络 / 20 位 MDM / 防重放签名 / 令牌内存态）；§6.3 红线（本次不涉及视觉，但仍不得引入硬编码色）；`services` 不得定义硬控写接口。

## 架构与方案

- 分层：`src/services/<domain>.ts` 为跨端公共服务真源；`src/screen/lib/data/*Mock.ts` 为待淘汰的遗留假数据，逐步清空而非新增。
- 调用路径：组件 → `services/<domain>`（内部 `request()` + `useDevMock()` 回退）→ `services/http.ts`（B3 包络 `unwrapBody` + 防重放签名 + 令牌内存态）。组件不再直接 import mock。
- dev 降级：`useDevMock()` 在 `!VITE_API_BASE` 或 `DEV && VITE_USE_DEV_MOCK==='true'` 时返回内置 fixture（参考 `services/alarm.ts:50-53`），保证无后端不白屏；有 base 走真实 API。
- 状态着色/ token：本次只动数据接入，UI 维持既有规范映射表与 token，零视觉改动。

## 决策记录（ADR）

- 决策 1：复用既有 `src/services/*` 而非新建并行 data 层 — 理由：基础设施已就绪、`useDevMock` 降级模式统一、避免双轨数据层；反对项：部分模块（生产/视频/通讯）暂缺 service，需新建但沿用同一 `request()` 模式。
- 决策 2：P0 仅取"后端桩已就绪"的三模块作样板 — 理由：风险最低、可验证接线范式；反对项：事故应急 mock 体量最大（35.7K），拆子任务控制单条 ≤2h。
- 决策 3：接线前强制结构对齐审计 — 理由：`AlarmItem` 等 service 类型与 mock 形状未必一致，先对齐再接线避免字段错位；反对项：略增前期工时。

## 风险与缓解

| 风险                         | 可能影响                    | 缓解措施                                                   |
| ---------------------------- | --------------------------- | ---------------------------------------------------------- |
| service 类型与 mock 形状错位 | 接线上线后字段缺失/类型报错 | 每模块先做结构对齐审计，缺失字段先在 service 补齐          |
| 淘汰 mock 误删仍被引用项     | 运行时 undefined            | 接线后 `grep` 确认 `lib/data/*Mock` 该模块 import 清零再删 |
| 真实 API 字段与文档偏差      | 联调数据异常                | dev 降级保留，联调期以真实返回为准修正 service 映射        |
| 回归 `src/screen` 存量类型债 | vue-tsc 报错                | 仅改接线文件，沿用现有 `@ts-nocheck` 范围不扩大            |

## 依赖

- 上游：`src/services/http.ts`（request/包络/签名）、`services/alarm.ts`/`emergency.ts`/`weather/*` 既有桩、`emergencyEventStore`/`emergencyPlanStore`/`securityEventStore`。
- 下游：大屏 P0/P1/P2/P3 各模块视图与面板组件。
- 待确认项：`#TODO-确认` 生产/视频/通讯后端是否已有接口契约（决定 P2 service 字段），不得默认已决。
