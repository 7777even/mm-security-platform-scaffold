# Tasks: 写端点契约四同步与视图实时订阅

## 实现

- [x] device.openapi.json 补 POST /devices 与 PUT、DELETE /devices/{code}
- [x] device.openapi.json 新增 DeviceWriteRequest schema（7 字段）与本域 DeleteResult
- [x] communication.openapi.json 补 POST /communication/records 与 PUT、DELETE /communication/records/{recordNo}
- [x] communication.openapi.json 新增 CommRecordWriteRequest schema（12 字段）
- [x] DeviceView 接入 useDomainAutoRefresh(device)
- [x] CommRecordView 接入 useDomainAutoRefresh(communication.record)

## 验证

- [x] npm run gen:api-types 全 33 域生成成功、无 $ref 解析失败
- [x] npm run type-check（vue-tsc）通过
- [x] SUBAPP_NO_EMPTY=1 npm run build:subapps 12 个子应用全部构建通过
- [x] 后端 check-api-contract.mjs --strict：schema 漂移 0，本批 6 条写路由全部对齐（路由差异维持基线 12）
- [x] 双仓提交并按 scope 推送（contract / mgmt / docs），关联本 Change 归档
