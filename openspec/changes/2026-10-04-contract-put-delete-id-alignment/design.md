# Design: 契约 PUT/DELETE 路由对齐至 /{id}

## 背景与根因

`check-api-contract.mjs` 比对「后端 Controller (method, path)」与「前端契约 paths」。三域 PUT/DELETE 后端实现按 AGENTS.md §11 约定落在 `/{id}` 子路径，但契约（openapi.json）误将其挂在集合路径，导致每域产生「契约有实现无」+「实现有契约无」两条路由差异，合计 12 条（基线技术债）。

前端 `src/services/security.ts` / `fireMonitoring.ts` 的写函数**早已调用 `/{id}`**（运行时正确），仅契约文档与生成类型路径图不一致——属纯文档对齐，无行为变更。

## 端点矩阵（对齐后）

| 域              | 方法   | 路径                                  | 权限码                        | 广播域                  |
| --------------- | ------ | ------------------------------------- | ----------------------------- | ----------------------- |
| fire-monitoring | PUT    | `/api/v1/fire/patrols/{id}`           | `fire:patrol-write`           | `fire.patrol-record`    |
| fire-monitoring | DELETE | `/api/v1/fire/patrols/{id}`           | `fire:patrol-write`           | `fire.patrol-record`    |
| security        | PUT    | `/api/v1/security/bollards/{id}`      | `security:bollard-write`      | `security.bollard`      |
| security        | DELETE | `/api/v1/security/bollards/{id}`      | `security:bollard-write`      | `security.bollard`      |
| security        | PUT    | `/api/v1/security/gate-controls/{id}` | `security:gate-control-write` | `security.gate-control` |
| security        | DELETE | `/api/v1/security/gate-controls/{id}` | `security:gate-control-write` | `security.gate-control` |

## 机械改造

- 各 operation 的 `id` path 参数（`name=id`、`in=path`、`integer`、`required`）已存在，仅将 `put`/`delete` 从集合 path 对象迁至 `{id}` 子路径对象（外科手术式文本搬移，保留全部 description/example/schema `$ref`，不重排格式）。
- 重跑 `npm run gen:api-types`：仅路径图变化（`/{id}` 新增），schema 类型不变；service 仅 import `components` schema，故编译无影响。
- 守门：`node scripts/check-api-contract.mjs --strict` 期望路由差异 0。

## 风险

- 仅契约文档 + 生成类型路径图变更，无运行时/行为变更；前端 service 调用与后端实现本就一致。
