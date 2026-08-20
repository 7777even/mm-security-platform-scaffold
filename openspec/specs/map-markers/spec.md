# Capability: map-markers

Cesium 点位（报警/设备）与风险区域渲染、复合标注、点击拾取。

## Requirements

### Requirement: 点位渲染（等级/状态色）

报警点按 `level`（1-4）着色，设备点按 `status`（online/offline/normal/active）着色，均落在经纬度坐标。

#### Scenario: 报警点着色

- **WHEN** 渲染报警点位
- **THEN** 使用 `LEVEL_COLORS[level]`；未命中回退默认色

#### Scenario: 设备点着色

- **WHEN** 渲染设备点位
- **THEN** 使用 `STATUS_COLORS[status]`；未命中回退默认色

### Requirement: 复合标注

每个点位为「图形 + 文字」复合标注：点位主体（point/圆点）叠加名称 label，二者作为同一实体的 `point` + `label` 图形共存，保证视觉一体。

#### Scenario: 复合标注渲染

- **WHEN** 渲染点位
- **THEN** 实体同时含 `point`（等级/状态色圆点）与 `label`（点位 `name`），label 位于点位上方

#### Scenario: 标注可独立显隐

- **WHEN** 调用标注显隐
- **THEN** 所有点位 label 的 `show` 被切换，point 不受影响

### Requirement: 风险区域渲染（评分色面）

风险区域按 `score` 着色为半透明多边形面 + 描边 + 质心等级文字，不出现「实体 label 撑白块」类异常。

#### Scenario: 区域多边形

- **WHEN** 渲染风险区域
- **THEN** 以 `ZONE_COORDS[zone]` 构成 `polygon.hierarchy`，半透明填充 + 描边，`outlineWidth >= 1`

#### Scenario: 区域标签独立

- **WHEN** 渲染风险区域
- **THEN** label 作为独立实体置于质心，不与 polygon 同实体，避免撑白块

### Requirement: 点击拾取浮窗

点击报警/设备点位时拾取对应实体，回传点位属性用于浮窗展示。

#### Scenario: 点击点位拾取

- **WHEN** 用户在 viewer 上 `LEFT_CLICK`
- **THEN** `scene.pick` 命中实体时，回传该点位 `properties`（含 id/name/level/status 等）

#### Scenario: 点击空白不报错

- **WHEN** 点击空白区域（无实体）
- **THEN** 回传 null，不抛错
