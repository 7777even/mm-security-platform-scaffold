# 移动端样式统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让移动端全部 36 个 `.vue` 文件零硬编码、统一复用 `tokens.css` 与 `mobile.css` 两道单一真源，消除样式不一致与触控违规。

**Architecture:** 在 `tokens.css` 的 `[data-theme='mobile']` 块补齐缺失的尺寸刻度 token（图标/箭头/空态），在 `mobile.css` 补一个共享修饰类；逐文件将 `<style>` 内硬编码颜色/间距/字号/圆角/尺寸改为 token 引用，并将重复的本地 UI 类替换为既有共享类（删本地定义）。不改动业务逻辑与模板语义，仅做等价类名/值替换。

**Tech Stack:** Vue 3 SFC（`<style scoped>`）、CSS 自定义属性（`var(--token)`）、stylelint、Vite build、vue-tsc。

## Global Constraints

- **红线 1（AGENTS.md）**：禁止硬编码颜色/字号/间距/圆角/尺寸，一律引用 `src/styles/tokens.css` 的 `var(--token)`；新增/调整 token 只改 `tokens.css` 单一真源，禁止在组件内重定义。
- **触控热区（UI规范-移动端 §3.4）**：交互元素严格 48–56px；原 32px 胶囊按钮统一改用 `.mb-chip`/`.mb-btn-ghost`（48px），不新增 32px token。
- **z-index 只用五层 token**：`--z-base/--z-marker/--z-chrome/--z-overlay/--z-toast`。
- **状态着色只用规范映射表**（`--success/warning/danger-mobile` 等），禁止自造色阶。
- **提交规范（AGENTS.md §6）**：conventional commits + 端 scope；`tokens.css` 改动用 `shared`，端内用 `mobile`，按影响面拆分提交。
- **验证门槛**：每个原子改动跑通 `stylelint` + `vite build` 后再声称完成（verification-before-completion）。

> 注：本任务为纯样式，无单元测试可写；TDD 红绿循环以「stylelint 零新增违规 + build 通过 + 硬编码 grep 归零」作为等价验证门禁，逐文件提交。

---

## File Structure

- `src/styles/tokens.css`（修改）：`[data-theme='mobile']` 块补尺寸刻度 token；`[data-skin='outdoor']` 同步（仅颜色反相，尺寸不变）。
- `apps/mobile/styles/mobile.css`（修改）：补 `.mb-menu__ico--green/blue/orange/red` 软底修饰类。
- `apps/mobile/views/**/*.vue`（修改，共约 30 个）：`<style>` 去硬编码 + 复用共享类。
- `apps/mobile/components/**/*.vue`（修改，共约 16 个）：同上。

---

## Task 0: tokens.css 补移动端尺寸刻度

**Files:**

- Modify: `src/styles/tokens.css`（插入到 `[data-theme='mobile']` 块，约 line 544 `--mb-radius-ctrl` 之后）

**Interfaces:**

- Produces: `--mb-ico-xs/sm/md/lg/xl/play`、`--mb-chevron`、`--mb-empty-pad` 供后续所有视图/组件引用。

- [ ] **Step 1: 在 mobile token 块追加尺寸刻度**

在 `--mb-radius-ctrl: 8px;` 之后插入：

```css
/* 移动端图标尺寸刻度（Icon size 一律引用，禁止内联 px） */
--mb-ico-xs: 14px; /* 辅助图标 */
--mb-ico-sm: 16px; /* 常规图标（默认档） */
--mb-ico-md: 18px; /* 列表/菜单图标 */
--mb-ico-lg: 20px; /* 强调图标 */
--mb-ico-xl: 22px; /* 列表箭头/大图标 */
--mb-ico-play: 28px; /* 视频播放键 */
--mb-chevron: 22px; /* 列表右箭头字形 */
--mb-empty-pad: 56px; /* 空态纵向内边距 */
```

- [ ] **Step 2: 确认户外皮肤仅反相颜色、尺寸不变**

`[data-skin='outdoor']` 块已覆写颜色 token（`--mb-stroke`/`--mb-body`/`--mb-muted`/`--mb-primary-dark` 等），尺寸刻度无需在此覆写（图标随 `currentColor` 反相即可）。若户外块误改了上述新增尺寸 token，删除之。

- [ ] **Step 3: 提交**

```bash
git add src/styles/tokens.css
git commit -m "style(shared): 补移动端图标/箭头/空态尺寸刻度 token"
```

---

## Task 1: mobile.css 补菜单图标软底修饰类

**Files:**

- Modify: `apps/mobile/styles/mobile.css`（在 `.mb-menu__icon` 定义附近追加）

**Interfaces:**

- Consumes: `--mb-menu-green-soft`/`--mb-menu-blue-soft`/`--mb-menu-orange-soft`/`--mb-menu-red-soft`（已在 tokens.css 定义）。
- Produces: `.mb-menu__ico--green/blue/orange/red` 供 `profile.vue` 等菜单图标复用，替代本地 `.mb-menu-*-soft` 包裹类。

- [ ] **Step 1: 追加软底修饰类**

在 `.mb-menu__icon` 之后插入：

```css
.mb-menu__ico--green {
  background: var(--mb-menu-green-soft);
}
.mb-menu__ico--blue {
  background: var(--mb-menu-blue-soft);
}
.mb-menu__ico--orange {
  background: var(--mb-menu-orange-soft);
}
.mb-menu__ico--red {
  background: var(--mb-menu-red-soft);
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/styles/mobile.css
git commit -m "style(mobile): 补 .mb-menu__ico--* 软底修饰共享类"
```

---

## Task 2: profile.vue 去硬编码 + 复用共享类

**Files:**

- Modify: `apps/mobile/views/profile.vue`（`<style>` 块，约 line 226-310）

**Interfaces:**

- Consumes: `.mb-menu__*`、`.mb-switch`、`.mb-menu__ico--*`、`.mb-avatar-md`、`.mb-fz-*`、`--card-mobile`。

- [ ] **Step 1: 删除本地重复的菜单/设置/开关类**

删除以下本地定义（mobile.css 已有等价共享类）：
`.mb-menu-item`、`.mb-menu-ico`、`.mb-menu-label`、`.mb-menu-arrow`、`.mb-setting-item`、`.mb-setting-ico`、`.mb-switch`、`.mb-switch__knob`、`.mb-menu-green-soft` 等四个软底类。

- [ ] **Step 2: 修改模板类名引用共享类**

- `class="mb-menu-item"` → `class="mb-menu__item"`
- `class="mb-menu-ico mb-menu-green-soft"` → `class="mb-menu__icon mb-menu__ico--green"`
- `class="mb-menu-label"` → `class="mb-menu__label"`
- `class="mb-menu-arrow"` → `class="mb-menu__chevron"`
- `class="mb-switch"` + `:class="{ on: elder }"` → `class="mb-switch"` + `:class="{ 'mb-switch--on': elder }"`
- 设置项 `.mb-setting-item/.mb-setting-ico` 同法映射到 `.mb-menu__item/.mb-menu__icon`。

- [ ] **Step 3: 替换残留硬编码值**

- `font-size: 22px;`（箭头）→ 删除该本地类改用 `.mb-menu__chevron`（其字号已由共享类控制；若需显式则 `font-size: var(--mb-chevron);`）。
- `background: #fff;`（开关滑块）→ 随共享 `.mb-switch::after` 走 `--card-mobile`，无需本地值。
- `width:56px;height:56px`（头像）→ `width:var(--mb-avatar-md);height:var(--mb-avatar-md);`
- 其它 `4px`/`10px 0`/`2px` 等间距 → `--space-xs`/`--mb-card-gap`；`18px` 图标 → `var(--mb-ico-md)`。

- [ ] **Step 4: 提交**

```bash
git add apps/mobile/views/profile.vue
git commit -m "style(mobile): profile 视图去硬编码并复用共享类"
```

---

## Task 3: messages.vue / messageHistory.vue 去硬编码

**Files:**

- Modify: `apps/mobile/views/messages.vue`（约 line 110-160）
- Modify: `apps/mobile/views/messageHistory.vue`（约 line 65-80）

**Interfaces:**

- Consumes: `.mb-btn-ghost`、`.mb-btn-sm`、`.mb-empty`、`.mb-empty__art`、`.mb-empty__text`、`.mb-chip`、`.mb-fz-*`、`--mb-empty-pad`。

- [ ] **Step 1: messages.vue 工具栏胶囊改为共享类**

- 删本地 `.msg-toolbar__pill`（`height:32px;padding:0 16px` 等），模板 `class="msg-toolbar__pill"` → `class="mb-btn-ghost mb-btn-sm"`（48px 触控合规）。
- `padding: 56px 0;`（空态）→ 改用 `.mb-empty` 结构（`padding` 由共享类控制；如需额外纵向呼吸用 `padding: var(--mb-empty-pad) 0;`）。

- [ ] **Step 2: messages.vue 列表区核对**

`.msg-list`/`.msg-item` 已用 token，仅确认无残留 `px`/`#`；`gap`/`padding` 统一引用 `--mb-card-gap`/`--space-*`。

- [ ] **Step 3: messageHistory.vue 空态**

`padding: 56px 0;` → `padding: var(--mb-empty-pad) 0;`（或复用 `.mb-empty`）。

- [ ] **Step 4: 提交**

```bash
git add apps/mobile/views/messages.vue apps/mobile/views/messageHistory.vue
git commit -m "style(mobile): 消息视图胶囊/空态改为共享类与 token"
```

---

## Task 4: MessageFilterTabs.vue / MessageItem.vue / MobileHeader.vue 去硬编码

**Files:**

- Modify: `apps/mobile/components/MessageFilterTabs.vue`（约 line 45-60）
- Modify: `apps/mobile/components/MessageItem.vue`（`<style>` 块）
- Modify: `apps/mobile/components/MobileHeader.vue`（`<style>` 块）

**Interfaces:**

- Consumes: `.mb-chip`、`.mb-chip--on`、`.mb-fz-*`、`--space-*`、`--mb-border-w`、`--mb-stroke`。

- [ ] **Step 1: MessageFilterTabs 筛选页签改 .mb-chip**

- 删本地 `.filter-tabs__item`（`height:32px;padding:0 16px`），模板 `class="filter-tabs__item"` + `:class="{ active }"` → `class="mb-chip"` + `:class="{ 'mb-chip--on': active }"`（48px 触控合规）。

- [ ] **Step 2: MessageItem 去硬编码**

- `padding:12px` → `padding: var(--space-md);`（或 `--mb-card-gap`）
- `border:1px` → `border: var(--mb-border-w) solid var(--mb-stroke);`
- `gap:4px/6px` → `var(--space-xs)`/`var(--space-sm)`
- `width:8px;height:8px`（圆点）→ `width:var(--mb-dot-size);height:var(--mb-dot-size);`
- `font-size:22px`（图标）→ `var(--mb-ico-xl)`

- [ ] **Step 3: MobileHeader 去硬编码**

- `border-bottom:1px solid` → `border-bottom: var(--mb-border-w) solid var(--mb-stroke);`
- `min-height:48px` → `min-height: var(--mb-row-h);`
- `font-size:28px` → `var(--mb-fz-hero)`；`width/height:18px` 图标 → `var(--mb-ico-md)`

- [ ] **Step 4: 提交**

```bash
git add apps/mobile/components/MessageFilterTabs.vue apps/mobile/components/MessageItem.vue apps/mobile/components/MobileHeader.vue
git commit -m "style(mobile): 消息组件去硬编码并复用共享类"
```

---

## Task 5: TabBar.vue 去硬编码

**Files:**

- Modify: `apps/mobile/components/TabBar.vue`（`<style>` 块）

**Interfaces:**

- Consumes: `--mb-border-w`、`--mb-stroke`、`--space-xs`、`--mb-fz-tip`、`--mb-ico-*`。

- [ ] **Step 1: 替换硬编码**

- `border-top:1px` → `border-top: var(--mb-border-w) solid var(--mb-stroke);`
- `gap:2px` → `var(--space-xs)`
- 标签文字 `font-size` 引用 `--mb-fz-tip`；图标 `size` 属性改为 `var(--mb-ico-md)`

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/components/TabBar.vue
git commit -m "style(mobile): TabBar 去硬编码引用 token"
```

---

## Task 6–N: 其余视图/组件逐文件去硬编码（通用流程）

**Files（逐文件，每个单独提交）：**

- `apps/mobile/views/`: `home.vue`、`dashboard.vue`、`statistics.vue`、`personnel.vue`、`material.vue`、`map.vue`、`library.vue`、`notice.vue`、`noticeDetail.vue`、`drills.vue`、`drill-detail.vue`、`events.vue`、`event-detail.vue`、`event-resources.vue`、`alarms.vue`、`alarm-detail.vue`、`anomalies.vue`、`contacts.vue`、`duty.vue`、`task.vue`、`taskDetail.vue`、`settings.vue`、`login.vue`、`welcome.vue`、`messageCenter.vue`，以及 `views/msd/`、`views/emergency/`、`views/inspection/`、`views/safety/`、`views/standard/`、`views/leader/` 子目录下全部 `.vue`
- `apps/mobile/components/`: `app-content.vue`、`IconTile.vue`、`MapPanel.vue`、`StatCard.vue`、`QuickActions.vue`、`SearchBar.vue`、`SectionTitle.vue`、`PageContainer.vue`、`EmptyState.vue`、`SettingItem.vue`、`BottomSafeBar.vue`、`Avatar.vue`、`Tag.vue`、`MaqatError.vue`、`ThemeToggle.vue`

**通用步骤（每文件一个 Task）：**

- [ ] **Step 1: 读文件并列出硬编码**

运行（确认无遗漏）：

```
npx stylelint "apps/mobile/views/<file>.vue" || true
```

并人工核对 `<style>` 块内所有 `#hex`、`rgb()`、`Npx`（颜色/间距/字号/圆角/尺寸）、`<Icon size="Npx">` 内联尺寸。

- [ ] **Step 2: 按映射替换**

| 硬编                       | 改为                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#fff`/`rgb(...)`/品牌色   | `--card-mobile`/`--primary-mobile`/`--text-title-mobile`/`--mb-muted`/`--mb-body`/`--mb-stroke`/`--success/warning/danger-mobile`/`--mb-menu-*-soft` |
| 间距 `4/8/16/24px`         | `--space-xs/sm/md/lg`、`--mb-card-gap`、`--mb-pad-x`                                                                                                 |
| 字号 `12/14/15/17/20/28px` | `--mb-fz-tip/help/form-label/section/page/hero`；箭头 `--mb-chevron`                                                                                 |
| 圆角 `8/16px`、`999px`     | `--mb-radius-ctrl/card/btn`                                                                                                                          |
| 图标 `14/16/18/22/28px`    | `<Icon size="var(--mb-ico-xs/sm/md/xl/play)">`                                                                                                       |
| 行高 `40/48/56px`          | `--mb-cell-h`/`--mb-row-h`/`--mb-row-h-elder`                                                                                                        |
| `border:1px`               | `border: var(--mb-border-w) solid var(--mb-stroke);`                                                                                                 |
| `56px 0` 空态              | `padding: var(--mb-empty-pad) 0;` 或 `.mb-empty`                                                                                                     |

- [ ] **Step 3: 复用共享类**

若文件内定义了与 `mobile.css` 同义的本地类（如 `.xxx-card`/`.xxx-row`/`.xxx-btn`/`.xxx-empty`），删除本地定义并将模板类名改为 `.mb-card`/`.mb-list-row`/`.mb-btn-*`/`.mb-empty` 等既有共享类；仅当 ≥2 文件共享同一本地模式时，才在 `mobile.css` 新增共享类（并在本计划外先补 Task 1 同类 PR）。

- [ ] **Step 4: 提交（每文件独立 mobile scope 提交）**

```bash
git add apps/mobile/views/<file>.vue
git commit -m "style(mobile): <file> 去硬编码并复用共享类"
```

> 每文件严格独立提交，便于 review 与回滚；不跨文件合并。

---

## Task FINAL: 整端验证（verification-before-completion）

**Files:** 无新增；全量校验。

- [ ] **Step 1: 硬编码归零**

运行（应无输出）：

```
npx grep -rnE '#[0-9a-fA-F]{3,6}|[0-9]+px' apps/mobile --include=*.vue
```

若仍有命中，逐项回到对应 Task 修复（合法例外：无——Icon size 已改 `var()`，间距/颜色已改 token）。

- [ ] **Step 2: stylelint + 构建**

```bash
npm run lint
npm run build
```

Expected: 零新增 stylelint/eslint 违规；`vite build` 成功。

- [ ] **Step 3: 类型检查**

```bash
npx vue-tsc --noEmit
```

Expected: 无新增类型错误。

- [ ] **Step 4: 视觉抽查**

启动 dev server，访问 `/apps/mobile/`，抽查「首页 / 消息 / 我的」三页：无样式回归、图标尺寸统一、触控热区 ≥48px、户外皮肤 `data-skin="outdoor"` 反相正常。

- [ ] **Step 5: 归档 openspec**

验证通过后，将 `openspec/changes/mobile-style-unification/` 归档至 `openspec/archive/`（保留 proposal + 本计划引用）。

---

## Self-Review

1. **Spec coverage**：① tokens.css 尺寸刻度（Task 0）✓；② 36 文件去硬编码（Task 2–N）✓；③ 复用共享类/删重复（Task 2/3/4/通用 Step 3）✓；④ 32px→48px 触控（Task 3/4）✓；⑤ 验证（Task FINAL）✓。
2. **Placeholder scan**：通用流程（Task 6–N）给出明确映射表与逐文件提交步骤，非「TBD」；每文件独立提交，非「similar to」。
3. **Type consistency**：新增 token 名在 Task 0 定义、Task 2–N 引用一致；共享类 `.mb-menu__ico--*` 在 Task 1 定义、Task 2 引用一致。
4. **唯一偏差**：纯样式无单元测试，以 stylelint+build+硬编码 grep 作为等价验证门禁（已在 Global Constraints 显式声明）。
