# 设计文档：修复气象瓦片源装配（卫星云图 / 降雨雷达）

> 适用：L3 / L4。记录架构决策、取舍、风险与依赖。L1 / L2 不建此文件。
> 与本变更 `proposal.md` / `tasks.md` / `spec-delta.md` 四者闭环，人工确认后才动手（AGENTS.md §1.1 / 用户规则 §5）。

## 目标与约束

**目标（可被 tasks.md 验收标准逐条印证）**

1. 降雨雷达模式在整个时间轴上都有雷达图层，不再整层消失；不再出现 300km 瓦片被 8× 拉伸的糊块。
2. 卫星云图模式可下钻到 z=6 且 z=6 瓦片 200 可用；切帧不再有明暗跳变。
3. 「正在预载下一帧」不再常驻；播放到末帧停止，不回绕到 24h 前。
4. 拖透明度滑块不重建底图。
5. 源的物理分辨率上限在 UI 上诚实暴露，不制造「能无限放大」的假象。

**硬约束**

- AGENTS.md §6.3：禁止硬编码颜色 / 字号 / 间距，一律 `var(--token)`；z-index 只用五层 token。新增提示条样式必须走 token。
- AGENTS.md §3：气象瓦片为公开只读静态资源，不得经 `src/services/http.ts` 定义写接口；本变更不新增任何写接口。
- 大屏端 UI 规范：玻璃 / 发光 / 渐变仅限大屏，提示条沿用现有 `.scm-float` / `.scm-status` 视觉语言，不引入后台白卡。
- 兼容下限 Chromium 86（config.yaml 信创约束）：不得使用 `AbortSignal.timeout` 等 Chromium 117+ 才支持的 API 于运行时代码（仅探测脚本可用）。

## 架构与方案

### 分层落点

| 层             | 文件                                                                       | 职责                                                                      |
| -------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 服务（源适配） | `src/services/weather/weatherTileSources.ts`（新增）                       | 源注册表 + `resolveTileSource(zoom)` 层级→源解析 + 封顶判定               |
| 服务（源适配） | `src/services/weather/gibsHimawariApi.ts`（新增）                          | GIBS 葵花 IR 时次拉取 + 瓦片 URL 构造                                     |
| 服务（源适配） | `src/services/weather/jmaHimawariApi.ts`、`rainViewerApi.ts`（既有，不改） | JMA / RainViewer 时次与 URL                                               |
| 组合式         | `src/composables/useSatelliteCloudMap.ts`（修改）                          | 单轨时间轴（24h/6h/当前）、雷达帧回退、雷达覆盖判定、**时次自动刷新轮询** |
| 组件           | `src/components/panels/typhoon/SatelliteCloudMapDialog.vue`（修改）        | Leaflet 图层装配与渲染、播放控制、提示                                    |

`services` 与 `adapter` 分离：services 只做「取时次 + 拼 URL」，组件只做「装配图层 + 渲染」，层级策略集中在 `weatherTileSources.ts`，组件不写 `if (zoom > 5)` 这类散落分支。

### 数据源实测结论（2026-09-04 探测，产出归档于 `engineering/qa/`）

| 源    | 图层                                         | 原生分辨率 | 最大层级              | 时次                      | 格式 | CORS                               |
| ----- | -------------------------------------------- | ---------- | --------------------- | ------------------------- | ---- | ---------------------------------- |
| JMA   | `B13/TBB`                                    | 2 km       | **z=5**（z6 → 404）   | 213 帧 / 36h · 10min      | jpg  | 无（`<img>` 标签不受限，实测可用） |
| GIBS  | `Himawari_AHI_Band13_Clean_Infrared`         | 2 km       | **z=6**（2.45 km/px） | 190 帧 / 24h · 10min      | png  | `*`                                |
| GIBS  | `Himawari_AHI_Band3_Red_Visible_1km`         | 1 km       | z=7                   | 190 帧 / 24h · 10min      | png  | `*`                                |
| GIBS  | `MODIS_Terra_CorrectedReflectance_TrueColor` | 250 m      | z=9                   | 145/24h，实为**每日一档** | jpg  | `*`                                |
| FY-4B | —                                            | —          | —                     | —                         | —    | **无公开瓦片服务**                 |

- FY-4B 走不通：`nmc.cn` 卫星页全 JS 动态无静态直链、`rsapp.nsmc.org.cn/geofy` 不暴露 WMS/WMTS、4 条直链候选全 404、无 CORS。
- 仓库既有 `src/screen/lib/weather/gibsSatelliteApi.ts` 的 `Himawari_AHI_Band13_Clean_Infrared_v0_NRT` 在 GIBS 上不存在（tile 请求返回 `InvalidParameterValue / LAYER does not exist`）；其 `DescribeDomains` 走 `wmts.cgi` 的 `all` 端点不校验图层故「看起来通」，是误导来源。该文件零引用，本变更删除。

### 关键流程

1. **层级→源解析**：`resolveTileSource(zoom)` 返回 `{ source, maxNativeZoom, capped }`。z≤5 → JMA；z=6 → GIBS IR；z≥7 → GIBS IR 且 `capped=true`（`maxNativeZoom=6`，由 Leaflet 上采样），UI 显示封顶提示。
2. **单轨时间轴 + 雷达优雅降级**：时间轴恒由 JMA 时次构建（24h / 6h / 当前，约 10 分钟一档），**三个模式共用同一条轨，24 小时回放能力不因雷达覆盖不足而削减**。雷达作为叠加层按 ±900s 匹配 RainViewer 帧；未命中时**沿用上一个可用雷达帧**并保留图层（不 `remove()`），来源行把雷达实际时次与卫星时次分开标注，超出雷达覆盖范围时追加「雷达仅覆盖最近约 2 小时」说明。
3. **切帧渲染**：保留同一个 `L.TileLayer` 实例，用 `setUrl()` 就地换 URL；图层 `options.fadeAnimation = false`，从根上消除淡入跳变。源切换（JMA↔GIBS）才重建图层，且新层就位后再移除旧层。
4. **加载态**：`weatherFrameLoading` 在任何提前 return 路径上都必须复位；`waitForTileLayer` 超时视为「保留上一帧」，不再把新层丢弃导致画面长期停在旧帧。
5. **播放预取**：播放启动 / 推进时以 `new Image()` 预取后续 `WEATHER_PREFETCH_FRAMES`（默认 6）帧瓦片。瓦片 URL 中 `basetime/validtime` 固定，故二次播放直接命中 HTTP 缓存、切帧无网络等待。仅使用 `new Image()`，不依赖 `AbortSignal.timeout` / fetch 优先级提示等 Chromium 117+ API（信创下限 Chromium 86）。
6. **自动刷新**：以 60s 周期 `fetch(targetTimes_fd.json)`，走浏览器默认缓存语义——源返回 `ETag` + `Last-Modified` + `Cache-Control: max-age=60`，未更新时命中 304、响应体 0 字节（已实测）。出现新 `validtime` 则追加进 `jmaFrames`；**仅当 `frameIndex` 处于末帧时才自动前进**，否则只更新列表不切换。页面隐藏（`visibilitychange`）暂停、可见立即补拉；失败按 60→120→240→600s 指数退避，成功后复位，且不得清空既有帧列表。

## 决策记录（ADR）

- **决策 1：下钻取「JMA 主 + GIBS 补 z=6 + z≥7 封顶」（方案 3），而非 GIBS 单源替换或四级金字塔** — 理由：JMA 与 GIBS IR 同为 Himawari AHI 10 分钟语义，时次对齐逻辑最简；只新增 1 个源，符合 YAGNI；保留 JMA 的 36h 历史 — 反对项：z≥7 仍是 2km 分辨率。已确认：该上限是物理限制（AHI B13 原生 2km），任何 10 分钟级源都无法突破，用 MODIS 日档补 z=8–9 会让时间轴失去意义，故选择诚实封顶而非制造假象。
- **决策 2：时间轴保持单一 JMA 轨 24h 不变，雷达叠加层优雅降级，不削减回放** — 理由：用户明确「回放功能不能删」；雷达覆盖仅 2h 是源的限制，不应传导为时间轴能力削减；单轨比双轨更简单，组件无需维护两条轴的状态机 — 反对项：24h 前的雷达显示的是「最近可用帧」而非真实历史，UI 上明确标注，不隐瞒。
- **决策 3：真实 24h 雷达回放走后端历史服务，前端不直连第三方爬取** — 理由：第三方公开雷达源的实时历史普遍不足 24h（RainViewer 实测 2.04h）；`nmc.cn` 虽为国产权威源，但全站声明「未经授权禁止下载使用」，爬取存在侵权合规风险，且其 `/rest/tempchart/getRadar` 任意参数仅返回 `[]`、并非公开接口 — 反对项：需后端立项（定时抓取雷达拼图留存 24h + B3 接口下发），属跨端协议 §8 L4 需人工确认；本变更仅做前端降级与适配位预留，后端到位后替换 `services` 实现即可，页面零改动。
- **决策 4：不引入商用气象 API（和风 / 彩云 / 墨迹）** — 理由：需 API key、预算与合规采购，且其雷达历史普遍仅 2–6h，不足以解决 24h 诉求 — 反对项：商用源 SLA 更好，若后端自建排期过长可单独立项评估。
- **决策 5：FY-4B 不作为本次候选** — 理由：实测无公开瓦片服务且无 CORS，无法在浏览器直连 — 反对项：国产源缺失，若后续拿到合规服务通道再单独立项。
- **决策 6：只改路由实际引用的 `panels/typhoon/` 一份，两份同名副本不扩散** — 理由：`src/components/typhoon/` 与 `src/screen/components/panels/typhoon/` 均非当前路由引用，扩散改动会放大回归面且无法验证 — 反对项：副本与实现会继续漂移，已记录为技术债。
- **决策 7：自动刷新用纯前端轮询（60s + 条件请求），不引入后端或 WebSocket 推送** — 理由：源自带 `ETag` / `Last-Modified` / `Cache-Control: max-age=60`，实测条件请求返回 304 且响应体 0 字节，轮询成本趋近于零；全圆盘时次本身 10 分钟一档且上游存在约 14 分钟处理延迟（实测末帧距今 842s），更快的推送不带来任何业务价值 — 反对项：轮询在理论上不如推送及时、也不如推送省连接。已确认：该延迟来自源的上游处理链路，前后端均无法消除，故不为它引入后端依赖；预取缓冲已在体验上掩盖加载等待。

## 风险与缓解

| 风险                                         | 可能影响                           | 缓解措施                                                                                                                      |
| -------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GIBS 可用性 / 国内访问时延                   | z=6 瓦片加载慢或超时               | `waitForTileLayer` 超时降级回 JMA z=5 上采样，并在来源行标注「GIBS 不可用，已降级」                                           |
| GIBS 时次与 JMA 时次不对齐                   | 切到 z=6 时画面时次跳变            | 两侧同为 10 分钟一档，用 `pickNearestGibsTime` 取最近时次；来源行显示实际使用时次                                             |
| PNG 体积大于 JPG（实测 z5 60KB vs JMA 12KB） | z=6 下钻时流量与首屏变慢           | 仅 z=6 使用 GIBS；保留 `WEATHER_LAYER_LOAD_TIMEOUT` 超时降级                                                                  |
| 修改 `useSatelliteCloudMap` 影响其他消费方   | 大屏其他页面回归                   | 该 composable 仅被卫星云图弹窗消费（已核），改动保持返回字段向后兼容                                                          |
| 删除 `src/screen/**` 存量文件                | 存量子应用回归                     | 该文件零引用（已 grep 核），走 `screen` scope 单独提交便于回滚                                                                |
| 雷达回退帧被误认为真实历史                   | 值班人员按「24h 前的雷达」做研判   | 超出雷达覆盖范围时来源行强制追加「雷达仅覆盖最近约 2 小时」标注，并与卫星时次分列显示                                         |
| 合规风险：误用未授权数据源                   | 侵权 / 等保审计问题                | 明确排除 `nmc.cn` 爬取（全站声明未经授权禁止下载）；仅使用 JMA / GIBS / RainViewer 三个允许直连的源                           |
| 轮询在弹窗长期打开下累积请求                 | 无谓流量 / 触发源侧限流            | 60s 周期 + 命中 304 零字节；页面隐藏暂停；失败指数退避上限 600s；弹窗关闭即停轮询                                             |
| 预取窗口过大造成流量激增                     | 值班终端带宽压力                   | 预取帧数固定为 6（z5 约 1.7 MB）；源仅 10 分钟一档，更大窗口无收益                                                            |
| 自动刷新打断用户查看历史帧                   | 值班人员正在研判某历史时次却被跳走 | 仅当 `frameIndex` 处于末帧时才自动前进，否则只更新帧列表不切换                                                                |
| 自动刷新与既有 `realtime-channel` 概念混淆   | 误当作平台实时通道能力复用         | 本轮询面向公开气象静态资源，不经 `src/services/http.ts`，与平台 realtime 通道零耦合，命名用 `weatherAutoRefresh` 前缀避免混淆 |

## 依赖

- 上游依赖：`docs/UI规范-大屏端.md`（提示条样式）、`openspec/config.yaml`（信创 Chromium 86 下限）。
- 下游影响：`src/views/typhoon-emergency/index.vue` → `src/components/panels/typhoon/TyphoonLeftPanel.vue` → `SatelliteCloudMapDialog.vue`（唯一的消费链路）。
- 待确认项：`#TODO-确认` — 后端 24h 雷达历史服务是否立项（定时抓取雷达拼图留存 24h + B3 接口下发）。本变更交付前端降级方案与适配位预留，后端排期与接口契约需与后端团队确认后单独立 Change，不在本次范围内。
- 已确认项：GIBS 作为 z=6 下钻源（方案 3）、`weather-tiles` 作为新增 capability 名、删除 `src/screen/lib/weather/gibsSatelliteApi.ts`、动态轮播与自动刷新纳入本次范围且采用纯前端方案（零后端依赖），均已经人工确认。
