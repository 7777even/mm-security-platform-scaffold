# 大屏首页对齐设计说明文档 — 实现设计

> 日期：2026-08-20
> 范围：仅 `dashboard/index.vue` 大屏首页（消防监测首页 / 主界面级）
> 依据：`docs/安全管控平台设计说明.docx` §5.3 总体界面设计（图 5-1 色彩、图 5-3 字体、图 5-6 面板容器、图 5-7 统计告警卡片、图 5-9 列表、图 5-10 首页原型）
> 不在本轮：顶部导航栏（AppLayout）结构、底部滚动消息栏（全局组件，后续单独 change）

## 目标

将大屏首页在布局、配色、字体、面板、统计卡、告警列表、趋势图上对齐设计说明文档，达到视觉一致、可被设计稿核验的状态。

## 设计决策

### 1. 布局结构（三栏）

采用设计稿首页「左面板 419px + 中央地图 + 右面板 419px」骨架：

- **顶部浮动统计横条** → 移除，统计卡内嵌进左侧面板（设计稿无顶部浮动横条）。
- **左侧面板区（419px）**：统计卡组（在线点位 / 今日告警 / 风险指数 / 在线工作站）+ 近 24h 告警/处置趋势图。
- **中央**：Cesium BaseMap 地图主体，不变。
- **右侧面板区（419px）**：实时告警列表（保留 LIVE 标识、空态、mock 降级提示）。
- 2D/3D 切换保留，置于地图右上角浮层（或顶部右侧，不占面板）。
- 底部滚动消息栏本轮不做（划为全局组件）。

### 2. 设计令牌对齐（tokens.css）

| Token                | 原值                   | 设计稿值         | 说明                                        |
| -------------------- | ---------------------- | ---------------- | ------------------------------------------- |
| `--color-bg`         | `#050a15`              | `#0B1526`        | 主背景深蓝黑                                |
| `--color-danger`     | `#f5414b`              | `#FF4A5A`        | 危险/报警红                                 |
| `--color-warning`    | `#faad14`              | `#FFB020`        | 警示/预警橙                                 |
| `--color-success`    | `#52c41a`              | `#2EEC68`        | 正常/成功绿                                 |
| `--color-text-muted` | `#7e9bb8`              | `#8FAEC3`        | 辅助文字灰蓝                                |
| `--color-accent-2`   | 缺失                   | `#2E7CF6`        | 新增次强调蓝                                |
| `--glass-border`     | `rgb(0 212 255 / 28%)` | `#2AA7B8` 半透明 | 新增独立边框色语义（保留青色光带用 accent） |
| `--color-text`       | `#eaf2fb`              | 接近 `#FFFFFF`   | 维持高对比，可不改                          |

保留既有 `--color-accent: #00d4ff`（设计稿 `#00D0FF`，视觉无差）。

### 3. 字体规范（tokens.css + global.css）

- 新增 `--font-number`：`'Poppins', 'DIN', 'Consolas', monospace`（数据指标数字）；
- 新增 `--font-display`：`26px`（页面级大标题/关键数字）；
- 全局 `body` `font-family` 改为 `'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif`；
- 面板标题维持 16px（设计稿一致）；正文 14px、辅助 12px 维持。

### 4. 可复用组件

- **新增 `src/components/common/PanelCard.vue`**：标题区（图标槽 + 标题 + 右侧「更多」链接槽）+ 内容默认插槽 + 底部青色光带（复用 `.glass-panel` 玻璃质感）。替换 dashboard 内手写面板结构（告警面板、趋势图面板）。
- 统计卡不单独建组件，在 dashboard 左面板内联实现（4 项），遵循设计稿大字号+语义色。

### 5. 告警列表 / 趋势图

- 告警列表沿用现结构，宽度随右面板 419px；圆点/等级/设备/时间四要素保留，微调间距与字号对齐设计稿（行高、hover 高亮、分隔线）。
- 趋势图（ECharts）配色沿用 accent/success，坐标轴/标签色改用 `--color-text-muted`，尺寸随左面板自适应。

### 6. 约束

- 不引入公网字体 CDN（信创/离线场景）；Noto Sans SC 若系统未装则回退 Microsoft YaHei，不强制下载。
- 不破坏既有 services / stores / realtime 接线；仅视图层与样式层改动。
- 不新增硬控写端点（零下行红线维持）。
- 保持 CSP 兼容（无 inline style 注入）；`unsafe-eval` 已因 Cesium 放行。

## 验证

- `npm run build` 通过；`npm run lint` 0 error；`npm run test` 全绿（既有 dashboard spec 不受影响，必要时补布局断言）。
- 视觉核对：左 419 / 右 419 / 中地图三栏；配色取自设计稿色值；字体生效。
- 设计令牌变更不引入 `any`，TS strict 维持。

## 不在范围

- AppLayout 顶栏高度/导航图标/天气（后续 change）。
- 底部 67px 滚动消息栏（后续全局组件 change）。
- 其他视图（fire-alarm / industrial-video 等）的面板统一（后续）。
