# 移动端「我的」页 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现与原型图一致的移动端「我的」页（用户卡 + 9 功能菜单 + 2 设置项 + 户外强光皮肤切换），替换 `apps/mobile/views/profile.vue` 占位页。

**Architecture:** 单文件视图 `profile.vue` 承载全部（与现有 `home.vue`/`tasks.vue` 扁平风格一致，不拆组件）；菜单/设置以内联数据数组驱动渲染；图标用内联 `<svg><path :d>`（与 `messages.vue` 一致，规避 `vue/no-v-html`）；视觉全部走 `tokens.css` 单源 token；户外强光皮肤通过根节点 `data-skin` 切换实现（H5 降级的纯前端开关）。测试用 `@vue/test-utils` + jsdom 覆盖渲染与交互（TDD 先红后绿）。

**Tech Stack:** Vue 3 `<script setup>` + TypeScript(strict) + Vite + Element Plus(`ElMessage`) + Vitest + @vue/test-utils + jsdom。

## Global Constraints

- 应用根节点必须挂 `data-theme='mobile'`（已在 `apps/mobile/index.html` 挂载）。
- 全部颜色/字号/间距/圆角引用 `var(--token)`，**禁止**组件内硬编码，新增 token 只能改 `src/styles/tokens.css` 移动端块。
- 移动端约束（`docs/UI规范-移动端.md` §9）：同屏字号 ≤4 档；触控热区 48–56px；底部预留 `var(--mb-bottom-safe)`；状态/语义色只用规范映射。
- 头部采用浅蓝背景 `--primary-mobile-soft`（**按图片偏离**规范模板白底顶栏，仅本页独立类 `.profile-header`，不覆写 `.mb-brand-header`）。
- 户外强光皮肤 `[data-theme='mobile'][data-skin='outdoor']`：用户卡停用渐变 → 白底黑字（由 token 覆写自动生效）。
- 测试环境为 `node`，组件测试须文件头 `// @vitest-environment jsdom` 覆盖；`vue/no-v-html` 为 error，**禁止** v-html，图标用内联 SVG `<path>`。
- `eslint` 开启 `no-explicit-any`（error），测试桩用 `vi.mock` / `vi.mocked` 规避 any。
- 提交按 scope 拆分：`test(mobile):` / `fix(shared):`（token）/ `feat(mobile):`（页面）。
- 完成后 type-check / lint / test 通过；openspec 任务勾选并归档。

---

## 文件结构

| 文件                                                  | 动作 | 职责                                           |
| ----------------------------------------------------- | ---- | ---------------------------------------------- |
| `apps/mobile/views/profile.spec.ts`                   | 新增 | TDD 组件测试（jsdom）                          |
| `src/styles/tokens.css`                               | 改   | 移动端块新增用户卡/菜单图标 token + 户外覆写   |
| `apps/mobile/views/profile.vue`                       | 重写 | 浅蓝头部 + 渐变用户卡 + 9 菜单 + 2 设置 + 底栏 |
| `openspec/changes/mobile-profile/{proposal,tasks}.md` | 新增 | spec-driven 门禁（本次已随计划建立）           |

---

### Task 1: 编写失败组件测试（TDD 先红）

**Files:**

- Create: `apps/mobile/views/profile.spec.ts`

**Interfaces:** 无前置依赖（组件尚未实现，导入将失败即红）。

- [ ] **Step 1: 写入失败测试**

```ts
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('element-plus', () => ({
  ElMessage: { info: vi.fn() },
}));

import { ElMessage } from 'element-plus';
import Profile from './profile.vue';

describe('移动端「我的」页', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.skin;
    vi.mocked(ElMessage.info).mockClear();
  });
  afterEach(() => {
    delete document.documentElement.dataset.skin;
  });

  const mountProfile = () =>
    mount(Profile, {
      global: { stubs: { TabBar: true, RouterLink: true } },
    });

  it('渲染用户信息（姓名/角色）', () => {
    const w = mountProfile();
    expect(w.text()).toContain('张工');
    expect(w.text()).toContain('消防业务管理员 · 储运部 · MM-2018');
  });

  it('渲染 9 个功能菜单项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-menu-item');
    expect(items.length).toBe(9);
    const labels = items.map((i) => i.find('.mb-menu-label').text());
    expect(labels).toEqual([
      '通讯录',
      '今日值班',
      '应急预案',
      '化学品知识（MSDS）',
      '应急资源',
      '辅助资料库',
      '演练信息',
      '运维监测看板',
      '系统设置',
    ]);
  });

  it('渲染 2 个设置项', () => {
    const w = mountProfile();
    const items = w.findAll('.mb-setting-item');
    expect(items.length).toBe(2);
    const labels = items.map((i) => i.find('.mb-setting-label').text());
    expect(labels).toEqual(['适老模式', '户外强光皮肤']);
  });

  it('点击菜单项触发占位提示', async () => {
    const w = mountProfile();
    await w.findAll('.mb-menu-item')[0].trigger('click');
    expect(ElMessage.info).toHaveBeenCalled();
  });

  it('点击适老模式触发占位提示', async () => {
    const w = mountProfile();
    await w.findAll('.mb-setting-item')[0].trigger('click');
    expect(ElMessage.info).toHaveBeenCalled();
  });

  it('切换户外强光皮肤设置根节点 data-skin', async () => {
    const w = mountProfile();
    const sw = w.find('.mb-switch');
    expect(sw.exists()).toBe(true);
    await sw.trigger('click');
    expect(document.documentElement.dataset.skin).toBe('outdoor');
    await sw.trigger('click');
    expect(document.documentElement.dataset.skin).toBeUndefined();
  });
});
```

- [ ] **Step 2: 运行测试确认失败（红）**

Run: `npx vitest run apps/mobile/views/profile.spec.ts`
Expected: FAIL — `Cannot find module './profile.vue'` 或组件相关编译错误（尚未实现）。

- [ ] **Step 3: 提交（红）**

```bash
git add apps/mobile/views/profile.spec.ts
git commit -m "test(mobile): 新增「我的」页组件测试（TDD 先红）"
```

---

### Task 2: 新增移动端 token（shared）

**Files:**

- Modify: `src/styles/tokens.css`（`:root[data-theme='mobile']` 块，位于消息分类图标配色后、该块 `}` 之前；以及 `[data-theme='mobile'][data-skin='outdoor']` 块末尾）

**Interfaces:** 产出供 Task 3 引用的 token：

- `--mb-usercard-bg` / `--mb-usercard-fg`（用户卡背景/文字）
- `--mb-menu-green-soft` / `--mb-menu-blue-soft` / `--mb-menu-orange-soft` / `--mb-menu-red-soft`（菜单图标浅底圆）

- [ ] **Step 1: 在移动端块新增 token**

在 `:root[data-theme='mobile']` 块末尾（消息分类图标配色 `--mb-msg-system-soft` 之后、`}` 之前）插入：

```css
/* 移动端「我的」页：用户卡渐变 + 菜单图标配色（浅底圆承载，基于语义色派生，单一真源） */
--mb-usercard-bg: linear-gradient(
  135deg,
  color-mix(in srgb, var(--primary-mobile) 66%, #fff 34%) 0%,
  var(--primary-mobile) 100%
);
--mb-usercard-fg: var(--color-on-primary);
--mb-menu-green-soft: color-mix(in srgb, var(--success-mobile) 12%, transparent);
--mb-menu-blue-soft: color-mix(in srgb, var(--primary-mobile) 12%, transparent);
--mb-menu-orange-soft: color-mix(in srgb, var(--warning-mobile) 12%, transparent);
--mb-menu-red-soft: color-mix(in srgb, var(--danger-mobile) 12%, transparent);
```

- [ ] **Step 2: 在户外皮肤块覆写用户卡（停用渐变）**

在 `[data-theme='mobile'][data-skin='outdoor']` 块末尾（`}` 之前）插入：

```css
/* 「我的」页用户卡：户外皮肤停用渐变（白底黑字，由组件引用 token 自动生效） */
--mb-usercard-bg: var(--card-mobile);
--mb-usercard-fg: #000;
```

- [ ] **Step 3: 校验 lint / type-check（token 改动不报错）**

Run: `npm run lint && npm run type-check`
Expected: 均 exit 0。

- [ ] **Step 4: 提交（shared）**

```bash
git add src/styles/tokens.css
git commit -m "fix(shared): 新增移动端用户卡与菜单图标 token"
```

---

### Task 3: 实现「我的」页（mobile）

**Files:**

- Rewrite: `apps/mobile/views/profile.vue`

**Interfaces:** 消费 Task 2 token（`--mb-usercard-bg` / `--mb-usercard-fg` / `--mb-menu-*-soft`）；导出行为：菜单点击 `ElMessage.info('功能建设中')`、适老点击同占位、户外开关切换 `document.documentElement.dataset.skin`。

- [ ] **Step 1: 写入完整组件**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import TabBar from '../components/TabBar.vue';

const userName = ref('张工');
const userRole = ref('消防业务管理员 · 储运部 · MM-2018');
const avatarChar = userName.value.charAt(0);

type Tone = 'green' | 'blue' | 'orange' | 'red';

interface ProfileMenuItem {
  key: string;
  label: string;
  tone: Tone;
}
const menuItems: ProfileMenuItem[] = [
  { key: 'contacts', label: '通讯录', tone: 'green' },
  { key: 'duty', label: '今日值班', tone: 'green' },
  { key: 'plan', label: '应急预案', tone: 'blue' },
  { key: 'msds', label: '化学品知识（MSDS）', tone: 'orange' },
  { key: 'resource', label: '应急资源', tone: 'green' },
  { key: 'library', label: '辅助资料库', tone: 'blue' },
  { key: 'drill', label: '演练信息', tone: 'red' },
  { key: 'ops', label: '运维监测看板', tone: 'blue' },
  { key: 'settings', label: '系统设置', tone: 'blue' },
];

interface ProfileSettingItem {
  key: 'elder' | 'outdoor';
  label: string;
  tone: Tone;
}
const settingItems: ProfileSettingItem[] = [
  { key: 'elder', label: '适老模式', tone: 'blue' },
  { key: 'outdoor', label: '户外强光皮肤', tone: 'orange' },
];

const ICON_PATHS: Record<string, string> = {
  contacts: 'M4 5h16v14H4zM9 10a2 2 0 104 0M9 14c0-1.4 2-2 4-2s4 .6 4 2',
  duty: 'M4 5h16v15H4zM4 9h16M8 3v4M16 3v4',
  plan: 'M7 3h7l4 4v14H7zM14 3v4h4M9 12h6M9 16h6',
  msds: 'M9 3h6v3l3 4v11H6V10l3-4zM9 3v3h6V3',
  resource: 'M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6z',
  library: 'M5 4h4v16H5zM11 4h4v16h-4zM17 5l3 1-2 14-3-1z',
  drill: 'M13 2L4 14h7l-1 8 9-12h-7z',
  ops: 'M4 20V10M9 20V4M14 20v-7M19 20V8',
  settings:
    'M12 9a3 3 0 100 6 3 3 0 000-6zM4 12h2M18 12h2M12 4v2M12 18v2M6.5 6.5l1.5 1.5M16 16l1.5 1.5M17.5 6.5L16 8M8 16l-1.5 1.5',
  elder: 'M12 4a4 4 0 100 8 4 4 0 000-8zM4 20c0-4 4-6 8-6s8 2 8 6',
  outdoor: 'M12 3a9 9 0 109 9 7 7 0 01-9-9z',
};

const TONE_COLOR: Record<Tone, string> = {
  green: 'var(--success-mobile)',
  blue: 'var(--primary-mobile)',
  orange: 'var(--warning-mobile)',
  red: 'var(--danger-mobile)',
};

const outdoor = ref(document.documentElement.dataset.skin === 'outdoor');
function toggleOutdoor() {
  outdoor.value = !outdoor.value;
  if (outdoor.value) document.documentElement.dataset.skin = 'outdoor';
  else delete document.documentElement.dataset.skin;
}
function onMenu() {
  ElMessage.info('功能建设中');
}
function onSetting(item: ProfileSettingItem) {
  if (item.key === 'outdoor') return; // 户外强光实际切换皮肤，不弹占位
  ElMessage.info('功能建设中');
}
</script>

<template>
  <div class="mb-page profile-page">
    <header class="profile-header">
      <h1 class="profile-header__title">我的</h1>
      <RouterLink to="/tasks" class="profile-header__nav" aria-label="导航">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        导航
      </RouterLink>
    </header>

    <section class="mb-user-card" aria-label="用户信息">
      <span class="mb-user-avatar">{{ avatarChar }}</span>
      <div class="mb-user-meta">
        <p class="mb-user-name">{{ userName }}</p>
        <p class="mb-user-role">{{ userRole }}</p>
      </div>
    </section>

    <section class="mb-card mb-menu-group" aria-label="功能菜单">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="mb-menu-item"
        @click="onMenu()"
      >
        <span
          class="mb-menu-ico"
          :class="`tone-${item.tone}`"
          :style="{ color: TONE_COLOR[item.tone] }"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path :d="ICON_PATHS[item.key]" />
          </svg>
        </span>
        <span class="mb-menu-label">{{ item.label }}</span>
        <span class="mb-menu-arrow" aria-hidden="true">›</span>
      </button>
    </section>

    <section class="mb-card mb-setting-group" aria-label="设置">
      <button
        v-for="item in settingItems"
        :key="item.key"
        type="button"
        class="mb-setting-item"
        @click="item.key === 'elder' ? onSetting(item) : undefined"
      >
        <span
          class="mb-setting-ico"
          :class="`tone-${item.tone}`"
          :style="{ color: TONE_COLOR[item.tone] }"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path :d="ICON_PATHS[item.key]" />
          </svg>
        </span>
        <span class="mb-setting-label">{{ item.label }}</span>
        <span
          v-if="item.key === 'outdoor'"
          class="mb-switch"
          role="switch"
          :aria-checked="String(outdoor)"
          :class="{ on: outdoor }"
          @click.stop="toggleOutdoor"
        >
          <span class="mb-switch__knob" />
        </span>
        <span v-else class="mb-menu-arrow" aria-hidden="true">›</span>
      </button>
    </section>

    <TabBar active="profile" />
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-mobile);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--mb-header-h);
  padding: 0 var(--mb-pad-x);
  background: var(--primary-mobile-soft); /* 浅蓝头，按图片偏离白底模板 */
}
.profile-header__title {
  margin: 0;
  font-size: var(--mb-fz-page);
  font-weight: 600;
  color: var(--text-title-mobile);
}
.profile-header__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--primary-mobile);
  font-size: var(--mb-fz-help);
  text-decoration: none;
}
.profile-header__nav svg {
  width: 20px;
  height: 20px;
}

.mb-user-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--mb-card-gap) var(--mb-pad-x);
  padding: var(--space-lg) var(--mb-pad-x);
  border-radius: var(--mb-radius-card);
  background: var(--mb-usercard-bg);
  color: var(--mb-usercard-fg);
}
.mb-user-avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: var(--mb-fz-section);
  font-weight: 700;
  color: var(--primary-mobile);
  background: var(--primary-mobile-soft);
}
.mb-user-meta {
  min-width: 0;
}
.mb-user-name {
  margin: 0;
  font-size: var(--mb-fz-section);
  font-weight: 700;
}
.mb-user-role {
  margin: 4px 0 0;
  font-size: var(--mb-fz-tip);
  opacity: 0.85;
}

.mb-menu-group,
.mb-setting-group {
  margin: 0 var(--mb-pad-x) var(--mb-card-gap);
  padding: 4px var(--mb-pad-x);
}

.mb-menu-item,
.mb-setting-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  min-height: var(--mb-row-h); /* 触控热区 48 */
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  cursor: pointer;
}
.mb-menu-group .mb-menu-item:last-child,
.mb-setting-group .mb-setting-item:last-child {
  border-bottom: none;
}

.mb-menu-ico,
.mb-setting-ico {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.mb-menu-ico svg,
.mb-setting-ico svg {
  width: 20px;
  height: 20px;
}

.tone-green {
  background: var(--mb-menu-green-soft);
  color: var(--success-mobile);
}
.tone-blue {
  background: var(--mb-menu-blue-soft);
  color: var(--primary-mobile);
}
.tone-orange {
  background: var(--mb-menu-orange-soft);
  color: var(--warning-mobile);
}
.tone-red {
  background: var(--mb-menu-red-soft);
  color: var(--danger-mobile);
}

.mb-menu-label,
.mb-setting-label {
  flex: 1;
  min-width: 0;
  font-size: var(--mb-fz-help);
  color: var(--text-title-mobile);
}
.mb-menu-arrow {
  flex-shrink: 0;
  color: var(--text-muted-mobile);
  font-size: 22px;
  line-height: 1;
}

.mb-switch {
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-border);
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.mb-switch.on {
  background: var(--primary-mobile);
}
.mb-switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition-fast);
}
.mb-switch.on .mb-switch__knob {
  transform: translateX(18px);
}
</style>
```

- [ ] **Step 2: 运行测试确认通过（绿）**

Run: `npx vitest run apps/mobile/views/profile.spec.ts`
Expected: PASS（6 用例全绿）。

- [ ] **Step 3: 全量校验**

Run: `npm run lint && npm run type-check && npm run test`
Expected: lint/type-check exit 0；本次 `profile.spec.ts` 全绿（大屏既有失败与本变更无关，按纪律不纳入）。

- [ ] **Step 4: 提交（mobile）**

```bash
git add apps/mobile/views/profile.vue
git commit -m "feat(mobile): 实现「我的」页（用户卡/9 菜单/2 设置/户外皮肤切换）"
```

---

### Task 4: 归档 openspec 变更

**Files:**

- Move: `openspec/changes/mobile-profile` → `openspec/archive/mobile-profile`

- [ ] **Step 1: 勾选 tasks.md 全部任务为 `[x]`**

- [ ] **Step 2: 移动到归档目录**

```bash
git mv openspec/changes/mobile-profile openspec/archive/mobile-profile
git add -A
git commit -m "docs(mobile): 归档移动端「我的」页 openspec 变更"
```

---

## 自检（Self-Review）

1. **Spec 覆盖**：用户卡/姓名/角色 ✅(T1,T3)；9 菜单 ✅；2 设置 ✅；户外切换 ✅；浅蓝头偏离 ✅(T3 Global)；token 单源 ✅(T2)。
2. **无占位**：每个 Step 含完整代码与命令，无 TBD/TODO。
3. **类型一致**：`Tone` / `ProfileMenuItem` / `ProfileSettingItem` / `ICON_PATHS` / `TONE_COLOR` 在 T3 内定义并在模板一致引用；测试标签与组件 `label` 完全一致（含全角括号「（MSDS）」）。
4. **风险**：`RouterLink` 在测试中 stub，组件真实运行依赖 `apps/mobile` 已挂载 vue-router（生产 OK）；`element-plus` 被 `vi.mock` 替换，仅影响测试。
