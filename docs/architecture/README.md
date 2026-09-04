# 架构总览（docs/architecture）

> 本文描述系统「现在是什么」。代码为准，本文随代码演进；改动架构须同步本文（docs/ 为长期共识，见 AGENTS §4 三类目录职责）。与本文观点冲突时以代码为最新事实，并回填本文。

## 1. 定位与技术栈

安全管控指挥系统**前端基座**（纯前端，无 Node 后端；后端为独立网关/服务，契约见 `docs/api/`）。

| 维度       | 选型                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 框架       | Vue 3 + TypeScript                                                                             |
| 构建       | Vite（多入口：主入口 + `apps/mgmt` + `apps/mobile`）                                           |
| 状态       | Pinia（`src/stores/`，跨端公共服务；端内可自建 store）                                         |
| 微前端     | wujie（`wujie-vue3`，大屏壳内嵌 18 个业务子应用，见 [micro-frontend.md](./micro-frontend.md)） |
| GIS 一张图 | Cesium（`src/components/map/SharedCesiumMap.vue` + 多图层 overlay）                            |
| UI 组件库  | Element Plus（暗色主题为 `src/styles/element-dark.css`）                                       |
| 令牌/签名  | 内存态令牌 + HttpOnly Cookie + HMAC-SHA256 防重放（见 [auth-token.md](./auth-token.md)）       |

## 2. 三端形态与入口

| 端           | 入口目录                                               | 主题挂载                | 定位                                                         | 运行环境                                                      |
| ------------ | ------------------------------------------------------ | ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| 大屏可视化端 | 主 entry（`index.html` / `src/main.ts`）               | `:root`（**不挂属性**） | 指挥大屏、Cesium 一张图、wujie 子应用装载槽                  | Web 大屏                                                      |
| 后台管理端   | `apps/mgmt`（`index.html` 挂 `data-theme="mgmt"`）     | `data-theme="mgmt"`     | 配置管理：用户权限、设备编码解析、向导、工作台               | Web 后台                                                      |
| 移动端       | `apps/mobile`（`index.html` 挂 `data-theme="mobile"`） | `data-theme="mobile"`   | 现场作业：巡检、工单、事件、资源、值班、演练、MSDS、地图导航 | Android 原生 hybrid（H5 业务页 + JSBridge，见 §3 移动端桥接） |

视觉语言**禁止跨端迁移**：玻璃/发光/渐变仅限大屏；浅色白卡/浅底标签仅限后台与移动（见 AGENTS §6.3）。三端各自 UI 规范见 `docs/UI规范-{大屏端,后台管理端,移动端}.md`。

## 3. 模块边界与目录职责

| 目录                               | 职责（不重叠）                                                                                                                                                                                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`                             | 跨端公共服务：`services/`（与 `adapter` 分离）、`composables/`、`directives/`、`stores/`、`styles/tokens.css`（token 单一真源）、`router/`、`shell/`（wujie 主壳）、`config/`、`constants/`、`utils/`、`components/`、`views/`（大屏页面）、`components/map/`（Cesium 图层） |
| `apps/mgmt` `apps/mobile`          | 独立应用入口（独立 `index.html` / 路由 / 布局壳），多入口构建；与大屏壳层互不依赖，仅共享 `src/styles/tokens.css` 与公共服务                                                                                                                                                 |
| `src/screen/`                      | fire-monitoring 迁入**存量**；token 已覆盖项必须用 `var(--token)`，未覆盖项可沿用 `src/screen/styles/variables.css` 源体系，新增页面不得新增未入 token 的硬编码                                                                                                              |
| `subapps/`                         | wujie 微前端子应用（18 个，IIFE 构建），详见 [micro-frontend.md](./micro-frontend.md) 与 `subapps/AGENTS.md`                                                                                                                                                                 |
| `docs/` `openspec/` `engineering/` | 三类目录职责不重叠：docs=系统现在是什么（长期共识）；openspec=系统将要怎么变（唯一业务规格源）；engineering=本次做得怎么样（短期过程记录）                                                                                                                                   |

### 移动端桥接层（`apps/mobile/bridges/`）

移动端页面**只允许经桥接实例访问原生能力**，禁止直调 `navigator.geolocation` / Web Storage 写死实现（AGENTS §6.5）：

- `LocationBridge`：无感定位（北斗/GPS 混合）
- `OfflineBridge`：断网落盘 + 重连静默补发（原生 SQLite+AES-256，H5 垫底 Web Storage）
- `TokenSource`：原生壳注入登录态

接口定义在 `bridges/types.ts`；`bridges/index.ts` 按运行环境选适配器（H5 降级实现 `bridges/h5.ts`）。hybrid 决策落地后仅替换 `index.ts` 适配器，业务页零改动。

## 4. 构建与多入口

- `vite.config.ts` 多入口：主入口 + `apps/mgmt` + `apps/mobile`；dev 访问 `/apps/mgmt/` 等独立应用。
- 子应用**必须** `npm run build:subapps`（IIFE 产物），禁止 vite 多 HTML 入口（见 micro-frontend.md 的构建铁律）。
- 验证矩阵（AGENTS §2）：改 `vite.config.ts`/依赖/多入口跑 `npm run build`；改 `subapps/**` 跑 `npm run build:subapps`。

## 5. 数据流（请求 / 响应 / 实时）

**出站（`src/services/http.ts` 拦截器统一处理）**

- 注入 `Authorization: Bearer <token>`（令牌走内存态，见 auth-token.md）
- 生产环境强制 HMAC-SHA256 防重放签名（timestamp / nonce / signature）
- 注入 `Accept-Language`（后端按语言头翻译报文，非前端 vue-i18n）
- 命中硬控路径由 `guardHardControl` 拦截——**前端只监不控**（零下行控制红线）

**入站（`unwrapBody<T>` 解包 B3 包络）**

- `code=0` → 返回 `data`；非 0 → 抛业务错误
- service 调用方只消费 `data`，不直接处理包络（契约见 `docs/api/_shared.json`）

**实时（WebSocket）**

- `/ws/alarm` **仅订阅 `alarm.push`**（上行订阅，不下行控制）
- 推送经 `ingestAlarm` 入 `alarm` store；`ack` 仅沿 `ACK_FLOW` 逐格前进（软件协同处置，不触发设备硬控）

## 6. 与 AGENTS.md 的映射

- 分级工作流 L0–L4（§1）、最小验证矩阵（§2）、API 契约（§3）、工程记录闭环（§4）、UI 红线（§6）、工程约定（§6.6）、品牌规范（§6.7）
- 分层 AGENTS（动手前按目标端读取对应文档）：root `AGENTS.md` → `apps/mgmt`/`apps/mobile` 端 AGENTS → `docs/UI规范-*.md` → `src/screen` 存量 → `subapps/AGENTS.md`

## 相关文档

- [micro-frontend.md](./micro-frontend.md) — wujie 微前端架构与契约
- [auth-token.md](./auth-token.md) — 鉴权、令牌、权限模型、零下行控制、防重放、实时订阅
- [../requirement/README.md](../requirement/README.md) — 核心业务域、角色与权限、三端适用场景
- [../api/README.md](../api/README.md) — 机器可读 API 契约（OpenAPI）
