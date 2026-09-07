# QA — 气象瓦片源可用性探测（GIBS / FY-4B / JMA / RainViewer 对照）

- 日期: 2026-09-07（探测执行于 2026-09-04，结论复核于 09-07）
- 效率等级: L4（本 QA 为 `openspec/changes/fix-weather-tile-sources/` 的**前置数据源探测**，不构成验收结论；验收 QA 于实施后另立）
- 范围: 大屏端卫星云图弹窗 `src/components/panels/typhoon/SatelliteCloudMapDialog.vue` 的气象瓦片候选源；涉及 `src/services/weather/`、`src/screen/lib/weather/gibsSatelliteApi.ts`

## 验收口径

- 判定各候选源是否具备浏览器直连可用性：时次接口可拉、瓦片返回 200、具备可用缩放层级、CORS 允许前端直连。
- 明确 10 分钟级静止卫星的分辨率物理上限，避免 design 阶段做出「可无限下钻」的假设。
- 为 `design.md` 的源选择（ADR-1 / ADR-3）提供可复核证据。

## 实际执行命令与结果

### 1. JMA 葵花（现状主源）

```
GET https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_fd.json
  -> 200 application/json, 213 帧, 20260902202000 .. 20260904081000（约 36h，10min 一档）
  basetime == validtime: 213/213（每帧独立目录）
  CORS: 无（<img> 标签不受限，Leaflet 实际可用）

GET .../satimg/{basetime}/fd/{validtime}/B13/TBB/5/25/14.jpg   -> 200 image/jpeg 12526B
GET .../B13/TBB/6/51/28.jpg                                     -> 404 text/html 2203B
  => JMA 最大层级 z=5，z>=6 全部 404（卫星模式被锁死 z=5 的根因）

24h 前历史帧可用性（z=5，茂名 25/14）：
  -  0 帧 20260904081000 -> 200 12526B
  - 24 帧 20260904041000 -> 200 10581B
  - 60 帧 20260903220000 -> 200 10691B
  -143 帧 20260903080000 -> 200 11408B
  => 24h 时间轴全程瓦片可用，源无历史断档

相邻帧内容差异（z4/13/6）：
  20260903080000 14574B md5=bd365670ac
  20260903081000 14516B md5=6c5fd030a8
  20260903082000 14404B md5=738e66e8f4
  => 相邻时次内容确实不同，源本身没问题
```

### 2. RainViewer 降雨雷达（现状雷达源）

```
GET https://api.rainviewer.com/public/weather-maps.json
  -> 200, host=https://tilecache.rainviewer.com
  radar.past = 13 帧，覆盖 2.04 小时（最新帧距今 4.6 min）
  => 24h 时间轴约 144 tick，仅最后约 12 个能命中（maxDeltaSeconds=900），其余 92% 无雷达帧

茂名瓦片（最新帧 /v2/radar/4c4bc3116aeb）：
  z4 12/7   -> 200 42131B
  z5 25/14  -> 200 58941B
  z6 51/28  -> 200  8157B
  z7 103/56 -> 200  2522B
  对照 广州 z5 -> 70112B；东京 z5 -> 26788B；首尔 z5 -> 24556B
  => 茂名/华南有真实回波，源可用；问题是「时间覆盖只有 2h」与「vector 模式 maxZoom=10 vs maxNativeZoom=7 导致 8x 拉伸」
```

### 3. NASA GIBS（下钻候选）

```
GET .../wmts/epsg3857/all/wmts.cgi?...&LAYER=Himawari_AHI_Band13_Clean_Infrared_v0_NRT
  DescribeDomains -> 200（该 all 端点不校验图层，故"看起来通"）
  瓦片 best 端点   -> 400 <ExceptionText>LAYER does not exist</ExceptionText>
  => 仓库既有 src/screen/lib/weather/gibsSatelliteApi.ts 引用的图层根本不存在（零引用文件，本次删除）

GET .../wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml -> 200 5793358B（真实图层清单）
  Himawari_AHI_Band13_Clean_Infrared     TileMatrixSet=GoogleMapsCompatible_Level6  Format=image/png
  Himawari_AHI_Band3_Red_Visible_1km     TileMatrixSet=GoogleMapsCompatible_Level7  Format=image/png
  MODIS_Terra_CorrectedReflectance_TrueColor  TileMatrixSet=GoogleMapsCompatible_Level9

GIBS Himawari_AHI_Band13_Clean_Infrared（Level6 / png）
  时次 190 个，2026-09-03T00:00:00Z .. 2026-09-04T08:00:00Z（10min 一档）
  z3 -> 200 image/png  96624B  cors=*
  z5 -> 200 image/png  60382B  cors=*
  z6 -> 200 image/png  12987B  cors=*
  z7 -> 400（超上限）

GIBS Himawari_AHI_Band3_Red_Visible_1km（Level7 / png）  z7 -> 200 34399B cors=*；z8 -> 400
GIBS MODIS_Terra_CorrectedReflectance_TrueColor（Level9 / jpg） z9 -> 200 6817B cors=*；z10 -> 400
```

### 4. 风云四号 FY-4B（用户指定的优先候选）

```
www.nmc.cn/publish/satellite/fy4b-visible.htm     -> 200 66346B，图片 URL 全由 JS 动态加载，HTML 内无可预测静态直链
www.nmc.cn/publish/satellite/fy4b-infrared.htm    -> 200 16204B，同上
www.nmc.cn/publish/satellite/fy4b-true-color.htm  -> 200 16204B，同上
rsapp.nsmc.org.cn/geofy/                          -> 200  6305B，未暴露任何 wms / wmts / geoserver / arcgis 服务端点

直链候选全 404：
  http://www.nmc.cn/rest/findSatellite?satelliteType=FY4B                       -> 404 cors=(无)
  http://www.nmc.cn/rest/fy4b/image?time=202609040600                           -> 404 cors=(无)
  http://image.nmc.cn/static2/dataService/imgmsg/20260904/FY4B_..._GCLR_....jpg -> 404 cors=(无)
  http://img.nsmc.org.cn/PORTAL/NSMC/DAT/FY4B/AGRI/20260904/...jpg              -> 404 cors=*
=> FY-4B 无公开瓦片服务、无 CORS，浏览器不可直连
```

### 5. 中央气象台雷达（24h 雷达回放候选）— 结论：不可用

```
www.nmc.cn 全站声明：「本站所刊登的信息、数据和各种专栏材料，未经授权禁止下载使用」
  => 爬取雷达图存在侵权与等保合规风险，中石化项目不可用

www.nmc.cn/rest/tempchart/getRadar -> 200 application/json cors=*，body 恒为 []
  ?type=1 / ?staCode=59287 -> 同样返回 []；带中文或非预期参数直接连接失败
  => 并非公开可用接口

www.nmc.cn/rest/radar、/rest/radar/chinaall、/rest/findRadar、/rest/radarImg -> 全部 404
雷达页 publish/radar/huadong.html -> 200，图片路径由 JS 经 image.nmc.cn{{=it[i].image}} 模板填充，HTML 内无可预测静态直链
image.nmc.cn/product/YYYY/MM/DD/RDCP/SEVP_NSMC_RDCP_SLDAS_EBREF_ACHN_L88_PI_*.PNG -> 404 / 连接失败
products.weather.com.cn/.../RADAR_CHINA_*.png -> 200 但 content-type 为 text/html 10159B（实为错误页，非图片）
```

### 6. 纯前端动态轮播 / 自动刷新可行性（2026-09-07 复核）

```
GET targetTimes_fd.json
  status 200 | 14487 B | CORS *
  ETag: W/"a5201164e503189414f9010c64725bc4"
  Last-Modified: Mon, 07 Sep 2026 00:36:42 GMT
  Cache-Control: max-age=60
  帧数 213，覆盖 35.83h；帧间隔众数 600s（少量 1200s 缺帧）
  末帧 20260907003000，距今 842s（≈14 min，源上游处理延迟）

条件请求：带 If-None-Match / If-Modified-Since -> 304，0 字节  ✅
  => 轮询成本趋近于零，纯前端自动刷新成立

单帧开销：z5 单瓦平均 10.3 KB -> 满屏 28 张 ≈ 0.28 MB/帧
  => 预取 6 帧 ≈ 1.7 MB；预取 12 帧 ≈ 3.4 MB
```

### 7. 浏览器端三模式对照（Playwright / Chromium，dev server :5174）

```
模式1 卫星云图：图层 [imagery z5 x28 op1, jma z5 x28 op0.72, radar x28 op0.64]；屏上 JMA 时次 20260904081000
模式2 降雨雷达（最新时次）：图层 [vector z10 x32 op1, radar x2 op0.72]；整轮 rainviewer 瓦片请求数 = 2
模式2 降雨雷达（24h 中段）：图层 [vector z10 x32 op1]；雷达层整层消失
模式3 台风路径：图层 [imagery z5 x28 op1]；路径矢量正常渲染
```

## 未运行项

- 未跑 `npm test` / `type-check` / `eslint`：本 QA 为数据源探测，未改动任何源码，不适用矩阵验证。
- 未验证 GIBS 在信创环境（鲲鹏/银河麒麟 + Chromium 86）下的 TLS 与渲染兼容性：本机无该环境，需在实施后的验收 QA 或现场联调补测。
- 未做 GIBS 国内访问的长时段时延采样：仅单点探测（95–300ms 量级），生产需按 design.md 的超时降级预案兜底。

## 截图证据

- 本轮为源探测，截图证据在实施后的验收 QA 中随三模式对照与 z=5→6→7 下钻一并归档（`engineering/qa/evidence/`）。
- 本轮结论的全部证据为上述可执行命令与响应摘要，可原样复跑复核。

## 结论

- **JMA 源健康**：24h 全程瓦片 200、相邻时次内容不同；唯一硬限制是 z≥6 返回 404。
- **RainViewer 源健康但覆盖不足**：茂名有回波，但 `radar.past` 仅 13 帧 / 2.04h，与 24h 时间轴错配是「降雨雷达不可用」的主因。
- **FY-4B 不可用**：无公开瓦片服务、无 CORS，按 ADR-5 排除。
- **中央气象台雷达不可用**：全站声明「未经授权禁止下载使用」，爬取有侵权与等保合规风险；`/rest/tempchart/getRadar` 任意参数仅返回 `[]` 且非公开接口；产品图直链全 404。按 ADR-3 排除，真实 24h 雷达回放改由后端历史服务承担（`#TODO-确认`）。
- **GIBS 可用且是唯一可行下钻源**：`Himawari_AHI_Band13_Clean_Infrared`（Level6 / png / CORS `*` / 10min 一档 / z=6 实测 200）可在 z=6 补上 JMA 的层级缺口。
- **物理上限（已写入 design.md）**：10 分钟级静止卫星原生 2 km（B13）/ 1 km（B03），对应 z≤6 / z≤7；z≥8 只有 MODIS 这类极轨日档。任何 10 分钟级源都无法下钻到厂区级（z≥10），本变更选择诚实封顶而非用日档制造假象。
- 遗留项：仓库既有的 `src/screen/lib/weather/gibsSatelliteApi.ts` 引用不存在的 GIBS 图层且零引用，已纳入 `tasks.md` §1 删除。
