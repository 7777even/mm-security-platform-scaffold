# feat-gis-cesium — 任务清单

> 状态：进行中（2026-08-19）。按详细设计 4.2.2.2 将地图底座由 OL+Three 双引擎切换为 Cesium.js 二三维一体化。

## 任务

### 1. 依赖与构建基建

- [ ] 1.1 `npm i cesium` 并移除 `ol` / `three` / `@types/three`
- [ ] 1.2 `vite.config.ts`：cesium 静态资源（`node_modules/cesium/Build/Cesium`）copy 插件与 `CESIUM_BASE_URL` 配置；评估 cesium 分包（独立 chunk + 懒加载）
- [ ] 1.3 评估 Cesium 在 `build.target: es2018` 下的兼容性，必要时在提案记录约束
- [x] 1.4 调整 dev/prod CSP：`script-src` 放行 `'unsafe-eval'`，因为 Cesium 1.x 引擎用 `new Function()` 动态编译 GLSL 着色器/Worker 代码，硬性需要 eval（`vite.config.ts` + `deploy/csp.conf`，均已改）

### 2. Cesium 服务层（TDD）

- [ ] 2.1 `[TDD]` `src/services/cesium.ts`：抽取纯函数 `createViewerConfig()`（2D/3D 模式、瓦片 URL、初始相机）与 `toPointEntity(mapPoint)` / `toZoneEntity(riskZone)` 数据映射，先写 spec（红）
- [ ] 2.2 `[TDD]` 实现 `src/services/cesium.ts`：viewer 初始化、瓦片底图、点位（等级色/状态色）、区域（评分色面）、点击拾取浮窗、`destroy` 清理（绿）

### 3. 地图组件

- [ ] 3.1 `[TDD]` `src/components/cesium/BaseMap.vue`（jsdom）：WebGL 不可用降级、容器渲染、2D/3D 模式切换、卸载清理
- [ ] 3.2 接线 dashboard：移除 OL 地图 + `FactoryScene.vue`，单一 `BaseMap` 承载二三维一体化，保留 `markOnce`/P9 `baseMapMs` 打点与实时流刷新

### 4. 清理与收尾

- [ ] 4.1 删除 `src/components/three/` 及 `ol`/`three` 相关 import/依赖；确认无残留引用
- [ ] 4.2 全量验证：`vitest` 全绿、`vue-tsc` 0 error、`eslint` 0 error、`vite build` 通过
- [ ] 4.3 更新 `docs/perf/` 性能基线（Cesium 首屏 gzip 体积、P9 地图加载）
- [ ] 4.4 更新 `D1验收标准_脚手架差距清单与整改建议.md`：电子地图(5) 基座支撑度更新为「Cesium 二三维一体化底座」；归档 change 并入 spec
