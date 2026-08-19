## Why

脚手架基座已沉淀并通过构建/测试/门禁验证，但对照 S1 规范与等保红线仍存在 P0/P1 差距：§5.3 令牌机制为占位（null）、§9.1/§9.4 离线部署仍依赖公网 CartoDB 地图源、§10.2 CSP 生产 nonce 方案缺失、生产 CSP 模板缺位、OpenSpec 任务清单完成度漂移（部分项误标已闭环）。本 change 旨在闭环等保红线 P0 项、补齐规范 P1 项，使脚手架真实满足 S1 合规基线，可作为生产发布样本。

## What Changes

- **§5.3 令牌内存态（P0-1）**：前端以 JS 内存维护 access token（严禁落地 localStorage/sessionStorage 防 XSS 窃取）；刷新令牌由后端种入 HttpOnly Cookie，浏览器自动随请求发送，前端 JS 不可读。请求拦截注入 `Authorization: Bearer <token>`。
- **§9.1/§9.4 离线部署（P0-2）**：dashboard 地图底图源抽为可配置常量，默认切内网/天地图瓦片占位，移除强制公网 CartoDB 依赖；收紧 dev CSP `img-src`。
- **§10.2 CSP 生产 nonce（P0-3）**：提供生产 CSP 模板（Nginx 片段，含 nonce 注入指引，移除 `unsafe-inline`）。
- **生产 CSP 模板（P1-1）**：新增 `deploy/csp.conf` 作为离线部署产物。
- **任务清单回写（P1-2）**：回写 `rebuild-scaffold-foundation/tasks.md`，消除完成度漂移。

## Capabilities

### New Capabilities

- 无新增能力，属 `scaffold-foundation` 加固。

### Modified Capabilities

- `scaffold-foundation`：补强 §5.3 / §9.1 / §9.4 / §10.2 合规项。

## Impact

- `src/services/token.ts`（新增）：内存令牌读写（set/get/clear）。
- `src/services/http.ts`：`getAccessToken` 接线 `token.ts`（替换 null 占位）。
- `src/stores/auth.ts`：登录流程写入内存令牌（当前为 Mock）。
- `src/views/dashboard/index.vue`：地图源可配置化。
- `deploy/csp.conf`（新增）：生产 CSP 模板。
- `openspec/changes/rebuild-scaffold-foundation/tasks.md`：回写差距项。

## 注意

后端 IDP（OAuth2.0 SSO）接入与 HttpOnly Cookie 种入为部署协作项，不在本脚手架纯前端范围；本 change 负责前端令牌内存态与接线的可验证闭环（含单测），后端契约在 `deploy/` 文档中约定。
