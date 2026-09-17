# 设计文档：全量数据变更实时刷新（realtime-data-sync）

## 目标与约束

- 目标：写操作后，三端对应域数据秒级自动刷新，无需手动刷新或重进页面。
- 硬约束：零下行控制红线（只触发客户端 refetch，不下发控制）；复用既有 `/ws/alarm` 连接与 `ws.ts` 心跳 / 重连；`realtime-channel` 既有三需求不退化。

## 架构与方案

- `realtime.ts` dispatch 路由：
  - 收到 `{topic, payload}`：若 `topic === 'alarm.push'` → 原 alarm 入库 / 监听逻辑；若 `topic` 以 `.changed` 结尾 → `domain = topic.slice(0, -'.changed'.length)`，调用 `domainRefreshHandlers.get(domain)` 全部钩子。
  - 新增 `subscribeDomainChange(domain, handler): () => void`（返回退订），与 `subscribeAlarmPush` 并列。
- 域 store 接线：各域 store 暴露 `refresh()`/`invalidate()`；在 store 初始化或对应页面 / 子应用激活时调用 `subscribeDomainChange(domain, () => store.refresh())`，组件卸载 / 子应用卸载时退订防泄漏（沿用 `subscribeAlarmPush` 的退订约定）。
- 客户端去抖：同域短时间内多次 `.changed` 合并为一次 refetch（如 300–500ms 去抖），避免广播风暴（后端高频写场景）。
- 三端共用：mgmt / screen / mobile 各自需要的域 store 均走此机制，写后自动刷新；大屏面板、移动端列表 / 详情均受益。

## 决策记录（ADR）

- ADR-1 整域 refetch 而非增量合并：收到 `.changed` 即整域重新拉取，规避脆弱的增量合并与 id 解析；域刷新非高频，成本可接受。
- ADR-2 域钩子注册式而非硬编码 switch：各域自行 `subscribeDomainChange`，新增域零改 `realtime.ts` 核心，符合开闭原则。
- ADR-3 客户端去抖：同域合并，缓解后端高频写造成的重拉。

## 风险与缓解

| 风险                            | 影响               | 缓解                                                      |
| ------------------------------- | ------------------ | --------------------------------------------------------- |
| 某域 store 未订阅导致该域不刷新 | 局部不实时         | 列清单逐域接线 + 单测断言订阅触发刷新                     |
| 退订遗漏致内存泄漏 / 陈旧刷新   | 子应用卸载后仍刷新 | 沿用 subscribeAlarmPush 退订约定，组件 / 子应用卸载时退订 |
| alarm 消费路径回归              | 大屏告警流异常     | 保留 alarm.push 原逻辑 + 既有 ws / realtime 单测不破      |

## 依赖

- 上游：后端 Change `realtime-broadcast`（`<domain>.changed` 广播）；`realtime.openapi.json` 契约扩展。
- 下游：大屏 / 管理端 / 移动端各域面板与列表。
