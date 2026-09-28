# Proposal: dashboard-alarm-trend-daily（前端）

## 问题

`GET /dashboard/alarm-trend` 当前契约返回 24 个「小时桶」（`hour`/`count`），语义是近 24 小时按小时聚合。
但业务侧要的是**近 7 天每天一条**的趋势曲线：X 轴为日期、Y 轴为当天报警总数，今天刚新增的报警要即时计入「今天」那个点。
原「按小时聚合」无法表达跨天趋势，且与「今天新增应被记录」的预期冲突。

## 方案

将响应形状从「24 个按小时桶」改为「7 个按天桶」：

- `AlarmTrendPoint.hour`（String, "08:00"）→ `AlarmTrendPoint.date`（String, "09-22"），`count` 语义由「该小时报警数」改为「当天报警数」。
- 后端 `DashboardService.trend24h` → `trendDaily`：窗口改为近 7 天（含今天），按自然日聚合 `fac_alarm`（主告警）+ `fac_perimeter_alarm`（周界告警）的当日发生总数，输出 7 个按天升序排列的桶。
- 前端 `AlarmTrendPanel` 用 `date` 作 X 轴标签；dev mock（`trendFixture` / `alarmTrendData`）与兜底标签同步为 7 日。

## 影响面

- 契约：`dashboard.openapi.json` 的 `AlarmTrendPoint` 与 `getAlarmTrend` 示例。
- 前端：`alarm.ts` 类型、`AlarmTrendPanel.vue`、`mocks/fixtures.ts`、`securityMock.ts`、`devMock.spec.ts`。
- 后端：`AlarmTrendPoint` DTO、`DashboardService`、`DashboardController`、两个测试类。
- 属 L3 契约形状变更，走四同步（openspec + 契约 + 后端实现 + 生成类型）。
