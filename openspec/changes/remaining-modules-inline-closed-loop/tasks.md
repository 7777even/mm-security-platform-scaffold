# 任务清单 — 其余模块内嵌闭环

- [x] major-hazard：useMajorHazardInteraction + MajorHazardInteractionLayer + 二级界面（详情/监测点位/视频点位/危化品/疏散路线/应急操作）+ 接线 list/detail 面板
- [x] video-wall：useVideoWallInteraction + VideoWallInteractionLayer + 相机详情/事件上墙对话框 + 接线 VideoWallGrid（保留 videoWallStore）
- [x] video-control：useVideoControlInteraction + VideoControlInteractionLayer + 控制页/相机详情对话框 + 接线 VideoControlGrid
- [x] typhoon-emergency：既有卫星云图/风险视频墙对话框经本地 ref 已具内嵌闭环；useTyphoonInteraction + TyphoonRiskPointDetailDialog 为同模式备用（未强制改写，避免触碰复杂 Cesium 地图逻辑）
- [x] production-area：useProductionAreaInteraction + ProductionAreaInteractionLayer + 装置详情/人员/告警列表/视频对话框 + 接线各面板（补充挂载层 + 人员/告警面板 @more 接线 + facilityId 透传）
- [x] production-communication：useCommunicationInteraction + CommunicationInteractionLayer + 设备详情 + 接管既有一键/单点广播对话框
- [x] accident-rescue：useAccidentRescueInteraction + AccidentRescueInteractionLayer + 统一分发既有 9 对话框与面板点击（保留双模式与现有 composable）
- [x] extreme-weather：替换静态/emoji 假数据，useExtremeWeatherInteraction + ExtremeWeatherInteractionLayer + 风险点/卫星云图/视频墙/告警/调度对话框 + 同步更新 index.spec.ts（已通过 2 测试）

# 收尾（协调者）

- [x] 全局 eslint / stylelint / vue-tsc --noEmit 验证并修复（结果：eslint 0 / stylelint 0 / vue-tsc 0 / extreme-weather spec 2 passed）
- [x] 修复系统性运行时缺陷：src/components/common/{OneKeyDispatchDialog,VideoWallDialog}.vue 误用相对 './ScreenDialog.vue'（应为 @/components/fire/ScreenDialog.vue），导致所有复用这两个通用弹窗的模块运行时无法解析
- [ ] 归档 openspec/changes → archive（待用户确认或下一步统一归档）
