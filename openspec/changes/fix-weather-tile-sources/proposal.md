# 变更提案：修复气象瓦片源装配（卫星云图 / 降雨雷达）

> 适用：L3 / L4 改动（业务能力 / 高风险）。L0–L2 不建此文件。
> 约束：本文件须含 Why / What Changes / Capabilities / Impact 四节，控制在 500 字内，聚焦单一变更（openspec/config.yaml）。

## Why

卫星云图弹窗三个模式中「降雨雷达」「卫星云图」两个不可用，仅「台风路径」正常。根因是**源覆盖与代码装配不匹配，不是源故障**（实证数据见 `design.md`）：

- 时间轴由 JMA 建（24h ≈ 144 tick），而 RainViewer `radar.past` 仅 13 帧 / 2.04h，`maxDeltaSeconds=900` → 92% 的 tick 无 `rainViewerPath` → 雷达层整层 `remove()` 消失；vector 模式 `maxZoom=10` 而雷达 `maxNativeZoom=7` → 约 300km 分辨率瓦片被 8× 拉伸，整轮实测仅取到 2 张瓦片。
- JMA 瓦片 z≥6 返回 404 → 卫星模式被锁死在 z=5；切帧整层替换叠加 `leaflet-fade-anim` 淡入 → 每帧明暗跳变；`syncWeatherLayers` 的 `swapVersion` 提前 return 未复位 `weatherFrameLoading` → 「正在预载下一帧」常驻；播放 `stepFrame(+1)` 在末帧 `% len` 回绕到 24h 前。
- `src/screen/lib/weather/gibsSatelliteApi.ts` 引用的 `Himawari_AHI_Band13_Clean_Infrared_v0_NRT` 在 GIBS 上不存在（`LAYER does not exist`）。

不做则气象能力实际只剩台风路径可用，与应急值守定位不符。

## What Changes

- 新增 `src/services/weather/weatherTileSources.ts`：气象瓦片源注册表 + `zoom → 源` 解析（JMA z≤5 / GIBS IR z=6 / z≥7 封顶提示）。
- 新增 `src/services/weather/gibsHimawariApi.ts`（GIBS `Himawari_AHI_Band13_Clean_Infrared`，Level6 / PNG / CORS `*`）；删除零引用的失效文件 `src/screen/lib/weather/gibsSatelliteApi.ts`。
- 修改 `src/composables/useSatelliteCloudMap.ts`：时间轴**保持单一 JMA 轨（24h / 6h / 当前）不做削减**，24 小时回放能力完整保留；新增雷达帧回退策略——未命中 ±900s 匹配窗时沿用上一个可用雷达帧，并在来源行标注雷达实际时次。
- 修改 `src/components/panels/typhoon/SatelliteCloudMapDialog.vue`：切帧就地改 URL 不重建图层、关 `leaflet-fade-anim`、复位 `weatherFrameLoading`、播放到末帧停止不再回绕、透明度变更不再重建底图、雷达未命中帧保留上一帧、z≥7 显示源分辨率封顶提示、播放时预取后续帧瓦片。
- 修改 `src/composables/useSatelliteCloudMap.ts`（另）：新增**纯前端自动刷新**——按 60s 轮询 JMA 时次表（源返回 `ETag` + `Cache-Control: max-age=60`，未更新时命中 304、响应体 0 字节，实测已验证），新时次追加进帧列表；仅当用户停留在末帧时自动切换，页面隐藏即暂停、可见立即补拉。全程无需后端配合。

## Capabilities

### Added Capabilities

- `weather-tiles`：气象瓦片源与时次装配能力——多源层级解析、单轨时间轴与 24 小时回放保全、雷达覆盖优雅降级、切帧无闪烁渲染、播放预取缓冲、气象帧自动刷新（纯前端轮询，零后端依赖）。

### Modified Capabilities

- 无（既有 `map-layers` 为 Cesium 场景图层体系，与本变更无关）。

## Impact

- 受影响：大屏端 `:root`；`src/services/weather/`、`src/composables/useSatelliteCloudMap.ts`、`src/components/panels/typhoon/SatelliteCloudMapDialog.vue`。
- 不触碰：`src/components/typhoon/` 与 `src/screen/components/panels/typhoon/` 两份同名副本（非路由实际引用，本次不扩散）；`src/styles/tokens.css`；`apps/mgmt` 与 `apps/mobile`。
- 契约：不新增 HTTP 写接口；气象瓦片为公开只读静态资源，不经过 `src/services/http.ts` 拦截器，零下行控制红线与 B3 包络不受影响。
- 依赖：新增外部数据源 GIBS（`gibs.earthdata.nasa.gov`），命中 §8 L4 硬门禁，须人工确认。
- 回归面：`npm test`（新增 `weatherTileSources` 单测）；`npm run type-check`；`npx eslint <受影响路径>`。

## 人工确认关卡（L3 须过 / L4 实施前须过）

- [ ] 提案范围与用户 / 设计方确认一致，无需求扩散、无自造平行任务。
- [ ] 目标端 UI 规范（`docs/UI规范-大屏端.md`）已对齐，token 引用合规，端间视觉语言未混用。
- [ ] API 契约（AGENTS.md §3）未违反：零下行控制 / B3 包络 / 20 位 MDM / 防重放签名 / 令牌内存态。
- [ ] 高风险项（L4：新增外部数据源 GIBS）已明确并取得人工确认。
