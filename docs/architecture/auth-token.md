# 鉴权与令牌体系 / 权限模型（docs/architecture/auth-token.md）

> 最高风险面，改动须严格对齐 AGENTS §3 API 契约与 §6 红线。本文描述「现在是什么」；任何越权/下行控制行为均为红线违规。

## 1. 认证（登录态）

- **脚手架阶段**：单一「管理员」身份登录（`src/stores/auth.ts` 的 `roleId='admin'`，统一授予全部权限码）。
- **正式环境**：由 IDP SSO 下发 access token 并写入**内存态**；刷新令牌由后端种入 **HttpOnly Cookie**，浏览器自动随请求发送，前端 JS 不可读。
- **令牌内存态**：`src/services/token.ts` 的 `getAccessToken` / `setAccessToken` / `clearAccessToken`；**禁止 localStorage 明文**存储令牌。

## 2. 授权（RBAC）

权限码形如 `fire-alarm:view` / `fire-alarm:ack` / `ops:view` / `system:user:view` / `mobile:field-report:view`，按业务模块分组：`dashboard` `weather` `fire-alarm` `security` `video` `ops` `system` `mobile`。

| 层级   | 机制                   | 实现                                                                                                                         |
| ------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 按钮级 | `v-permission` 指令    | `src/directives/permission.ts`：无权限元素从 DOM 移除（Comment 锚点占位），订阅 `auth.$subscribe` 实时刷新，切换角色即时生效 |
| 路由级 | `meta.perm` + 全局守卫 | `src/router/index.ts` `beforeEach`：`auth.hasPerm(perm)` 为假则跳 `not-found`                                                |
| 菜单级 | 动态装配 + 过滤        | `/auth/menus` 返回菜单树（B3 AUTH-05），`usePermission().filterRoutesByPerm` 按 perm 过滤；mock 不可达降级 `DEFAULT_MENUS`   |
| 数据级 | **服务端过滤**         | 行级数据权限由服务端按角色-终端-防区下发，前端不持有                                                                         |

正式环境角色由 IDP/RBAC 网关按「**角色-终端-防区**」三维下发替换脚手架阶段的静态 `ROLE_PERMS`。

## 3. 零下行控制（红线，禁止违反）

- 前端**只监不控**：`services` 不定义任何硬控写接口。
- 出站请求命中硬控路径由 `guardHardControl` 在 http 拦截器统一拦截。
- `ack` 仅软件协同处置：`src/stores/alarm.ts` 的 `ACK_FLOW = ['ACTIVE','ACKED','DISPATCHED','CLOSED']`，`ack()` 只允许沿流程前进一格，跨级/重复/越界均忽略；**不触发任何设备硬控**。

## 4. 防重放签名

- 生产环境（`gateway-bypass=false`）：http 拦截器强制 HMAC-SHA256 签名头（timestamp / nonce / signature），见 `src/services/requestSigner.ts`。
- Dev 经 `gateway-bypass` 挂起签名校验，便于本地联调。

## 5. 20 位 MDM 设备编码

- 设备物理主键固定 **20 位中石化 MDM 编码**，禁止自创物理主键。
- 解析/查看入口：`/system/device-code`（`views/system/deviceCode.vue`）。

## 6. 实时订阅（WebSocket）

- `/ws/alarm` **仅订阅 `alarm.push`**（上行订阅，不下行控制）。
- 推送经 `ingestAlarm`（`src/stores/alarm.ts`）去重入流（同 `alarmId` 以最新为准）。
- WebSocket 封装见 `src/services/ws.ts` / `realtime.ts`；与告警相关的事件类型见 `src/services/emergencyEventStore.ts`。

## 7. i18n（后端驱动）

- 非前端 `vue-i18n` 库；`src/services/http.ts` 拦截器注入 `Accept-Language`（`localStorage['app-language'] ?? navigator.language ?? 'zh-CN'`）。
- 报文文案由**后端按语言头翻译**返回；前端仅透传语言偏好。

## 相关文档

- [README.md](./README.md) — 架构总览（数据流 §5）
- [micro-frontend.md](./micro-frontend.md) — 子应用经 `props.perms` 拿到已解析权限
- [../api/README.md](../api/README.md) — 机器可读契约（`_shared.json` 定义 `bearerAuth` + `replaySign` 安全方案）
- [../requirement/README.md](../requirement/README.md) — 业务视角的权限码分布与三端场景
