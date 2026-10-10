# 移动端 Vue3 SPA → uni-app 迁移方案（原生能力驱动）

> 状态：**P1 页面迁移已完成（35/35 路由页），P3 地图/视频真实接入已完成（含微信定位权限声明），多端构建（mp-weixin + app 资源包）已验证**　|　驱动：更强原生能力（离线推送 / 离线落盘 / 原生定位 / 性能）
> 工程位置：`frontend-scaffold/mobile-uniapp/`（独立 uni-app 工程，已从 Vite 多入口剥离）
> 源工程（待全量移植）：`frontend-scaffold/apps/mobile/`（Vue3 H5 SPA，仍保留为 legacy 真源直到全量完成）
> 现状事实基线：`frontend-scaffold/apps/mobile/`、`frontend-scaffold/vite.config.ts`、`apps/mobile/AGENTS.md`、`apps/mobile/router.ts`、`apps/mobile/main.ts`、`apps/mobile/bridges/`、`src/services/*`、`src/stores/*`

---

## 0. 结论速览

- **技术上可行**：uni-app 本身即 Vue，移动端 43 个 `.vue` + 18 个 `.ts` 的绝大多数是列表/详情/表单页，业务逻辑、Pinia、composables 可复用。
- **这本质是「换平台/重架构」而非开关切换**：路由、DOM/BOM API、Element Plus、共享 `src/services` 的浏览器耦合、Cesium 地图、Vite 多入口剥离，都必须重做。
- **针对「原生能力」驱动的真实账**：uni-app App 模式（5+ runtime）相对现状的最大增量是**离线推送**（H5/WebView 后台被杀后收不到，只有原生 App 能）与**原生 SQLite 离线落盘**；但你们已有 `bridges/` 抽象 + Android 原生壳，原生定位/离线逻辑本就可达。**划算与否取决于：是否要 iOS / 是否想卸载原生壳维护成本 / 是否要小程序**。
- **工作量粗估（H5 + App 对等）**：1 人 **4–6 周**；若追加微信/支付宝小程序等多端，再 +1–2 周。
- **推荐先跑 Phase 0 PoC**（约 1 周）再决定是否全量投入。

---

## 1. 现状盘点（事实）

| 项        | 现状                                                                                                                                                                                                                            | 迁移含义                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 技术栈    | Vue3 + Vite + Pinia + Vue Router（H5 SPA）                                                                                                                                                                                      | uni-app Vue3+Vite 模式可承接                                                         |
| 规模      | `views/` ~38 文件（35 路由页 + 3 spec）、`components/` 若干、`composables/`、`bridges/`、`data/`、`lib/`、`styles/`                                                                                                             | 中等体量，机械工作量为主                                                             |
| 路由      | `router.ts` ~35 条，`meta.tab` 控制底部标签栏（home/messages/profile），`router.afterEach` 设 `document.title`                                                                                                                  | 全部改写为 `pages.json` + `uni.navigateTo/switchTab`                                 |
| UI 库     | `AGENTS.md` 禁 Element Plus，但实探 **8 个文件**仍用 `ElMessage`/`el-`（MessageItem、alarm-detail、duty、event-detail、messageHistory、messages、patrol-exec、video-player）；`main.ts` 引 `element-plus/.../message/style/css` | DOM 型 PC 库 uni-app 不支持，必须清退                                                |
| 共享内核  | 重度复用 `src/services/*`（`http.ts` 走 `fetch`、`realtime.ts`/`ws.ts` 走 `WebSocket`、`token.ts`/`auth.ts` 依赖浏览器环境）、`src/stores/{auth,alarm}.ts`                                                                      | **最大阻塞点**：非 H5 平台无 `fetch`/`WebSocket`/`document`/`localStorage`，需适配层 |
| 原生能力  | `bridges/`（types 接口 + h5 降级实现 + index 出口）；原生壳经 `tokenSource.getToken()` 注入令牌                                                                                                                                 | 接口可保留，实现换为 uni 实现（原生桥 / `plus` API）                                 |
| 地图/视频 | `map.vue`（`MapPanel.vue`，Cesium 浏览器重库）、`video-player.vue`（hls/jwplayer）                                                                                                                                              | 无 uni 等价物，需换 uni 地图/`video` 或 web-view 兜底                                |
| 构建      | 根 `vite.config.ts` 多入口 `mobileApp`（第 307 行）、dev `entries`（第 258 行）含 `apps/mobile/index.html`；`vitest include` 显含 `apps/mobile/**/*.spec.ts`                                                                    | uni-app 是独立编译器，**不能**塞进现有 Vite 多入口 → 移动端须拆为独立工程            |
| wujie     | 移动端 **无** wujie 依赖（仅大屏子应用用）                                                                                                                                                                                      | 无 wujie 迁移负担                                                                    |

---

## 2. 目标形态

- **工程**：`apps/mobile/` 从 Vite 多入口剥离为**独立 uni-app 工程**（建议 `frontend-scaffold/mobile-uniapp/`，或独立仓）。编译模式 = `vue3` + `vite`。
- **产物**：H5（保留嵌 Android 原生壳能力）+ App（5+ runtime，承载离线推送/原生定位/原生存储）。
- **保留**：Pinia、SFC、TS、Composition API、`bridges/` 接口契约、`src/services` 的 API 语义（经适配层）。
- **替换**：`pages.json` 路由、`uni.*` 原生 API、`uni.request`/`uni.connectSocket`、uni-ui/uView 组件、`<map>`/`<video>`。

---

## 3. 必须重做的硬骨头（按风险排序）

1. **共享 `src/services` 的浏览器耦合（最高风险）**
   - `http.ts` 的 `fetch` → 抽 `HttpClient` 接口，提供 `uni.request` 实现（App/小程序无 fetch）。
   - `realtime.ts`/`ws.ts` 的 `WebSocket` → 用 `uni.connectSocket`（App/小程序原生；H5 仍可用 WebSocket，可做条件分支）。
   - `token.ts`/`auth.ts` 的 `localStorage`/`document` → 改 `uni.setStorageSync`/`uni.getStorageSync`；令牌注入走 bridges 的 uni 实现。
   - apis 业务层若直接 `import.meta.env`/浏览器 API 需收敛到适配层。
2. **路由重写**：`router.ts` ~35 条 → `pages.json` 的 `pages[]` + `tabBar`（home/messages/profile）+ `subPackages`（可选）。所有 `useRouter()`/`this.$router`、`router.push` 改为 `uni.navigateTo`/`redirectTo`/`switchTab`/`reLaunch`。
3. **DOM/BOM API 清理**：`document.title` → `pages.json` 的 `navigationBarTitleText` 或 `uni.setNavigationBarTitle`；`localStorage` → `uni` 存储；`window`/`navigator` 直调清零（现有 `router.afterEach` 即设 `document.title`）。
4. **Element Plus 清退**：8 个文件 → `uni.showToast`/`uni.showModal` 或 uView 组件；删除 `main.ts` 的 EP 样式引包。
5. **Cesium 地图**：`map.vue`/`MapPanel.vue` → uni `<map>` 组件或高德/腾讯 uni 插件；若需保留 Cesium 复杂可视化，用 `<web-view>` 内嵌现有 H5 地图页作为逃生舱（牺牲部分原生性能）。
6. **视频播放**：`video-player.vue`（hls/jwplayer）→ uni `<video>`（App 原生支持 HLS）或原生播放插件。
7. **从 Vite 多入口剥离**：新建独立 uni-app 工程；与 `src/services` 共享通过 npm workspace / git submodule / 复制；共享层必须平台无关。原「一个 Vite 工程三端」架构被打破，需在 AGENTS/CI 中明确 mobile 独立构建与门禁。

---

## 4. 分阶段实施路线

| 阶段                     | 内容                                                                                                                                                    | 工期   | 产出 / 门禁                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| **P0 PoC**               | 空 uni-app 工程 + 移植 2–3 个代表性页（home 列表 + 一个详情 + messages）+ 验证 4 个适配层：uni.request、uni.connectSocket、uni 存储、bridges uni 实现   | ~1 周  | H5+App 双端跑通；证明后端联调、实时、令牌衔接可行 → **决策闸门** |
| **P1 脚手架 + 共享适配** | 建工程；`pages.json` 纳管全部 35 路由 + tabBar；搬 Pinia stores；落地 HttpClient/WS/Storage/Token 适配层；替换 `bridges` 实现                           | ~1 周  | 工程可构建；共享服务平台无关                                     |
| **P2 页面迁移**          | 全量移植 `views/`+`components/`；清 DOM API；清 Element Plus；逐页对照 `docs/UI规范-移动端.md`（48–56px 热区、安全区、户外/适老皮肤）                   | 1–2 周 | 全部页面功能对等；lint/type-check 绿                             |
| **P3 特殊页**            | Cesium 地图替换 / web-view 兜底；video 播放替换                                                                                                         | 3–5 天 | 地图/视频可用                                                    |
| **P4 原生能力接入**      | uni-push（DCloud 账号 + 厂商通道配置）；原生 SQLite 离线加固；原生定位；App 离线打包 + native plugin 桥接令牌注入                                       | 3–5 天 | 锁屏离线推送、离线填报、后台定位验证通过                         |
| **P5 CI/CD + 测试**      | mobile 独立 CI（type-check→lint→build→App 云打包）；移植平台无关的 vitest spec（duty/patrol-exec/profile 三份 composables 测试大多可搬，触 DOM 的需调） | 2–3 天 | 门禁绿；双端产物可发布                                           |

**合计**：H5+App ≈ 4–6 周（1 人）；+小程序多端 +1–2 周。

---

## 5. 对现有 Vite 三端工程的改造

- `vite.config.ts` 第 306–307 行（`mgmtApp`/`mobileApp` 入口）、第 258 行 `entries`、第 359 行 `vitest include` 的 `apps/mobile/**` 项 **移除**（mobile 不再参与根构建）。
- 根 `AGENTS.md` §0「前端三端架构」中「移动端 = `apps/mobile/`」改为「移动端 = `mobile-uniapp/`（独立 uni-app 工程，见本方案）」，并同步两端 `AGENTS.md` 的 §0 复述。
- `src/services/*` 继续作为 API 真源，但须改造为**平台无关**（抽适配层）；主壳/后台（仍走 Vite）继续用 fetch 实现，uni-app 用 uni 实现——同一份业务 service，两套底层适配。
- 契约同步纪律不变：后端改接口仍走四同步 + `gen:api-types`；uni-app 端的 TS 类型由同一契约生成（或手动对齐）。

---

## 6. 原生壳 → uni 的 bridges 替换路线（核心）

现有 `bridges/` 已是干净接缝，迁移成本最低的部分在此：

```
bridges/types.ts   → 接口契约【保留不变】
bridges/h5.ts      → 【删除】H5 降级实现
bridges/uni.ts     → 【新增】uni 实现：
                       getLocation  → uni.getLocation / 后台定位插件
                       storage      → uni.setStorageSync/getStorageSync
                       push         → uni-push 监听 onPushMessage
                       getToken     → 读 plus 存储 / native plugin 回传（替代原"原生壳注入令牌"）
bridges/index.ts   → 【改】出口改为引用 uni 实现（条件编译 #ifdef 可保留 H5 分支）
```

- **令牌衔接变化**：原「Android 原生壳经 `tokenSource.getToken()` 注入」改为 uni App 的原生通信机制（离线打包 + native plugin，或 `plus` API 在 App 启动时写入存储）。`bridges/tokenSource` 接口不变，仅实现层换掉，业务页零改动。
- **离线推送**：接 uni-push，需 DCloud 账号 + 各厂商（华为/小米/OPPO/vivo/APNs）配置；后端推送服务可保留，仅换 App 通道。这是 H5 现状给不了、迁移后最大的能力增量。

---

## 7. 风险与缓解

| 风险                                                | 等级 | 缓解                                                                 |
| --------------------------------------------------- | ---- | -------------------------------------------------------------------- |
| 共享 `src/services` 浏览器耦合（fetch/WS/document） | 高   | P0 PoC 先验证 uni.request/connectSocket 适配；抽平台无关接口         |
| Cesium 地图无 uni 等价物                            | 中高 | web-view 内嵌现有 H5 地图页兜底；或换 uni 地图 SDK（损失部分可视化） |
| 视频 hls/jwplayer 不兼容                            | 中   | uni `<video>`（App 原生 HLS）；web-view 兜底                         |
| 失去「单 Vite 工程三端」内聚                        | 中   | 明确 mobile 独立构建/CI；API 真源仍共享，靠契约门禁保一致            |
| 原生壳令牌注入机制重构                              | 中   | 保留 `bridges/tokenSource` 接口，仅换实现；P4 专做                   |
| 团队 uni-app + 5+ 离线打包学习曲线                  | 中   | P0 PoC 同步练手；native plugin 预留排期                              |
| 现有 3 份 mobile vitest spec 触 DOM                 | 低   | 移植为平台无关 composables 测试；触 DOM 的用 uni mock                |

---

## 8. 决策检查点 & 替代方案

**决策闸门（P0 结束后决定是否全量）**：

1. uni.request / connectSocket 适配层能否稳定联调后端（含鉴权/实时）？
2. Cesium 地图、hls 视频的替换方案业务方可接受？
3. uni-push 能否满足贵方厂商/离线推送要求？

**更便宜的替代（若只要 Android、愿继续养原生壳）**：

- 不迁 uni-app，在**现有 Android 壳 + `bridges`** 上增强：离线推送用厂商 SDK、离线存储用原生 SQLite、定位用原生 SDK。
- 优点：成本更低、风险更小、保住 Vite 三端架构。
- 缺点：无 iOS / 无小程序、仍需自维护原生壳。

**推荐**：先执行 **P0 PoC（~1 周）**，用实测结果（而非推测）决定走「uni-app 全量」还是「增强现有原生壳」。本方案文档即为 PoC 与后续落地的执行基线。

---

## 9. 迁移进度（持续更新）

> 源 `apps/mobile/` 共 **37 个视图 / 35 路由**（2 个为 spec 测试文件，不移植），下表逐页追踪移植状态——**已全部完成**。

| 路由（源）          | uni 页面                                | 状态         | 备注                                                               |
| ------------------- | --------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `/home`             | `pages/home/home`                       | ✅ 已有(PoC) | 首页概览                                                           |
| `/messages`         | `pages/messages/messages`               | ✅ 已有(PoC) | 消息中心（已接 `/notifications`）                                  |
| `/messages/history` | `pages/messageHistory/messageHistory`   | ✅           | 通知历史                                                           |
| `/profile`          | `pages/profile/profile`                 | ✅           | 我的                                                               |
| `/login`            | `pages/login/login`                     | ✅           | 真实 `/auth/login`                                                 |
| `/alarms`           | `pages/alarms/alarms`                   | ✅           | 告警明细列表                                                       |
| `/alarms/:id`       | `pages/alarm-detail/alarm-detail`       | ✅           | 告警详情（liveAlarms 缓存）                                        |
| `/tasks`            | `pages/tasks/tasks`                     | ✅           | 任务中心                                                           |
| `/tasks/:id`        | `pages/task-detail/task-detail`         | ✅           | 任务详情（`/tasks/{id}`）                                          |
| `/events`           | `pages/events/events`                   | ✅           | 应急事件（events 分组）                                            |
| `/events/:id`       | `pages/event-detail/event-detail`       | ✅           | 事件详情（liveEvents 缓存）                                        |
| `/contacts`         | `pages/contacts/contacts`               | ✅           | 通讯录（按分类+搜索，`uni.makePhoneCall`）                         |
| `/duty`             | `pages/duty/duty`                       | ✅           | 今日值班（名单+签到写接口）                                        |
| `/plans`            | `pages/plans/plans`                     | ✅           | 应急预案目录                                                       |
| `/plans/:id`        | `pages/plan-detail/plan-detail`         | ✅           | 预案详情（catalog+catalog-detail）                                 |
| `/drills`           | `pages/drills/drills`                   | ✅           | 演练信息（状态筛选）                                               |
| `/drills/:id`       | `pages/drill-detail/drill-detail`       | ✅           | 演练详情                                                           |
| `/resources`        | `pages/resources/resources`             | ✅           | 应急资源（4 类并行 `rescue-resources/*`）                          |
| `/event-resources`  | `pages/event-resources/event-resources` | ✅           | 周边资源（前端静态占位）                                           |
| `/library`          | `pages/library/library`                 | ✅           | 辅助资料库（`/emergency/knowledge`）                               |
| `/msds`             | `pages/msds/msds`                       | ✅           | MSDS 列表                                                          |
| `/msds/:cas`        | `pages/msds-detail/msds-detail`         | ✅           | MSDS 详情                                                          |
| `/settings`         | `pages/settings/settings`               | ✅           | 系统设置（退出登录清令牌）                                         |
| `/anomalies`        | `pages/anomalies/anomalies`             | ✅           | 异常管理（前端静态 mock）                                          |
| `/orders`           | `pages/orders/orders`                   | ✅           | 报修工单（`/fire-facility/work-orders`）                           |
| `/orders/:id`       | `pages/order-detail/order-detail`       | ✅           | 工单详情                                                           |
| `/tickets`          | `pages/tickets/tickets`                 | ✅           | 操作票列表（`/special-operations`）                                |
| `/ticket-exec`      | `pages/ticket-exec/ticket-exec`         | ✅           | 操作票执行                                                         |
| `/patrols`          | `pages/patrols/patrols`                 | ✅           | 防火巡查（`/fire/patrols`）                                        |
| `/patrol-exec`      | `pages/patrol-exec/patrol-exec`         | ✅           | 巡查执行（写接口）                                                 |
| `/ops`              | `pages/ops-board/ops-board`             | ✅           | 运维监测看板（设备+工单聚合）                                      |
| `/map`              | `pages/map/map`                         | ✅           | 态势地图（uni `<map>` 真实瓦片 + 真实 GPS 定位）                   |
| `/path`             | `pages/path-nav/path-nav`               | ✅           | 路径规划（真实 GPS + 目的地选择 + 轨迹 + `openLocation` 原生导航） |
| `/videos`           | `pages/videos/videos`                   | ✅           | 视频监控宫格（真实快照缩略图 `/video/cameras/{id}/snapshot`）      |
| `/videos/:id`       | `pages/video-player/video-player`       | ✅           | 视频播放（真实快照帧 + 截图存相册 + `streamUrl` 预留流播放）       |

**进度**：35/35 路由页已移植；`npm run type-check`（vue-tsc `--noEmit`）全绿（35 页 0 错）；`npm run build:h5` 通过（产出 `dist/build/h5/`）。
**构建状态（✅ 已跑通）**：`@dcloudio` 全部 8 包统一钉在同一 `3.0.0-alpha-5020620260914001` 线 + `npm install --legacy-peer-deps` 即可正常构建（之前误把运行时平台留 `2.0.2` 而工具链用 alpha，导致 `vite-plugin-uni` 装成残缺 stub 报缺 `lib/ssr/entry-server.js`；统一 alpha 线后该包装全 405 文件，构建通过）。**多端构建已实跑验证（2026-10-10）**：`build:mp-weixin` 产出 `app.js/json/wxss` + `project.config.json` + 35 个 `pages`，零平台特定错误；`build:app` 命令行成功产出 App 资源包（`app-service.js`/`app-config.js`/`manifest.json`/`pages`），真正出 `.apk` 需 HBuilderX 本地打包或 DCloud 云打包（P4 前置）。
**已完成适配层**：`platform/{http,api,ws,realtime,storage,token,nav,bootstrap,logger,accessibility}`、`bridges/{types,uni,index}`、`composables/{useMessageCenter,useDomainAutoRefresh,useAccessibilityModes}`、`data/{liveCache,geo}`、`lib/mapAlarm`、组件 `MobileHeader/Icon/IconTile/MapPanel/MessageItem/MessageFilterTabs`。

**P3 地图/视频真实接入（✅ 2026-10-09 完成，已 type-check + build:h5 双门禁通过）**：

- `/map`：保留 uni `<map>` 原生组件（真实瓦片），新增「定位我的位置」按钮 —— `uni.getLocation`（gcj02）真实 GPS，叠加「我的位置」标记并 `show-location` 显示系统蓝点，可重定位。
- `/path-nav`：从纯占位改为**真实导航** —— 加载时 `uni.getLocation` 取真实位置；从 `/map/alarms` 取报警点作为目的地候选（地图标记 + 下方列表双选）；绘制 当前位置→目的地 `polyline` 箭头轨迹；「开始导航」调 `uni.openLocation` 拉起系统地图 App 实时路线规划；「缓存路径」存 `storage`。
- `/videos`：缩略图由静态图标改为**真实摄像头快照**（GET `/video/cameras/{id}/snapshot` 字节 → base64 dataURL，全平台可用），逐卡并行拉取、失败降级图标。
- `/video-player`：直播画面由空 `<video>` 改为**真实快照帧**（`<image>` 承载）；新增 `streamUrl` 可选字段 —— 后端下发扬地址时优先 `<video>` 播放（App 原生 HLS 支持）；「截图」写临时文件后 `saveImageToPhotosAlbum` 存相册（H5 降级提示长按保存）；「全屏」`previewImage` 预览；「云台」提示待后端接入。
- `MapPanel`：新增 `polyline` / `showMyLocation` 属性，轨迹线 + 系统蓝点；无标记但有线时也渲染地图。
- `platform/api.ts`：新增 `fetchCameraSnapshot(id)`（二进制端点，带鉴权 + 401 触发未授权处理，ArrayBuffer→base64 全平台降级）；`VideoCamera` 加可选 `streamUrl`。
- `platform/http.ts`：新增 `emitUnauthorized()` 供非 JSON 端点复用 401 处理。
- `manifest.json`：补齐定位权限 —— App 端已启用 `Geolocation` 模块 + Android `ACCESS_FINE_LOCATION`；微信小程序端新增 `permission.scope.userLocation`（定位用途描述）+ `requiredPrivateInfos: ["getLocation"]`，否则 `getLocation` 在真机被微信拒绝。

**⚠️ P3 已知限制（非缺陷，待后端媒体网关）**：后端 `VideoCameraItem` 当前**不下发流地址**，仅提供 dev seeder 占位截图（代码注释明确「后续接真流时替换」）。因此 H5/App 暂以「真实快照帧」呈现，`<video>` 播放需待后端补齐 `streamUrl` 字段（届时前端已就绪，无需改代码）。真实 HLS/RTSP 流为后续阶段，不阻塞 P3 验收。

**下一步（跨工程收尾）**：

> ✅ **多端构建已验证（2026-10-10）**：实跑 `build:mp-weixin`（零平台特定错误）与 `build:app`（命令行成功产出 App 资源包；真正 `.apk` 需 HBuilderX 本地打包或 DCloud 云打包，为 P4 前置）。迁移到小程序/App 平台无隐藏兼容问题。

1. 从根 `vite.config.ts` 多入口剥离 mobile（plan §5：移除第 306–307/258/359 行 mobile 相关项），移动端独立构建/CI。**⚠️ 与 2026-10-09 已确认的「apps/mobile 仍活跃、其 vitest 须留 CI」冲突，剥离前需先裁定三端架构口径。**
2. P4 原生能力：uni-push 离线推送、原生 SQLite 离线落盘、原生定位、App 离线打包 + native plugin 令牌注入（需 DCloud 账号与厂商通道配置）。
3. P5 移动端独立 CI（type-check→lint→build→App 云打包）；移植 `apps/mobile` 下 3 份 vitest spec（composables 触 DOM 部分需 uni mock）。
4. 业务联调：以真实后端跑通各页端点，补齐 `anomalies`/`event-resources` 等暂为静态/mock 的数据源；后端补 `streamUrl` 后验证视频真播放。
