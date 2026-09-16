# Spec Delta: mgmt 通讯通知管理（五页真后端化）

## ADDED

### Requirement: 通讯通知记录页服务驱动渲染

mgmt 端 `/comm-sms`、`/comm-call`、`/comm-broadcast`、`/comm-push`、`/comm-intercom`
SHALL 由服务驱动视图渲染（不再使用 `module-embed` iframe 占位），
数据来源 SHALL 为 `GET /api/v1/communication/records?type=`。

#### Scenario: 进入短信记录页

- **WHEN** 用户访问 `/comm-sms`
- **THEN** 页面标题为「短信记录」，表格列为记录编号/发送时间/发送人/接收号码/短信类型/内容摘要/状态，
  且数据来自 `type=sms` 的接口响应

#### Scenario: 接口失败不落假数据

- **WHEN** 接口请求失败
- **THEN** 表格置空并提示错误，SHALL NOT 回退渲染任何演示数据

## 约束

- `src/data/protoPages.ts` 清单 SHALL 保持不变（原型兜底能力与一致性守护不受影响）。
- 五页 SHALL 共用同一视图组件，按 `route.path` 区分记录类型与列定义。
