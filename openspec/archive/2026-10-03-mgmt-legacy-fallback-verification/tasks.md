# Tasks: 后台管理遗留兜底验证

## 验证

- [x] 脚本比对 SERVICE_PATHS vs mgmtMenus 叶子 path：73 叶子全部覆盖，moduleRoutes 为空
- [x] 确认 module.vue 零导入方、module-embed.vue 仅被空 moduleRoutes 引用、protoPages 仅被 module-embed + 其 spec 引用

## 文档校正

- [x] 校正 router.ts 注释「其余叶子仍走 module-embed」为休眠兜底表述
- [x] 校正 apps/mgmt/AGENTS.md 页面清单，标注 module/module-embed 为遗留休眠兜底

## 门禁

- [x] 变更仅为注释与 markdown（无编译影响），git diff 确认无代码改动
- [x] 提交 docs(mgmt) 并归档本 Change
