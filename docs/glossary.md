# 术语表（AI 协作统一参照）

> 跨工具、跨端一致引用的术语与枚举真源。状态/等级/设备着色的**枚举文字与语义固定，三端统一**；唯渲染形式不同（大屏用语义色、后台/移动用 `.tag-*` 浅底标签）。新增状态/术语必须先提案入对应规范，禁止自造文案或色阶。与 `docs/UI规范-*.md` §状态映射表、`docs/api/_shared.json` 互为镜像。
>
> **后端镜像**：后端实现口径（UserContext / JwtFilter / 双轨迁移 / 错误码分段等）以 [`backend-scaffold/docs/glossary.md`](../../backend-scaffold/docs/glossary.md) 为补充，本文为枚举/色阶 canonical 真源，冲突以本文为准。

## A. 业务域（对齐 `src/services/*` 与 `views/*`）

| 域（英文标识） | 中文               | 关键能力                                              | 服务 / store                                             |
| -------------- | ------------------ | ----------------------------------------------------- | -------------------------------------------------------- |
| Alarm          | 监测预警           | 报警列表、确认/派发/闭环（沿 `ACK_FLOW`）、实时推送   | `services/alarm.ts` + `stores/alarm.ts`                  |
| Emergency      | 应急指挥           | 力量/资源、结案、值班、通讯录、知识库、演练、台风应急 | `services/emergency.ts`                                  |
| Map / GIS      | 地图一张图         | 报警/设备 GeoJSON、Cesium 图层叠加                    | `services/map.ts` `services/geo.ts` + `components/map/*` |
| Dashboard      | 总览大屏           | 总览指标、趋势、热力图、应急预案库                    | `services/dashboard.ts`                                  |
| Uplink         | 审计与防爆手机     | 路由/操作审计埋点、防爆手机回传（上行）               | `services/audit.ts` `services/emergencyPhone.ts`         |
| Auth           | 认证与菜单         | 登录、动态菜单装配（B3 AUTH-05）、设备编码解析        | `services/menu.ts` `stores/auth.ts`                      |
| Offline        | 离线作业（移动端） | 断网落盘 + 重连静默补发                               | `services/offlineOutbox.ts` + `apps/mobile/bridges/*`    |

## B. 状态 / 等级 / 设备 着色映射（canonical 枚举）

> 代码一律引用 `var(--token)`，禁止硬编码 hex。下表 hex 仅作设计稿对照，AI 生成代码时**不要写死**。

### B.1 报警等级 `AlarmLevel = 1 \| 2 \| 3 \| 4`

| 等级 | 语义 | 大屏色阶     | 后台/移动标签色                   |
| ---- | ---- | ------------ | --------------------------------- |
| 1    | 一级 | `#ff5a4a` 红 | `#f5222d` 红（`--color-alarm-1`） |
| 2    | 二级 | `#ff9a3c` 橙 | `#fa8c16` 橙（`--color-alarm-2`） |
| 3    | 三级 | `#f0c429` 黄 | `#fa8c16` 橙（`--color-alarm-3`） |
| 4    | 四级 | `#b07aff` 紫 | 主色蓝（`--color-alarm-4`）       |

渲染：大屏用等级色左边条/等级标识；后台/移动渲染为 `.tag-*` 浅底标签。token 名统一为 `--color-alarm-1..4`（各端主题解析值不同，勿跨端抄 hex）。

### B.2 报警状态 `AlarmStatus`

| 值           | 文案   | 大屏语义色         | 后台/移动标签类 |
| ------------ | ------ | ------------------ | --------------- |
| `ACTIVE`     | 待处理 | `--color-danger`   | `tag-danger`    |
| `ACKED`      | 已确认 | `--color-warning`  | `tag-warning`   |
| `DISPATCHED` | 已派单 | `--color-accent-2` | `tag-info`      |
| `CLOSED`     | 已闭环 | `--color-success`  | `tag-success`   |

### B.3 设备状态 `DeviceStatus`

| 值        | 文案 | 颜色 token           |
| --------- | ---- | -------------------- |
| `ONLINE`  | 在线 | `--color-success`    |
| `OFFLINE` | 离线 | `--color-text-muted` |
| `FAULT`   | 故障 | `--color-danger`     |

### B.4 风险区地图填充（仅大屏）

`high` rgba(255,90,74,0.22) / `warning` rgba(240,180,41,0.20) / `notice` rgba(0,180,255,0.18) / `normal` rgba(135,149,176,0.14)。

## C. 架构与契约术语

| 术语            | 含义                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| wujie           | 微前端框架（`wujie-vue3`），大屏壳内嵌 18 个业务子应用；子应用独立 Pinia、共享设计 token 与登录态                                                                              |
| IIFE 构建铁律   | 子应用必须 `npm run build:subapps` 打成 IIFE；禁止 vite 多 HTML 入口（否则 `#app` 不挂载）                                                                                     |
| WujieHost       | 大屏壳装载槽（`src/shell/WujieHost.vue`），路由 `meta.subappUrl` 命中时渲染 wujie 子应用                                                                                       |
| 设计 token 注入 | 主壳 `injectDesignTokens` 向沙箱注入 `:root` 变量；子应用**不再打包** `tokens.css`                                                                                             |
| B3 统一包络     | 响应包络 `ApiResponse{code,message,data,traceId}`：`code=0` 成功，非 0 抛业务错误（`unwrapBody<T>` 解包）                                                                      |
| 20 位 MDM 编码  | 设备中石化 MDM 物理主键，固定 20 位，禁止自创；解析入口 `/system/device-code`                                                                                                  |
| RBAC 四层权限   | ① 按钮级 `v-permission` ② 路由级 `meta.perm`+守卫 ③ 菜单级 `/auth/menus` 动态装配 ④ 数据级**服务端过滤**                                                                       |
| 零下行控制      | 前端只监不控；硬控写接口由 `guardHardControl` 拦截；`ack` 仅沿 `ACK_FLOW` 前进一格，不触发设备硬控                                                                             |
| 防重放签名      | 生产环境 HMAC-SHA256（`X-Timestamp`/`X-Nonce`/`X-Signature`，有效窗 10s）；Dev 可 `gateway-bypass` 挂起                                                                        |
| 令牌内存态      | `getAccessToken/setAccessToken` 内存态；刷新令牌走 HttpOnly Cookie，前端 JS 不可读                                                                                             |
| ACK_FLOW        | 报警处置流 `['ACTIVE','ACKED','DISPATCHED','CLOSED']`，`ack()` 仅前进一格                                                                                                      |
| 移动端桥接层    | `apps/mobile/bridges/`：`LocationBridge`(无感定位)/`OfflineBridge`(断网落盘)/`TokenSource`(令牌注入)；业务页只经桥接访问原生能力，禁止直调 `navigator.geolocation`/Web Storage |
| Cesium 一张图   | `src/components/map/SharedCesiumMap.vue` + 多图层 overlay；强依赖 WebGL 同源 blob 沙箱                                                                                         |

## D. 工程与协作术语

| 术语                 | 含义                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| OpenSpec             | 业务变更规格工具（`@fission-ai/openspec`），`openspec/changes/` 为唯一业务规格源                                |
| L0–L4                | 分级工作流：L0 只读/文档 → L1 小改 → L2 技术债 → L3 业务能力 → L4 高风险（见 `docs/ai-collaboration-guide.md`） |
| 验证矩阵             | 最小验证对应表（AGENTS §2），改完只跑对应一行                                                                   |
| `tokens.css`         | 设计 token 单一真源（`src/styles/tokens.css`），禁止组件内重定义                                                |
| `data-theme`         | 主题挂载：大屏 `:root`(不挂) / 后台 `mgmt` / 移动 `mobile`                                                      |
| z-index 五层         | `--z-base(0)/--z-marker(5)/--z-chrome(10)/--z-overlay(30)/--z-toast(40)`                                        |
| `.tag-*`             | 状态标签类 `tag-success/-warning/-danger/-info`（后台/移动浅底深字）                                            |
| 三端视觉语言禁止迁移 | 玻璃/发光/渐变仅限大屏；浅色白卡/浅底标签仅限后台与移动                                                         |
| 跨工具适配层         | `CLAUDE.md` + `.cursor/`(rules/commands/skills/README)，镜像 `AGENTS.md` 供多 AI 工具读取                       |
| 机器消费闭环         | `docs/api/*.openapi.json` → `scripts/gen-api-types.mjs` → `src/types/generated/*` → `src/services/*` 消费       |
| 契约四同步           | OpenSpec → `docs/api` → 类型生成 → 调用方（见 `docs/api/README.md`）                                            |
