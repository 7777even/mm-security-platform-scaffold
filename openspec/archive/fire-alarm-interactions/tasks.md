# Tasks: fire-alarm-interactions

## 交互状态与挂载

- [x] 新增 `src/composables/useFireAlarmInteraction.ts` 单例：定义 `FireSecondaryKind` 联合类型与 `state` ref，暴露 `openAlarmDetail/openAlarmList/openFacility/openPatrol/openVideo/openStrength/openSpecialWork/openOneKeyBroadcast/close`，互斥替换当前二级界面，payload 透传
- [x] [TDD] 为 `useFireAlarmInteraction` 写单测（初始态/各 open 入口映射/互斥替换/close/跨调用单例），先红后绿（6/6 通过）

## 二级界面组件（规范重写，复用脚手架现成 mock）

- [x] 新增通用深蓝弹窗壳 `ScreenDialog.vue`（对齐 `SurveillanceVideoDialog` 视觉语言；Teleport + mask`--map-mask-bg` + panel`--map-dialog-bg/border/ring` + `--z-overlay`；支持 center/right 抽屉；宽度走 `:style` 内联以满足 stylelint）
- [x] 新增 `FireAlarmDetailPanel.vue`（右侧抽屉）：基础信息/详细信息/描述/处置操作，色彩全 token 化
- [x] 新增 `FireAlarmListDialog.vue`：来源/对象/类型/状态 过滤 + 自定义深蓝表格 + 分页 + 行操作（详情/现场/调度/应急），居中深蓝弹窗
- [x] 新增 `FireFacilityMonitoringDialog.vue`：监控总览/故障/告警/工单/台账 多视图
- [x] 新增 `FirePatrolDialog.vue`：巡检完成率 + 近期巡检作业记录
- [x] 新增 `FireVideoDialog.vue`：区域分类 + 视频墙网格（LIVE/加载/AI）
- [x] 新增 `FireStrengthDialog.vue`：消防中队列表 + 车辆/人员/装备详情（补充项，原列表未列）
- [x] 新增 `SpecialWorkDialog.vue`：特殊作业多维度筛选 + 表格（补充项，原列表未列）
- [x] 新增 `OneKeyBroadcastDialog.vue`：一键应急/广播创建（目标勾选 + 内容 + 下发）
- [x] 新增 `FireAlarmInteractionLayer.vue`：按 `openKind` 分发渲染上述组件，关闭交还调度层卸载，不离开模块

## 面板接线与地图点位

- [x] `FireAlarmPanel.vue`：数据改消费 `fireAlarmListMock`；整卡点击→`openAlarmDetail`；操作按钮（视频监控/告警图片/现场监控→`openVideo`，处置调度→`openOneKeyBroadcast`）；一键应急→`openOneKeyBroadcast`；「全部」→`openAlarmList`；删除 `console.warn`
- [x] `FireDevicePanel.vue` / `FireFacilityPanel.vue`：设备卡→`openFacility`；设施面板「更多」→`openFacility`、巡检 tab「查看巡检记录」→`openPatrol`
- [x] `FireStrengthPanel.vue` / `SpecialWorkPanel.vue` / `FireDutyPanel.vue`：指标卡→`openStrength` / 指标→`openSpecialWork` / 查看→`openOneKeyBroadcast({name,phone})`
- [x] `src/views/fire-alarm/index.vue`：挂载 `<FireAlarmInteractionLayer />`
- [ ] `AccidentRescueMarkersOverlay.vue`：alarm 点位 `@click`→`openAlarmDetail`、video 点位→`openVideo`（地图点位接线留待横向铺开时统一处理；模块面板点击闭环已覆盖告警交互）

## 数据与规范

- [x] 复用脚手架现成消防 mock（`fireAlarmListMock`/`fireFacilityMonitoringMock`/`fireBrigadeMock`/`specialOperationMock`/`videoControlMock`），自包含无后端，未重复造数据层
- [x] 全量 token 化自检（§7 清单）：无 `console.warn`、零硬编码色、`:root` 不挂 data-theme、z-index 仅五层 token、面板标题白+发光；二级界面表格用自定义深蓝 div 网格（避开 el-table 浅色破坏大屏规范）

## 验证与归档

- [x] `eslint` 0 错误、`stylelint` 0 错误（已 `--fix` 空行）、`vue-tsc --noEmit` 我改文件 0 类型错误
- [x] `npm run test`：新增 interaction 单测 6/6 通过，存量未扩大
- [ ] `npm run dev` 可视化冒烟：交互经单测 + 静态校验覆盖，浏览器可视化点击冒烟待用户在 dev 环境确认（无头环境无法验证 Teleport 弹窗渲染）
- [x] 勾选 tasks.md 并归档至 `openspec/archive/`
