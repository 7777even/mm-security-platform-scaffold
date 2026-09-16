# Capability: mgmt-data-wiring

后台管理端（`apps/mgmt`）数据接入约定：视图经共享 `src/services/*` 消费真实后端，
替代 `module-embed.vue` 的 iframe 原型占位（`public/pc-admin` + `protoPages` 兜底），
使 mgmt 从原型演示态进入联调态。

与 `screen-data-wiring` / `mobile-data-wiring` 对称，分端维护「接线能力」规格。

## Requirements

### Requirement: 服务驱动视图接管 iframe 兜底

mgmt 叶子页接入后端后 SHALL 以服务驱动视图渲染：路径加入 `apps/mgmt/router.ts` 的
`SERVICE_PATHS` 并注册 `serviceRoutes`（优先级高于 `moduleRoutes` 的 `module-embed` 兜底）。
SHALL NOT 改动 `src/data/protoPages.ts` 清单——该清单由 `protoPages.spec.ts` 与原型
`index.html` 的 `data-page` 一致性守护，须保留原型兜底能力。

#### Scenario: 叶子页改接后端

- **WHEN** 某 mgmt 叶子页具备后端数据源
- **THEN** 该路径进入 `SERVICE_PATHS` + `serviceRoutes`，页面渲染真实视图而非 iframe，且 `protoPages.ts` 保持不变

#### Scenario: 兜底仍可用

- **WHEN** 某叶子页未接入后端
- **THEN** 仍由 `module-embed.vue` 渲染（命中原型页则 iframe，否则静态三态页）

### Requirement: 通讯通知记录页服务驱动渲染

`/comm-sms`、`/comm-call`、`/comm-broadcast`、`/comm-push`、`/comm-intercom` SHALL 由服务驱动视图渲染，
五页 SHALL 共用同一组件并按 `route.path` 区分记录类型与列定义，数据来源 SHALL 为
`GET /api/v1/communication/records?type=`。

#### Scenario: 进入短信记录页

- **WHEN** 用户访问 `/comm-sms`
- **THEN** 页面标题为「短信记录」、面包屑为「通讯通知管理 / 短信记录」，
  表格列为 记录编号 / 发送时间 / 发送人 / 接收号码 / 短信类型 / 内容摘要 / 状态，数据来自 `type=sms`

#### Scenario: 接口失败不落假数据

- **WHEN** 接口请求失败
- **THEN** 表格置空并提示错误，SHALL NOT 回退渲染任何演示数据

#### Scenario: 真机走查可验收

- **WHEN** 五页在运行中的后端下逐页访问
- **THEN** 每页渲染后端真实记录（行数与列值与 `fac_comm_record` 种子一致），且非 iframe 形态
