# Design: fire-alarm-crud

## Payload 与类型对齐

`FireAlarmEditPayload` 为后端 `FireAlarmCreateRequest` 与全字段 `FireAlarmUpdateRequest` 的**并集**
（19 字段，`title`/`time` 必填，其余可选）。`createFireAlarm` 与 `updateFireAlarm(fullPayload)` 共用该类型，
编辑态带 `alarmId` 走 `update`、新增态不带走 `create`——对话框一处提交逻辑覆盖两种模式。

## 离线语义

- `useDevMock()` 为真：`createFireAlarm` 返回 `{ alarmId: "FA-MOCK-<ts>", ...payload }` 假对象，
  `deleteFireAlarm` 直接 resolve（不落库，仅前端会话态成功）。
- `isAlarmOffline()` 为真（未配 `VITE_API_BASE` 且未开 `VITE_USE_DEV_MOCK`）：调用 `notifyBackendOffline`
  报错并 `throw`，避免静默失败。
- 正常态：`request({ url:'/fire-alarms', method:'POST', data:payload })` /
  `request({ url:'/fire-alarms/<id>', method:'DELETE' })`，由 `http.ts` 解 B3 包络并抛 `ApiError`。

## 实时订阅（三端联通）

- 管理端列表：`onMounted` 注册 `const unsub = subscribeDomainChange('fire-alarm.alarm', load);`，
  `onUnmounted(unsub)`；后台 / 大屏任意写操作广播 `fire-alarm.alarm.changed` 后，列表在 400ms 去抖内自动 `load()`。
- 大屏：`FireMonitoring.vue` 复用已导入的 `refreshScreenFireAlarms`，挂同一域订阅，`onUnmounted` 退订；
  与既有 `onMounted(() => void refreshScreenFireAlarms())` 首次拉取并存，不冲突。
- `subscribeDomainChange(domain, handler)` 签名与 `realtime.ts` 一致，返回退订函数。

## 对话框与操作列

- `FireAlarmEditDialog.vue`：`<el-dialog :model-value="modelValue">` + `v-model` 表单全字段；
  `rules` 仅 `title`/`time` 必填；提交 `validate` 成功后按 `form.alarmId` 有无分流 create/update，
  成功 `ElMessage.success` 并 `emit('saved')` + `emit('update:modelValue', false)`。
- `AlarmRecordView.vue`：新增按钮开 `openCreate()`（editRow=null）；行「编辑」开 `openEdit(row)`；
  行「删除」`ElMessageBox.confirm` 确认后 `deleteFireAlarm(row.alarmId)` 再 `load()`；
  `STATUS_TEXT`/`STATUS_TAG` 补 `DISPATCHED:'已派单'`/`ACKED:'已确认'`，`el-select` 选项同步。

## 大屏浮层 vs 残影

本变更**只挂订阅**，不新增浮层 / 弹窗；`/fire` 大屏既有渲染层与 `requestRenderMode` 策略不变，
避免引入「残影」类回归（详见项目记要「残影 vs 面板本体」）。
