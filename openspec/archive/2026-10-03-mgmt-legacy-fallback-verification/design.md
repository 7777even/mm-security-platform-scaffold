# Design: 后台管理遗留兜底验证

## 验证方法

脚本化比对 `apps/mgmt/router.ts` 的 `SERVICE_PATHS`（含 `FIRE_FACILITY_LEDGER_PATHS` / `FIRE_MONITOR_PATHS` spread）与 `src/data/mgmtMenus.ts` 的全部叶子 path（经 `L(name,'/path',...)` 辅助函数与内联 `path:` 提取）。结果：73 个组级叶子 path 全部命中 SERVICE_PATHS；唯一未命中 `/form` `/workbench` 属顶层链接（自有显式路由），不进入 `moduleRoutes`。故 `moduleRoutes` 生成为空，`module-embed.vue` 动态 import 无触发。

## 引用关系

- `module-embed.vue`：仅 `router.ts` 的 `moduleRoutes` 动态 import（块当前为空）。
- `module.vue`：零导入方（仅 AGENTS.md 历史提及）。
- `protoPages.ts`：仅 `module-embed.vue` + `protoPages.spec.ts`（校验 public/pc-admin/index.html 的 data-page 一致性）。

## 取舍

保留休眠兜底（route-level keep fallback switch）：删除将使新增未接入叶子 404，且 `protoPages.spec.ts` 守护的 legacy 原型 HTML 仍存在于 public/。故仅校正文档，不删代码。
