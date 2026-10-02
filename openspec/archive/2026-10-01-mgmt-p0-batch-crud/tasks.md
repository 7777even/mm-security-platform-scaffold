# Tasks: mgmt P0 批次前端接线

- [x] 新增 `MgmtRecordEditDialog.vue` 通用台账弹窗（schema 驱动）
- [x] `businessWrite.ts` 新增四域 update / delete（8 个方法，三态语义对齐）
- [x] 应急指令页：通用弹窗 + 编辑 / 删除 + 操作列
- [x] 值班签到页：通用弹窗 + 编辑 / 删除 + 操作列
- [x] 台风调度页：通用弹窗 + 编辑 / 删除 + 操作列
- [x] 巡更执行页：通用弹窗 + 编辑 / 删除 + 操作列
- [x] 自动联动页：`VideoLinkageEditDialog` + 新增 / 编辑 / 删除，接通写链路
- [x] 契约三域补 put / delete 并 `gen:api-types`
- [x] 单测：通用弹窗 3 例 + 四域删除链路 4 例 + 联动弹窗 3 例 + 联动页 3 例
- [x] `type-check` / `lint`（0 error）通过
- [x] 全量 `vitest run` 回归确认
- [x] 双仓提交推送并归档
