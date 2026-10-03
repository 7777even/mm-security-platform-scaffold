# Tasks: 三批订阅接线补充单测

## 实现

- [x] 新增 MonitorCommProductionSubscriptionViews.spec.ts，mock video / communication / device / hazard / specialOperation 五个 service
- [x] mock @/services/realtime 捕获 subscribeDomainChange 与退订
- [x] video.camera：VideoMgmtView / VideoHealthView 订阅、退订、回调重拉
- [x] communication.device：BroadcastDeviceView / PhoneMgmtView / RadioMgmtView 订阅、退订、回调重拉
- [x] communication.record：CommRecordView 订阅与退订（mock vue-router useRoute）
- [x] device：DeviceView 订阅与退订
- [x] hazard / hazard.point：HazardMgmtView / MonitorPointView 订阅、退订，并断言两域不串台
- [x] special-operation：SpecialOpsView 订阅、退订，并断言重拉保留分页过滤参数

## 验证

- [x] npx vitest run 目标文件：14 例全通过
- [x] npx vue-tsc --noEmit 通过
- [x] npx eslint 目标文件 0 error
- [ ] 按 scope 拆分提交推送（test / docs），关联本 Change 归档
