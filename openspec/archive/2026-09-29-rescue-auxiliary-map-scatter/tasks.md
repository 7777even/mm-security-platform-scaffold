# Tasks

## 1. 浮层三件套

- [x] `lib/composables/useAuxiliaryKnowledgeMapView.ts`（单例状态 + open/close + cap=60）
- [x] `components/map/AuxiliaryKnowledgeMapOverlay.vue`（投屏 + 散布 + close，theme 透传）
- [x] `useAuxiliaryKnowledgeMapView.spec.ts`（open / 负数归零 / NaN 归零 / 封顶截断 / close 复位）

## 2. 接线

- [x] `RescueAuxiliaryPanel.openItem` 调 `openAuxiliaryKnowledgeScatter`（保留 InfoDetailDialog）
- [x] `AccidentEmergencyRescue.vue` 挂 `<AuxiliaryKnowledgeMapOverlay v-if="sceneMode==='default'">` + eventId/onUnmounted 复位

## 3. 验证

- [x] `npm run type-check` 通过；`npx eslint` 0 error
- [x] `SUBAPP_NO_EMPTY=1 SUBAPP=fm-rescue npm run build:subapps` 成功（浮层进子应用产物）

## 4. 归档

- [x] 全部勾选后 `git mv` 本 Change 到 `openspec/archive/2026-09-29-rescue-auxiliary-map-scatter`
- [x] `node scripts/check-openspec-hygiene.mjs` 通过
