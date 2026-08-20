# Capability: map-layers

Cesium 瓦片底图与图层可见性控制。

## Requirements

### Requirement: 瓦片底图可配置

沿用 `VITE_MAP_TILE_URL`，生产同源离线瓦片、开发可公网预览；通过 `UrlTemplateImageryProvider` 注入 `viewer.imageryLayers`。

#### Scenario: 注入瓦片

- **WHEN** viewer 初始化后加载底图
- **THEN** 使用 `MAP_TILE_URL` 创建 `UrlTemplateImageryProvider` 并 `imageryLayers.addImageryProvider`

#### Scenario: 缺失瓦片不阻断

- **WHEN** 瓦片服务不可用
- **THEN** 仍渲染 viewer（深空背景），不抛致命错误

### Requirement: 图层显隐控制

提供底图 / 点位 / 区域 / 标注 四类图层的显隐开关，供地图工具栏调用。

#### Scenario: 切换底图可见性

- **WHEN** 调用底图显隐
- **THEN** `imageryLayers` 对应图层 `show` 属性被切换

#### Scenario: 切换点位/区域/标注可见性

- **WHEN** 调用对应显隐
- **THEN** 对应实体集合 `show` 被切换
