# Design: 五页共用视图 + 列配置驱动

## 路由接管方式

mgmt 路由优先级：`serviceRoutes` > `moduleRoutes`（module-embed iframe / 静态兜底）。
因此只需把五路径写入 `SERVICE_PATHS` 并注册服务路由，**无需改动 `src/data/protoPages.ts`**
（该清单由 `protoPages.spec.ts` 与原型 `index.html` 的 `data-page` 一致性守护，删条目会破坏守护与兜底）。

## 单视图多页签

五页列定义不同但数据同构，`CommRecordView.vue` 以 `Record<CommunicationRecordType, ViewMeta>`
具名键配置 title / icon / iconTone / columns，按 `route.path` 取用。
用**具名键访问**（而非 `Record<string, T>` 索引）避免 strict 模式下索引取值的类型歧义。

## 列映射（对齐原型 pc-admin 各页列）

| 页面                   | 列                                                                         |
| ---------------------- | -------------------------------------------------------------------------- |
| `/comm-sms` 短信       | 记录编号 / 发送时间 / 发送人 / 接收号码 / 短信类型 / 内容摘要 / 状态       |
| `/comm-call` 通话      | 记录编号 / 通话时间 / 通话类型 / 主叫方 / 被叫方 / 通话时长 / 通话结果     |
| `/comm-broadcast` 广播 | 记录编号 / 播报时间 / 广播类型 / 内容类型 / 覆盖区域 / 关联设备 / 内容摘要 |
| `/comm-push` 推送      | 记录编号 / 推送时间 / 推送标题 / 消息类型 / 业务类型 / 推送对象            |
| `/comm-intercom` 对讲  | 记录编号 / 通话时间 / 发起人 / 通话组 / 信道频率 / 呼叫方向 / 时长         |

## 空值渲染

各类型仅填充自身字段，未使用字段后端返回空字符串；表格统一渲染 `—` 占位，不落假数据。
