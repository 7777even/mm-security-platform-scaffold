# Spec Delta

## Capability: security

### CHANGED

- `/security/perimeter-alarms/{id}`
  - 由「仅 PUT」恢复为「GET + PUT 同 path」（`get` 此前因重复 key 被静默丢弃）
  - GET：按主键返回单条周界入侵告警详情（operationId: `getPerimeterAlarm`）
  - PUT：周界入侵告警写回（operationId: `updatePerimeterAlarm`，perm `security:perimeter-ack`）
