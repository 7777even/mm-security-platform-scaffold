# Tasks: 七域写 UI 闭合

## 实现

- [x] src/services/video.ts 增 createVideoCamera / updateVideoCamera / deleteVideoCamera
- [x] src/services/communication.ts 增通讯设备与通讯记录各 3 个写方法
- [x] src/services/device.ts 增 createDevice / updateDevice / deleteDevice（按 code）
- [x] src/services/hazard.ts 增危险源与监测点位各 3 个写方法
- [x] src/services/specialOperation.ts 增 createSpecialOperation / updateSpecialOperation / deleteSpecialOperation
- [x] VideoMgmtView 补 CRUD 与 video:camera-write 权限按钮
- [x] BroadcastDeviceView / PhoneMgmtView / RadioMgmtView 补 CRUD 与 communication:device-write
- [x] CommRecordView 补 CRUD，保留五路由共用的 recordType 机制，recordNo 编辑态禁用
- [x] DeviceView 补 CRUD，保留 status 筛选与分页，deviceCode 编辑态禁用
- [x] HazardMgmtView 补 CRUD，保留三 tab 与空态结构
- [x] MonitorPointView 补 CRUD，点位 id 编辑态禁用
- [x] SpecialOpsView 补 CRUD，保留类型 / 等级 / 状态筛选与分页

## 验证

- [x] npx vue-tsc --noEmit EXIT=0
- [x] npx eslint 全部改动文件 0 error
- [ ] SUBAPP_NO_EMPTY=1 npm run build:subapps 12 子应用全绿
- [ ] 按 scope 拆分提交推送（feat(mgmt) / docs(mgmt)），关联本 Change 归档
