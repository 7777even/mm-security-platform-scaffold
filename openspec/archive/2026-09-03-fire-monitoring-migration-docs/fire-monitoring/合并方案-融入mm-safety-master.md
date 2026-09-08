# mm-UIproject 融入 mm-safety-master 功能：合并方案

## 0. 文档信息

| 项目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| 版本     | V1.0                                                                                             |
| 日期     | 2026-08-10                                                                                       |
| 状态     | 建议稿（待产品/技术确认）                                                                        |
| 适用范围 | `mm-UIproject/fire-monitoring` 为主基座，吸收 `E:\智慧园区\茂名石化项目\mm-safety-master` 的功能 |
| 维护人   | 产品经理 + Codex 协作整理                                                                        |

**结论摘要**：推荐“代码移植合入”方案——以 mm-UIproject 的 UI 体系、路由、单例 Cesium 地图为基座，把 mm-safety-master 中 UI-project 尚缺的功能（测绘与空间搜索、防洪抗涝仿真、作战沙盘与风险可视化、预案矩阵、运维监测等）按模块移植进同一工程，并全部套用 UI-project 的设计规范。不采用 wujie 微前端集成，避免两套 UI 并存。

---

## 1. 背景与目标

### 1.1 两个项目的定位

| 项目                                | 定位                          | 技术栈                                                     | 特点                                                                                                                                   |
| ----------------------------------- | ----------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `mm-UIproject/fire-monitoring`      | 高保真演示原型（UI 唯一基准） | Vue3 + Vite + TS + vue-router + Cesium + Leaflet + ECharts | 单体应用；`SharedCesiumMap` 全站单例地图；`PanelCard/SpriteImage/ClipImage/designAssets` 设计体系；`ViewportSimulator` 尺寸模拟        |
| `mm-safety-master`（外部 E:\ 路径） | 功能原型/业务能力验证         | Vue3 + Vite + TS + wujie-vue3                              | 微前端壳 + 6 个子应用（消防报警、应急指挥、安全防范、防洪抗涝、运维监测、工业视频）；CesiumMap 内置业务图层/测绘搜索/沙盘风险/洪水仿真 |

> 注意：`电信包项目\mm-safety-master` 是 2026-07-03 的旧快照（含截图与 dist），外部 `E:\智慧园区\茂名石化项目\mm-safety-master` 才是 2026-07-31 仍在更新的源，合并以外部目录为准。

### 1.2 合并目标

1. UI 与 `mm-UIproject` 现有实现及 `docs/UI设计规范.md` 严格一致（视觉、交互、组件、资源三统一）。
2. 把 mm-safety-master 中 UI-project 缺失或较弱的功能补进同一工程，保持单体架构。
3. 地图能力统一收口到 `MaomingPetroCesiumMap` / `SharedCesiumMap`，不新建第二个 Viewer。
4. 数据统一进 `src/lib/data/*.ts`（TS interface），组件内不硬编码业务数据。

### 1.3 产品经理确认的合并红线（2026-08-10 确认）

1. **入口以 UI-project 为准**：系统入口、首页、主导航、路由、Header/页脚、跳转关系全部沿用 UI-project，不采用 mm-safety-master 的微前端壳与场景切换入口。
2. **视觉与交互是第一位**：合并后的所有页面和细节必须与 UI-project 保持一致；mm-safety-master 只提供功能逻辑（计算、状态、交互行为），其视觉样式一律不直接搬用。
3. **确认门禁**：任何不确定的内容，先向产品经理确认后再实施；实施过程中每完成一批，先演示/确认再进入下一批。

---

## 2. 现状盘点

### 2.1 UI-project 已有能力（无需重做）

- 页面/路由：应急指挥、消防报警、安全防恐、工业电视、生产应急、事故应急救援、演练、台风应急、生产区域、重大危险源、通信设备、视频联控、视频墙。
- 面板组件：security / tv / production / accident-rescue / preliminary / typhoon / video-control / video-wall 全系列。
- 地图：`MaomingPetroCesiumMap` 已具备装置区 3D 体块、线框、标签合并贴图、告警标点脉冲、疏散路线/人员、监控点位、电视巡检圈、AI 诊断扫描等 API。
- 设计体系：`variables.css`、`designAssets.ts`、`spriteConfig`、`PanelCard`、`MapPageShell`、`DashboardLayout`、`ViewportSimulator`。

### 2.2 mm-safety-master 可移植功能清单

#### 地图能力（`src/components/CesiumMap.vue` + `src/composables/`）

| 能力                  | 实现文件                | 说明                                                                 |
| --------------------- | ----------------------- | -------------------------------------------------------------------- |
| 底图切换（卫星/矢量） | CesiumMap.vue           | 常驻工具栏                                                           |
| 业务图层显隐          | `useMapLayers.ts`       | 摄像头、DCS、GDS、重大危险源、关注区域、战术沙盘标绘、测绘与取点标注 |
| 测绘与空间搜索        | `useSpatialTools.ts`    | 测距、经纬度取点、圈选、线选、面选（撒点空间搜索）                   |
| 防洪抗涝仿真          | `useFloodSimulation.ts` | 区域绘制、水体实体、地形采样、面积/体积精算、多区域联动              |
| 作战沙盘与风险可视化  | `useSandboxAndRisk.ts`  | 战术沙盘标绘、SLAB 扩散、风险半径、火灾热辐射                        |
| 告警特效              | `useAlarmEffect.ts`     | 告警闪烁/光柱                                                        |
| 绘图基础              | `useDrawTool.ts`        | 多边形/线绘制                                                        |
| 小地图                | MiniMap.vue             | 工业视频场景鹰眼                                                     |

#### 子应用功能

| 子应用                | 可移植亮点                                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| emergency-command     | 接警研判五要素、预案矩阵（阶段/组织/事件/动作卡、流程线、节点联动）、处置过程指导悬浮窗、阶段五维面板、升级确认、SDS/物资/装备详情、沙盘 Tab、指令派发、值班名册 |
| flood-control         | 防洪抗涝控制面板、地图右键菜单、淹没仿真控制                                                                                                                     |
| industrial-video      | 视频墙（4/9/16 分屏、拖拽、网格合并）、播放/回放条、PTZ 云台、AI 告警处置工作台、告警底栏                                                                        |
| fire-alarm            | 平战转换（isEmergency）、告警处置工作台、一键应急、DCS/GDS 数据                                                                                                  |
| security              | 安防左右面板、底部告警面板、道闸/门禁联动                                                                                                                        |
| operation-maintenance | 运维监测左右面板（区域、传感器、消防设备、告警、设备列表）                                                                                                       |

### 2.3 差距分析（UI-project 缺失项）

| 能力                               | UI-project 现状                                                 | 合并动作                                                              |
| ---------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| 测距/取点/圈选/线选/面选           | 无（`useMapControls` 仅有 layers/3d/toggle）                    | 移植 `useSpatialTools`，挂到地图常驻工具栏，样式对齐 UI 规范 5.6      |
| 防洪抗涝仿真                       | 仅有台风页（`TyphoonEmergencyDetail`），无淹没仿真/区域绘制     | 移植 `useFloodSimulation` + flood-control 面板，新增“防洪抗涝”页/入口 |
| 战术沙盘/SLAB/风险半径/热辐射      | 无                                                              | 移植 `useSandboxAndRisk`，接入应急指挥/事故救援                       |
| 预案矩阵（可编辑阶段/组织/动作卡） | `EmergencyPlanPanel`/`EmergencyProcessPanorama` 为展示型        | 按“演示可交互”深度移植 emergency-command matrix 组件与 store          |
| 运维监测                           | 无独立页面/导航（地图模式已预留 `operation-monitoring`）        | 新增页面 + 面板 + mock 数据                                           |
| 平战转换/一键应急                  | 消防页有告警弹窗，无全局“平时→战时”状态机                       | 移植 fire-alarm 状态机到消防/应急页                                   |
| 视频墙 PTZ/历史回放                | `VideoWallView` 已有网格/告警/联动配置；PTZ、回放需逐项核对     | 对照 industrial-video 补齐缺口，UI 不变                               |
| 业务图层开关                       | `MapLayerPanel` 已有 15 项图层勾选                              | 把沙盘/测绘标注显隐并入同一面板，不另做弹窗                           |
| 告警特效                           | 标点已有脉冲动效                                                | 吸收 `useAlarmEffect` 的光柱/爆闪作为可选增强，避免与现有标点冲突     |
| 接警研判/处置过程指导              | 事故救援页已有 `RescueStageProgress`/`CommandActionDetailPanel` | 与 emergency-command 的 NodeGuidance/五维面板比对后择优合入           |

---

## 3. 合并原则（不变量）

1. **UI 以 UI-project 为准**：新增/移植页面必须使用 `DashboardLayout` + `MapPageShell` + `PanelCard`，资源走 `designAssets.ts`/`spriteConfig`，禁止硬编码图片路径。
2. **保持单体架构**：不引入 wujie；与 `UI设计规范.md` 第 11 条冲突处理一致（“演示原型保持单体，架构另行归档”）。
3. **地图单例**：所有移植的地图交互（测绘/洪水/沙盘/风险）挂到 `SharedCesiumMapExpose`，页面只调用 API。
4. **数据集中**：子应用 `store.ts` 的 mock 数据迁到 `src/lib/data/*.ts`，组件用 TS interface 收数。
5. **通信内联化**：`WujieVue.bus` 事件全部改为单体内事件/直调（见 4.3）。
6. **每完成一批更新进度表**：同步 `docs/二级页面补充进度表.md` 并交付验收。
7. **入口不动**：不改 UI-project 的入口/导航结构；新增功能按“导航项 → 二级路由 → 弹窗/抽屉”的既有规则挂载。
8. **视觉只认 UI-project**：移植组件时仅搬运逻辑与数据，所有视觉按 UI-project 现有组件和设计规范重建；拿不准的样式先出方案图/描述再确认。

---

## 4. 推荐合并路线

### 4.1 方案对比

| 方案                    | 说明                                               | 优点                                    | 缺点                                         | 结论   |
| ----------------------- | -------------------------------------------------- | --------------------------------------- | -------------------------------------------- | ------ |
| A. 代码移植合入（推荐） | UI-project 为唯一工程，按模块移植功能并重做样式    | UI 完全统一；无微前端成本；符合既有规范 | 需要重构 bus 事件、样式适配，工作量较大      | ★      |
| B. 微前端集成           | 用 wujie 把 safety-master 子应用挂进 UI-project 壳 | 子应用原样可用                          | 两套 UI 并存、冲突处理违背规范、演示体验割裂 | 不推荐 |
| C. 双轨并行             | 两库各自维护，仅同步规格                           | 零改动                                  | 功能重复维护，客户演示仍是两套               | 不推荐 |

### 4.2 分阶段实施

| 阶段             | 内容                                                                                                                                      | 产出                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| M0 基线          | 先提交两库当前未提交改动；记录外部 safety-master 版本（7/31）                                                                             | 干净基线、版本记录        |
| M1 地图能力      | 移植 `useSpatialTools`/`useMapLayers`/`useAlarmEffect`，扩展 `SharedCesiumMapExpose`；地图工具栏按 UI 规范 5.6 重做（底图/图层/测绘搜索） | 全站地图工具条 + 空间搜索 |
| M2 应急增强      | 移植 `useSandboxAndRisk`、预案矩阵、接警研判、处置过程指导到 `/emergency`、`/emergency/drill`、`/fire/rescue`                             | 应急指挥/事故救援能力补齐 |
| M3 防洪抗涝      | 新增 `views/FloodControlView.vue` + `panels/flood/*`，移植 `useFloodSimulation` 与右键菜单；入口建议挂“预警中心”或主导航                  | 防洪抗涝页面              |
| M4 运维监测      | 新增 `views/OperationMaintenanceView.vue` + `panels/operation/*`，迁移 opm store 数据；导航新增“运维监测”                                 | 运维监测页面              |
| M5 视频墙补齐    | 逐项 diff industrial-video 与 `VideoWallView`，补齐 PTZ/回放/拖拽缺口                                                                     | 视频墙功能完整            |
| M6 消防/安防增强 | 移植平战转换、一键应急、道闸联动等交互                                                                                                    | 消防/安防页面增强         |
| M7 验收          | `npm run build`、尺寸模拟器三档检查、截图对比、更新进度表                                                                                 | 可演示交付                |

### 4.3 文件级移植映射

| 来源（mm-safety-master）                                       | 落点（mm-UIproject/fire-monitoring）                                         |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/composables/useSpatialTools.ts`                           | `src/lib/composables/map/useSpatialTools.ts`，API 挂 `SharedCesiumMapExpose` |
| `src/composables/useFloodSimulation.ts`                        | `src/lib/composables/map/useFloodSimulation.ts`                              |
| `src/composables/useSandboxAndRisk.ts`                         | `src/lib/composables/map/useSandboxAndRisk.ts`                               |
| `src/composables/useMapLayers.ts`                              | 并入 `src/lib/composables/useMapLayerPanel.ts` 与 `MapLayerPanel` 图层清单   |
| `src/composables/useAlarmEffect.ts`                            | 并入现有告警标点体系（可选增强）                                             |
| `src/composables/useDrawTool.ts`                               | `src/lib/composables/map/useDrawTool.ts`                                     |
| `subapps/emergency-command/src/components/matrix/*`            | `src/components/panels/accident-rescue/plan-matrix/*`                        |
| `subapps/emergency-command/src/store/usePlanMatrixStore.ts` 等 | `src/lib/data/planMatrixMock.ts` + `src/lib/composables/usePlanMatrix.ts`    |
| `subapps/flood-control/src/components/*`                       | `src/components/panels/flood/*` + `views/FloodControlView.vue`               |
| `subapps/operation-maintenance/src/store.ts`                   | `src/lib/data/operationMaintenanceMock.ts` + `panels/operation/*`            |
| `subapps/fire-alarm/src/store.ts`                              | `src/lib/composables/useEmergencyMode.ts`                                    |
| `subapps/industrial-video/src/components/PlaybackBar.vue` 等   | 对照 `src/components/video-wall/*` 补缺口                                    |
| 子应用 `services/messageBus.ts`、`utils/wujieBridge.ts`        | 删除，改由 `sharedCesiumBridge.ts` + 页面内事件                              |

### 4.4 通信重构规则

现 mm-safety-master 大量使用 `WujieVue.bus.$on/$emit`，单体内替换为：

| 原事件                                                                    | 替换方式                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `map-focus` / `map-alarm-focus`                                           | `sharedCesiumBridge.onSharedMapReady` + `flyToWorldPositions` / 新增 `showAlarmEffect` API |
| `draw-all-flood-regions` / `draw-flood-features` / `clear-flood-features` | 新增 `useFloodSimulation` 直调 API                                                         |
| `map-sandbox-draw-*` / `map-spatial-*`                                    | 新增 `useSandboxAndRisk` / `useSpatialTools` 直调 API                                      |
| `switch-scene` / `minimap-*` / `sidebar-collapsed`                        | vue-router 跳转 + 页面内状态，不再需要跨应用总线                                           |

---

## 5. 新增/变更页面清单

| 页面                           | 类型       | 处理                                                                            |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------- |
| 防洪抗涝一张图                 | 新增主页面 | `/flood`，挂载 `MapPageShell` + `DashboardLayout`；左/右栏 338/419px 按 UI 规范 |
| 运维监测一张图                 | 新增主页面 | `/operation`，复用 `PanelCard` 与 mock 数据                                     |
| 应急指挥 / 事故救援 / 演练     | 升级       | 融入预案矩阵、接警研判、沙盘与风险可视化                                        |
| 工业电视 / 视频墙              | 升级       | 补齐 PTZ、回放、拖拽缺口（保持现有 UI）                                         |
| 消防报警 / 安全防恐 / 生产应急 | 增强       | 平战转换、一键应急、道闸联动等                                                  |
| 地图常驻工具条                 | 公共升级   | 底图切换 + 业务图层 + 测绘与搜索（样式对齐 UI 规范 5.6）                        |

---

## 6. 验收标准与风险

### 6.1 验收标准

- [ ] `npm run build`（vue-tsc 类型检查）通过
- [ ] 1366 / 1920 / 2560 三档尺寸模拟器检查通过
- [ ] 新增页面使用 `PanelCard`，资源经 `designAssets.ts`，无硬编码图片路径
- [ ] 地图聚焦 inset 已配置，目标不被侧栏遮挡
- [ ] 告警/状态色符合规范（红=危险、金=警告、绿=正常）
- [ ] `二级页面补充进度表.md` 已更新

### 6.2 主要风险

| 风险                                           | 应对                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| wujie bus 重构遗漏导致交互失效                 | M1 先建“事件清单”，逐个替换并在对应页面回归               |
| Cesium 事件/实体资源未释放（测绘、洪水、沙盘） | 移植时保留原 clear/destroy 逻辑，并在路由切换时统一清理   |
| 两库 Cesium 版本差异                           | 均为 1.142，风险低；合并后以 UI-project package-lock 为准 |
| 新页面侧栏遮挡地图                             | 按 `cesiumMapModes.ts` 增加 flood/operation 聚焦配置      |
| 模拟数据不自洽                                 | 数据统一进 `src/lib/data`，字段以 TS interface 约束       |
| 工作树脏提交                                   | M0 先提交，禁止在未提交状态下开始移植                     |

---

## 7. 待确认事项

- [x] 演示优先级：预案矩阵/沙盘 → 防洪抗涝（并入 UI-project 既有应急事件页）→ 运维监测（新增一级模块）→ 视频墙（核对 UI 一致性）→ 地图测绘
- [x] 防洪抗涝：属于一类特定应急事件，对比 UI-project 既有页面与 mm-safety-master 旧页面做合并，不新增导航
- [x] 运维监测：新增一个一级模块（主导航增加入口）
- [x] 预案矩阵交互深度：演示级（可点击、可切换阶段，不做新增/编辑）
- [x] 地图工具条/新面板样式：无设计稿，按 UI-project 现有视觉模型与 UI 规范重建

> 实施节奏：每完成一批，先演示确认，再进入下一批。

---

## 8. 相关文件索引

| 内容                      | 位置                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| UI 设计规范               | `mm-UIproject/fire-monitoring/docs/UI设计规范.md`                     |
| 二级页面进度表            | `mm-UIproject/fire-monitoring/docs/二级页面补充进度表.md`             |
| 功能规格（safety-master） | `E:\智慧园区\茂名石化项目\mm-safety-master\specs\*.md`                |
| OpenSpec 变更历史         | `E:\智慧园区\茂名石化项目\mm-safety-master\openspec\specs\`           |
| 地图实现                  | `src/components/map/MaomingPetroCesiumMap.vue`、`SharedCesiumMap.vue` |
| 地图桥接                  | `src/lib/composables/sharedCesiumBridge.ts`                           |

## 9. 实施记录

| 批次                  | 状态                  | 说明                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 第一批：预案矩阵/沙盘 | ✅ 待产品经理视觉确认 | 三级呈现 + 方案 A 阶段分区轨道 + 5 阶段 15 节点渐进式解锁（班组必执行，逐级升级或直接收尾）+ 升级/收尾决策流 + 处置指导/节点配置/下一步自动演示 + 矩阵交互（L2 指挥视图，L3 管理）+ 左右侧栏收起 + 自定义滚动进度条；按《交付测试规范》三层测试 38/38 通过；截图与记录见 `docs/演示截图/`、`docs/交付测试记录-2026-08-11-预案全景全流程.md` |

> 设计例外（2026-08-10 产品经理确认）：仅“预案全景全流程”模块以 mm-safety-master 设计为主；入口、页面壳及其他模块仍以 UI-project 为准。

---

变更记录：

| 版本 | 日期       | 说明                                                       |
| ---- | ---------- | ---------------------------------------------------------- |
| V1.0 | 2026-08-10 | 初版：现状盘点、差距分析、推荐代码移植合入方案、分阶段计划 |
