# Tasks: 救援资源四台账管理页 CRUD（前端）

- [x] `rescueResource.ts`：12 个写方法 + 4 个写请求类型 + 3 组状态常量 + 两个只读类型补字段
- [x] 契约：8 个 path 补 post/put/delete + 4 个 WriteRequest schema + Item 补字段
- [x] `gen:api-types` 重新生成；后端契约守门 `--strict` 0 差异
- [x] 四个页面接入通用弹窗 + 操作列 + `useDomainAutoRefresh` 订阅
- [x] 单测：RescueResourceCrudViews.spec.ts 6 例（四页订阅 + 删除 + 车辆本体字段 + 退订）
- [x] `type-check` 通过
- [x] 全量 `vitest run`：73 文件 465 例通过
- [x] `lint`（改动文件 0 error）/ `gate:screen` PASS
- [x] 后端真机对拍四台账 CRUD 全路径（41/41 通过）
- [x] 双仓提交推送并归档
