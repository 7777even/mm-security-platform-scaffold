# 设计

## 页面结构

复用 `AreaView` 只读页范式：

- `MgmtPageHead`：标题「消防设施故障管理」、面包屑「消防设施管理 / 设备故障管理」、图标 `Warning`、tone `red`。
- 筛选行（在 `mgmt-card` 内、表格上方）：两个 `el-select`（级别/状态，均 `clearable`）+「查询」「重置」按钮。
- `el-table`：`v-loading` 绑定 `loading`；7 列：编号、关联设备、故障类型、级别、状态、发现时间、维修责任人。
- 级别/状态列使用 `.tag-*` 类着色。
- 无分页：后端 `/faults` 返回扁平 `items`，由前端全量展示。

## 字段映射

| 界面列     | FireFacilityFaultItem 字段      | 说明                                             |
| ---------- | ------------------------------- | ------------------------------------------------ |
| 编号       | `faultCode`                     | 后端真实故障单号，如 FLT-20260820-001            |
| 关联设备   | `facilityName` / `facilityCode` | 优先展示名称                                     |
| 故障类型   | `faultType`                     | 如硬件故障、通信故障、软件故障                   |
| 级别       | `faultLevel`                    | 紧急/重要/一般                                   |
| 状态       | `status`                        | 待确认/已确认/已派单/处理中/维修中/待验收/已完成 |
| 发现时间   | `discoverTime`                  | 后端原始时间字符串                               |
| 维修责任人 | `repairPerson`                  | 维修人                                           |

## 着色规则

- **级别**：紧急 → `tag-danger`；重要 → `tag-warning`；一般 → `tag-info`。
- **状态**：待确认 → `tag-danger`；已确认/已派单/处理中/维修中 → `tag-warning`；待验收 → `tag-info`；已完成 → `tag-success`。

## 错误与三态

`fetchFireFacilityFaults` 调用放入 `try/catch`，异常时 `toastErr` 提示并清空 `rows`；不主动注入 mock。该服务为只读，无写操作，不写审计。
