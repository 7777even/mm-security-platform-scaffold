# 安全管控指挥系统（大屏端）UI 设计规范

## 0. 文档信息

| 项目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 版本     | V1.0                                                           |
| 日期     | 2026-08-10                                                     |
| 状态     | 草稿（待产品/UI 评审）                                         |
| 适用范围 | `mm-UIproject/fire-monitoring`（客户需求确认用高保真演示原型） |
| 维护人   | 产品经理 + Codex 协作整理                                      |

## 1. 目的与定位

本文档是安全管控指挥系统大屏端唯一的 UI 规范来源，用于：

- 统一三套既有资产（原型 PDF、mm-UIproject、mm-safety-master）的视觉与交互口径；
- 约束后续新增页面、组件、地图图层和模拟数据的实现方式；
- 作为客户需求确认演示的验收基准（视觉还原、交互可点通、模拟数据与流程自洽）。

本项目的定位是**高保真演示原型，不是生产开发**。因此规范以「还原原型、可演示、数据自洽」为第一优先级，不引入真实后端、权限、微前端等生产架构。

## 2. 设计语言与原则

### 2.1 整体风格

工业精密风 + 深蓝科技感：深海蓝背景、发光边框、渐变面板、克制的信息密度。参考《大型复杂管控系统场景 UI 设计与交互规范指南 v2》的设计原则，但不照搬其布局数值（见 §11 冲突处理）。

### 2.2 信息层级

- **L1 核心**（前 20% 高频）：关键安全指标、全场态势图、实时告警 —— 常驻主界面视觉中心；
- **L2 中频**（20%–50%）：设备运行状态、近期趋势 —— 二级菜单或切卡，交互响应 ≤500ms；
- **L3 低频**（50%–90%）：历史曲线、传感器明细 —— 下钻/弹窗按需获取；
- **L4 背景**（后 10%）：系统日志、静态规程 —— 收纳于导航底层或知识库。

### 2.3 告警色彩语义

| 颜色            | 语义           | 使用场景                               |
| --------------- | -------------- | -------------------------------------- |
| 红 `#d33232`    | 危险/故障/超限 | 火灾告警、严重入侵、设备停机           |
| 金/橙 `#eca641` | 警告/需干预    | GDS 报警、人员非法聚集、待处置         |
| 黄 `#f0b429`    | 注意/临界      | 电量低、维护提醒、消息条警示           |
| 绿 `#3dd68c`    | 正常/安全      | 设备健康、在线、AI 识别框              |
| 青 `#6acab2`    | 信息/辅助      | 一般状态、联动成功                     |
| 紫 `#b07aff`    | 点缀/标签      | 图表点缀、预警中心标识，禁止大面积使用 |

日常监测面板禁止大面积使用红橙两色及泛光特效，仅在真实告警触发时使用规范色板中的高亮标牌。

## 3. 设计令牌（Design Tokens）

唯一权威定义见 `src/styles/variables.css`，本文档为说明性汇总；新增颜色/尺寸必须优先复用令牌，不得在组件内散落硬编码。

### 3.1 颜色

| 令牌                | 值                                                               | 用途          |
| ------------------- | ---------------------------------------------------------------- | ------------- |
| `--bg-primary`      | `#001630`                                                        | 页面/地图背景 |
| `--bg-panel`        | `rgba(0,35,75,0.72)`                                             | 面板底色      |
| `--bg-panel-header` | `linear-gradient(90deg, rgba(0,80,160,0.45), rgba(0,40,90,0.2))` | 面板头部      |
| `--border-glow`     | `rgba(0,180,255,0.35)`                                           | 发光边框/焦点 |
| `--border-panel`    | `rgba(0,140,220,0.25)`                                           | 常规面板边框  |
| `--text-primary`    | `#ffffff`                                                        | 主文字        |
| `--text-secondary`  | `#8795b0`                                                        | 次要文字/时间 |
| `--text-muted`      | `#d8d8d8`                                                        | 弱化文字      |
| `--accent-blue`     | `#00b4ff`                                                        | 主强调色      |

辅助色：`#6acab2`（青）、`#eca641`（金）、`#d33232`（红）、`#ffc4c4`（红浅）、`#3dd68c`（绿）、`#b07aff`（紫）。

### 3.2 字体

| 令牌             | 值                                                                    |
| ---------------- | --------------------------------------------------------------------- |
| `--font-display` | `'Noto Sans SC', 'Microsoft YaHei', sans-serif`                       |
| `--font-body`    | `'Noto Sans SC', 'Source Han Sans SC', 'Microsoft YaHei', sans-serif` |

字号规范（大屏）：系统标题 38px；面板标题 18px；区块标题 16px；正文 13–14px；辅助信息 11–12px；数字使用 `font-variant-numeric: tabular-nums`。

### 3.3 布局尺寸

| 令牌                    | 值                         |
| ----------------------- | -------------------------- |
| `--header-height`       | 77px                       |
| `--footer-height`       | 67px                       |
| `--sidebar-width`       | 419px（通用侧栏）          |
| `--sidebar-width-left`  | 338px（安全防恐/生产左栏） |
| `--sidebar-width-right` | 419px                      |

### 3.4 圆角 / 边框 / 滚动条

- 常规面板/按钮圆角：2px；
- 快捷按钮/输入框：4px；
- 浮层菜单：10px；
- 面板边框：1px `rgba(0,140,220,0.25)`，hover/active 时提亮为 `rgba(0,180,255,0.45~0.65)`；
- 滚动条：宽 4px，`::-webkit-scrollbar-thumb` 为 `rgba(0,140,220,0.3)`，圆角 2px。

## 4. 画布与视口

- **基准画布：1920×1080**；页面设置 `min-width: 1920px`、`min-height: 1080px`（消防监测页允许 `min-width: 1366px`）；
- 全站由 `ViewportSimulator` 包裹，支持预设：1920×1080、2560×1440、3840×2160、1680×1050、1600×900、1366×768、1280×720 及自定义；
- 模拟预览态下等比缩放、禁止页面滚动（`body.viewport-sim-active { overflow: hidden }`），原生视口模式允许滚动；
- 模拟器工具条高 32px，状态记忆于 `sessionStorage`。

## 5. 页面布局规范

### 5.1 页面骨架

所有大屏页面必须采用三层结构（`MapPageShell`）：

| 层     | 内容                        | z-index |
| ------ | --------------------------- | ------- |
| 地图层 | Cesium 地图、覆盖图层、标点 | 0       |
| UI 层  | 头部、侧栏、底部消息条      | 2       |
| 浮层   | 抽屉、弹窗、工具菜单        | 6–14    |

外层容器 `pointer-events: none`，可交互子元素显式恢复 `pointer-events: auto`，保证中央地图始终可操作。

### 5.2 头部

- 高 77px，网格 `507px 1fr minmax(430px, auto)`；
- 左侧：系统标题 38px + 装饰切图；
- 中间：主导航（应急指挥/消防报警/安全防恐/工业电视/生产应急）+ 预警中心；导航项高 62px、间距 52px，激活态使用 163×62 切图高亮底 + 底部高亮线；
- 右侧：天气、实时时钟（每秒刷新）、用户区（头像 + 管理员 + 下拉）。

### 5.3 主区侧栏

- 消防监测：左栏 419px（消防力量/特殊作业/设备监测/值班信息），右栏 419px（消防设备/安全告警）；
- 安全防恐：左栏 338px（进出统计/巡逻联动），右栏 419px（告警趋势/巡逻告警）；
- 生产应急：左栏 338px，右栏 419px，底部统计条；
- 工业电视：左右各 419px，右侧详情抽屉打开时右栏平移隐藏；
- 侧栏纵向按固定比例/固定高度网格排列，面板间 gap 7–12px。

### 5.4 底部消息条

- 高 67px，左右边距 17px、底部 10px；
- 左侧 132×52 标签区，中间跑马灯（`28s linear infinite`），右侧「查看全部」按钮；
- 消息类型：danger / warning，对应语义色。

### 5.5 抽屉与弹窗

- 通用抽屉宽 420px（生产设备列表 520px），顶部 `header-height + 8px`，底部 54px，左右各 19px；
- 抽屉打开时主侧栏整体平移隐藏（`translateX(±110%) + opacity: 0`）；
- 弹窗/菜单 z-index ≥ 12；抽屉层 z-index 7–14；
- 抽屉必须使用 `<Transition>` 且延迟卸载（`after-leave` 后再销毁），保证离场动画完整。

### 5.6 地图控件

- 地图工具条位于右侧栏内侧，通过 `--map-controls-right` 变量避让侧栏宽度；
- 抽屉/轨迹场景打开时控件位置动态计算（如 `calc(420px + 19px + 16px)`）；
- 控件按钮使用切图（88×38 / 105×36 / 107×36 等），hover 提升亮度 `filter: brightness(1.12)`。

## 6. 组件规范

### 6.1 PanelCard（唯一面板容器）

- 头部高 42.5px：切图背景 + 16px 图标 + 18px 标题 + 「更多」入口；
- 内容区：`padding: 8px 14px 16px`，切图底 + 底部装饰条（≤16px）；
- 面板内容滚动统一使用 4px 细滚动条；
- 所有面板资源必须通过 `panelAssets(variant, module)` 取切图，禁止手写图片路径。

### 6.2 切图组件

- `SpriteImage`：通过 `background-image + background-position` 从设计切片裁切图标；
- 裁切模式：`none` / `fit` / `contain` / `icon-left` / `icon-top`；
- `ClipImage`：按配置裁剪装饰图；
- 业务图标一律走 `spriteConfig.ts` / 各模块 `*SpriteConfig.ts`，禁止新增独立小图标文件。

### 6.3 组件设计来源（公共模块原型）

原型 `公共模块/` 下有两组通用组件设计，新页面必须优先沿用其形态：

- `业务对象通用弹窗.pdf`：设备/人员/车辆等业务对象的通用详情弹窗，所有「对象详情」统一复用此弹窗模式；
- `图层.pdf`：地图图层控制面板（图层开关、显隐、顺序）。

> 说明：这两份 PDF 尚未完成像素级视觉解读，接入时以本文档 + 原型为基准，建议在智谱视觉 MCP 生效的会话中解读后细化到本清单。

### 6.4 可复用组件清单（布局与通用业务）

**布局组件**

| 组件                                      | 用途                                          | 复用场景               |
| ----------------------------------------- | --------------------------------------------- | ---------------------- |
| `DashboardLayout`                         | 标准页面骨架：头部 + 主区 + 底部消息条        | 所有地图大屏页         |
| `AppHeader`                               | 系统头部：标题、主导航、天气、时钟、用户区    | 所有大屏页             |
| `AccidentRescueHeader`                    | 事故/演练/台风专用头部（事件信息 + 响应时间） | 事故救援、演练、台风页 |
| `SystemMessageBar`                        | 底部跑马灯消息条                              | 大屏页默认展示         |
| `UserMenuDropdown`                        | 用户下拉菜单                                  | 头部用户区             |
| `ViewportSimulator` / `ViewportSizePanel` | 大屏尺寸模拟与尺寸面板                        | 全局（App.vue 已内置） |
| `MapPageShell`                            | 地图页三层外壳（地图层/UI 层/浮层）           | 所有地图页             |

**通用业务组件**

| 组件                                | 用途                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| `PanelCard`                         | 通用面板容器（切图头部 + 内容 + 底部装饰），模块面板的首选容器 |
| `PreliminarySidePanel`              | 前序应急/消防应急专用面板容器                                  |
| `AccidentRescueSidePanel`           | 事故应急救援专用面板容器（支持 accident/drill 主题）           |
| `SpriteImage`                       | 从设计切片裁切图标（none/fit/contain/icon-left/icon-top）      |
| `ClipImage`                         | 按配置裁剪装饰图                                               |
| `StatCard` / `ProductionStatCard`   | 统计卡：数值 + 单位 + 图标                                     |
| `AlarmCard` / `ProductionAlarmCard` | 告警卡：类型色 + 时间 + 位置 + 状态 + 处置入口                 |
| `EquipmentItemCard`                 | 设备条目卡                                                     |
| `OverviewGridItem`                  | 生产总览网格项（切图 + 名称 + 数量）                           |
| `TvSemiGauge`                       | 半圆仪表（视频/指标类可视化）                                  |
| `FireAlarmListDialog`               | 消防告警列表弹窗（多条件筛选 + 分页）                          |
| `FireAlarmImageDialog`              | 告警图片预览弹窗                                               |
| `EquipmentMaintenanceDialog`        | 设备维保弹窗（Tab + 筛选 + 工单跟踪）                          |

### 6.5 可复用组件清单（地图）

| 组件                                                                                                    | 用途                                            |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `SharedCesiumMap` / `MaomingPetroCesiumMap`                                                             | 全站单例 Cesium 地图（业务配置由 mapMode 驱动） |
| `CenterMap`                                                                                             | 消防中央地图：告警标点 + 地图工具条             |
| `FireEmergencyMap` / `ProductionMap` / `SecurityMap` / `TvMap` / `PreliminaryMap` / `AccidentRescueMap` | 各模块地图封装                                  |
| `MapModeToggle`                                                                                         | 「安全生产监测 / 前序应急」地图模式切换         |
| `RescueDrawerMapOverlay`                                                                                | 消防救援抽屉联动地图叠加                        |
| `SecurityTrackMapOverlay`                                                                               | 安防人/车轨迹回放叠加                           |
| `FireBrigadeMapOverlay`                                                                                 | 消防队伍地图叠加                                |
| `MajorHazardMapOverlay`                                                                                 | 重大危险源地图叠加                              |
| `TyphoonRiskMapOverlay`                                                                                 | 台风风险点地图叠加                              |
| `SecurityToolbarIcon`                                                                                   | 安防地图工具条图标                              |

### 6.6 可复用组件清单（模块面板）

模块面板统一放在 `src/components/panels/<module>/`，新页面按模块引用：

- **security（安全防恐）**：`EntryExitStatsPanel` 进出统计、`PatrolLinkagePanel` 巡逻联动、`AlarmTrendPanel` 告警趋势、`PatrolAlarmPanel` 巡逻告警、`SecuritySearchPanel/DetailPanel` 人车搜索与详情、`SecurityTrackScenePanel` 轨迹场景、`PatrolCameraListPanel/VideoDialog` 巡逻相机、`EntryCaptureListPanel` 出入抓拍、`BollardListPanel/DetailDialog` 防撞柱、`GateControlListPanel/DetailDialog` 门禁控制；
- **tv（工业电视）**：`VideoOverviewPanel` 视频总览、`VideoAnalysisPanel` 视频分析、`MaintenanceOrderPanel` 维保工单、`EventAnalysisPanel` 事件分析、`ImportantVideoPanel` 重要视频、`PlantInspectionPanel` 厂区巡检、`VideoMonitorDetailPanel` 监控详情；
- **production（生产应急）**：`FacilitiesOverview` / `DeviceOverview` / `ProductionAlarmPanel` / `RiskControlPanel` / `StatsOverviewBar` / `ProductionDeviceListPanel`、`ProductionAreaTopBar/PersonnelPanel/AlarmPanel`、`MajorHazardListPanel/StatsBar`；
- **accident-rescue（事故救援）**：`IncidentDetailPanel`、`EmergencyPlanPanel`、`AccidentInfoPanel`、`RescueDutyPanel`、`RescueAuxiliaryPanel`、`RescueDynamicsPanel`、`EmergencyProcessPanorama`、`RescueBottomToolbar`、`RescueStageProgress`、`EvacuationPeoplePanel`、`MonitoringPointsScenePanel`、`RescueRouteScenePanel`、`FacilityDetailPanel`、`CommandActionDetailPanel`、`EmergencyAddressBookDialog`、`EmergencyPlanSwitchDialog`；
- **preliminary（前序应急）**：`DutyWatchPanel`、`EmergencyEventListPanel`、`EmergencyRescuePanel`、`SafetyKnowledgePanel`、`EmergencyEventCreateModal`；
- **typhoon（台风）**：`TyphoonLeftPanel`、`TyphoonRightPanel`、`SatelliteCloudMapDialog`；
- **video-control（视频联控）**：`VideoControlSidebar`（分类 + 监控树）、`VideoControlGrid`（1×1/2×2/3×3 网格）、`VideoControlBottomBar`（布局/分页/操作）；
- **video-wall（视频墙）**：`VideoWallSidebar`、`VideoWallGrid`（可编辑网格）、`VideoWallPlayer`、`VideoWallAlarmPanel`，配套 `videoWallBus.ts` / `videoWallStore.ts` 状态。

### 6.7 组件复用规则

1. 新页面优先复用 `common/` 与 `layout/` 组件，禁止复制粘贴样式后改色改尺寸；
2. 模块面板新建到 `panels/<module>/` 目录，命名遵循现有 `XxxPanel / XxxDialog / XxxScenePanel` 约定；
3. 通用详情优先扩展「业务对象通用弹窗」模式，不逐页新造弹窗；
4. 组件视觉资源必须通过 `panelAssets` / `designAssets` / `spriteConfig` 获取，禁止硬编码图片路径；
5. 组件 props 优先使用 `src/lib/data` 的 TS interface，业务字段以 mock 接口为准；
6. 地图叠加层通过 `SharedCesiumMap` 暴露的 API 实现，禁止页面内重复创建 Viewer。

### 6.8 按钮与输入

- 大屏地图切换按钮：108×38 切图；
- 常规操作按钮：高 28–36px，圆角 2px，深蓝渐变底 + 蓝色描边；
- hover/active 反馈 100–200ms：提亮边框 + `filter: brightness(1.08~1.12)`；
- 输入框：深色底 + `rgba(0,120,200,0.35)` 描边，focus 时 `#00b4ff` 描边 + 微光。

## 7. 交互与动效规范

| 场景                | 时长       | 缓动                             |
| ------------------- | ---------- | -------------------------------- |
| 抽屉进入/离开       | 280ms      | `cubic-bezier(0.22, 1, 0.36, 1)` |
| 工业电视详情抽屉    | 0.38–0.42s | `cubic-bezier(0.4, 0, 0.2, 1)`   |
| 生产抽屉            | 0.26s      | `ease`                           |
| 按钮 hover/点击反馈 | 100–200ms  | `ease`                           |
| 加载 spinner        | 0.9s       | `linear infinite`                |
| 底部消息跑马灯      | 28s        | `linear infinite`                |
| 告警标点脉冲        | 1.5s       | `infinite`                       |

- 地图镜头切换：平滑飞入 0.9–1.15s，俯仰角 -38°~-46°，目标居中于「扣除侧栏后的可视区」；
- 所有操作必须有反馈：hover 态、加载态、空态、错误态至少四态齐全；
- 长文本统一截断规则：单行省略号 + 悬浮气泡全称（列表场景），禁止溢出换行破坏布局；
- 表单/下发类操作遵循「占位符 → 二次确认 → Loading」三段式闭环。

## 8. Cesium 地图视觉与交互规范

- 全站单例地图，页面通过 `mapMode` 切换业务配置（fire / fire-emergency / accident-rescue / evacuation / production / preliminary / security / tv / park-overview 等）；
- 装置区与边界数据来自 `mapdata` GeoJSON，底图影像来自 QGIS 导出 `map.png + map.pgw`，两者必须同源；
- 装置区 3D 体块支持悬停生长、线框模式、选中高亮；事故救援页使用顶视 2D 模式；
- 标点体系：
  - 告警标点：多层圆形切图（阴影/底座/外圈/内圈/图标）+ 竖线 + 落点圆点 + 弹出信息框；
  - 装置区标签：Billboard 合并贴图（上信息牌 + 下标点），随相机距离缩放；
  - 工业电视：四类相机标点 + 巡检圆圈叠加；
  - 安防：门禁标点、轨迹叠加、防撞柱/道闸状态标点；
- 聚焦规则：每个路由在 `cesiumMapModes.ts` 配置 `focusLeft/Right/Top/Bottom` inset，飞入时把目标居中于可用地图区，禁止被侧栏遮挡；
- 图层控制：`useMapControls` 统一处理「图层/区域/搜索/三维/热力/标签/切换」按钮，不直接在页面内散写地图 API。

## 9. 数据与状态模拟规范

- 所有业务数据集中在 `src/lib/data/*.ts`，以 TS interface 定义字段；组件内禁止硬编码业务数据；
- 告警类型枚举：火灾告警、GDS 报警、设备故障、视频识别；
- 告警状态枚举：未处置、处置中、已处置；
- 特殊作业枚举（8 类）：动火作业、盲板抽堵、吊装作业、动土作业、受限空间、高处作业、临时用电、断路作业；
- 消防设备分类（12 类）：火灾自动报警、消防水源、室外消防栓、自动喷水灭火、气体灭火、泡沫灭火、干粉灭火、防烟排烟、防火分隔、消防应急广播、应急照明疏散指示、消防电源；
- 视频状态：`live` / `loading` / `ai`，AI 识别框统一绿色 `#3dd68c`，加载态统一 spinner +「正在打开视频流，请稍候...」；
- 时间格式：模块内保持一致（演示数据多用 `yyyy/MM/dd HH:mm:ss`），时钟类每秒刷新；
- 监控画面使用 `src/assets/mock-cameras` 模拟图，禁止引用不可访问的真实视频流；
- 台风/卫星/雷达模块允许直连公开接口（istrongcloud、JMA、GIBS、RainViewer），失败时必须回退 mock 且不阻塞页面。

## 10. 设计资源与切图规范

- 设计稿切片源在 `Images/`，工程运行资源在 `public/design/`，两者以 `designAssets.ts` 的映射表为准；
- 模块前缀：`消防监测一张图_`、`消防应急一张图_`、`事故应急救援_`、`生产应急监测_`、`前序应急一张图_`、`安全防恐_`、`工业电视一张图_`；
- 新页面资源必须登记进 `designAssets.ts` 的 module/panel 映射，禁止在模板里直接写 `/design/xxx.png`；
- 装饰性元素用切图，内容性元素用真实 HTML 组件（README「装饰切图 + 内容重构 + 图标裁切」三策略）；
- 切图命名沿用原型导出名（矩形/圆形/路径/图层/图片 + 序号），变更需同步更新映射。

## 11. 冲突处理与待确认项

| 冲突项     | 本规范（工程还原）    | 其它来源                                | 处理                           |
| ---------- | --------------------- | --------------------------------------- | ------------------------------ |
| 大屏主色   | `#001630` / `#00b4ff` | mm-safety-master：`#0d5c4c` / `#00d4ff` | 待客户确认；确认前以本规范为准 |
| 头部高度   | 77px                  | 设计准则：130px                         | 以原型图还原为准               |
| 底部高度   | 67px                  | 设计准则：100px                         | 以原型图还原为准               |
| 边缘留白   | 17–39px               | 设计准则：96px                          | 以原型图还原为准               |
| 紫色使用   | `#b07aff` 仅点缀      | 设计准则：禁用高饱和紫                  | 限定小面积点缀                 |
| 字体加载   | Google Fonts 外链     | —                                       | 内网演示需本地化字体           |
| 微前端架构 | 不使用                | mm-safety-master 使用 wujie             | 演示原型保持单体，架构另行归档 |

## 12. 新页面/新组件接入检查清单

- [ ] 路由已注册，页面挂在 `MapPageShell` + `DashboardLayout` 下；
- [ ] `min-width: 1920px`，并通过尺寸模拟器检查 1366 / 1920 / 2560 三档；
- [ ] 面板使用 `PanelCard`，资源走 `designAssets.ts`，未直接引用 `Images/` 大图；
- [ ] 优先复用 `common/`、`layout/`、`panels/` 现有组件，未复制样式新造重复组件；
- [ ] 数据写在 `src/lib/data`（TS interface），未在组件内硬编码；
- [ ] 抽屉/弹窗动效、z-index、`pointer-events` 符合本规范；
- [ ] 空态、加载态、长文本截断齐全；
- [ ] 地图聚焦 inset 已配置，目标不被侧栏遮挡；
- [ ] 告警/状态颜色符合语义（红=危险、金=警告、绿=正常）；
- [ ] 已通过 `npm run build`（vue-tsc 类型检查）。

## 13. 相关文件索引

| 内容           | 位置                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 设计令牌       | `src/styles/variables.css`                                                                                                                                              |
| 切图资源映射   | `src/utils/designAssets.ts`、`src/utils/*SpriteConfig.ts`、`public/design/`                                                                                             |
| 布局组件       | `src/components/layout/DashboardLayout.vue`、`src/components/map/MapPageShell.vue`、`src/components/layout/AppHeader.vue`、`src/components/layout/SystemMessageBar.vue` |
| 面板组件       | `src/components/common/PanelCard.vue`、`SpriteImage.vue`、`ClipImage.vue`                                                                                               |
| 视口模拟       | `src/utils/viewportSimulator.ts`、`src/components/layout/ViewportSimulator.vue`                                                                                         |
| 地图模式与聚焦 | `src/config/cesiumMapModes.ts`                                                                                                                                          |
| 地图实现       | `src/components/map/MaomingPetroCesiumMap.vue`、`SharedCesiumMap.vue`                                                                                                   |
| 模拟数据       | `src/lib/data/*.ts`                                                                                                                                                     |
| 设计原则参考   | `1交付阶段-进行中/03_产品设计/设计准则/大型复杂管控系统场景 UI 设计与交互规范指南v2.docx`                                                                               |
| 原型基准       | `1交付阶段-进行中/03_产品设计/安全管控指挥系统原型/大屏/`                                                                                                               |
| 需求规格参考   | `mm-safety-master/specs/`、`1交付阶段-进行中/03_产品设计/需求分析/`、`03_产品设计/PRD文档/`                                                                             |

---

变更记录：

| 版本 | 日期       | 说明                                                   |
| ---- | ---------- | ------------------------------------------------------ |
| V1.0 | 2026-08-10 | 初稿：以 mm-UIproject 工程实现为基准，统一三套资产口径 |
