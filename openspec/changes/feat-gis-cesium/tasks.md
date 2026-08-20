# feat-gis-cesium — 任务清单

> 状态：进行中（2026-08-20）。按详细设计 4.2.2.2 将地图底座由 OL+Three 双引擎切换为 Cesium.js 二三维一体化。

## 任务

### 1. 依赖与构建基建

- [x] 1.1 `npm i cesium` 并移除 `ol` / `three` / `@types/three`
- [x] 1.2 `vite.config.ts`：cesium 静态资源 copy 插件、`CESIUM_BASE_URL`、`@zip.js/zip.js` 与 `lerc` alias、`optimizeDeps` exclude/include
- [x] 1.3 Cesium 在 `build.target: es2018` 下兼容性验证（排除 `cesium`/`@zip.js/zip.js` 预构建，避免 esbuild 降级失败）
- [x] 1.4 dev/prod CSP `script-src` 放行 `'unsafe-eval'` + `'wasm-unsafe-eval'`（Cesium 1.x 动态 GLSL 编译 + Worker WebAssembly 解码硬性需求）

### 2. Cesium 服务层（TDD）

- [x] 2.1 `[TDD]` `src/services/cesium.ts`：导出纯函数 `markerColor(kind, p)`（报警 level 色 / 设备 status 色）与 `zoneFillColor(score)`（评分分级色），先写 spec（红）
- [x] 2.2 实现 `src/services/cesium.ts`：`createCesiumViewer`（含防白屏/阻断 Ion/Bing 异步路径/ResizeObserver 友好）、`loadBaseMap`（瓦片 URL 可配置，P9 打点）、`loadAlarmMarkers` / `loadDeviceMarkers`（point+label 复合标注）、`loadRiskZones`（polygon + 独立 label 实体，规避撑白块）、`resetView` / `setSceneMode2D/3D`、`setLayerVisible`（base/markers/zones/labels 四类）、`enablePick`（LEFT_CLICK 拾取报警/设备点位，回传 PickResult）

### 3. 地图组件

- [x] 3.1 `[TDD]` `src/components/cesium/BaseMap.vue`（jsdom）：WebGL 不可用降级、容器渲染、卸载 destroy、sceneMode 同步、viewerFactory 注入兼容
- [x] 3.2 接线 dashboard：移除 dashboard 自身的 2D/3D 切换浮层（由 BaseMap 工具栏承担），保留受控 `sceneMode` prop + `mode-change` 事件 + `error` 降级提示；保留 P9 `baseMapMs` 打点、实时流刷新

### 4. 清理与收尾

- [x] 4.1 删除 `src/components/three/` 及 `ol`/`three` 相关 import/依赖；确认无残留引用
- [x] 4.2 全量验证：`vitest` 全绿、`vue-tsc` 0 error、`eslint` 0 error、`vite build` 通过
- [x] 4.3 新增点击拾取 + 完整地图工具栏 + 复合标注（Cesium 二三维一体化的核心交互）：
  - **点击拾取**：`enablePick` → LEFT_CLICK → `scene.pick` → `PickResult{name,kind,level,status,id}` → BaseMap 浮窗
  - **完整地图工具栏**：2D/3D 切换、放大、缩小、复位、底图/点位/区域/标注 显隐开关
  - **复合标注**：`point`（等级/状态色圆点 + 白描边）+ `label`（点位名称 + 深色背景）同实体叠加，标注可独立显隐
- [x] 4.4 更新 `openspec/specs/{cesium-viewer,map-layers,map-markers,webgl-context}` 四份能力 spec；归档 change 并入 spec
- [x] 4.5 更新 `D1验收标准_脚手架差距清单与整改建议.md`：电子地图(5) 基座支撑度更新为「Cesium 二三维一体化底座 + 点击拾取 + 完整工具栏 + 复合标注」