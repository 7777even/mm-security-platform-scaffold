# 设计说明

## 根因

`security.openapi.json` 的 `paths` 下存在重复 key：

- 约 576 行：`"/security/perimeter-alarms/{id}": { "get": {...} }`
- 约 656 行：`"/security/perimeter-alarms/{id}": { "put": {...} }`

JSON 对象 key 必须唯一，解析器保留最后一次出现 → `get` 丢失。

## 修复

合并为单一 path key（OpenAPI 3.x 同一 path 可承载多 method）：

```
"/security/perimeter-alarms/{id}": {
  "get": { ... },
  "put": { ... }
}
```

用带括号匹配的脚本完成合并，确保：

- 夹在 GET / PUT 之间的 `snapshot` 等相邻 path 不被误删；
- 逗号边界正确（合并后 PUT 为末位 method、snapshot 成为 paths 末位 path，尾逗号均已去除）；
- 合并后 JSON 仍合法、path key 唯一。

## 验证

- `json.load` 通过；path key 计数 = 1；methods = [get, put]；operationId 分别为 getPerimeterAlarm / updatePerimeterAlarm。
- 后端 `check-api-contract.mjs --strict` 退出 0，路由差异 0、schema 漂移 0、合计 0。
- 重跑 `npm run gen:api-types`，`security.ts` 新增 `getPerimeterAlarm` 操作类型。
