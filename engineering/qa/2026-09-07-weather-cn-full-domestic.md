# QA · 卫星云图/降雨雷达效果对齐（国内源二阶段）

日期：2026-09-07　变更：`openspec/changes/weather-radar-dual-source/`（二阶段）

## 用户反馈的三个问题

1. 雷达彩色块与地图位置对不上（整图近似对位偏差）。
2. 卫星模式长时间空白/转圈（JMA、GIBS 外源不可达）。
3. 放大到茂名/厂区级雷达模糊马赛克。
   期望参照：中央气象台官网那种全国雷达拼图 + 逐 6 分钟动画回放。

## 根因取证

- nmc 官网雷达页（chinaall.html）用 jquery.iviewer 看图，**无地理配准**可抄。
- 中央气象台**台风网** `gis.js` 的 `addRadarImg`/`addCloudImg` 给出官方配准：
  south/west (11.1784, 67.5)，north/east (55.7766, 140.625)（≥2023 版，SWAN 产品实测注释）。
- 首版用的 `[[10,70],[60,140]]` 北界差近 5° → 对位偏差实锤。
- 清晰度：medium ECREF 仅 825×739；**SWAN EZ9 3328×2560**（4 倍，约 2km/px）直连 200。
- 卫星：JMA/GIBS 在用户网络不可达；nmc 发布 **FY4B ETCC 真彩**（860×540，15 分钟帧，UTC）直连 200。
- 时间轴此前依赖 JMA 时次表——外源不可达时**整条时间轴都是死的**，这是"一直转圈"的深层原因。

## 修复

- 雷达：SWAN EZ9 + 官方 bounds + z≥9 隐藏（官方同款）。
- 卫星：FY4B 真彩 imageOverlay（夜间无新帧回退更早白天帧），JMA/GIBS 装配退役。
- 时间轴：本地 15 分钟步长生成（24h=96 帧/6h=24 帧/current=8 帧），零外源请求；RainViewer 可选静默。

## 验收口径与执行

| 项         | 命令                                      | 结果                     |
| ---------- | ----------------------------------------- | ------------------------ |
| 类型检查   | `npm run type-check`                      | 0 error                  |
| 子应用重建 | `npm run build:subapps`                   | fm-typhoon dist 重建成功 |
| 双模式实证 | `node scripts/shoot-china-radar.mjs 5174` | 见下                     |

实证（playwright 穿透 wujie shadow DOM）：

- 卫星模式：`img.leaflet-image-layer` ×2 均 `naturalWidth>0`，FY4B URL
  `...WXBL/medium/...PY_20260907023000000.JPG` 与 SWAN 雷达叠加同时在场。
- 雷达模式：SWAN `...RDCP/...P9_20260907025400000.PNG` 加载成功；源切换开关正常（全球雷达未配 key 禁用）。
- 回退链路生效：03:30/03:24/03:15 等未生成帧 404 后自动回退到 02:54/02:30 可用帧。

截图：`engineering/qa/scm-fy4b-satellite.png`、`engineering/qa/scm-swan-radar.png`。

## 未运行项 / 已知残留

- 对位精度未经目视核对（沙箱无法看图），但 SWAN + 官方 bounds 为台风网同款配对，理论对齐官方。
- FY4B 真彩夜间无新帧（可见光通道物理限制），夜间回退显示更早白天帧；如需昼夜全通道需另立 change 引入红外产品页。

## 追加修复（同日）：404 控制台噪声归零

用户反馈控制台出现成串 404（"现在"时次打到未生成帧）。两次尝试对比：

- 方案 A（已废弃）：fetch 探测实际最新帧——发现 image.nmc.cn 的 **404 响应不带 ACAO 头**，
  fetch 404 反而触发 CORS 控制台报错，探测路线天然有噪声，废弃。
- 方案 B（落地）：时间轴末端**静态回退 45 分钟**（`CN_TIMELINE_SAFE_LAG_MS`，覆盖官方 30–45 分钟生成延迟），
  零探测、零 404、确定性成立；弹窗内 backstep 回退链保留兜底。

复测（`node scripts/shoot-china-radar.mjs 5174`）：`nmcResponses ok:8 / fail:0`，`consoleErrors: []`，
FY4B 03:15 与 SWAN 03:12 帧直连命中。

## 追加修复（同日二）：雷达模式底图 "API key required"（CARTO）

用户反馈雷达区显示 "API KEY required carto.com/basemaps/apikey"——来自**矢量底图**：
CARTO basemaps 已对无 key 请求返回印字报错瓦片（最初那句"缺apikey"的真正来源，而非 RainViewer）。
修复：两个弹窗的 `createVectorBaseLayer` 由 CARTO light_all 换为
**Esri World Light Gray Base**（与卫星模式实景影像同域 `server.arcgisonline.com`，
免 key、国内可达、浅灰适合叠雷达）。
复测：雷达模式 `carto 请求 0 / esri 69 瓦片全 200 / consoleErrors: []`。

## 追加修复（同日三）：底图缺少参照特征

用户反馈：Esri 浅灰画布低层级下近乎纯灰，无路网/城市等参照，体现不出"哪里在下雨"。
修复：底图换**高德中文矢量**（`webrd0{s}.is.autonavi.com ... style=8`，免 key、国内 CDN、
路网+城市+中文标注齐全）；高德为 GCJ-02，与 WGS-84 叠加层约 500m 系统偏移，
全国/城市级视图可忽略（已在代码注释说明）。
复测：`amap 60 瓦片全 200 / nmc 3 ok / consoleErrors: []`，截图 `scm-amap-radar.png`。
