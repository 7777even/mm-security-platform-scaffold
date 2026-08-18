# 设计文档：dashboard「应急一张图」地图底座（2026-08-18）

> 由 brainstorming 产出，已获用户批准。实现计划见 `docs/superpowers/plans/`。

## 背景与目标

综合态势页（dashboard）当前为面板式布局（指标卡/趋势图/告警列表平铺）。目标改为**全屏地图底座**：OpenLayers 2D 地图为底，指标卡/告警列表/趋势图以悬浮玻璃面板叠加，接入 mock 地图接口绘制报警点/设备点/区域轮廓，形成指挥大屏「应急一张图」形态。

## 范围

- `src/views/dashboard/index.vue` 重构为地图底座布局
- 新增 `src/services/map.ts`（`/map/alarms`、`/map/devices`、`/dashboard/risk-heatmap` 对接 + 静态兜底）
- 新增地图点位样式与区域着色
- 实时通道 `rt/alarm/push` 联动地图点位
- CSP 开发态放行瓦片外域
- 新增 OpenLayers 按需引入

## 非目标（YAGNI）

- 不做 3D（Cesium/Three.js，S3 定案属后续真机验证项）
- 不接天地图密钥（生产替换项，代码留 adapter 注释）
- 不做复杂地图交互（测距/标绘/图层开关等）

## 技术决策

| 项 | 决策 | 依据 |
|---|---|---|
| 地图库 | OpenLayers（`ol` 包，按需引核心模块） | S3 定案 2D 基线；纯 JS Canvas，Chromium 86 兼容 ✅ |
| 底图 | OSM 公网瓦片 + CSS 暗色滤镜（反转/饱和度/对比度） | 开发占位好看、零配置；生产替换天地图（注释标注） |
| 点位数据 | mock `GET /map/alarms`（GeoJSON Feature）、`GET /map/devices`、`GET /dashboard/risk-heatmap` | B3 契约已实现 |
| 降级 | mock 不可达 → 静态兜底点位 + 黄色提示 | 与现有 dashboard 模式一致 |

## 布局

```
┌────────────────────────────────────────────┐
│  [指标卡条] 在线点位·今日告警·风险指数·工作站 │  顶部紧凑横条（玻璃）半透明
├──────────────────────┬─────────────────────┤
│                      │ 实时告警列表         │
│     全屏地图          │ （玻璃面板，右缘）    │
│   报警点/设备点/区域   │  LIVE + 隔行变色    │
│                      ├─────────────────────┤
│                      │ 趋势图（迷你，底部）   │
└──────────────────────┴─────────────────────┘
```

- 地图占满 dashboard；顶部指标卡改横条、右侧告警列表、左下迷你趋势图，均为半透明玻璃悬浮面板
- 地图控件（缩放/复位）右下，深色适配

## 叠加图层

| 图层 | 数据源 | 样式 |
|---|---|---|
| 报警点位 | `GET /map/alarms` | 等级色圆点（1红/2黄/3蓝/4灰）+ 点击弹详情 |
| 设备点位 | `GET /map/devices` | 状态色（绿在线/灰离线/红故障）小圆点 |
| 区域轮廓 | `GET /dashboard/risk-heatmap` | 五区域静态坐标映射 + score 着色半透明面 |

## 数据流

```
onMounted → fetchMapData()（并行 3 接口）
              ├─ 成功 → 渲染点位/区域 → markOnce('map:ready')
              └─ 失败 → 静态兜底 + 提示
ws rt/alarm/push → 告警列表置顶 + 地图对应点位更新
```

## 错误处理与降级

- 地图初始化失败（WebGL/CSS filter 异常）：面板式兜底布局（现有布局保留为 fallback）
- mock 不可达：静态点位 + 黄色提示
- 点击点位无详情数据：仅显示点位基本信息

## 测试

- `services/map.ts`：类型解析/兜底数据（TDD）
- 地图初始化与点位渲染：jsdom 环境冒烟（ol 在 jsdom 下有限支持，以「不抛错 + 容器存在」为断言）

## 性能与体积

- OpenLayers 按需引入，控制新增 chunk 体积
- 构建后跑 `analyze-dist.mjs`，若 ol 导致超限（>500KB）则评估懒加载/拆包
- 渲染层埋点新增 `map:ready`

## 边界与约束

- 不改路由/权限/动态菜单/错误边界
- 全量门禁：eslint / vue-tsc / stylelint / vitest / build + 体积对比
- 生产底图替换天地图（S3）时仅改 adapter/图层源
