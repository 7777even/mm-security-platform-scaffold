## Capability: fire-situation-map

火情态势大屏只读接口契约（装置区消防保障汇总 / 聚合点位 / 重点监控对象）。

### MODIFIED

- `GET /fire-situation/areas` 响应 `FireMonitorArea.equipment`（消防设备数）语义变更：现按区聚合自监测表 `fac_fire_facility_monitor`，与监测总数 983 真源归一；示例值 refinery-1 128→92、refinery-2 96→68。字段形态不变（仍为 integer）。

#### Scenario: 装置区设备数契约示例与真源一致

- Given 后端已完成监测表 (区×类型) 矩阵化并按区聚合
- When 前端读取 `docs/api/fire-situation.openapi.json` 的 areas 示例
- Then `equipment` 示例反映新分区值（炼油一部装置区=92），与运行时返回值一致
