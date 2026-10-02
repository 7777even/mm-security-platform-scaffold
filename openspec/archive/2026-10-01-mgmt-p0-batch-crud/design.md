# Design: 通用台账弹窗与 P0 接线

## 决策 1：schema 驱动的通用弹窗

`FieldDef { prop, label, type, required, options, disabledOnEdit, dateType, valueFormat }`
一次性描述字段形态，弹窗负责渲染、校验与 payload 组装。收益：

- 后续 30+ 模块接入只需声明字段清单（约 20 行），无需重复写模板；
- 下拉/日期选择器口径集中，避免各模块各自发挥；
- 校验规则由 `required` 统一生成，提示语一致。

## 决策 2：写接口仍在视图层调用

弹窗只 `emit('save', payload, id|null)`，由父组件决定调 create 还是 update，
保持"service 调用在视图层"的既有模式，也让业务化提示语（如"签到成功/签退成功"）留在视图里。

## 决策 3：控件类型判定沿用既有标准

**有既定字典/枚举取值 → `select`**（指令状态、签到动作、调度动作、巡更结果、联动预置点/对象）；
**无字典的描述类字段 → `input` / `textarea`**（类别、下发方式、目标、备注、位置、发现、工单号），
绝不臆造下拉。

## 决策 4：`date` 字段区分日期与日期时间

值班日期 / 巡查日期是纯日期（后端存 `YYYY-MM-DD`），故 `FieldDef` 增加
`dateType` 与 `valueFormat`，默认才是 `datetime` + `YYYY-MM-DD HH:mm:ss`。

## 决策 5：自动联动单独写专用弹窗

联动配置含"规则行数组"这种动态结构，超出 `FieldDef` 的表达能力，
故仍写专用弹窗 `VideoLinkageEditDialog`，规则行支持增删、选项取自后端
`/video/linkage-options`（零下行红线：不回灌假选项）。

## 类型约束

Element Plus 的 `v-model` 不接受 `unknown`，故统一改用
`:model-value` + `@update:model-value` 并做类型断言，保证 `vue-tsc` 严格模式通过。
