# docs/api/ — API 契约真相源

按业务域拆分的前后端契约（OpenAPI 3.x JSON），是接口定义的**单一真相源**。

## 四条铁律

1. **按 Controller 分组**：用 `tags` 标注所属 Controller（如 `AlarmController` / `AuthController` / `GisController`）。
2. **每个接口有 `summary` + `description`**：一句话摘要 + 说明（含是否触及硬控、MDM 编码等约束）。
3. **每个字段有中文 `description`**：`schema.properties.*.description` 必须中文，说明含义与取值。
4. **每个接口有成功响应 `example`**：`responses.200.content.*.example` 提供可落地的成功响应样例（B3 包络 `code=0` 取 `data`）。

## 同步规则

- 仅在**新增 / 变更 API** 时同步更新对应 `<domain>.openapi.json`；纯调用方实现变化走 L3，不改契约文件。
- 文件列表（按业务域）：
  - `alarm.openapi.json` — 告警查询 / 确认 / 规则
  - `auth.openapi.json` — 认证 / 令牌 / 权限码
  - `gis.openapi.json` — 地图图层 / 标记 / 一张图
  - 其他域按需新增（如 `device.openapi.json` / `rbac.openapi.json`）
- 当前文件为**结构桩（stub）**，已按四条铁律给出样例结构，待补充真实接口契约。

## 与 AGENTS.md 的关系

契约须满足 AGENTS.md §3 API 契约规则：零下行控制、B3 统一包络、20 位 MDM 设备编码、防重放签名、令牌内存态。
