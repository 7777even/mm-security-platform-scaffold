# Proposal: fire-alarm-interactions

## Why

用户要求「大屏端按 fire-monitoring 压缩包实现，包括点击、二级界面等交互，但用脚手架大屏端统一规范」。脚手架大屏端已完成视觉骨架与路由级二级页（screen-secondary-pages 已归档），但**模块内点击交互仍是空壳**：`src/components/fire/*` 的告警/设备/设施面板点击仅 `console.warn`，未打开任何二级界面。参考实现 fire-monitoring 的消防模块具备完整交互闭环（告警卡→详情抽屉、设施→监测弹窗、巡检→弹窗、按钮→视频/一键应急等）。本提案补齐「消防报警」模块的点击→二级界面交互闭环，作为后续横向铺开其他模块（安全防恐/生产应急…）的示范切片。

## What Changes

- 新增模块级交互单例 `src/composables/useFireAlarmInteraction.ts`：管理当前打开的二级界面 `{type, payload}|null`，暴露 `openAlarmDetail / openAlarmList / openFacility / openPatrol / openVideo / openOneKeyBroadcast / close`。
- `src/views/fire-alarm/index.vue` 增加 `<FireAlarmInteractionLayer />`，按 interaction 状态渲染二级界面：抽屉类（告警详情）用既有 `SecondaryPageOverlay`（模块内覆盖层，不离开模块）；弹窗类用深蓝 Dialog（`--map-mask-bg`/`--map-dialog-bg`/`--map-dialog-border` + `z-index:var(--z-overlay)`）。
- 接管既有面板点击：`FireAlarmPanel`（告警行→详情、操作按钮→视频/处置/一键应急、「全部」→列表）、`FireDevicePanel`（设备卡→设施监测）、`FireFacilityPanel`（设施→监测弹窗）、`FireStrengthPanel`/`SpecialWorkPanel`/`FireDutyPanel` 的条目点击→对应详情/列表，移除 `console.warn` 占位。
- 新增二级界面组件（按参考行为语义重写，零硬编码色）：`FireAlarmDetailPanel`（右侧抽屉：基础信息/详细信息/报警核实/处置情况/操作日志/关联操作 + 确认→开始处置→提交处置状态机）、`FireAlarmListDialog`（过滤+表格+分页+行操作）、`FireFacilityMonitoringDialog`（设施列表+工单 tab）、`FirePatrolDialog`、`FireVideoDialog`（视频/图片）、`OneKeyBroadcastDialog`（一键应急）。
- 地图点位点击：`AccidentRescueMarkersOverlay` 的 alarm 点位 `@click`→`openAlarmDetail`，video 点位→`openVideo`。
- 消防特有 mock 走脚手架自包含约定（扩展 `src/mocks/devMock.ts` 或新增 `src/services/fire-mock.ts`），复用既有 `src/stores/alarm.ts`。

## Capabilities

- fire-alarm-interactions（新增：消防报警模块点击→二级界面交互闭环）

## Impact

- 影响：`src/views/fire-alarm/index.vue`、`src/components/fire/*`（6 个面板接线）、`src/components/map/AccidentRescueMarkersOverlay.vue`（点位点击）、新增 `src/composables/useFireAlarmInteraction.ts` + 7 个二级界面组件 + 可能 `src/services/fire-mock.ts`。
- 风险：交互层须与既有 `SecondaryPageOverlay`/`z-index` 五层协调，避免遮挡地图工具；参考硬编码色须全量 token 化（对齐 §7 自检清单）；jsdom 测试需 mock 地图组件。
