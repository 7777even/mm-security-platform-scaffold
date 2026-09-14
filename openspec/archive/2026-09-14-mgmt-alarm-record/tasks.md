# 任务：后台管理端报警管理域·报警记录页接后端

> 单条 ≤2h；完成标准见 `openspec/changes/2026-09-14-mgmt-alarm-record/` 与根 `AGENTS.md` §5 DoD。

## 1. 路由优先命中真实视图（mgmt）

- [x] `apps/mgmt/router.ts`：`SERVICE_PATHS` 加入 `'/alarm-record'`；`serviceRoutes` 新增 `/alarm-record` → `AlarmRecordView.vue`（`meta.title='报警记录'`）。
- [x] 验收：访问 `/apps/mgmt/alarm-record` 命中真实视图而非 `module-embed.vue` 兜底页。

## 2. 报警记录页（只读订阅）

- [x] `apps/mgmt/views/alarm/AlarmRecordView.vue`（`/alarm-record`）：`fetchAlarmPage` 分页 + 级别/状态筛选 + 8 列呈现 + 中文映射 + `.tag-*` 着色 + 时间格式化。
- [x] 筛选卡：级别（`el-select` 一级~四级）、状态（`el-select` 活动/已确认/已派发/已闭环），查询/重置；`loading` 经 `v-loading` 接入 `MgmtProTable`。
- [x] 三态纪律：后端不可用时显式提示 + 空态，不回灌内存 mock。
- [x] 验收：列表/分页/筛选/着色均来自真实 `GET /alarms`；级别/状态/类型/预警着色与中文映射正确。

## 3. service 扩展（向后兼容）

- [x] `src/services/alarm.ts`：`fetchAlarmPage(page, size, query?)` 透传 `level/status`（非空），默认行为不变；移动端既有调用无影响。
- [x] 验收：契约零漂移（`alarm.openapi.json` / `types/generated/alarm.ts` 未改）；旧调用方行为不变。

## 4. 门禁与文档

- [x] `apps/mgmt/**` 纳入统一 `tsconfig` 后 `vue-tsc` 0 错（与系统管理域共用机制）；eslint 0 error（本次文件不在 warning 清单）。
- [x] openspec 四件套 + `.openspec.yaml`（本 Change）。
- [x] `npx vite build --outDir dist-verify-mgmt-alarm` 通过（EXIT=0；改用全新 outDir 规避 safe-delete 守卫对旧 `dist/` 的批量删除拦截，与代码无关）。
- [x] 浏览器内视觉走查（agent-browser 0.27，dev `:5174`，实测 2026-09-14）：`/apps/mgmt/alarm-record` 渲染真实后端分页数据——列含 `2026-09-02 14:30` / `装置C气体检测仪-G01 泄漏` / `气体` / `三级` / `装置C` / `FAC2026GASA000000001` / `已确认` / `否` 等；`Total 14`、分页 1/2、每页 10 条；着色与中文映射正常；前端运行期零错误。截图证据：`ab-shots/alarm-record.png`。
- [ ] 待办（下一批）：报警规则配置页（待后端 `AlarmRule` 端点）；报警确认/派发/删除写操作（待后端 `Alarm` 状态变更端点）。

## 5. 提交（按 scope 拆分，单行标题）

- [x] `feat(mgmt)`：mgmt 路由注册 `/alarm-record` + `AlarmRecordView.vue` + `fetchAlarmPage` 扩展。
- [x] `chore:`：本 openspec 变更归档（tasks 全勾后 `git mv` 至 `archive/2026-09-14-mgmt-alarm-record`）。
