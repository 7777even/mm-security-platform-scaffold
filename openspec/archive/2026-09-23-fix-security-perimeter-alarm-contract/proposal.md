# 修复 security 契约重复 path key 导致的路由漂移

## Why

后端 `SecurityController` 已同时实现 `GET` 与 `PUT /security/perimeter-alarms/{id}`，
但前端契约 `docs/api/security.openapi.json` 中该 path 被写了两次（约 576 行定义 `get`、656 行定义 `put`）。
JSON 规范下重复 key 后者覆盖前者，`JSON.parse` 只保留 `put`，`get` 被静默丢弃。
跨库契约守门（`scripts/check-api-contract.mjs --strict`）因此报「实现有 / 契约无 1 处」并以退出码 1 失败。

## What Changes

将两处 path 块合并到同一个 `/security/perimeter-alarms/{id}` key 之下（OpenAPI 3.x 正确写法：
一个 path 承载 `get` + `put`），恢复被吞掉的 GET。其余契约与后端实现无变化。

## Capabilities

- security（周界入侵告警详情 GET / 写回 PUT 归一到同一 path）

## Impact

- 前端生成类型 `src/types/generated/security.ts` 将补回 `getPerimeterAlarm` 操作类型。
- 后端契约守门 strict 模式：路由差异 0 / schema 漂移 0，退出 0。
- 不涉及后端代码、不涉及运行期行为；前端手写服务 `src/services/security.ts` 的 `fetchPerimeterAlarm` 本就已存在，无需改动。
