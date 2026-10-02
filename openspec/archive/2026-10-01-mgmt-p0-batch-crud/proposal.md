# Change: mgmt 全模块 CRUD（P0 批次）前端接线：通用台账弹窗 + 五模块 CRUD

## 为什么

P0 批次要落地 8 个模块，且后续 P1–P3 还有 30+ 个台账模块需要 CRUD 界面。
若每个模块各写一个弹窗组件会产生大量重复代码且难以保持下拉/日期选择器口径一致。
故本 Change 引入 **schema 驱动的通用台账弹窗**，并完成 P0 剩余模块的接线。

## 变更内容

1. **新增通用组件** `apps/mgmt/components/MgmtRecordEditDialog.vue`
   —— 由字段定义数组（`FieldDef`）驱动渲染与校验，支持
   `input / textarea / select / date / number` 五种控件，
   新增与编辑共用（按 `editRow` 是否带 id 判定），保存时 `emit('save', payload, id|null)`，
   具体写接口由父组件调用（service 调用保持在视图层）。
2. **四个业务写域接 CRUD**：应急指令 `EmergencyCommandView`、值班签到 `DutySignInView`、
   台风调度 `TyphoonDispatchView`、巡更执行 `PatrolExecutionView`
   —— 原有"仅新增"弹窗统一改为通用弹窗，并补编辑 / 删除（二次确认）+ 操作列。
3. **应急自动联动 `AutoLinkageView` 接通写链路**：后端 POST/PUT/DELETE 与契约本就齐备，
   本次补 `VideoLinkageEditDialog`（含联动规则动态行）与删除操作。
4. **服务层** `businessWrite.ts` 新增 8 个写方法（四域的 update / delete），
   三态语义（live / demo / offline）与既有 `createXxx` 一致。
5. **契约**：`emergency` / `fire-monitoring` / `typhoon-emergency` 三个域各补
   `/{资源}/{id}` 的 put 与 delete（与既有 get/post 分列不同 path key）。

## 范围与非目标

- 移动端本轮不纳入（用户决定先做 mgmt + 大屏双端）。
- 通用弹窗不替代已有的专用弹窗（消防报警 / 消防故障 / 联动配置），仅用于新接线模块。
