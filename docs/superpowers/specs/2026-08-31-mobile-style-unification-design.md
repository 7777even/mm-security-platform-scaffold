# 移动端样式统一 — 设计文档

- 日期：2026-08-31
- 范围：移动端 `apps/mobile/**`（视图 + 组件，共 36 个 `.vue` 文件）
- 关联 openspec 变更：`openspec/changes/mobile-style-unification/`
- 决策（已与用户确认）：
  1. 深度 = 合规（去硬编码）+ 抽/复用共享类。
  2. 范围 = 整端 36 文件全部过。
  3. 缺尺寸刻度 → 在 `src/styles/tokens.css` 单一真源补齐移动端尺寸 token。
  4. `messages.vue` / `MessageFilterTabs.vue` 中 `height:32px` 内联胶囊按钮违反 UI规范-移动端 §3.4 触控 48–56px → 统一改用共享 `.mb-chip` / `.mb-btn-ghost`（48px），不新增 32px token。

## 1. 目标

移动端 scaffold 阶段由多视图分别实现，出现系统性不一致：

- **硬编码违例**（违反 AGENTS.md 红线 1「禁止硬编码，一律引用 token 单一真源」）：散落的 hex/rgb 颜色、`px` 间距/字号/圆角/尺寸（如 `messages.vue` `padding:0 16px`、`height:32px`、`padding:56px 0`；`profile.vue` `font-size:22px`、`background:#fff`、`width/height:56px/36px/44px/26px`；各组件 `border:1px`、`margin:4px`、`gap:2/4/6px`、`<Icon size="28px/22px/18px/16px/14px">`）。
- **重复定义**：多个视图重写了 `mobile.css` 已提供的共享类（`.mb-menu__*`、`.mb-switch`、`.mb-empty`、`.mb-chip`），造成维护分裂与视觉漂移。
- **触控违规**：32px 胶囊按钮低于 §3.4 的 48–56px 热区。

统一后：所有移动端样式均经 `tokens.css`（颜色/间距/字号/圆角/尺寸刻度）与 `mobile.css`（组件级共享类）两道单一真源表达，组件内零硬编码、零重复。

## 2. Token 合规映射规则（适用于所有文件 `<style>` 块）

| 类别                            | 硬编码示例                                                    | 改为                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 颜色                            | `#fff` / `rgb(...)` / `#1677ff` 等                            | `--card-mobile` / `--primary-mobile` / `--text-title-mobile` / `--mb-muted` / `--mb-body` / `--mb-stroke` / `--success/warning/danger-mobile` / `--mb-menu-*-soft` 等语义 token |
| 间距/内边距/外边距              | `4px/8px/16px/24px`                                           | `--space-xs/sm/md/lg`、`--mb-card-gap`、`--mb-pad-x`                                                                                                                            |
| 字号                            | `12/14/15/17/20/22/28px`                                      | `--mb-fz-tip/help/form-label/section/page/hero`，箭头用 `--mb-chevron`                                                                                                          |
| 圆角                            | `8/16px`、`999px`                                             | `--mb-radius-ctrl/card/btn`                                                                                                                                                     |
| 尺寸（width/height/min-height） | 图标 `14/16/18/22/28px`、行高 `40/48/56px`、滑块 `44/26/24px` | ② 新增尺寸刻度 token；已有者用 `--mb-row-h` / `--mb-avatar-*` / `--mb-switch-*` / `--mb-cell-h` / `--mb-photo-size` 等                                                          |

原则：组件内不重定义任何 token 值；只引用。

## 3. 新增移动端尺寸刻度 token（`src/styles/tokens.css`，`[data-theme='mobile']` 块）

| Token            | 值   | 用途                                    |
| ---------------- | ---- | --------------------------------------- |
| `--mb-ico-xs`    | 14px | 辅助图标                                |
| `--mb-ico-sm`    | 16px | 常规图标（默认档）                      |
| `--mb-ico-md`    | 18px | 列表/菜单图标                           |
| `--mb-ico-lg`    | 20px | 强调图标                                |
| `--mb-ico-xl`    | 22px | 列表箭头/大图标                         |
| `--mb-ico-play`  | 28px | 视频播放键                              |
| `--mb-chevron`   | 22px | 列表右箭头字形（替代 `font-size:22px`） |
| `--mb-empty-pad` | 56px | 空态纵向内边距（替代 `56px 0`）         |

- 户外皮肤 `[data-skin='outdoor']` 仅反相颜色（`currentColor` 已保证图标跟随）；尺寸刻度不随户外变化。
- 不新增 32px 控件 token（按决策 4 抬到 48px）。

## 4. 共享类复用 / 抽取规则

- **优先复用** `mobile.css` 既有共享类；仅当 ≥2 个视图共享同一本地模式时，才把该模式抽成新的 `mobile.css` 共享类（避免无谓扩散）。
- **删本地定义**：view 内与共享类同义的 `<style>` 定义一律删除，标记改用共享类。
- 本次需补的共享类（移动端缺失）：
  - `.mb-menu__ico--green/blue/orange/red`：菜单图标软底修饰类，背景引用既有 `--mb-menu-*-soft`（目前仅 `profile.vue` 本地包了一层 `.mb-menu-*-soft`，应上提到共享类）。
- 重点文件处理：
  - `profile.vue`：删本地 `.mb-menu-item/.mb-menu-ico/.mb-menu-label/.mb-menu-arrow/.mb-setting-item/.mb-setting-ico/.mb-switch/.mb-switch__knob`，改用 `.mb-menu__*`、`.mb-switch`（其 `#fff` 滑块背景随共享类走 `--card-mobile` 自动修复）、`.mb-menu__ico--*`。
  - `messages.vue`：`.msg-toolbar__pill` → `.mb-btn-ghost .mb-btn-sm`；`.msg-empty` → `.mb-empty` + `.mb-empty__art/__text`。
  - `MessageFilterTabs.vue`：`.filter-tabs__item` → `.mb-chip` + `.mb-chip--on`。
  - 其余视图/组件：逐文件按 §2 映射 + §4 规则处理（见 writing-plans 任务清单分组）。

## 5. 实施分组（writing-plans 任务清单依据）

- WP0 `tokens.css`：补 §3 尺寸刻度 token + 户外同步。
- WP1 `mobile.css`：补 `.mb-menu__ico--*`（其余共享类已齐备，仅核对引用）。
- WP2 视图文件（按业务域分批，每批含 token 合规 + 共享类复用）：
  - 我的/设置：`profile.vue`、`settings.vue`、`login.vue`、`welcome.vue`
  - 消息：`messages.vue`、`messageHistory.vue`、`MessageFilterTabs.vue`、`MessageItem.vue`、`MobileHeader.vue`、`messageCenter.vue`
  - 首页/统计：`home.vue`、`dashboard.vue`、`statistics.vue`、`personnel.vue`、`material.vue`
  - 地图/资料/通知：`map.vue`、`library.vue`、`notice.vue`、`noticeDetail.vue`
  - 演练/事件/告警/异常/通讯/值班/任务：`drills.vue`、`drill-detail.vue`、`events.vue`、`event-detail.vue`、`event-resources.vue`、`alarms.vue`、`alarm-detail.vue`、`anomalies.vue`、`contacts.vue`、`duty.vue`、`task.vue`、`taskDetail.vue` 及 `views/msd`、`views/emergency`、`views/inspection`、`views/safety`、`views/standard`、`views/leader` 子目录
- WP3 组件：`TabBar.vue`、`app-content.vue`、`IconTile.vue`、`MapPanel.vue`、`StatCard.vue`、`QuickActions.vue`、`SearchBar.vue`、`SectionTitle.vue`、`PageContainer.vue`、`EmptyState.vue`、`SettingItem.vue`、`BottomSafeBar.vue`、`Avatar.vue`、`Tag.vue`、`MaqatError.vue`、`ThemeToggle.vue`
- WP4 验证：stylelint + `vite build` + dev server `/apps/mobile/` 三页（首页/消息/我的）视觉抽查。

## 6. 验证（verification-before-completion）

1. `npm run lint`（eslint + stylelint）零新增违规。
2. `vite build`（或 `vue-tsc --noEmit`）类型/构建通过。
3. 启动 dev server，访问 `/apps/mobile/`，抽查首页、消息、我的三页：无样式回归、无硬编码残留（搜索 `#[0-9a-fA-F]{3,6}`、`px` 在 `<style>` 内应清零或仅剩 token 派生）。
4. 户外皮肤 `data-skin="outdoor"` 下图标/文字反相正常。

## 7. 风险与约束

- 改动只做样式（token 引用 + 类名替换 + 删重复定义），**不改动业务逻辑/模板结构语义**；模板类名调整限于「本地类 → 共享类」等价替换。
- 严格保留 `mobile.css` / `tokens.css` 为唯一真源；不在组件内重定义 token。
- 触控热区统一 ≥48px（决策 4）。
- 提交遵循 conventional commits + `mobile` scope（跨端共享文件改动用 `shared`，按 AGENTS.md 拆分提交）。
