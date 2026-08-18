# 前端脚手架 性能基线实测报告（B4）

> 对齐《安全管控指挥系统 前端性能SLO预算表 骨架V0.1》；本报告为**脚手架样本**的实测基线，作为技术选型定案（B4）的输入，待信创真机（G1）到位后回填替换。

## 1. 实测环境与口径

| 项 | 值 |
|---|---|
| 实测日期 | 2026-08-18 |
| 被测工程 | frontend-scaffold（Vue3.5 + Vite5.4 + Element Plus + ECharts 按需） |
| 构建模式 | `npm run build`（production，gzip 预压缩） |
| 产物分析 | `node scripts/analyze-dist.mjs`（可复现） |
| HTTP 加载 | `vite preview` 本地传输计时（curl，未带 Accept-Encoding，取原始体积） |
| 真机环境 | 未到位（石化窗 Chromium 86 / 海光 C86 / 麒麟 V10 待 G1 实测） |

## 2. 优化前后对比（2026-08-18 按需引入落地）

| 指标 | 优化前 | 优化后 | 降幅 |
|---|---|---|---|
| 产物原始合计 | 2059.88 KB | **879.58 KB** | -57% |
| 产物 gzip 合计 | 609.33 KB | **300.89 KB** | -51% |
| 首屏入口 JS | 53.48 KB（入口，EP 在主 chunk 外） | 117.48 KB（gzip 45.74） | 见 2.1 |
| 首屏 CSS | 351.02 KB | **9.60 KB**（gzip 2.60） | -97% |
| 首屏关键资源合计 | 404.50 KB（gzip 67.77） | **127.08 KB**（gzip 48.34） | -29%（gzip 口径） |
| 超限 chunk（>500KB） | element-plus 1135.6 KB | **无** | — |
| 最大独立 chunk | element-plus 1135.6 KB | echarts 482.07 KB（懒加载路由 chunk） | — |

> 说明：优化前入口 JS 仅 53.48KB 是因为 element-plus/echarts 被 manualChunks 拆成独立大 chunk；优化后移除 EP 强制分块，EP 组件按需打散进主包与懒加载 chunk，首屏 CSS 由 351KB 骤降至 9.6KB。

### 2.1 首屏入口（进入平台场景，优化后）

| 资源 | 原始 | gzip |
|---|---|---|
| 入口 JS `index-56sncITb.js` | 117.48 KB | 45.74 KB |
| 入口 CSS `index-CFXh9dUz.css` | 9.60 KB | 2.60 KB |
| **首屏关键资源合计** | **127.08 KB** | **48.34 KB** |

### 2.2 体积 Top（优化后）

| 文件 | 原始(KB) | gzip(KB) | 说明 |
|---|---|---|---|
| echarts JS | 482.07 | 162.24 | 按需，仅 dashboard 懒加载时进入 |
| index JS（首屏入口） | 117.48 | 45.74 | 含 vue/pinia/router/http/ws |
| AppLayout JS | 88.57 | 30.29 | 懒加载布局 |
| 其余（路由懒加载 chunk） | ≤53 | ≤21 | deviceCode/users/NotFound 等 |

## 3. 三层耗时实测/估算（进入平台 ≤5000ms）

| 层 | SLO 配额 | 实测/估算 | 结论 |
|---|---|---|---|
| 网络层 | ≤2500ms（SSO/OAuth2 双因素 + 首屏资源） | 首屏 gzip **48.34 KB**：本地传输约 0.2s（curl 计时含握手）；按内网 10Mbps 估算约 40~60ms | ✅ 体积无忧，余量充足 |
| 数据层 | ≤1500ms（权限/菜单/初始化） | Mock 接口延迟 30~40ms/请求；权限/菜单为本地 Pinia 初始化 | ✅ 达标 |
| 渲染层 | ≤1000ms（首屏骨架 + 布局） | **未实测（需浏览器/真机）**；首屏主 chunk 117KB（gzip 45.74KB），解析负担较优化前大幅下降 | ⚠️ 待真机复测 |

## 4. 剩余优化空间与建议

1. **ECharts 482KB 为最大 chunk**：已按需注册（Line/Grid/Tooltip/Legend），且仅 dashboard 路由懒加载时进入（首屏不包含）。若后续引入地图/图表组合加重，可评估 `echarts` 拆包为 `echarts-core` + 体积监控阈值。
2. **渲染层风险**：石化窗 Chromium 86（单核弱 GPU 环境）解析/执行负担仍须真机复测；若超预算，启用 SLO §3 渲染层降级（骨架屏 + 路由级代码分割，均已具备基础）。
3. **SSO 双因素握手**：网络层余量评估以静态资源为主，认证握手耗时未纳入，G1 实测时补充。
4. **CSS 首屏 9.6KB**：已达成极优；后续新增 EP 组件时依赖 unplugin 自动按需，避免回退全量。

## 4.1 地图底座引入后体积（2026-08-18 OpenLayers 接入）

> 综合态势页重构为「应急一张图」地图底座（OpenLayers + OSM 开发占位底图），实测体积变化。

| 指标 | EP 按需后 | 地图底座后 | 增量 |
|---|---|---|---|
| 产物原始合计 | 879.58 KB | **1200.95 KB** | +321.37 KB（ol） |
| 产物 gzip 合计 | 300.89 KB | **395.06 KB** | +94.17 KB |
| 首屏入口 JS | 117.48 KB（gzip 45.74） | **321.96 KB**（gzip 95.57） | 入口含 ol 公共代码 |
| 首屏关键资源合计 | 127.08 KB（gzip 48.34） | **332.18 KB**（gzip 98.30） | 网络层仍 SLO 内 |
| 超限 chunk（>500KB） | 无 | **无**（ol 分块 168.85KB，echarts 471KB） | — |

- 最大独立 chunk：echarts 471.38KB（仅 dashboard 懒加载进入）→ ol 168.85KB 分块。
- 首屏 gzip 98.30KB：内网 10Mbps 估算 ~80~120ms，**网络层 SLO（≤2500ms）余量仍充足**。
- 渲染层新增负担：ol 初始化 + 点位图层在 dashboard 场景；`?perf=1` 已含 `map:ready` 埋点，G1 真机复测时回填。
- 底图开发占位为 OSM 公网瓦片；生产替换天地图（S3）时瓦片体积与缓存策略另行评估。

## 4.2 3D 场景引入后体积（2026-08-18 Three.js 接入）

> dashboard 增加 2D/3D 切换，3D 用 Three.js 厂区场景（`FactoryScene.vue`，懒加载）。

| 指标 | 地图底座后 | +3D（懒加载） | 变化 |
|---|---|---|---|
| 产物原始合计 | 1200.95 KB | **1686.03 KB** | +485 KB（three） |
| 产物 gzip 合计 | 395.06 KB | **518.30 KB** | +123 KB |
| 首屏关键资源 gzip | 98.30 KB | **98.87 KB** | ≈0（three 不进首屏） |
| 超限 chunk（>500KB） | 无 | **无**（FactoryScene 481KB / echarts 471KB，均懒加载） | — |
| 独立 chunk | ol 168.85KB | FactoryScene **481.07KB**（gzip 121.7）+ echarts 471.38KB | three 为最大懒加载 chunk |

- **three 懒加载验证**：首屏 gzip 仅 +0.57KB，`defineAsyncComponent` 成功隔离 three 体积——只在用户点击「3D」时加载 481KB chunk。
- 网络层：首屏 98.87KB 内网估算 ~80~120ms，**SLO 余量仍充足**。
- 渲染层：3D 场景渲染成本（WebGL）待 G1 真机实测；`?perf=1` 埋点覆盖 `map:ready`，3D 切换时刻可用 Performance 面板采样。

## 5. 结论

- **网络层/数据层**：当前脚手架首屏资源 48.34KB（gzip），进入平台预算内余量充足，不构成瓶颈。
- **渲染层**：按需引入落地后，最大解析负担由 element-plus 全量包（1133KB）转为 echarts（482KB，仅 dashboard 时加载），首屏 CSS 下降 97%，风险显著收敛；最终结论待 G1 真机复测。
- 本报告作为 B4「性能达标结论」输入：记录「脚手架单体 SPA 首屏体积基线 + EP 按需优化已落地 + 真机复测项」。

## 6. 渲染层真机复测 SOP（G1）

### 6.1 内置埋点（脚手架已实现，`src/utils/perf.ts`）

- 启用：开发态默认开启；任意环境 URL 携带 `?perf=1` 显式开启，`?perf=0` 强制关闭。
- 打点点位：
  | 标记 | 位置 | 含义 |
  |---|---|---|
  | `app:start` | `main.ts` 模块顶层 | 入口 JS 开始执行（渲染层起点） |
  | `app:ready` | `main.ts` mount 之后 | 首屏挂载完成（渲染层终点） |
  | `render`（measure） | 同上 | `app:start → app:ready` 耗时 |
  | `layout:ready` | `AppLayout.vue` onMounted | 大屏布局可用 |
  | `dashboard:chart-ready` | dashboard 图表首次渲染 | dashboard 场景图表可用 |
  | `dashboard:data-ready` | dashboard 数据加载完成 | dashboard 场景数据闭环 |
- 输出格式：`[perf] render=123.4ms (app:start → app:ready)`，同时打印各标记相对时刻，可与 DevTools Performance 面板 FCP 交叉验证。

### 6.2 真机操作步骤（进入平台场景）

1. **部署**：`npm run build` 产物部署内网静态服务（或 `vite preview`），真机浏览器访问 `http://<host>/?perf=1`。
2. **冷启动**：无痕窗口 + DevTools Network 勾选 Disable cache（SLO 按首次进入计，不测缓存态）。
3. **测量**：从控制台读取 `[perf] render=` 与 `[perf] app:ready @`（FCP 用 Performance 面板 `Largest Contentful Paint` / `First Contentful Paint` 标记核对）；同法连测 **3~5 次取中位数**，记录机器负载状态。
4. **对照 SLO**：渲染层 `render ≤ 1000ms` 即达标；同时记录数据层（接口耗时）与网络层，三层合计 < 5000ms。
5. **越界处理**：>1000ms 先按 SLO §3 渲染层降级（骨架屏 / 路由级代码分割，脚手架已具备）收敛，仍不达标回 M0 选型评审。
6. **dashboard 场景**：同法读 `dashboard:chart-ready` 与 `dashboard:data-ready`，衡量 ECharts 懒加载包在真机上的解析执行负担。
