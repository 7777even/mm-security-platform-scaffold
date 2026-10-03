# Design: 安防检索与周界告警 CRUD 契约四同步

## 真源与守门链路

```
docs/api/security.openapi.json  ──(npm run gen:api-types)──▶  src/types/generated/security.ts
        │
        └──(backend: node scripts/check-api-contract.mjs --strict)──▶ 路由层 + schema 层对拍
```

- 路由层：后端 Controller 的 `(method, path)` ⇄ 契约 `paths`（契约 `servers[0].url=/api/v1` 参与拼接）。
- schema 层：后端具名 DTO（`@NotBlank`/`Integer` 等）⇄ 契约 `components.schemas` 同名字段的**字段名 + 类型族**。
  因此 `VehicleSearchWriteRequest.confidence` 必须写 `"type": "integer"`（后端为 `Integer`），
  写成 `string` 会被判为类型漂移。

## 同 path 多 method 合并

OpenAPI 的 `paths` 以路径为 key、方法为子 key。人员/车辆登记与详情、周界告警详情与写回/删除
都落在同一路径上，必须合并，否则：

1. 生成类型里会出现两条重复 path key，后者覆盖前者；
2. 守门脚本按 `(method, path)` 比对，拆开写虽不影响路由层，但会破坏「按域分组 + 单一真源」的可读性。

## 四条铁律落地

- ① 按域分组：全部落在 `security.openapi.json`，未新建 `security-person.openapi.json` 之类平行体系。
- ② 每个 operation 具备 `summary` + `description`：description 内写明权限码、广播域、必填项、
  read-modify-write 语义与 409 乐观锁。
- ③ 每个 schema 字段具备中文 `description`：两个 WriteRequest 共 28 个字段全部带中文说明。
- ④ 200 响应具备 `example`：写端点给出完整请求/响应 example，删除端点给 `data: null`。

## 存量漂移修复（emergency）

`emergency.openapi.json` 里 `PUT/DELETE /emergency/cases`、`/emergency/knowledge`、`/emergency/phones`
写在了**无 `{id}` 的路径 key**上，而后端实现与前端 `src/services/emergency*.ts` 均为 `/{id}`。
按「不改后端实现来迁就」的原则，把 put/delete 迁到 `/emergency/{cases,knowledge,phones}/{id}` 新 path key
（两操作原本就声明了 `id` path 参数，迁移无需改参数），守门路由差异 12 → 0。

## 后续消费层（本 Change 未做）

前端 mgmt「人员登记 / 车辆登记」台账接 CRUD 时，按 `fire-alarm-crud` 已验证的范式：
服务层新增 `createPersonSearch` / `updatePersonSearch` / `deletePersonSearch`（车辆同理），
编辑对话框回显详情后提交（避免全字段覆盖丢字段），列表 `subscribeDomainChange('security.person-search', load)`
并在卸载时退订。
