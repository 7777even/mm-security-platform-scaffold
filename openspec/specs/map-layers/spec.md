# Capability: map-layers

Cesium 场景图层体系（源项目 mapMode 体系迁入）：装置区立体层、厂区边界、疏散路线、TV 巡检圈、布防聚焦线等场景级图层，按 `CesiumMapMode` 配置开关，经 `sharedCesiumBridge` expose API 受控操作。

## Requirements

### Requirement: mapMode 图层配置

每种 `CesiumMapMode`（fire / fire-emergency / accident-rescue / evacuation / production / preliminary / security / tv / park-overview / operation-monitoring / ai-diagnosis / cesium-test）在 `config/cesiumMapModes.ts` 中声明图层开关：`showPlantZoneTags`、`enablePlantZoneSelection`、`enablePlantZoneHover`、`suppressBlankClickDeselectWhenSelected`。

#### Scenario: 模式切换生效

- **WHEN** 路由切换或 `cesiumMapModeOverride` 被设置
- **THEN** 装置区标签牌显隐、装置区悬停 drillPick、装置区选中行为按目标模式配置生效

### Requirement: 疏散路线与疏散人员图层

提供 `showEvacuationRoute` / `clearEvacuationRoute` / `showEvacuationPeople` / `clearEvacuationPeople` / `focusEvacuationPerson`：路线折线与人员点位数据由调用方传入，渲染于场景并支持聚焦单个人员。

#### Scenario: 展示并清除疏散路线

- **WHEN** 调用 `showEvacuationRoute` 传入折线/点位后调用 `clearEvacuationRoute`
- **THEN** 路线实体先渲染后移除，场景无残留

### Requirement: TV 巡检圈图层

提供 `setTvInspectionCircles` / `getTvInspectionCircles` / `applyTvInspectionCircles` / `clearTvInspectionCircles` 与扫描态（`tvInspectionScanState`），巡检圈颜色收编于 `constants/mapScene.ts`（`TV_INSPECTION_CIRCLE_COLOR`）。

#### Scenario: 设置巡检圈

- **WHEN** 调用 `setTvInspectionCircles` 传入圆心/半径
- **THEN** 场景渲染对应扫描圈实体；`clearTvInspectionCircles` 后全部移除

### Requirement: 布防聚焦与边界几何查询

暴露 `setMonitoringFocusArea` 聚焦区域控制，及 `getBoundaryModelCenter` / `getBoundaryEdgePositions` / `getBoundaryModelTopHeight` / `getPlantZoneWorldPosition` 等几何查询，供覆盖层做屏幕锚定与布局计算。

#### Scenario: 覆盖层查询边界几何

- **WHEN** 覆盖层需要沿边界布局元素
- **THEN** 经 expose 查询边界中心/四边锚点/顶高，未就绪时返回 null 不抛错

### Requirement: 引擎级颜色单一真源

所有进入 Cesium API（材质、Shader、实体颜色）与 canvas 2D 绘图的颜色值统一收编 `src/constants/mapScene.ts`（按场景分组导出并标注来源），组件内禁止散落字面量色值；DOM/HTML 覆盖层颜色仍走 `tokens.css`。

#### Scenario: 新增场景颜色

- **WHEN** 需要为新场景图层引入颜色
- **THEN** 在 `constants/mapScene.ts` 增加带注释的命名常量并引用，不在组件内内联
