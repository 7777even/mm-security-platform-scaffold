# Proposal: feat-monitor-warning

## Why

对照 `D1 验收标准与测试用例对照表` §2「监测预警（4 项二级功能）」与 `D1验收标准_脚手架差距清单与整改建议.md` 的 P2 范围，本模块是 P2 第一块、基座已具备落地条件：

- `services/alarm.ts` 已定义 `AlarmItem`/`AlarmStatus`/`fetchAlarmPage` 等类型与接口，但 `views/fire-alarm/index.vue` 仍为占位骨架，无列表/详情/处置。
- `services/ws.ts` 实时通道仅提供 `RealtimeClient`，未订阅报警 topic、未与 UI 状态联动。
- RBAC 已内置 `fire-alarm:view` / `fire-alarm:ack` 权限位；审计埋点（`audit.ts`）、性能基线（`perf-budget.ts`）、零下行守卫（`hardControlGuard.ts`）均已在 `harden-d1-frontend-baseline` 闭环，可直接复用。

目标是把「监测预警」从骨架推进为可演示、可单测、可映射 D1 验收用例的端到端功能。

## What Changes

1. 新增 `stores/alarm.ts`（Pinia）：实时报警 ingestion（订阅 ws topic → 入 store）、列表分页/等级/状态筛选状态、ack 状态流转；`ingestAlarm` 暴露为可单测纯函数。
2. 接线实时流：在应用初始化处启动 `RealtimeClient`，按 `alarm.push` topic 分发至 alarm store（含非法消息容错）。
3. 实现 `views/fire-alarm/index.vue`：报警列表（分页 + 等级/状态筛选）、详情抽屉、`ack` 按钮（`fire-alarm:ack` 权限门控，无权限禁用）。
4. `ack` 动作接 `reportAudit({ action: 'alarm-ack', module: 'fire-alarm' })`，并触发 P10 查询性能打点（`recordPerf`/`markOnce`）。
5. 复用 `hardControlGuard`：本模块仅软件协同联动（ack/dispatch 预案），不引入任何硬控写端点。

## Capabilities

新增 Capability：**Monitor Warning**（归档后并入 `scaffold-foundation/spec.md`）

- Requirement: 实时报警接入 — 订阅 ws `alarm.push`，去重入 store，断线重连后继续累积。
- Requirement: 报警列表与筛选 — 分页 + 等级(1-4)/状态(ACTIVE/ACKED/DISPATCHED/CLOSED)筛选，空态展示。
- Requirement: 报警确认处置 — 具 `fire-alarm:ack` 权限方可确认；确认仅更新状态并发起软件协同（预案 dispatch），不下行硬控。
- Requirement: 审计与性能 — ack 上报审计；列表查询触发 P10 打点。

## Impact

- 依赖既有 spec：`realtime-channel`（ws ingestion）、`rbac-permission`（`fire-alarm:view`/`ack`）、`scaffold-foundation`（audit / perf-budget / hardControlGuard / 设计 token）。
- 新增/改动文件：`stores/alarm.ts`、`views/fire-alarm/index.vue`、实时流接线（建议 `services/realtime.ts` 或 `main.ts` 初始化）、对应 `.spec.ts`。
- 不改动 services 层硬控边界；不引入公网外链；不破坏既有构建/lint。

## 非目标

- 地图联动、视频弹窗（属「电子地图/视频」模块，独立 change）。
- RBAC 角色/权限接口真实接入（需后端 IDP 契约）。
- 真机/浏览器级性能压测（CI-browser，超出本环境）。
- 硬控写端点（受 `hardControlGuard` 拦截，本 change 严禁新增）。

## 验证

- `vitest run` 全绿（alarm store spec：入流追加/去重、分页切片、ack 状态流转、ws 分发接线；view spec：筛选交互、权限门控、空态）。
- `eslint` 0 error；`npm run build` 通过。
- 回写 `D1验收标准_脚手架差距清单与整改建议.md` 中「监测预警」P2 状态。
