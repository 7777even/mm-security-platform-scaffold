# Proposal: 七域写 UI 闭合

## 背景

监测 / 通信 / 生产 7 个域的写端点已由后端在 V106 提供正式权限码。此前前端三批只做了
「订阅 → 重拉」半环，管理端无新增 / 编辑 / 删除入口，写能力只对直连 API 的 ADMIN 可用。

## 目标

- 5 个 service（video / communication / device / hazard / specialOperation）补齐 create / update / delete。
- 9 个视图组件补 `MgmtRecordEditDialog` 写弹窗、新增按钮与操作列，并用 `v-permission` 挂载权限码。
- 定位是字符串自然键的域，编辑态禁用该字段，与后端「不以请求体覆盖定位键」的修复对齐。

## 非目标

- 不改动既有的读逻辑、筛选、分页、tab 与 `useDomainAutoRefresh` 订阅。
- 不改 `MgmtRecordEditDialog` 组件本身（字符串定位键由页面内 `editKey` 判定新增 / 更新）。
- 不新增 spec 测试文件（另见订阅接线 spec 的 change）。
