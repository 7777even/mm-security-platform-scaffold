# Tasks: 写端点契约四同步与 5 视图实时订阅

## 实现

- [x] video.openapi.json 补 POST /video/cameras 与 PUT、DELETE /video/cameras/{id}
- [x] video.openapi.json 新增 VideoCameraWriteRequest schema（6 字段）
- [x] communication.openapi.json 补 POST /communication/devices 与 PUT、DELETE /communication/devices/{id}
- [x] communication.openapi.json 新增 CommDeviceWriteRequest schema（15 字段）与本域 DeleteResult
- [x] VideoMgmtView / VideoHealthView 接入 useDomainAutoRefresh(video.camera)
- [x] BroadcastDeviceView / PhoneMgmtView / RadioMgmtView 接入 useDomainAutoRefresh(communication.device)

## 验证

- [x] npm run gen:api-types 全 33 域生成成功、无 $ref 解析失败
- [x] npm run type-check（vue-tsc）通过
- [x] SUBAPP_NO_EMPTY=1 npm run build:subapps 12 个子应用全部构建通过
- [x] 后端 check-api-contract.mjs --strict：schema 漂移 0，本批 6 条写路由全部对齐
- [x] 双仓提交并按 scope 推送（contract / mgmt / docs），关联本 Change 归档
