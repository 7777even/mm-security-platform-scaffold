# Design: dashboard-alarm-trend-daily（前端）

## 数据来源与口径

- 主告警：`fac_alarm`（已删除 `deleted=0`），发生时间 `occurred_at`（LocalDateTime）。
- 周界入侵告警：`fac_perimeter_alarm`，`alarm_time`（VARCHAR，`yyyy-MM-dd HH:mm:ss`，可字典序比较）。
- 当天总数 = 当日两类告警发生数之和；无报警的日子 `count=0`，保证前端拿到完整 7 点序列。

## 后端聚合（DashboardService.trendDaily）

- 窗口：`today = now.toLocalDate()`，取 `today-6 .. today` 共 7 天。
- `fac_alarm`：`selectList` 带 `ge(occurredAt, 窗口起点)` + `le(occurredAt, today 23:59:59)`，按 `toLocalDate()` 累加。
- `fac_perimeter_alarm`：`selectList` 带 `ge(alarmTime, 窗口起点字符串)` + `le(alarmTime, today 23:59:59 字符串)`，解析 `alarm_time` 按 `toLocalDate()` 累加；格式异常行跳过。
- 输出 7 个 `AlarmTrendPoint`，日期标签 `MM-dd`，按天升序（左→右 = 旧→今），形成趋势曲线。
- 缓存：沿用 `trendCache`（HOURS 键 + 10s TTL），今天新增报警 10s 内反映到「今天」桶。

## 前端消费（AlarmTrendPanel）

- `fetchAlarmTrend()` 返回 `AlarmTrendPoint[]`（`date` + `count`）。
- ECharts line：`xAxis.data = points.map(p => p.date)`，`series.data = points.map(p => p.count)`。
- 断网兜底：内置 `alarmTrendData`（7 日数值）+ 7 个日期标签，保证 UI 可见。

## 契约四同步

- `docs/api/dashboard.openapi.json`：`AlarmTrendPoint.hour→date`、summary/description/example 改为近 7 天按天。
- `npm run gen:api-types` 重新生成 `src/types/generated/dashboard.ts`。
- 后端 DTO/Service/Controller 同步为 `date` + 7 桶。
- 守门：`backend/scripts/check-api-contract.mjs --strict` 路由 + schema 双层对拍。
