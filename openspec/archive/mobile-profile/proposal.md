# Change: 移动端「我的」页（用户卡 + 功能菜单 + 设置）

## Why

移动端 `/profile` 当前为占位页，缺乏与原型图一致的「我的」页。需落地白底统一头（MobileHeader brand）、用户卡（实色主蓝，与首页 hero 对齐）、9 项功能菜单（彩色图标 + 右箭头）与 2 项设置（适老模式 / 户外强光皮肤），补齐移动端个人中心入口。

## What Changes

- `src/styles/tokens.css`（`data-theme='mobile'` 块）：新增 `--mb-usercard-bg`（用户卡实色主蓝）、`--mb-usercard-fg`（用户卡文字色）、`--mb-menu-{green,blue,orange,red}-soft`（菜单图标浅底圆），并在户外皮肤块覆写用户卡为白底黑字。
- 重写 `apps/mobile/views/profile.vue`：白底统一头 + 用户卡（实色主蓝）+ 9 菜单 + 2 设置 + 底栏；菜单/设置点击 `ElMessage.info` 占位；户外强光开关实际切换根节点 `data-skin="outdoor"`。
- 新增 `apps/mobile/views/profile.spec.ts`（TDD）覆盖渲染与交互。

## Capabilities

- mobile-profile: 用户卡展示、功能菜单列表、设置项、户外强光皮肤切换占位。

## Impact

- 仅移动端（apps/mobile + 共享 tokens.css 移动端块）。
- 头部采用统一 `MobileHeader brand` 白底顶栏（与 home/messages 一致，由组件承载，不另写独立类）。
- 不涉及写控接口、设备编码、权限变更。
