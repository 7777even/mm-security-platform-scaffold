# Spec: dashboard（指挥大屏聚合）

> 大屏首页聚合接口的查询与展示能力。来源 Change：`openspec/changes/2026-09-28-dashboard-alarm-trend-daily/`（已归档）。

## 职责边界

- 数据真源为后端 `GET /api/v1/dashboard/*`（契约见 `docs/api/dashboard.openapi.json`）。
- 前端 `src/services/alarm.ts` 提供 `fetchAlarmTrend`；`AlarmTrendPanel` 用其渲染趋势曲线。
- 后端 `DashboardService` 聚合 `fac_alarm`（主告警）+ `fac_perimeter_alarm`（周界告警）。

## Requirements

### Requirement: 告警趋势按天统计

`GET /api/v1/dashboard/alarm-trend` SHALL 返回近 7 天（含今天）每天一个桶，每桶 `date`（如 "09-22"）+ `count`（当天 `fac_alarm` 主告警与 `fac_perimeter_alarm` 周界告警发生总数）；无报警的日子 `count=0`，形成按天趋势曲线。今天刚新增的报警应即时计入「今天」桶。

#### Scenario: 正常返回 7 天趋势

- **WHEN** 前端请求 `GET /api/v1/dashboard/alarm-trend`
- **THEN** 返回 7 个 `AlarmTrendPoint`，`date` 为近 7 天日期标签（升序）、`count` 为各天报警总数；今天新增的报警计入「今天」桶

#### Scenario: 某天无报警

- **WHEN** 近 7 天中存在无报警的日子
- **THEN** 该天桶 `count=0` 仍出现在序列中，保证前端 X 轴 7 点完整

## 约束

- `AlarmTrendPoint` 字段：`date`（String, "MM-dd"，日期标签）/ `count`（integer，当天报警数）。
- 后端聚合窗口：`today = now.toLocalDate()`，取 `today-6 .. today` 共 7 个自然日；`fac_alarm` 按 `occurred_at`、`fac_perimeter_alarm` 按 `alarm_time`（VARCHAR `yyyy-MM-dd HH:mm:ss`，可字典序比较）归到自然日。
- 缓存沿用 `trendCache`（HOURS 键 + 10s TTL），今天新增报警 10s 内反映到「今天」桶。
- 前端 `AlarmTrendPanel` 用 `date` 作 X 轴、`count` 作 Y 轴；断网兜底用内置 7 日数值 + 日期标签，SHALL NOT 回退与真实数据口径冲突的演示曲线。
