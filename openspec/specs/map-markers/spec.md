# Capability: map-markers

点位呈现体系（源项目 HTML 覆盖层机制迁入）：报警/设备点位经 `map-adapter` 转换后由 `AccidentRescueMarkersOverlay` 以 HTML/Vue 覆盖层渲染，经 `useCesiumScreenAnchor`（`worldToScreen`）屏幕锚定，随相机同步。另有事故救援、重大危险源、消防力量、安保轨迹、沙盘推演、台风风险、告警详情等业务覆盖层。

## Requirements

### Requirement: 数据适配契约（map-adapter）

脚手架后端点位（`/map/alarms`、`/map/devices` 的 `MapPoint`）经 `services/map-adapter.ts` 单向适配为覆盖层数据形状，禁止覆盖层直连后端接口或 mock 数据源。

#### Scenario: MapPoint → MonitoringPoint

- **WHEN** 视图以 `toMonitoringPoints(points, kind)` 适配点位
- **THEN** 输出 `{ id, name, category, status, lastTime, org, longitude, latitude }`；`alarm` → category「报警点位」，`device` → category「监测设备」；`ONLINE→normal`、`FAULT→alarm`、其余→`warning`；level ≤2→`alarm`、≥3→`warning`、缺省→`alarm`

#### Scenario: WorldMarkerAnchor 转换与防冲突

- **WHEN** 覆盖层需要屏幕锚定坐标
- **THEN** `toWorldMarkers(points, kind)` 输出 `{ key: '<kind>:<id>', longitude, latitude, height? }`；过滤非法坐标（非有限数）；kind 前缀保证报警/设备 id 冲突隔离

### Requirement: HTML 覆盖层屏幕锚定

点位标记为 DOM 元素，经 `useCesiumScreenAnchor` 以 `worldToScreen`（`SceneTransforms.worldToWindowCoordinates`）逐帧换算屏幕坐标并 `translate` 定位，覆盖层容器 `pointer-events: none`、标记本体按需 `auto`；随相机渲染帧（`addRenderListener`）同步。

#### Scenario: 相机运动时标记跟随

- **WHEN** 相机飞行/缩放/旋转
- **THEN** 点位标记屏幕位置逐帧同步，坐标在视锥外或被遮挡时标记隐藏（worldToScreen 返回 null）

#### Scenario: 覆盖层不阻断地图交互

- **WHEN** 用户与地图交互
- **THEN** 覆盖层容器不拦截指针事件，仅标记本体可点

### Requirement: 点位状态着色（token 单一真源）

标记状态色（normal / warning / alarm 及报警等级 1-4）仅使用 `tokens.css` 语义 token（`--color-success/warning/danger`、`--color-alarm-1..4`、`--map-marker-cyan` 等地图专用 token），禁止组件内自造色阶；发光/脉冲等 DOM 动画样式同理。

#### Scenario: 状态变化反映着色

- **WHEN** 点位 `status` 为 normal / warning / alarm
- **THEN** 标记圆点/描边呈现对应语义 token 颜色

### Requirement: 业务覆盖层经共享桥受控

各业务覆盖层（AccidentRescue / MajorHazard / FireBrigade / SecurityTrack / Sandbox / TyphoonRisk / AlarmDetail / RescueDrawer）不直接持有 viewer，统一经 `sharedCesiumBridge` 的 expose API（`worldToScreen` / `getMarkerUiScale` / `flyToWorldPositions` / `getBoundaryEdgePositions` 等）与地图协作。

#### Scenario: 覆盖层聚焦点位

- **WHEN** 用户在覆盖层内点击「定位」
- **THEN** 经 `flyToWorldPositions`（或语义化 fly API）飞行至目标坐标，视角参数受控

#### Scenario: 地图未就绪降级

- **WHEN** 覆盖层在 `onSharedMapReady` 前请求数据
- **THEN** 经 ready 回调队列延迟执行，不抛错
