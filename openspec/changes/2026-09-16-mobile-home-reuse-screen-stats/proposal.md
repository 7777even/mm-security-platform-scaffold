# Proposal: 移动端首页统计复用大屏既有端点

## Why

移动端首页 `home.vue` 的「今日告警概览」6 项、待办任务、事件条、未读计数**均为页内硬编码**
（早于 ④-A 冻结清单，不在 `data/mock.ts` 内，故此前 mock 排查未覆盖）。后端 `alarm`/`tasks`/
`emergency-event`/`message` 域端点均已就绪。**按决策"复用大屏既有端点"**，不新增后端接口。

## What Changes

- `home.vue` 告警概览改由 `fetchAlarmPage`（**`/alarms`，与大屏报警面板同源**）按 `type` 聚合；
  `alarmTotal` 取分页 `total`；类型→中文标签/图标/色档由 `TYPE_META` 映射
  （FIRE 火灾报警 / GAS 气体报警 / TEMP 温度报警 / CCTV 视频AI / SOS 紧急求助）。
- 待办任务改用已接后端的 `/tasks`（`fetchTasks`）；`pendingCount` = 非「已完成」任务数。
- 事件条改用 `/emergency-events`（`fetchEmergencyEvents`）；无进行中事件则不渲染该条。
- 未读计数改用消息中心 `fetchMessages`（`/messages`）`read=false` 计数。
- 删除已无任何引用的 `apps/mobile/data/mock.ts`（移动端全部视图去 mock 后成死文件）。

## Capabilities

- 移动端首页展示的统计**全部来自真实后端**（复用大屏同源 `/alarms`），无硬编码数字。

## Impact

- **纯前端改动，无接口变更、无契约变更、无后端改动**（故不涉跨库四同步）。
- 回退：恢复 `home.vue` 硬编码 + `data/mock.ts`。
- 视觉：告警卡由原型 6 分类调整为后端真实 `type` 枚举（3 列宫格，按数据自适应）。
