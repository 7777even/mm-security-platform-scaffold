# Change: 救援资源四台账管理页补齐 CRUD 与实时订阅（P1 第一批）

## 为什么

后端同批 Change（`backend-scaffold/openspec/changes/2026-10-02-mgmt-p1-rescue-resource-crud`）
已为救援人员 / 消防队伍 / 救援车辆 / 救援装备四张台账补齐 POST / PUT / DELETE 与四个广播域。
前端此前四个页面全是**只读表格**：`EmergencyExpertView`、`EmergencyTeamView`、
`EmergencyVehicleView`、`ResourceView` 既不能新增也不能改错，也没订阅任何域。

## 变更内容

| 页面                                    | 新增能力                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| `emergency/EmergencyExpertView`         | 新增 / 编辑 / 删除 + 订阅 `rescue.personnel`                    |
| `emergency/EmergencyTeamView`           | 新增 / 编辑 / 删除 + 订阅 `rescue.brigade`                      |
| `emergency/EmergencyVehicleView`        | 新增 / 编辑 / 删除 + 订阅 `rescue.vehicle`                      |
| `emergency/ResourceView`                | 新增 / 编辑 / 删除 + 订阅 `rescue.equipment`                    |
| `src/services/rescueResource.ts`        | 12 个写方法 + 4 个写请求类型 + 3 组状态常量；两个只读类型补字段 |
| `docs/api/rescue-resource.openapi.json` | 8 个 path 补 post / put / delete + 4 个 WriteRequest schema     |

## 设计要点

- **四个页面零字段映射**：后端写请求字段名刻意对齐只读 DTO，`openEdit(row)` 直接
  `{ ...row }` 灌进通用弹窗，保存时原样回传。
- **车辆编辑只回传本体**：`openEdit` 显式挑出 22 个本体字段，不传 `crew / onboardEquipment /
consumables / dispatchSummary` 子集合——否则子表会被误当成车辆字段回传。
- **有字典才用下拉**：值班状态、车辆状态、装备状态有既定取值 → `el-select`；
  中队 / 位置 / 型号 / 日期等无字典 → `el-input`（不臆造下拉）。
- **订阅统一走** `useDomainAutoRefresh(domain, load, { immediate: false })`，
  `immediate: false` 避免与 `onMounted(load)` 重复触发首屏请求。
- 删除二次确认，成功后 `await load()` 重拉（以服务端为唯一真源，不本地 splice）。

## 范围与非目标

- 非目标：大屏侧本批不接这四个域的订阅（大屏救援力量面板走本地聚合，接入前需评估与既有
  聚合逻辑的冲突，留作下一批）；不改动既有只读表格的列语义。
