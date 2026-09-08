# Tasks — screen-map-toolbar

- [x] [TDD] 在 `sharedCesiumBridge.ts` 新增 `zoomIn`/`zoomOut`/`toggleSceneMode`/`getSceneMode` 到 `SharedCesiumMapExpose` 接口与桥接函数 `zoomInSharedMap`/`zoomOutSharedMap`/`toggleSharedMapSceneMode`/`getSharedMapSceneMode`；先写失败单测（mock 地图 expose）验证桥接转发，再实现。
- [x] [TDD] 在 `MaomingPetroCesiumMap.vue` 实现 `zoomIn`/`zoomOut`（沿视线按当前高度比例推进/拉远）/`toggleSceneMode`（scene.morphTo2D/3D）/`getSceneMode`，并加入 `defineExpose`；先写失败测试验证 expose 注册这些方法。
- [x] 新建 `src/components/map/MapToolBar.vue`：横向工具栏，按规范 §10.1 + 大屏 token 样式；按钮 放大/缩小/复位/图层/三维视角（接真实桥接）+ 热力/区域/搜索/测距（占位 toast）。
- [x] 在 `SharedCesiumMap.vue` 模板内挂载 `<MapToolBar />`，确保覆盖在 Cesium 画布之上且不影响地图拖拽选择。
- [x] 组件测试：校验 `MapToolBar` 点击 放大/缩小/复位/图层/三维视角 触发对应桥接调用；占位按钮点击触发 `ElMessage` 提示且不抛错。
- [x] 验证：运行 `vitest` 跑通（21 个相关用例全绿）；`vue-tsc --noEmit` 0 错误；`eslint` 0 问题。
