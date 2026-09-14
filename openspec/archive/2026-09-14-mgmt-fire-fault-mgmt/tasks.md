# 任务清单

- [x] 新建 `FaultMgmtView.vue`，接 `fetchFireFacilityFaults` 并渲染 7 列表格
- [x] 在 `apps/mgmt/router.ts` 的 `SERVICE_PATHS` + `serviceRoutes` 注册 `/fault-mgmt`
- [x] 筛选项对齐后端真实枚举（级别=紧急/重要/一般；状态=确认→派单→处置→验收→完成生命周期）
- [x] 级别与状态列按语义着色
- [x] 运行 `vue-tsc` 全项目 0 错
- [x] 运行 `eslint` 目标文件 0 error
- [x] `vite build --outDir dist-verify-mgmt-fault` EXIT=0
- [x] agent-browser 走查 `/apps/mgmt/fault-mgmt` 显示真实后端数据与正确着色
- [x] 按 scope 拆分提交并推送到 `origin/feature/scaffold-rebuild`
- [x] 归档本 openspec Change
