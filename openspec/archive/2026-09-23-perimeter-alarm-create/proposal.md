# Proposal: perimeter-alarm-create（前端）

## 背景

配合后端 `POST /security/perimeter-alarms`（见后端同名 change），在前端「当前厂区状态」面板提供**手工创建治安报警（周界入侵告警）**的入口：按钮 + 表单弹窗，提交后即时刷新。

## 分级：L3（前端侧）

仅扩展契约 `security.openapi.json` + 生成类型 + 新增服务函数 + 面板 UI，不新增独立域。

## 范围

1. 契约：`docs/api/security.openapi.json` 新增 `POST /security/perimeter-alarms` + `PerimeterAlarmCreateRequest` schema（四条铁律：按域分组 / summary+description / 中文字段 description / 2xx 响应 example 用 B3 包络）。
2. 类型：`npm run gen:api-types` 重新生成 `src/types/generated/security.ts`。
3. 服务：`src/services/security.ts` 新增 `PerimeterAlarmCreatePayload` + `createPerimeterAlarm(payload)`（范式对齐 `updatePerimeterAlarm`）。
4. UI：`SecurityStatusPanel.vue` 加「新增治安报警」按钮（`v-permission="'security:perimeter-create'"`）+ 最小可用字段表单 Dialog；提交成功 `touchPerimeterAlarmChanged()` 即时重拉（并依赖既有 `security.perimeter-alarm` 实时订阅）。

## 人工确认关卡（与用户对齐）

- [x] **权限策略**：按钮按 `security:perimeter-create` 显隐（与后端 perm 一致）。
- [x] **表单字段（最小可用）**：告警标题（必填）、类型（默认「周界入侵告警」）、等级、位置、发生时间（默认现在可改）、说明、入侵对象名（可选）。抓拍图不传。
- [x] **创建后刷新**：成功即 `touchPerimeterAlarmChanged()`，并依赖既有实时订阅兜底。

## 不在范围

- 不上传抓拍图片；不处理演练/真实事件双模式（周界告警无演练态）。
- 不改 `src/screen/lib/data/*` mock（写操作走真实后端；离线无 VITE_API_BASE 时显式报错）。
