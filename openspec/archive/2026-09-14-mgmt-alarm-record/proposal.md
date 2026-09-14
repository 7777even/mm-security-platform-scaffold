# 变更提案：后台管理端报警管理域·报警记录页接后端（mgmt-alarm-record）

> 适用：L3 改动（新增后台管理端业务能力，复用既有跨库契约，无后端/契约增量）。

## Why

后台管理端（`apps/mgmt`）「逐域接后端」主线已落系统管理域（用户/角色/字典/审计/厂区五页）。报警管理域是下一个最高就绪度域：后端 `AlarmController` 已具备完整分页只读能力（`GET /api/v1/alarms` 支持 `page/size/level/status/deviceCode`），前端 `src/services/alarm.ts`、`docs/api/alarm.openapi.json`、`src/types/generated/alarm.ts` 契约与类型四方已对齐，但 `apps/mgmt` 下报警域的页面仍由静态 `module-embed.vue` 兜底（零 service 调用）。

现状痛点：报警管理菜单（报警记录 / 报警规则配置 / 误报管理 / 报警联动）全部是空壳，与大屏同源的报警台账无法在后台统一查阅、过滤、核对。本变更先闭合「报警记录」一页，把真实报警台账接入后台，验证「mgmt 报警域 → 共享后端 /alarms」的取数链路。

不做会怎样：报警管理域停留在演示壳，无法作为交付项；报警台账在后台无管理入口、无法按级别/状态核对。

## What Changes

- **路由优先命中真实视图**：`apps/mgmt/router.ts` 的 `SERVICE_PATHS` 加入 `'/alarm-record'`，并在 `serviceRoutes` 显式注册 `AlarmRecordView.vue`，优先于数据驱动的 `module-embed.vue` 兜底页。
- **报警记录页（只读订阅）**：新建 `apps/mgmt/views/alarm/AlarmRecordView.vue`（`/alarm-record`），消费 `GET /api/v1/alarms`：
  - 列表 + 真分页（`MgmtProTable` 封装 `el-pagination`，page/pageSize 上拉取数）；
  - 筛选卡：级别（一级~四级）、状态（活动/已确认/已派发/已闭环），查询/重置；
  - 8 列呈现：报警时间 / 报警名称 / 类型 / 级别 / 事发位置 / 关联设备 / 状态 / 是否预警；
  - 级别/状态/类型/预警均着 `.tag-*` 状态标签，中文映射（一级~四级、消防/气体/温度/视频/应急、活动/已确认/已派发/已闭环）；
  - 后端不可用时显式提示 + 空态，不回灌内存 mock 假数据（沿用 `isAlarmOffline`/`notifyBackendOffline` 三态纪律）。
- **service 扩展（向后兼容）**：`src/services/alarm.ts` 的 `fetchAlarmPage` 原仅传 `page/size`，后端已原生支持 `level/status/deviceCode` 但前端未暴露；本变更扩展可选 `query` 参数透传 `level/status`（deviceCode 暂未在前端 UI 暴露，预留），默认行为不变。

## Capabilities

### Added Capabilities

- `mgmt-alarm-record`：后台管理端报警管理域·报警记录页，接真实后端 `GET /alarms` 分页 + 级别/状态过滤 + 中文映射 + 状态着色，只读订阅（零下行控制）。

### Modified Capabilities

- `mgmt-scaffold`：后台端壳层服务驱动视图再 +1（报警记录），与既有系统管理域五页共用路由优先注册机制。

## Impact

- 受影响端：后台管理端（`data-theme='mgmt'`）。
- 受影响文件：`apps/mgmt/router.ts`、`apps/mgmt/views/alarm/AlarmRecordView.vue`（新增）、`src/services/alarm.ts`（仅扩展 `fetchAlarmPage` 可选 `query` 参数，默认行为不变）。
- 不触碰：大屏端、移动端、`src/styles/tokens.css`、契约真源 `docs/api/alarm.openapi.json`（本次零契约变更，既有 `/alarms` 已满足）、后端（零改动）。
- 契约与权限语义：本页为只读订阅，后端 `GET /alarms` 仅 `@RequireAuth`（登录可读），无 role/perm 限定；不新增任何硬控写端点（零下行控制红线保持）；响应仍走既有 `request()` B3 包络 + Bearer（内存态令牌）。
- 依赖与回归面：复用 `src/services/{http,alarm}.ts`、`apps/mgmt/components/{MgmtPageHead,MgmtProTable}.vue`、`apps/mgmt/utils/feedback.ts`（均不改签名）；回归面限定在后台端报警记录页与 `fetchAlarmPage` 调用方（mobile 端仍走原 `page/size` 默认，无行为变化）。

## 明确不在本期范围

- 报警规则配置页：后端**暂无** `AlarmRule` 端点（grep 确认无 `AlarmRule`/`RuleController`），暂缓至下一批。
- 报警写操作（确认/派发/删除）：后端 `AlarmController` 的写端点面向 `EmergencyEvent`（`POST`/`PUT /{id}`/`DELETE /{id}`），并非对 `Alarm` 台账的确认/派发；本页保持只读订阅，写链路待后端补 `Alarm` 状态变更端点后接入。

## 人工确认关卡（L3 须过）

- [x] 提案范围与「逐域接后端」主线一致：首期＝报警记录只读页；不扩散到规则配置/写操作（后端未就绪）。
- [x] 目标端 UI 规范（`docs/UI规范-后台管理端.md`）已对齐：白底卡片/浅灰底、主色蓝实色按钮、`.tag-*` 状态标签、无大屏玻璃/发光/科技青；色/字/距全部 `var(--mgmt-*)`。
- [x] API 契约（AGENTS.md §3）未违反：零下行控制 / B3 包络 / 令牌内存态；本次零契约变更，复用既有 `/alarms`。
- [x] 高风险项：本变更**不触碰** L4 清单（未改 `tokens.css`、`http.ts` 拦截器签名、wujie 壳、主题挂载机制、生产依赖）；仅新增只读视图 + 向后兼容地扩展 service 参数。
