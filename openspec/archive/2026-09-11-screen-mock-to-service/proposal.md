# 变更提案：大屏数据接入接线（mock→service）

> 适用：L3。聚焦单一变更：把大屏组件从遗留 `lib/data/*Mock` 改接已建好的 `src/services/*` 真实调用层。

## Why

大屏 15 视图 + 99 面板已通过内嵌闭环范式跑通交互，但数据层 100% 依赖 `src/screen/lib/data/*Mock.ts`（41 个文件）——组件直接 import 假数据，绕过了已建好的 `src/services/*`（`request()` + `useDevMock()`/`VITE_API_BASE` 回退 + B3 包络）。结果是大屏停在"演示态"无法联调。后端桩 `alarm.ts`/`emergency.ts`/`weather/*` 已就绪，工作量已从"造数据层"降为"逐域封装 + 组件接线"。现在做可把大屏推进到联调，且复用既有 service 基础设施、不重造。

## What Changes

- 按域封装 service：扩展 `services/alarm.ts`（消防，已就绪）、`services/emergency.ts`（事故应急，已就绪）、`services/weather/*`（极端天气/台风，真实外部 API）；新建 `services/hazard.ts`（重大危险源）、`services/security.ts`（安全防恐）、`services/production.ts`/`video.ts`/`communication.ts`（P2）。
- P0 三模块（消防报警、事故应急、极端天气）组件从 `lib/data/*Mock` 改消费对应 `src/services/*`，经 `request()` 真实调用、dev 自动降级。
- 接线前做结构对齐审计：`AlarmItem` 等 service 类型与 mock 返回逐字段对齐，缺失字段先补 service。

## Capabilities

### Added Capabilities

- `screen-data-wiring`：大屏组件经统一 `src/services/*` 层消费后端数据，dev 无后端自动降级，告别 `lib/data/*Mock` 直引。

### Modified Capabilities

- （无既有 capability 被修改，属新增接线能力。）

## Impact

- 端：仅大屏 `:root`；不影响后台 `mgmt` / 移动 `mobile`，不改 `tokens.css`、不改 wujie 壳与路由。
- 契约：严守 AGENTS.md §3——零下行控制（不新增硬控写接口）、B3 包络（`unwrapBody` 解包）、20 位 MDM 设备码、防重放签名、令牌内存态；仅复用既有 GET/事件写接口。
- 依赖/回归：依赖 `src/services/http.ts`；可能触发 `src/services/http.spec.ts` 与 realtime 集成测试；P0 接线后 `npm run type-check` + eslint 0 error。

## 人工确认关卡（L3 须过）

- [ ] 提案范围与用户确认一致：P0 = 消防报警/事故应急/极端天气三模块样板，P1/P2/P3 分期，无需求扩散。
- [ ] 目标端 UI 规范已对齐：本次仅改数据接入，不动视觉语言与 token。
- [ ] API 契约未违反：仅读/复用既有事件写，无新增硬控写接口，B3 包络与 MDM 编码保留。
- [ ] 高风险项：不触碰 Cesium 内核 / wujie 壳 / token 体系 / 构建部署链路 / 权限模型，无需 L4 确认。
