# 变更提案：移动端「我的」页对齐 ui-redesign 的 Mine.vue

## Why

参考项目 `ui-redesign` 的「我的」页是 `src/views/mobile/Mine.vue`，本仓库对应页是 `apps/mobile/views/profile.vue`。前两批迁移都未覆盖它：`mobile-views-parity` 只补齐 router 中缺失的 15 个视图（profile 已存在，不在清单），`1c11d5f` 只把它的本地类收口为 `.mb-menu__*`（commit message 原文「profile 等重复本地类改为复用 mobile.css 共享类」）。结果本页仍是自家实现：内联 `ICON_PATHS` 手绘 path、自写 `.mb-user-card`、9 个菜单是 `<button>` 弹「功能建设中」点了不跳转——与 zip 的视觉结构和可达性都不一致，且 `apps/mobile/views/profile.spec.ts` 因类名改版遗留 7 个失败用例。

## What Changes

- **命名沿用 `profile` 不变**：路由 `/profile`、路由名 `mobile-profile`、文件 `profile.vue`、`TabBar active="profile"` 全部保持。`/profile` 已是对外可达路径（hybrid 原生壳深链、`settings.vue` 的 `back-to`），重命名零收益且引入失效风险；本仓库 35 条路由一律英文语义 kebab-case，本就未沿用 zip 的驼峰命名。
- 用户卡：删除自写 `.mb-user-card`，改用共享类 `.mb-usercard`（已由 `--mb-usercard-bg: var(--primary-mobile)` 定义为实色主蓝底白字，与 Mine.vue 的 `background: var(--m-primary)` 等价，且自带 `[data-skin='outdoor']` 规则）；头像用 `.mb-avatar--on-primary`。
- 菜单图标：内联 `ICON_PATHS` + 文本 `›` 换为 `IconTile`（rounded+soft，`size="md"`）+ `Icon name="chevron"`；图标名与 tone 照 Mine.vue 逐项搬（phone/green、calendar/teal、plan/blue、flask/orange、resource/green、book/navy、drill/red、ops/cyan、settings/slate），全部已在 `styles/iconset.ts` 中就绪。
- 菜单交互：9 项由 `button` + `ElMessage('功能建设中')` 改为 `RouterLink`，指向 `/contacts` `/duty` `/plans` `/msds` `/resources` `/library` `/drills` `/ops` `/settings`（router.ts 中均已存在）。移除 `element-plus` 依赖。
- 保留项目侧增强：适老 / 户外模式开关组（`useAccessibilityModes`，`data-elder` / `data-skin` 注入），zip 的 Mine.vue 无对应项，不因迁移丢失。
- 修复 `profile.spec.ts`：选择器同步为 `.mb-menu__*`，菜单断言改为校验 `to`，并新增用户卡共享类与 IconTile 的断言。

## Capabilities

- 新增 `mobile-profile-parity`：移动端「我的」页的视觉结构、图标体系与菜单可达性与参考项目 `Mine.vue` 一致。

## Impact

- 仅影响 `apps/mobile/views/profile.vue` 与 `apps/mobile/views/profile.spec.ts`；不触碰大屏 `screen`、后台 `apps/mgmt`。
- 不新增 token、不新增组件：全部复用 `mobile.css` 共享类与既有 `Icon` / `IconTile`。
- 行为变更：「我的」页 9 个菜单由不可点变为可跳转，需确认这 9 个目标页已可用（路由均已注册，视图文件均已存在）。
