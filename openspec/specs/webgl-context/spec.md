# Capability: webgl-context

Cesium 运行前的 WebGL 可用性与上下文降级兜底。

## Requirements

### Requirement: WebGL 检测

组件初始化前通过 `detectWebGL()` 检测运行环境 WebGL 能力。

#### Scenario: 检测不可用

- **WHEN** `detectWebGL()` 返回 false
- **THEN** 不创建 Cesium viewer，渲染降级提示并 emit `error`

### Requirement: 降级不白屏

WebGL 不可用或 Cesium 加载失败时，提供可读的降级文案，不出现空白画布。

#### Scenario: 降级文案

- **WHEN** 进入降级分支
- **THEN** 展示「当前环境不支持 WebGL / 地图加载失败」提示，保留页面其余功能可用
