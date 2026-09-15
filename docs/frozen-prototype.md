# 原型占位冻结清单（Prototype Freeze List）

> 本文件定义「原型占位红线」：这些页面**不接本仓后端、保持 iframe 原型演示形态**，不在「业务域剩余闭环（④）」范围内。
> 冻结原因：后端无对应生产端点 / 本期非生产必需 / 纯流程演示空壳。冻结不删除、不改写，保留原型演示价值。

## 冻结页面（mgmt 端）

| 路径              | 当前形态                                       | 冻结原因                                                                    |
| ----------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `/form`           | `apps/mgmt/views/form-wizard.vue` 流程填报向导 | 纯原型空壳，无后端填报存储端点                                              |
| `/comm-sms`       | module-embed iframe 占位                       | 通讯记录类，本期非生产必需（CommDeviceController 仅有设备、无通知记录端点） |
| `/comm-call`      | module-embed iframe 占位                       | 同上                                                                        |
| `/comm-broadcast` | module-embed iframe 占位                       | 同上                                                                        |
| `/comm-push`      | module-embed iframe 占位                       | 同上                                                                        |
| `/comm-intercom`  | module-embed iframe 占位                       | 同上                                                                        |

## 冻结页面（mobile 端）

以下 mobile 视图引 `../data/mock` / `../data/geo` 静态数据，且后端无对应端点，冻结为原型红线（不接本仓后端）：

- `/tasks`、`/orders`、`/tickets` 等无后端端点的 mock 页（注：events / alarms 有后端端点，归 ④-E 接后端，不在此冻结）

## 不接后端原则

1. 冻结页维持 `module-embed.vue` 的 iframe 加载 `public/pc-admin` 原型，不在 `SERVICE_PATHS` 登记、不建真 service 视图。
2. 后续若产品决定上线某冻结域，须先在对应端建 L4 openspec Change + 后端端点 + 契约四同步，再解除冻结。
3. 本清单随④推进更新；解除冻结的域须从本表移除并加注释说明来源 Change。

---

_生成于 2026-09-15，④-A 任务产出。_
