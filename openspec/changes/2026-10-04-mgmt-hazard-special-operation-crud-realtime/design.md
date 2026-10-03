# Design: 契约四同步与订阅接线

## 决策

### 1. 契约是唯一真源

`docs/api/*.openapi.json` 是前端契约真源，TS 类型由 `npm run gen:api-types` 单向生成，不可手改 `src/types/generated/`。本批两份契约的写端点 paths 与后端 Controller 逐字对齐：PUT / DELETE 挂在 `/{id}` 子路径而非集合路径——挂错集合路径会同时产生「契约有实现无」与「实现有契约无」两条差异，使 `check-api-contract` 的路由差异数从基线 12 抬升。

### 2. DeleteResult 各域本地定义

两份契约各自声明本域 `DeleteResult`，不跨域引用——跨域 `$ref` 一旦不可解析，该域整份类型生成静默失败（脚本仅在逐域行打 ✗、末尾仍打「生成完成」），必须 `grep "✗\|Can't resolve"` 复核。

### 3. 订阅一律走 useDomainAutoRefresh

三个视图复用既有 composable（自带 onMounted 订阅 / onUnmounted 退订），不手写 `subscribeDomainChange`。订阅域与后端 `@RealtimeSync` 的 domain 字面量一一对应：HazardMgmtView→`hazard`、MonitorPointView→`hazard.point`、SpecialOpsView→`special-operation`。

### 4. 重拉保留当前查询条件

`SpecialOpsView` 的 `load` 带类型 / 等级 / 状态过滤与分页，`useDomainAutoRefresh` 回调复用该函数而非重置页码或清空筛选，避免收到广播时把用户的检索上下文冲掉。

## 验证口径

- 类型生成后确认 33 域全成功且无 `$ref` 解析失败。
- `check-api-contract.mjs --strict` 的路由差异须维持基线 12（涨了即本批引入新债）。
