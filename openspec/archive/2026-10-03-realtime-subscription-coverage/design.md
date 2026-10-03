# Design: 实时订阅覆盖补齐

## 接线方式

统一改用 `useDomainAutoRefresh(domain, fetcher)` composable（自带 onMounted 订阅 / onUnmounted 退订，替代手写 `subscribeDomainChange`），在组件挂载后订阅 `<domain>.changed`，变更到达即调用 fetcher 只读重拉；回调无下行控制。

## 域映射

- 每个视图订阅其展示数据对应的业务域（与后端 `@RealtimeSync(domain=...)` 一致）。
- 通用台账 25 域共用单一 `mgmt-ledger` 通道（后端广播常量域），前端 `MgmtLedgerView` 仅重拉自身路由域，跨域重拉无害。
- resources 视图展示 4 类救援资源，订阅 4 个域（rescue.vehicle / rescue.equipment / rescue.personnel / rescue.brigade）；orders / ops-board 展示消防设施台账与故障，订阅 fire-facility.ledger / fire-facility.fault。

## 无消费者域

monitor / comm / production 域当前后端未标注 `@RealtimeSync`（无广播），对应页面暂不可订阅，待后端补注解后接入（本批不涉及）。
