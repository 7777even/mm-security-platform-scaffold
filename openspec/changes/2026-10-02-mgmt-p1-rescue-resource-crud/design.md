# Design: 救援资源四台账管理页 CRUD

## 1. 四页共用一套套路，零字段映射

后端写请求字段名对齐只读 DTO（`name / squadron / role / plate / type / status …`），
于是四个页面的 `openEdit` 都可以是：

```ts
editRow.value = { ...row } as unknown as Record<string, unknown>;
```

不必写 `personName ↔ name` 之类的映射。这是后端 Change 里「写请求用 DTO 字段名」决策的直接收益：
代价在后端 service 里付一次，四个前端页面全部免单。

## 2. 车辆为什么不能 `{ ...row }`

车辆 DTO 带有 `crew / onboardEquipment / consumables / dispatchSummary` 四个子集合，
而后端写端点只接受本体字段。若直接展开整行，子集合会被一起 POST/PUT 过去——
后端 DTO 没有这些字段，Jackson 遇到未知字段会直接解析失败（不是"忽略"）。

所以 `EmergencyVehicleView.openEdit` 显式列出 22 个本体字段。单测固定了这个行为
（断言 `form` 不含 `crew` / `onboardEquipment`），防止后续有人图省事改回 `{ ...row }`。

## 3. 弹窗字段的「有字典才下拉」判定

| 字段                           | 判定                                | 控件              |
| ------------------------------ | ----------------------------------- | ----------------- |
| 值班状态 / 车辆状态 / 装备状态 | 库内有既定取值（在岗·备勤·休整 等） | `el-select`       |
| 中队 / 位置 / 型号 / 各类日期  | 自由文本，无字典表                  | `el-input`        |
| 人数 / 数量 / 经纬度           | 数值                                | `el-input-number` |

日期类字段用 `el-input` 而非日期选择器：库内这些列是 VARCHAR 且格式不统一
（有的是 `2023-05-18`，有的是 `38000 公里` 这类带单位串），强行套日期选择器会写坏数据。

## 4. 为什么删除后重拉而不是本地 splice

四个列表都带过滤（角色 / 区域 / 中队）与服务端聚合（总数、选项集合），
本地删除容易与这些状态不一致。统一 `await load()`，代价是多一次请求。
