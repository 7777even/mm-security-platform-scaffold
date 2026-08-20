# 大屏首页对齐设计说明文档 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `src/views/dashboard/index.vue` 大屏首页在布局、配色、字体、面板、统计卡、告警列表、趋势图上对齐 `docs/安全管控平台设计说明.docx` §5.3，形成「左 419 / 右 419 / 中地图」三栏态势页。

**Architecture:** 设计令牌下沉到 `tokens.css`（配色/字体变量，全站复用）；新增可复用 `PanelCard.vue` 统一面板容器（标题图标槽 + 更多链接 + 底部青色光带）；`dashboard/index.vue` 重组为三栏：左侧面板（统计卡组 + 近24h趋势图）、右侧面板（实时告警列表）、中央 Cesium 地图；2D/3D 切换移到地图右上角浮层。视图/样式层改动，不碰 services/stores/realtime 接线。

**Tech Stack:** Vue 3 `<script setup>` + SCSS 变量（CSS 自定义属性）、ECharts、Cesium、`vitest` + `@vue/test-utils`、`@element-plus/icons-vue`（图标，已为依赖）。

## Global Constraints

- 配色严格取自设计稿：主背景 `#0B1526`、危险红 `#FF4A5A`、警示橙 `#FFB020`、成功绿 `#2EEC68`、辅助文字 `#8FAEC3`、次强调蓝 `#2E7CF6`、边框线 `#2AA7B8`、主强调 `#00D0FF`（沿用 `--color-accent` 视觉无差）。
- 中文字体：`'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif`（不引入公网 CDN，离线回退 YaHei）。
- 数字字体：`'Poppins', 'DIN', 'Consolas', monospace`（系统无则回退 Consolas）。
- 布局：左/右侧面板宽 `419px`，顶栏下方不再浮动统计横条；底部滚动消息栏不在本轮。
- 红线：保持零下行（不新增公网端点）、CSP 兼容（无 inline style 注入）、TS strict（无 `any`）。
- 提交信息不使用括号 scope，例如 `fix: 描述` / `feat: 描述`。

---

### Task 1: 对齐设计令牌（配色 + 字体变量）

**Files:**

- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`

**Interfaces:**

- 产出：供后续 Task 3/4 使用的 CSS 变量名（`--color-accent-2`、`--color-border`、`--font-number`、`--font-display`）。

- [ ] **Step 1: 修改 tokens.css 颜色与字体变量**

将 `src/styles/tokens.css` 全文替换为：

```css
:root {
  /* ---- 基底色（设计稿 §5-1 色彩规范） ---- */
  --color-bg: #0b1526;
  --color-primary: #13293c;
  --color-primary-soft: #1a3f4e;

  /* ---- 强调发光（大屏科技青 #00D0FF） ---- */
  --color-accent: #00d4ff;
  --color-accent-2: #2e7cf6;
  --color-accent-soft: rgb(0 212 255 / 12%);
  --color-accent-glow: rgb(0 212 255 / 35%);

  /* ---- 语义色（设计稿：成功/警示/危险） ---- */
  --color-danger: #ff4a5a;
  --color-warning: #ffb020;
  --color-success: #2eec68;

  /* ---- 文本（设计稿：正文白 / 辅助灰蓝） ---- */
  --color-text: #eaf2fb;
  --color-text-muted: #8faec3;

  /* ---- 面板（玻璃拟态，边框线取 #2AA7B8） ---- */
  --glass-bg: rgb(19 41 60 / 62%);
  --glass-border: rgb(42 167 184 / 42%);
  --glass-blur: 12px;
  --row-alt-bg: rgb(0 212 255 / 5%);

  /* ---- 排版（设计稿 §5-3：面板标题 16 / 正文 14 / 辅助 12） ---- */
  --font-title: 16px;
  --font-body: 14px;
  --font-display: 26px;
  --font-number: 'Poppins', 'DIN', 'Consolas', monospace;

  /* ---- 间距（外边距 16 / 内边距 24） ---- */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;

  /* ---- 圆角 ---- */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}
```

- [ ] **Step 2: 修改 global.css 背景与字体**

在 `src/styles/global.css` 中：

1. 将 `body` 的 `font-family` 改为 `'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif`；
2. 将 `body` 的 `background-image` 第二个 `linear-gradient` 起止色改为设计稿主背景：`linear-gradient(180deg, #0b1526 0%, #08111f 100%)`；
3. 预留数字字体工具类（追加到文件末尾）：

```css
.font-number {
  font-family: var(--font-number);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: 验证样式层无语法错误**

Run: `npx vue-tsc --noEmit` （仅确认无 TS/样式引用报错，颜色改动不改类型）

Expected: 无 error 输出（忽略与本次无关的文件警告）。

- [ ] **Step 4: 提交**

```bash
git add src/styles/tokens.css src/styles/global.css
git commit -m "fix: 对齐设计稿配色与字体令牌"
```

---

### Task 2: 新建可复用 PanelCard 面板容器组件

**Files:**

- Create: `src/components/common/PanelCard.vue`
- Create: `src/components/common/PanelCard.spec.ts`

**Interfaces:**

- 产出：`<PanelCard title="..." icon="Bell" more="更多" @more="fn">插槽内容</PanelCard>`，内部复用 `.glass-panel`，标题区带图标 + 文字 + 右侧「更多」链接，底部追加青色光带。
- `icon` 为 `@element-plus/icons-vue` 组件名（字符串），经 `<component :is="...">` 渲染。

- [ ] **Step 1: 写失败测试**

`src/components/common/PanelCard.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PanelCard from './PanelCard.vue';

describe('PanelCard', () => {
  it('渲染标题与插槽内容', () => {
    const wrapper = mount(PanelCard, {
      props: { title: '实时告警' },
      slots: { default: '<p class="slot-body">内容</p>' },
    });
    expect(wrapper.text()).toContain('实时告警');
    expect(wrapper.find('.slot-body').exists()).toBe(true);
  });

  it('点击更多触发 more 事件', async () => {
    const wrapper = mount(PanelCard, {
      props: { title: '实时告警', more: '更多' },
    });
    await wrapper.find('.panel-more').trigger('click');
    expect(wrapper.emitted('more')).toBeTruthy();
  });

  it('无 more 时不渲染更多链接', () => {
    const wrapper = mount(PanelCard, { props: { title: '标题' } });
    expect(wrapper.find('.panel-more').exists()).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/components/common/PanelCard.spec.ts`

Expected: FAIL（`Cannot find module './PanelCard.vue'`）。

- [ ] **Step 3: 实现 PanelCard.vue**

`src/components/common/PanelCard.vue`：

```vue
<script setup lang="ts">
import { computed } from 'vue';
import * as ElementPlusIcons from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
    more?: string;
  }>(),
  { title: '', icon: '', more: '' },
);

const emit = defineEmits<{ (e: 'more'): void }>();

const iconComp = computed(() => {
  if (!props.icon) return null;
  return (ElementPlusIcons as Record<string, unknown>)[props.icon] ?? null;
});
</script>

<template>
  <section class="panel-card glass-panel">
    <header v-if="title" class="panel-card__head">
      <component :is="iconComp" v-if="iconComp" class="panel-card__icon" />
      <h2 class="panel-title panel-card__title">{{ title }}</h2>
      <button v-if="more" type="button" class="panel-more" @click="emit('more')">
        {{ more }}
        <span class="panel-more__arrow">›</span>
      </button>
    </header>
    <div class="panel-card__body">
      <slot />
    </div>
    <span class="panel-card__glow" aria-hidden="true" />
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  position: relative;
}

.panel-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg) 0;
}

.panel-card__icon {
  color: var(--color-accent);
  font-size: 18px;
}

.panel-card__title {
  flex: 1;
}

.panel-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.panel-more:hover {
  color: var(--color-accent);
}

.panel-more__arrow {
  font-size: 14px;
  line-height: 1;
}

.panel-card__body {
  flex: 1;
  min-height: 0;
  padding: var(--space-md) var(--space-lg) var(--space-lg);
}

/* 底部青色光带（设计稿面板容器底部光带） */
.panel-card__glow {
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.55;
  pointer-events: none;
}
</style>
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/components/common/PanelCard.spec.ts`

Expected: PASS（3 个用例）。

- [ ] **Step 5: 提交**

```bash
git add src/components/common/PanelCard.vue src/components/common/PanelCard.spec.ts
git commit -m "feat: 新增可复用 PanelCard 面板容器组件"
```

---

### Task 3: 重构大屏首页为三栏布局

**Files:**

- Modify: `src/views/dashboard/index.vue`（template 388-668 行 `<style>` 部分整体替换为三栏样式；template 306-386 行结构调整）
- Test: `src/views/dashboard/index.spec.ts`（新建；断言三栏结构与统计卡在左面板）

**Interfaces:**

- 消费：Task 2 的 `PanelCard`（`<PanelCard title icon more>`）；Task 1 的令牌（`--color-accent-2`、`--font-number`、`--font-display`）。
- 结构：`.dash-left`（419px 左面板：统计卡组 + 趋势图面板） + `.dash-right`（419px 右面板：告警列表） + 中央 `BaseMap` + `.map-mode-switch`（地图右上角 2D/3D）。

- [ ] **Step 1: 写失败测试**

`src/views/dashboard/index.spec.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Dashboard from './index.vue';

describe('dashboard 大屏首页', () => {
  it('渲染左/右面板与中央地图三栏', () => {
    const wrapper = mount(Dashboard, {
      global: { stubs: { BaseMap: true } },
    });
    expect(wrapper.find('.dash-left').exists()).toBe(true);
    expect(wrapper.find('.dash-right').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'BaseMap' }).exists()).toBe(true);
  });

  it('统计卡位于左侧面板', () => {
    const wrapper = mount(Dashboard, {
      global: { stubs: { BaseMap: true } },
    });
    const left = wrapper.find('.dash-left');
    expect(left.find('.stat-grid').exists()).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/views/dashboard/index.spec.ts`

Expected: FAIL（`.dash-left`/`.dash-right` 不存在）。

- [ ] **Step 3: 替换 template 为三栏结构**

将 `src/views/dashboard/index.vue` 的 `<template>`（306-386 行）整体替换为：

```vue
<template>
  <div class="dashboard dashboard-map">
    <!-- Cesium 二三维一体化地图（中央主视觉） -->
    <BaseMap
      :tile-url="MAP_TILE_URL"
      :alarms="alarmPoints"
      :devices="devicePoints"
      :zones="riskZones"
      :scene-mode="sceneMode"
      @error="onMapError"
      @mode-change="(m) => (sceneMode = m)"
    />

    <!-- 地图降级提示 -->
    <p v-if="mapNotice" class="map-notice">{{ mapNotice }}</p>

    <!-- 2D/3D 切换浮层（地图右上角） -->
    <div v-if="!loading" class="map-mode-switch">
      <button
        type="button"
        class="mode-btn"
        :class="{ active: sceneMode === '2d' }"
        @click="sceneMode = '2d'"
      >
        2D
      </button>
      <button
        type="button"
        class="mode-btn"
        :class="{ active: sceneMode === '3d' }"
        @click="sceneMode = '3d'"
      >
        3D
      </button>
    </div>

    <!-- 左侧面板区（419px）：统计卡 + 趋势图 -->
    <div v-if="!loading" class="dash-left">
      <PanelCard title="态势概览" icon="DataBoard">
        <div class="stat-grid">
          <div v-for="s in stats" :key="s.label" class="stat-cell">
            <span class="stat-value font-number" :class="'tone-' + s.tone">
              {{ s.value }}<i v-if="s.unit">{{ s.unit }}</i>
            </span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="近 24h 告警/处置" icon="TrendCharts">
        <div ref="chartRef" class="chart" />
      </PanelCard>
    </div>

    <!-- 右侧面板区（419px）：实时告警列表 -->
    <aside v-if="!loading" class="dash-right">
      <PanelCard title="实时告警" icon="Bell" more="更多" @more="onMoreAlarms">
        <p v-if="mockError" class="mock-tip">{{ mockError }}</p>
        <ul v-else class="alarm-list">
          <li
            v-for="(a, index) in alarms"
            :key="a.id"
            class="alarm-row"
            :class="{ 'row-odd': index % 2 === 1 }"
          >
            <span class="alarm-dot" :class="'tone-' + a.tone" />
            <span class="alarm-level" :class="'tone-' + a.tone">{{ a.level }}</span>
            <span class="alarm-device">{{ a.device }}</span>
            <span class="alarm-time font-number">{{ a.time }}</span>
          </li>
          <li v-if="alarms.length === 0" class="alarm-empty">暂无告警数据</li>
        </ul>
        <div v-if="mockReady && !mockError" class="live-tag"><i class="live-dot" />LIVE</div>
      </PanelCard>
    </aside>

    <!-- 骨架屏（加载期覆盖） -->
    <div v-if="loading" class="dashboard-skeleton" data-test="dashboard-skeleton">
      <span class="skeleton skeleton-line" style="width: 200px" />
      <span class="skeleton skeleton-line" style="width: 160px" />
      <span class="skeleton skeleton-line" style="width: 180px" />
    </div>
  </div>
</template>
```

并在 `<script setup>` 中 `emit` 之后新增 `onMoreAlarms` 占位函数（无路由跳转，仅阻止默认；后续接入二级页）：

```ts
function onMoreAlarms(): void {
  // TODO 后续 change：跳转到告警二级列表页
}
```

- [ ] **Step 4: 替换 style 为三栏样式**

将 `src/views/dashboard/index.vue` 的 `<style scoped>`（388-668 行）整体替换为：

```css
.dashboard-map {
  position: relative;
  height: 100%;
  overflow: hidden;
}

/* 地图降级提示 */
.map-notice {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  background: rgb(255 176 32 / 15%);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: 12px;
}

/* 2D/3D 切换浮层（地图右上角） */
.map-mode-switch {
  position: absolute;
  top: var(--space-md);
  right: calc(419px + var(--space-md) * 2);
  z-index: 6;
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--radius-sm);
  background: rgb(0 212 255 / 10%);
}

.mode-btn {
  padding: 4px 14px;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.mode-btn.active {
  color: var(--color-accent);
  background: rgb(0 212 255 / 18%);
}

/* 左侧面板区（设计稿 419px） */
.dash-left {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  bottom: var(--space-md);
  width: 419px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* 右侧面板区（设计稿 419px） */
.dash-right {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  bottom: var(--space-md);
  width: 419px;
  z-index: 5;
}

.dash-right :deep(.panel-card) {
  height: 100%;
}

/* 统计卡网格：2 列 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.stat-value {
  font-size: var(--font-display);
  font-weight: 600;
  line-height: 1.1;
  color: var(--color-text);
  text-shadow: 0 0 12px rgb(0 212 255 / 25%);
}

.stat-value i {
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--color-text-muted);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 12px;
}

/* 趋势图高度自适应面板的剩余空间 */
.chart {
  height: 180px;
  width: 100%;
}

/* 告警列表 */
.alarm-list {
  list-style: none;
  margin: var(--space-md) 0 0;
  padding: 0;
}

.alarm-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-sm);
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.alarm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.alarm-dot.tone-danger {
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger);
}

.alarm-dot.tone-warning {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning);
}

.alarm-dot.tone-info {
  background: var(--color-text-muted);
}

.alarm-level {
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.alarm-device {
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-time {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.alarm-empty {
  padding: var(--space-md) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.live-tag {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  font-size: 12px;
  color: var(--color-success);
  letter-spacing: 1px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success);
  animation: live-blink 1.6s ease-in-out infinite;
}

@keyframes live-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.mock-tip {
  margin-top: var(--space-md);
  color: var(--color-warning);
  font-size: 13px;
}

/* 骨架屏 */
.dashboard-skeleton {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-bg);
}

.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    rgb(120 160 210 / 8%),
    rgb(120 160 210 / 18%),
    rgb(120 160 210 / 8%)
  );
  background-size: 200% 100%;
  animation: skeleton-sweep 1.4s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-line {
  height: 16px;
}

@keyframes skeleton-sweep {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* 语义色 */
.tone-accent {
  color: var(--color-accent);
}

.tone-danger {
  color: var(--color-danger);
}

.tone-warning {
  color: var(--color-warning);
}

.tone-success {
  color: var(--color-success);
}

.tone-info {
  color: var(--color-text-muted);
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npx vitest run src/views/dashboard/index.spec.ts`

Expected: PASS（2 个用例）。

- [ ] **Step 6: 提交**

```bash
git add src/views/dashboard/index.vue src/views/dashboard/index.spec.ts
git commit -m "feat: 大屏首页重构为三栏并接入 PanelCard"
```

---

### Task 4: 全量验证

**Files:**

- 无新增；对全部改动做回归。

- [ ] **Step 1: 运行 lint + typecheck + test + build**

Run: `npm run lint && npx vue-tsc --noEmit && npx vitest run && npm run build`

Expected: 全部 0 error / PASS / build 成功。

- [ ] **Step 2: 修复回归（如有）**

若报错，定位到对应文件修复后重跑 Step 1，直至全绿。

- [ ] **Step 3: 提交（如有修复）**

```bash
git add -A
git commit -m "fix: 大屏首页对齐全量验证修复"
```

（若无改动则跳过提交。）

---

## 自审

- **Spec 覆盖**：配色令牌(Task1)、字体(Task1)、三栏布局(Task3)、PanelCard 容器(Task2)、统计卡入左面板(Task3)、告警列表右面板(Task3)、趋势图(Task3)、底部消息栏 — 已明确划出本轮范围（全局组件后续）。✓
- **占位扫描**：Task3 `onMoreAlarms` 标 TODO 注释，但其为后续 change 跳转，本轮仅占位无副作用；非「实现占位」性质，可接受。其余步骤均含完整代码。✓
- **类型一致性**：`PanelCard` props(`title/icon/more`) 与 `dashboard` 用法一致；`tone-*` class 名在 tokens 与 dashboard 一致。✓
