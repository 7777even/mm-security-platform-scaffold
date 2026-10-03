# Tasks: 写端点契约四同步与视图实时订阅

## 实现

- [x] hazard.openapi.json 补 POST /hazards 与 PUT、DELETE /hazards/{id}
- [x] hazard.openapi.json 补 POST /monitoring/points 与 PUT、DELETE /monitoring/points/{id}
- [x] hazard.openapi.json 新增 MajorHazardWriteRequest（10 字段）、MonitoringPointWriteRequest（8 字段）与本域 DeleteResult
- [x] special-operation.openapi.json 补 POST /special-operations 与 PUT、DELETE /special-operations/{id}
- [x] special-operation.openapi.json 新增 SpecialOperationWriteRequest（26 字段）与本域 DeleteResult
- [x] HazardMgmtView 接入 useDomainAutoRefresh(hazard)
- [x] MonitorPointView 接入 useDomainAutoRefresh(hazard.point)
- [x] SpecialOpsView 接入 useDomainAutoRefresh(special-operation)

## 验证

- [x] npm run gen:api-types 全 33 域生成成功、无 $ref 解析失败
- [x] npm run type-check（vue-tsc）通过
- [x] SUBAPP_NO_EMPTY=1 npm run build:subapps 12 个子应用全部构建通过
- [x] 后端 check-api-contract.mjs --strict：schema 漂移 0，本批 9 条写路由全部对齐（路由差异维持基线 12）
- [ ] 双仓提交并按 scope 推送（contract / mgmt / docs），关联本 Change 归档
