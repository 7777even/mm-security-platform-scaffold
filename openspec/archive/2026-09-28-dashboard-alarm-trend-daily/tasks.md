# Tasks: dashboard-alarm-trend-daily（前端）

## 1. 契约变更

- [x] `dashboard.openapi.json`：`AlarmTrendPoint.hour→date`、summary/description/example 改为近 7 天按天
- [x] `npm run gen:api-types` 重新生成 `src/types/generated/dashboard.ts`

## 2. 后端实现

- [x] `AlarmTrendPoint` DTO：`hour`→`date`
- [x] `DashboardService.trend24h`→`trendDaily`：近 7 天按自然日聚合 fac_alarm + fac_perimeter_alarm
- [x] `DashboardController` 调用 `trendDaily`
- [x] `DashboardServiceTest` / `DashboardControllerTest` 对齐 7 桶与 `date` 字段

## 3. 前端消费

- [x] `alarm.ts`：`AlarmTrendPoint` 接口 `hour`→`date`
- [x] `AlarmTrendPanel.vue`：用 `date` 作 X 轴、兜底标签改 7 天日期
- [x] `mocks/fixtures.ts`：`trendFixture` 改 7 日桶
- [x] `securityMock.ts`：`alarmTrendData` 改 7 日值
- [x] `devMock.spec.ts`：断言 7 点

## 4. 验证与守门

- [x] 后端 `mvn test` 通过（DashboardServiceTest 7/7、DashboardControllerTest 4/4）
- [x] 前端 `vue-tsc` 类型检查 + `build:subapps(fm-security)`
- [x] `check-api-contract.mjs --strict` 后端契约守门通过
- [x] 重启后端 curl 验证返回 7 天桶
