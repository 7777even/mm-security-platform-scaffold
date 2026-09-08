# Spec Delta：修复气象瓦片源装配（卫星云图 / 降雨雷达）

> 适用：L3 / L4。描述本变更对 `openspec/specs/` 的增量：新增 / 修改 / 移除。
> 段落到 Requirement / Scenario 使用 Gherkin 风格（WHEN / THEN），与既有 `spec.md` 同构。

## ADDED Requirements

### Requirement: 气象瓦片源层级解析

系统须把「地图层级 → 气象瓦片源」的映射收敛到单一真源 `src/services/weather/weatherTileSources.ts`，组件内不得散落 `if (zoom > 5)` 之类的层级分支。源注册表须标注每个源的最大可用层级与是否已达封顶。

#### Scenario: 层级落在源可用范围内

- **WHEN** 以 `zoom = 0..5` 调用 `resolveTileSource`
- **THEN** 返回 JMA 源（`B13/TBB`），`maxNativeZoom = 5`，`capped = false`

#### Scenario: 层级超出 JMA 但落在 GIBS 可用范围

- **WHEN** 以 `zoom = 6` 调用 `resolveTileSource`
- **THEN** 返回 GIBS IR 源（`Himawari_AHI_Band13_Clean_Infrared`），`maxNativeZoom = 6`，`capped = false`

#### Scenario: 层级超出全部 10 分钟级源的物理上限

- **WHEN** 以 `zoom >= 7` 调用 `resolveTileSource`
- **THEN** 返回 GIBS IR 源且 `capped = true`，组件据此显示「已达 10 分钟级卫星源最高分辨率（≈2 km/px）」并停止请求更高层级

### Requirement: 单轨时间轴与回放能力保全

系统须维持单一 JMA 时次时间轴供全部气象模式共用；雷达源覆盖不足（RainViewer `radar.past` 实测仅约 2 小时）**不得**导致时间轴档位削减、时间窗缩短或回放功能移除。

#### Scenario: 三个模式共用同一条时间轴

- **WHEN** 在 `satellite` / `vector` / `typhoonPath` 任一模式下查看时间轴
- **THEN** 时间轴恒由 JMA 时次构建，档位保持 `24h / 6h / current`，约 10 分钟一档；切换模式不改变档位与时间窗

#### Scenario: 24 小时回放

- **WHEN** 在任意气象模式下播放时间轴
- **THEN** 可回放最近 24 小时的卫星帧序列，播放到末帧停止而非回绕；不因雷达无历史数据而禁用播放或截断时间窗

#### Scenario: 台风路径模式不使用时次轨

- **WHEN** 当前模式为 `typhoonPath`
- **THEN** 不加载气象瓦片时次，仅渲染路径矢量图层（既有行为保持不变）

### Requirement: 雷达图层连续呈现

系统须保证雷达图层在时间轴上连续存在；某一时次匹配不到雷达帧时，须沿用上一帧，不得将雷达图层整体移除。

#### Scenario: 连续多个时次无雷达帧匹配

- **WHEN** 连续推进 3 个匹配不到雷达帧的 tick（超出 ±900s 匹配窗）
- **THEN** 雷达图层保持显示上一次命中帧的内容，且来源行标注的是雷达帧的实际时次而非卫星时次

#### Scenario: 雷达帧恢复匹配

- **WHEN** 推进到重新命中雷达帧的 tick
- **THEN** 雷达图层切换到该命中帧，不出现整层消失再出现的闪烁

#### Scenario: 回退帧不得被误认为真实历史

- **WHEN** 当前 tick 的雷达内容由回退帧提供（非该时次真实数据）
- **THEN** 来源行把卫星时次与雷达实际时次分列标注，并追加「雷达仅覆盖最近约 2 小时」，不得让值班人员误判为该时次的真实雷达回波

### Requirement: 切帧无闪烁渲染与加载态复位

系统须在切换气象帧时不产生可见的明暗跳变，并在任何提前返回路径上复位加载态。

#### Scenario: 切换气象帧

- **WHEN** 时间轴推进到下一帧
- **THEN** 复用同一 `L.TileLayer` 实例就地 `setUrl()` 换源；仅当 `resolveTileSource` 返回的源 id 变化时才重建图层，且新层就位后再移除旧层

#### Scenario: 帧图层被并发切换打断

- **WHEN** `syncWeatherLayers` 因 `swapVersion` 失配而提前 return
- **THEN** `weatherFrameLoading` 被复位为 `false`，界面不残留「正在预载下一帧」

#### Scenario: 瓦片加载超时

- **WHEN** `waitForTileLayer` 在 `WEATHER_LAYER_LOAD_TIMEOUT` 内未完成
- **THEN** 保留上一帧图层继续显示，不丢弃已加载的新层导致画面长期停在旧帧

### Requirement: 播放预取缓冲

系统须在播放前把后续若干帧的瓦片预热到浏览器 HTTP 缓存，使切帧命中缓存从而实现瞬时切换；预取窗口须有明确上限以控制流量。

#### Scenario: 播放时预取后续帧

- **WHEN** 播放启动或时间轴推进
- **THEN** 以 `new Image()` 预取后续 `WEATHER_PREFETCH_FRAMES`（默认 6）帧的瓦片；默认窗口内总量约 1.7 MB（z5 实测 0.28 MB/帧）

#### Scenario: 预取命中缓存

- **WHEN** 播放推进到已被预取的帧
- **THEN** 瓦片从浏览器 HTTP 缓存命中，切帧无网络等待、无明暗跳变

#### Scenario: 预取在信创环境下的兼容

- **WHEN** 运行于 Chromium 86 兼容下限环境
- **THEN** 仅使用 `new Image()` 预取，不依赖 `AbortSignal.timeout` / `fetch` 优先级提示等 Chromium 117+ 才支持的 API

### Requirement: 气象帧自动刷新

系统须在不重新打开弹窗的前提下，周期性检查气象源是否产生新时次，并在用户停留在「最新」位置时自动呈现新帧；轮询须使用条件请求以避免重复传输。

#### Scenario: 轮询发现新时次

- **WHEN** 轮询 `targetTimes_fd.json` 得到新的 `validtime`
- **THEN** 新时次追加进帧列表与时间轴，弹窗无需重开即可看到最新帧

#### Scenario: 用户停留在最新位置

- **WHEN** 当前帧为时间轴末帧且轮询得到新时次
- **THEN** 自动切换到该新帧并更新时间轴刻度

#### Scenario: 用户正在查看历史帧

- **WHEN** 当前帧不是时间轴末帧（用户正在拖动或定点查看历史）
- **THEN** 仅更新帧列表，**不打断当前查看位置**

#### Scenario: 页面不可见

- **WHEN** 页面进入隐藏状态（`visibilitychange`）
- **THEN** 暂停轮询；页面重新可见时立即执行一次拉取

#### Scenario: 轮询成本控制

- **WHEN** 轮询周期内源未更新
- **THEN** 借助源返回的 `ETag` / `Last-Modified` 命中 304 条件请求，响应体为 0 字节（实测已验证）

#### Scenario: 轮询失败

- **WHEN** 轮询请求失败
- **THEN** 按指数退避重试（上限 600s），成功后复位；**不得**清空或降级已有帧列表

### Requirement: 播放与底图装配稳定性

系统须保证播放行为符合直觉，且非底图类型的状态变更不得重建底图。

#### Scenario: 播放到达末帧

- **WHEN** 播放推进到时间轴最后一帧
- **THEN** 播放停止（`playing = false`），不回绕到 24 小时前的第一帧

#### Scenario: 调整云图透明度

- **WHEN** 拖动「云图透明度」滑块
- **THEN** 仅调整气象图层 opacity，底图图层不被 remove / re-add，底图不出现整屏闪烁

## MODIFIED Requirements

无。既有 `map-layers` capability 面向 Cesium 场景图层体系（装置区、疏散路线、TV 巡检圈），与本变更的气象瓦片源无关，不在本次修改范围内。

## REMOVED Requirements

无。本次删除的 `src/screen/lib/weather/gibsSatelliteApi.ts` 为零引用失效文件（其引用的 GIBS 图层 `Himawari_AHI_Band13_Clean_Infrared_v0_NRT` 不存在），不构成既有 spec 中的 Requirement，故无需走 REMOVED 段。

## 关联 Spec

- 目标 spec 文件：`openspec/specs/weather-tiles/spec.md`（本变更新建该 capability，实施时按 spec-delta 落盘）。
- 与 `proposal.md` 的 Capabilities（`weather-tiles`）、`tasks.md` 的验收标准三者一一对应、闭环。
