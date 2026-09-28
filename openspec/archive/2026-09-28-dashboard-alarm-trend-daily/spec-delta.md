# Spec Delta: dashboard-alarm-trend-daily（前端）

## Capability: dashboard

### ADDED

#### Requirement: 告警趋势按天统计

`GET /dashboard/alarm-trend` SHALL 返回近 7 天（含今天）每天一个桶，每桶 `date`（如 "09-22"）+ `count`（当天 `fac_alarm` 主告警与 `fac_perimeter_alarm` 周界告警发生总数）；无报警的日子 `count=0`，形成按天趋势曲线。今天刚新增的报警应即时计入「今天」桶。

##### Scenario: 正常返回 7 天趋势

- **WHEN** 前端请求 `GET /dashboard/alarm-trend`
- **THEN** 返回 7 个 `AlarmTrendPoint`，`date` 为近 7 天日期标签（升序）、`count` 为各天报警总数；今天新增的报警计入「今天」桶

##### Scenario: 某天无报警

- **WHEN** 近 7 天中存在无报警的日子
- **THEN** 该天桶 `count=0` 仍出现在序列中，保证前端 X 轴 7 点完整
