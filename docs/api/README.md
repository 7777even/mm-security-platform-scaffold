# docs/api/ — API 契约真相源

按业务域拆分的前后端契约（OpenAPI 3.x JSON），是接口定义的**单一真相源**。

> 状态说明：本目录最初为结构桩（stub）。其中 `alarm` / `auth` 已**升级为代码真实契约**（对齐 `src/services/*` 实际端点）；`dashboard` / `emergency` / `map` / `uplink` / `realtime` 为本次新增的真实契约；`gis.openapi.json` 仍为**前瞻性桩**（描述未来 GIS 网关 `/gis/*` 形态，与已实现的 `/map/*` 端点并存，待后端落地）。

## 四条铁律

1. **按业务域分组**：用 `tags` 标注所属域（如 `alarm` / `auth` / `map` / `emergency` / `dashboard` / `uplink` / `realtime`），文件名即域。
2. **每个接口有 `summary` + `description`**：一句话摘要 + 说明（含是否触及硬控、MDM 编码等约束）。
3. **每个字段有中文 `description`**：`schema.properties.*.description` 必须中文，说明含义与取值。
4. **每个接口有成功响应 `example`**：`responses.200.content.*.example` 提供可落地的成功响应样例（B3 包络 `code=0` 取 `data`）。

## 共享组件 `_shared.json`

跨域复用的组件统一放在 `_shared.json`（非独立 API 文档），各域文件通过**相对 `$ref`** 引用，避免重复定义、单一真源：

- `components.securitySchemes`：`bearerAuth`（Authorization: Bearer，令牌内存态）、`replaySign`（HMAC-SHA256 防重放三头 X-Timestamp/X-Nonce/X-Signature）。
- `components.parameters`：`page` / `size`（分页）、`lang`（Accept-Language i18n 头）。
- `components.schemas`：`ApiResponse`（B3 包络）、`PageResult`（分页包络）、`ErrorEnvelope`（业务错误）。
- `components.responses`：`Unauthorized` / `BadRequest` / `Forbidden`。

各域响应用 `allOf` 叠加 `_shared` 的 `ApiResponse` 并覆盖 `data` 具体结构，表达「`ApiResponse<X>`」语义。

## 同步规则

- 仅在**新增 / 变更 API** 时同步更新对应 `<domain>.openapi.json`；纯调用方实现变化走 L3，不改契约文件。
- 文件列表（按业务域）：
  - `_shared.json` — 跨域共享组件（安全方案 / 参数 / 包络 / 错误响应）
  - `dashboard.openapi.json` — 态势总览 / 报警趋势 / 风险热力图（真实）
  - `alarm.openapi.json` — 报警/应急事件查询与 CRUD（真实，由 stub 升级）
  - `emergency.openapi.json` — 应急力量 / 结案 / 值班 / 通讯录 / 知识（真实）
  - `map.openapi.json` — 一张图报警/设备点位 GeoJSON（真实）
  - `auth.openapi.json` — 菜单树（真实，由 stub 升级；无显式 login 端点）
  - `uplink.openapi.json` — 审计埋点 / 防爆手机现场回传（真实上行）
  - `realtime.openapi.json` — 报警实时推送 WebSocket（真实，仅订阅）
  - `gis.openapi.json` — 地图图层 / 标记（**前瞻性桩**，描述未来 `/gis/*` 网关）
  - 其他域按需新增（如 `device.openapi.json` / `rbac.openapi.json`）

## 工具链（AI 与自动化消费）

### 1. 生成 TS 类型（本仓库标准做法）

统一由脚本 `scripts/gen-api-types.mjs` 处理「`_shared.json` 跨文件 `$ref` 合并 + 类型生成」，**不要**直接对单文件跑 `openapi-typescript`（会因 `_shared` 跨文件引用解析失败）：

```bash
npm run gen:api-types          # 生成 src/types/generated/<domain>.ts + index.ts
```

脚本逻辑（对齐 AGENTS.md §3）：

- 读取 `_shared.json`，把其 `components`（schemas / responses / parameters / securitySchemes）整体合并进每个域文档；
- 把 `./_shared.json#/components/...` 改写为内部 `#/components/...` 引用，使契约自洽；
- 调用 `openapi-typescript` 生成 `src/types/generated/<domain>.ts`（每域一个文件，B3 包络 + 域类型一并产出）；
- 生成 `src/types/generated/index.ts`，以**命名空间**重导出各域（`import type { Alarm } from '@/types/generated'`，再取 `Alarm.components['schemas']['AlarmItem']`），避免各域 `paths`/`components` 同名冲突。

> 生成物为自动代码，**请勿手改**；契约变更后重跑本命令并一并提交。

### 2. 其他消费方式

- **相对 `$ref` 解析**：Swagger UI、openapi-generator 原生支持跨文件 `$ref`。若某工具不支持，先内联（二选一）：
  - `npx @redocly/openapi-cli bundle docs/api/<domain>.openapi.json -o bundled.json`
  - `npx swagger-cli bundle docs/api/<domain>.openapi.json -o bundled.json`
- **生成 Mock / 客户端**：`openapi-generator-cli` 或 `openapi-typescript` + `typhon-ts` 可按契约生成调用方与桩数据（后端未就绪时前端联调用）。

## 变更四同步（契约 ↔ 代码 一致性闭环）

新增 / 修改接口时，按以下顺序同步，避免契约与实现漂移：

1. **OpenSpec**：业务变更先走 `opsx-*` / `.cursor/skills/openspec-*`，提案与 tasks 落地（`openspec/changes/`）。
2. **docs/api**：更新对应 `<domain>.openapi.json`（遵循四条铁律），共享语义改 `_shared.json`。
3. **类型生成**：跑 `npm run gen:api-types`，把契约变化反映到 `src/types/generated/`。
4. **调用方**：`src/services/*` 消费新类型（`import type { Xxx } from '@/types/generated'`），或据此调整 axios 适配层。

> 单一真源优先级：`src/services/*`（实际调用）↔ `docs/api/*.openapi.json`（机器可读契约）互为镜像；AGENTS.md §3 是散文约束，本目录是其机器可读投影。改 AGENTS §3 须同步此处。

## 与 AGENTS.md 的关系

契约须满足 AGENTS.md §3 API 契约规则：零下行控制、B3 统一包络、20 位 MDM 设备编码、防重放签名、令牌内存态。
