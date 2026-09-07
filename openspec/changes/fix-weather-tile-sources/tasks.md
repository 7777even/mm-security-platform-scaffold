# 任务清单：修复气象瓦片源装配（卫星云图 / 降雨雷达）

> 适用：L3 / L4。任务须可勾选、单条 ≤2h；标注 [TDD] 的先写失败测试再实现（openspec/config.yaml）。
> 任务状态只回填此处，禁止在 engineering/ 另立第二套任务清单（AGENTS.md §4）。

## 1. 服务层 · 气象瓦片源（新增 capability `weather-tiles`）

- [x] [TDD] 新建 `src/services/weather/gibsHimawariApi.ts`：导出 `GIBS_HIMAWARI_IR_LAYER = 'Himawari_AHI_Band13_Clean_Infrared'`、`GIBS_TILE_MATRIX_SET = 'GoogleMapsCompatible_Level6'`、`GIBS_MAX_ZOOM = 6`、`buildGibsTileUrl(time, z, x, y)`、`fetchGibsHimawariTimes(date)`、`pickNearestGibsTime(targetUnix, times)`；先写失败单测校验 URL 形如 `.../best/<layer>/default/<time>/GoogleMapsCompatible_Level6/<z>/<y>/<x>.png` 与时次解析，再实现。
- [x] [TDD] 新建 `src/services/weather/weatherTileSources.ts`：定义 `WeatherTileSourceId = 'jma' | 'gibs-ir'` 与 `resolveTileSource(zoom): { id, maxNativeZoom, capped, label }`；先写失败单测覆盖 z=0/5→jma、z=6→gibs-ir 且 capped=false、z=7/9→gibs-ir 且 capped=true，再实现。
- [x] 删除零引用的失效文件 `src/screen/lib/weather/gibsSatelliteApi.ts`（其 `Himawari_AHI_Band13_Clean_Infrared_v0_NRT` 图层在 GIBS 不存在），提交 scope 用 `screen`。

## 2. 组合式 · 单轨时间轴与雷达回退

- [x] [TDD] 修改 `src/composables/useSatelliteCloudMap.ts`：**保持 `timelineTicks` 为 JMA 单轨不变**（24h / 6h / 当前），不得新增第二条轨、不得削减档位或缩短时间窗；先写失败单测锁定「三个模式共用同一条 24h 轨，档位过滤后的 tick 数不随模式变化」，再实现。
- [x] [TDD] 同文件内新增 `resolveRadarFrameForTick(tick, radarFrames)`：按 ±900s 匹配，未命中时返回**上一次命中的帧**而非 `undefined`；先写失败单测覆盖「连续 3 个未命中 tick 仍返回上一帧」「首帧即未命中时返回 undefined 交由 UI 标注」，再实现。
- [x] [TDD] 同文件内新增 `radarCoverageLabel(tick, radarFrames)`：判定该 tick 的雷达时次是否落在覆盖窗内，供来源行标注「雷达仅覆盖最近约 2 小时」；先写失败单测覆盖窗内 / 窗外两种取值，再实现。
- [x] [TDD] 同文件内新增 `startAutoRefresh()` / `stopAutoRefresh()`：以 60s 周期 `fetch` JMA 时次表（浏览器默认缓存语义，源 `max-age=60` + `ETag`，未更新命中 304），新 `validtime` 追加进 `jmaFrames`；先写失败单测覆盖「出现新时次则追加」「无新时次不改动列表」「不在末帧时不自动前进」，再实现。
- [x] [TDD] 同文件内为轮询补 `visibilitychange` 暂停 / 可见立即补拉，以及失败指数退避（60→120→240→600s，成功后复位）；先写失败单测覆盖隐藏即停、连续失败的退避序列与成功后复位，再实现。
- [x] 轮询失败时仅记录错误态，不得清空或降级既有帧列表。
- [x] 保持对外返回字段向后兼容（`timelineTicks` 语义与字段不变），避免影响既有消费方。

## 3. 组件 · 渲染与播放

- [x] 修改 `src/components/panels/typhoon/SatelliteCloudMapDialog.vue`：卫星/雷达图层改为**复用同一 `L.TileLayer` 实例 + `setUrl()` 就地换 URL**，仅源切换（jma ↔ gibs-ir）时重建，且新层就位后再移除旧层。
- [x] 同文件内为两个气象图层设置 `fadeAnimation: false`，消除 Leaflet 淡入造成的每帧明暗跳变。
- [x] 同文件内修复 `syncWeatherLayers`：`swapVersion` 提前 return 的所有分支都必须复位 `weatherFrameLoading`；`waitForTileLayer` 超时视为「保留上一帧」，不再把已加载的新层丢弃。
- [x] 同文件内修复播放：`stepFrame(+1)` 到达末帧时停止播放（`playing = false`），不再 `% len` 回绕到 24h 前。
- [x] 同文件内移除 `watch([mapMode, radarOpacity])` 中对 `syncBaseLayer()` 的调用（改为判断底图类型是否真变化才重建），消除拖透明度滑块时的底图闪烁。
- [x] 同文件内接入 `resolveTileSource`：`maxZoom` 由 5 抬到 6，`maxNativeZoom` 取解析结果；z≥7 时在 `.scm-float` 提示区显示「已达 10 分钟级卫星源最高分辨率（≈2 km/px）」，样式沿用现有 `.scm-float` 语言并走 `var(--token)`。
- [x] 雷达未命中帧时保留上一帧图层（配合 §2 的 `resolveRadarFrameForTick`），来源行把卫星时次与雷达时次分开标注；超出雷达覆盖窗时按 `radarCoverageLabel` 追加「雷达仅覆盖最近约 2 小时」。
- [x] 同文件内新增播放预取：以 `new Image()` 预取后续 `WEATHER_PREFETCH_FRAMES`（默认 6，常量置于顶层）帧瓦片；弹窗关闭或停止播放后不再发起新预取。
- [x] 同文件内在弹窗打开时启动 `startAutoRefresh()`、关闭时 `stopAutoRefresh()`，并在来源行体现最新时次已更新。

## 4. 守门测试与验证

- [x] [TDD] 新增 `src/services/weather/weatherTileSources.spec.ts` 与 `gibsHimawariApi.spec.ts`，`npx vitest run src/services/weather` 必绿。
- [x] [TDD] 新增 `src/composables/useSatelliteCloudMap.spec.ts` 覆盖单轨时间轴（24h 不削减、三模式一致）、雷达帧回退、覆盖标注与自动刷新（追加 / 不前进 / 隐藏暂停 / 退避复位），`npx vitest run src/composables` 必绿。
- [x] 按 AGENTS.md §2 矩阵执行：`npm run type-check` + `npx eslint src/services/weather src/composables/useSatelliteCloudMap.ts src/components/panels/typhoon/SatelliteCloudMapDialog.vue`（不连跑 lint+type-check+build+build:subapps 四套）。
- [x] Playwright 实测三个模式（卫星云图 / 降雨雷达 / 台风路径）与 z=5→6→7 下钻，截图与网络统计归档至 `engineering/qa/`。
- [x] Playwright 验证自动刷新：拦截并改写时次接口注入新 `validtime`，断言帧列表追加、停在末帧时自动前进、停在历史帧时不切换；页面隐藏后不再产生轮询请求。

## 验收标准（Definition of Done）

- [x] 降雨雷达模式在 24h 时间轴全程有雷达图层（未命中时沿用最近可用帧并标注）；不再出现整轮仅 2 张瓦片、300km 瓦片 8× 拉伸的糊块；24h / 6h / 当前 三档与 24 小时回放能力不削减。
- [x] 卫星云图模式 z=6 瓦片返回 200（GIBS IR），z≥7 显示封顶提示且不再请求不存在的层级。
- [x] 连续播放 10 帧，屏幕不出现明暗跳变；「正在预载下一帧」不常驻。
- [x] 弹窗不重开即可获得新时次（mock 验证）；源未更新时轮询命中 304 零字节；页面隐藏时无轮询请求。
- [x] 连续播放 10 帧无网络等待（预取命中缓存），预取窗口控制在 6 帧以内。
- [x] 播放到末帧停止，不回绕到 24h 前；拖透明度滑块不重建底图。
- [x] `tasks.md` 全部勾选，验收标准逐条满足。
- [x] 受影响目标 `npm test` / type-check / eslint 0 error（按 §2 矩阵对应行，不连跑四套）。
- [x] 代码若改变契约 / 行为，同步 `docs/` 与 `docs/UI规范-大屏端.md`（短期记录不写进 docs/）。
- [x] 提交按 scope 拆分：`type(scope): 描述`，单行成句、禁止 `- ` 分点列表；临时输出文件不入库。
- [x] L4 完成后即刻写 `engineering/qa/` + `engineering/retro/`，不攒到最后补。
