# Tasks: 应急辅助信息知识卡点击在地图撒点

- [x] 新增 composable `useAuxiliaryKnowledgeMapView.ts`（状态 + 开/关 + 撒点上限）
- [x] 新增 `AuxiliaryKnowledgeMapOverlay.vue`（确定性散布 + 主题配色 + 世界坐标投屏）
- [x] `RescueAuxiliaryPanel.openItem` 追加 `openAuxiliaryKnowledgeScatter`（保留详情弹窗）
- [x] `AccidentEmergencyRescue.vue` 地图区挂载 overlay，事件切换 / 卸载清理
- [x] `useAuxiliaryKnowledgeMapView.spec.ts` 单测（开/关/非有限收敛/上限）
- [x] `screen-data-wiring` spec 新增 Requirement「事故救援/演练详情页应急辅助信息落图」
- [x] 事实基线 `docs/system-facts.md` 追加 2026-09-22 条目
- [x] 门禁：`vue-tsc` 0 ｜ ESLint 0 ｜ `vitest` 4/4 ｜ `validate-api-contracts` 通过 ｜ `build:subapps`（fm-rescue）✓
