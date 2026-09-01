# 变更提案：菜单行 button 外观收敛 + 「我的」页卡片间距与重复底栏修复

## Why

`mobile-profile-parity` 只把「我的」页的图标承载统一了，同页内两组菜单仍有三处样式不一致：

1. **行元素外观不同**：功能菜单行是 `<RouterLink>`（渲染为 `<a>`），设置行是 `<button>`。`.mb-menu__item` 未重置 `button` 的 UA 外观（灰底 `buttonface` + `outset` 边框），同一白卡内出现两种行外观。
2. **卡片间距丢失**：重写页面时删除了 scoped 里的 `.mb-menu-group / .mb-setting-group { margin-bottom }`，而 `.mb-menu` 共享类自身不带外边距（mobile.css 约定「间距由各块 margin-bottom 自控制」），两组菜单之间及与底栏之间零间距。
3. **底栏重复渲染**：`App.vue` 已唯一持有 `TabBar`（按 `route.meta.tab` 渲染），页面内又渲染了一份，两个 fixed 栏叠加。

## What Changes

- `mobile.css` 新增共享类 `.mb-menu__item--btn`：`button` 形态的菜单行重置 `appearance / background / border`（再按共享类规则补回 `border-bottom`）、`width: 100%`、`text-align: left`、`color: inherit`、`cursor: pointer`，使 `<button>` 行与 `<a>` 行视觉等价。
- `profile.vue`：删除重复渲染的 `TabBar`（由 `App.vue` 持有）；两组菜单收进 `.mb-stack`（共享类统一 `gap: var(--mb-card-gap)`），用户卡保留在外（其自带 `margin-bottom`）；设置行改用 `.mb-menu__item--btn`。
- `settings.vue`：自写的 `.settings__row` 替换为共享类 `.mb-menu__item--btn`，消除同一 reset 的第二份定义（顺带修掉该页 button 的 UA 灰底/边框）。
- 不新增 token，不改 `.mb-menu` 自身（避免波及 `.mb-menu` 的其他使用面）。

## Capabilities

- 新增 `mobile-menu-row-btn`：`a` / `button` 两种形态的菜单行在同一列表内视觉等价；「我的」页卡片间距与底栏唯一性回归共享类约定。

## Impact

- 影响 `apps/mobile/styles/mobile.css`（纯新增类）、`apps/mobile/views/profile.vue`、`apps/mobile/views/settings.vue` 及 `profile.spec.ts`。
- `settings.vue` 由 UA 灰底按钮行变为透明行（视觉修复，非回归）；其行尾开关、危险项语义不变。
- 不触碰大屏 `screen`、后台 `apps/mgmt`。
