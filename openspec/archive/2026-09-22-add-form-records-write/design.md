# 设计文档：流程填报向导真后端化（mgmt /form）

## 目标与约束

- 解冻 `/form` 空壳，提供「列表 + 多步向导 + 审核」闭环。
- 结构化填报内容以 `detailJson`（JSON 字符串）按 `formType` 维度组织；`formType` 固定枚举（隐患排查 / 设备巡检 / 值班交接 / 其他）。
- 对齐通讯通知记录域（comm）的服务驱动范式。

## 架构与方案

- 服务层 `src/services/formRecords.ts` 复用 `@/services/http` 的 B3 解包；与 `communication.ts` 同构。
- 视图复用 `MgmtProTable` / `MgmtPageHead`；向导用 `el-steps` 三步（选类型 → 填内容 → 预览提交）。
- ADMIN 审核按钮经 `useAuthStore().roles` 判定显隐，`PUT` 将 `status` 流转到 `REVIEWED`。
- 结构化字段按类型在视图内以 `TYPE_FIELDS` 配置驱动渲染，提交时 `JSON.stringify` 进 `detailJson`。

## 决策记录（ADR）

- 决策 1：`detailJson` 而非单文本 — 理由：多步向导三类结构不同，单文本装不下；反对项：单文本更简单，但与「向导」语义不符。
- 决策 2：`formType` 枚举而非自由串 — 理由：前端可出下拉、后端强校验，避免脏数据。

## 风险与缓解

| 风险                               | 可能影响               | 缓解措施                                        |
| ---------------------------------- | ---------------------- | ----------------------------------------------- |
| 后端三方言未实跑（H2 外无 Docker） | PG/DM 迁移语法风险     | 按 V27 先例写 `LONGVARCHAR`/`TEXT`，上环境复核  |
| 权限依赖 role ADMIN                | 非管理员看不到审核按钮 | 视图经 `auth.roles` 判定，后端 PUT 仍硬控 ADMIN |

## 依赖

- 上游：后端 `POST/PUT /api/v1/form-records`（本变更双端 Change）。
- 下游：mgmt `/form` 路由页面。
