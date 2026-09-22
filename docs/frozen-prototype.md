# 原型占位冻结清单（Prototype Freeze List）

> 本文件定义「原型占位红线」：这些页面**不接本仓后端、保持 iframe 原型演示形态**，不在「业务域剩余闭环（④）」范围内。
> 冻结原因：后端无对应生产端点 / 本期非生产必需 / 纯流程演示空壳。冻结不删除、不改写，保留原型演示价值。

## 冻结页面（mgmt 端）

> **已全部解除冻结**：原唯一冻结页 `/form`（流程填报向导）经跨库四同步新增后端 `POST/PUT /api/v1/form-records`（Change：`openspec/changes/2026-09-22-add-form-records-write/`，两端各一），前端改为服务驱动视图 `apps/mgmt/views/form-wizard.vue`（列表 + 多步填报向导 + ADMIN 审核），解除冻结。

> **已解除冻结（mgmt 端，2026-09-16）**：`/comm-sms`、`/comm-call`、`/comm-broadcast`、`/comm-push`、`/comm-intercom`
> 经跨库四同步新增后端 `GET /api/v1/communication/records`（Change：`openspec/changes/2026-09-16-add-comm-records-domain/`，两端各一），
> 前端改为服务驱动视图 `apps/mgmt/views/comm/CommRecordView.vue`（五页共用，按 `route.path` 区分记录类型与列定义）。
> 原冻结原因「CommDeviceController 仅有设备、无通知记录端点」由新增 `CommRecordController` + `fac_comm_record` 表消除。

## 冻结页面（mobile 端）

以下 mobile 视图后端无对应 REST 端点，冻结为原型红线（不接本仓后端），待建后端端点后解除：

- （暂无。`/tasks`、`/drills`、`/msds` 均已建后端并解除冻结，见下方「已解除冻结」。）

> **已解除冻结**（原 ④-A 冻结，2026-09-16 真后端化，端点见括注）：`/orders`、`/orders/:id`（fireFacility work-orders）、`/tickets`、`/ticket-exec`（specialOperation）、`/patrols`、`/patrol-exec`（fireMonitoring）、`/contacts`（emergencyPhone）、`/duty`（duty）、`/videos`、`/videos/:id`（video）、`/library`（knowledge）、`/resources`（rescueResource）、`/ops`（device）、`/plans`、`/plans/:id`（emergencyPlan）。events / alarms / messages 归 ④-E 已于更早接后端，不在此列。
>
> **2026-09-16 追加**：`/tasks`、`/tasks/:id`、`/path`（处置任务域）经跨库四同步新增后端 `GET /api/v1/tasks`（Change：`openspec/changes/2026-09-16-add-tasks-domain/`，两端各一）解除冻结。
>
> **2026-09-16 追加**：`/drills`、`/drills/:id`（应急演练域）经跨库四同步新增后端 `GET /api/v1/drills`（Change：`openspec/changes/2026-09-16-add-drills-domain/`，两端各一）解除冻结。
>
> **2026-09-16 追加**：`/msds`、`/msds/:cas`（化学品 MSDS 域）经跨库四同步新增后端 `GET /api/v1/msds`（按 CAS 详情，Change：`openspec/changes/2026-09-16-add-msds-domain/`，两端各一）解除冻结。

## 不接后端原则

1. 冻结页维持 `module-embed.vue` 的 iframe 加载 `public/pc-admin` 原型，不在 `SERVICE_PATHS` 登记、不建真 service 视图。
2. 后续若产品决定上线某冻结域，须先在对应端建 L4 openspec Change + 后端端点 + 契约四同步，再解除冻结。
3. 本清单随④推进更新；解除冻结的域须从本表移除并加注释说明来源 Change。

---

_生成于 2026-09-15，④-A 任务产出。_
