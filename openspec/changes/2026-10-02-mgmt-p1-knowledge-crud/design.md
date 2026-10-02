# Design: 应急知识库管理页接入 CRUD

## 1. 为什么复用 MgmtRecordEditDialog 而不是手写弹窗

管理端其余台账页（救援资源四页、应急事件等）已统一用 `MgmtRecordEditDialog` + `FieldDef[]`
驱动表单。知识库字段简单（title 必填、count 数字、icon 文本、description 文本域），
完全契合通用弹窗模型，避免重复实现校验/保存/关闭逻辑。

`editRow` 直接 `{ ...row }` 灌入；保存时 `MgmtRecordEditDialog` 仅提交非 `undefined` 的字段，
天然实现后端「局部更新」语义（未改字段不回传 → service 判定为 null 不修改）。

## 2. 为什么 id 用 Number 转换

只读 DTO `KnowledgeItem.id` 为 `string`（后端 `String.valueOf(id)`，与契约一致），
而写端点路径参数 `{id}` 为 integer。通用弹窗内部 `recordId` 已 `Number(raw)` 处理，
故写侧 `updateKnowledge(Number(row.id), body)` / `deleteKnowledge(Number(row.id))`
无契约漂移、无需改 DTO。

## 3. 为什么实时订阅复用 useDomainAutoRefresh

跨懒加载路由的盘点订阅必须扫 `useDomainAutoRefresh` composable（而非手写 `subscribeDomainChange`），
它在 onMounted 订阅、onUnmounted 退订，避免订阅泄漏。知识库页挂载即订阅 `emergency.knowledge`，
与救援资源等页同口径。

## 4. 权限门禁复用 v-permission 指令

`v-permission="'emergency:knowledge:write'"` 指令直接读 RBAC 持有的权限码集合，
与后端 V94 种子授权口径一致；未授权用户看不到新增/编辑/删除按钮，且即便绕过按钮也受后端 403 拦截。
