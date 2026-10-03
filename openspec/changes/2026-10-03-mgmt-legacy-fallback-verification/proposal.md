# Proposal: 后台管理遗留兜底页休眠验证

## 背景

P0 已证明 97 个菜单叶子全部接入服务视图 → `moduleRoutes` 为空。本批复核确认：当前 `mgmtMenus` 全部组级叶子 path 均命中 `SERVICE_PATHS`（含消防设施台账/监控段 spread），`module-embed.vue` 经 `moduleRoutes` 的动态 import 不再被任何路由触发；`module.vue` 无任何导入方；`protoPages.ts` 仅被 `module-embed.vue` 及其一致性 spec 引用。三者均为休眠兜底，无活跃消费者。

## 目标

- 复核并固化结论：`module-embed.vue` / `module.vue` / `protoPages` 为休眠兜底，0 活跃消费者。
- 校正 router.ts 与 AGENTS.md 中「其余叶子仍走 module-embed」的过时表述。
- 保留 route-level 兜底开关（不删除），确保未来新增未接入叶子时不 404。

## 非目标

- 不删除 `module-embed.vue` / `module.vue` / `protoPages.ts` / `protoPages.spec.ts`（保留为休眠兜底，避免回归）。
- 无 API / 契约变更。
