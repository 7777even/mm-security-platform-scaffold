# 指挥大屏视觉升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将脚手架从"占位页"视觉升级为符合石化智云 UI 规范的指挥大屏样式（深色科技蓝 + 青色发光 + 玻璃面板），逻辑/权限/门禁不动。

**Architecture:** 纯样式层升级：重构设计 token 与全局样式 → 重构 AppLayout 为大屏式（顶部发光标题栏 + 模块导航 + 时钟）→ Dashboard 精致化（指标卡/发光图表/斑马纹告警列表）→ 其余页面统一面板形态。不新增依赖，不修改 stores/composables/services/router/测试。

**Tech Stack:** Vue3 + Vite5 + TS(strict) + Element Plus + ECharts(按需) + Stylelint(prettier 对齐)

## Global Constraints

- 设计 token 基准 `#0F1E36` 安全工业蓝（spec 红线，不得移除）。
- 排版对齐石化智云规范：默认字体微软雅黑优先；标题 16px / 正文 14px；页面外边距 16px / 面板内边距 24px。
- 全站避免视觉噪点，文本高对比高易读；列表隔行变色。
- Chromium 86 为兼容下限（backdrop-filter 已支持，不使用过新 CSS 特性）。
- stylelint-config-standard：色值小写/6 位、现代 color-function（`rgb(0 212 255 / 45%)` 空格语法）、规则间空行、禁止 vendor 前缀。
- TS strict + 禁 any + 禁未用变量（ESLint flat）。
- 逻辑零改动：权限守卫、路由、stores/composables/services、TDD 测试文件一律不动。

---

### Task 1: 设计 Token 与全局样式

**Files:**
- Modify(覆盖): `src/styles/tokens.css`
- Modify(覆盖): `src/styles/global.css`

**Interfaces:**
- 产出：`--color-bg/primary/primary-soft/accent/accent-soft/accent-glow`、`--color-danger/warning/success`、`--color-text/text-muted`、`--glass-bg/border/blur`、`--row-alt-bg`、`--font-title/body`、`--space-*`、`--radius-*` 等 CSS 变量；全局类 `.glass-panel`（渐变描边+顶部亮线+内发光+hover）、`.panel-title`（青色竖条+发光）、`.row-odd`（隔行变色）。
- 消费方：Task 2-4 的所有 Vue 组件。

- [ ] **Step 1: 重写 `src/styles/tokens.css`**

```css
:root {
  /* ---- 基底色（spec 红线：安全工业蓝 #0F1E36） ---- */
  --color-bg: #050a15;
  --color-primary: #0f1e36;
  --color-primary-soft: #16304f;

  /* ---- 强调发光（大屏科技青） ---- */
  --color-accent: #00d4ff;
  --color-accent-soft: rgb(0 212 255 / 12%);
  --color-accent-glow: rgb(0 212 255 / 35%);

  /* ---- 语义色 ---- */
  --color-danger: #f5414b;
  --color-warning: #faad14;
  --color-success: #52c41a;

  /* ---- 文本（高对比） ---- */
  --color-text: #eaf2fb;
  --color-text-muted: #7e9bb8;

  /* ---- 面板（玻璃拟态） ---- */
  --glass-bg: rgb(15 30 54 / 62%);
  --glass-border: rgb(0 212 255 / 28%);
  --glass-blur: 12px;
  --row-alt-bg: rgb(0 212 255 / 5%);

  /* ---- 排版（石化智云：标题 16 / 正文 14） ---- */
  --font-title: 16px;
  --font-body: 14px;

  /* ---- 间距（石化智云：外边距 16 / 内边距 24） ---- */
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

- [ ] **Step 2: 重写 `src/styles/global.css`**

```css
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
}

body {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Segoe UI', sans-serif;
  font-size: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  background-image:
    radial-gradient(circle at 50% -12%, rgb(0 212 255 / 10%), transparent 62%),
    linear-gradient(180deg, #0a1428 0%, #050a15 100%);
  background-attachment: fixed;
}

/* 细窄青色滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgb(255 255 255 / 4%);
}

::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}

/* 玻璃面板：渐变描边 + 顶部亮线 + 内发光 + hover 微光 */
.glass-panel {
  position: relative;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  backdrop-filter: blur(var(--glass-blur));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 6%),
    inset 0 0 24px rgb(0 212 255 / 4%);
}

.glass-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(0 212 255 / 60%), transparent);
  pointer-events: none;
}

.glass-panel:hover {
  border-color: rgb(0 212 255 / 45%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 8%),
    0 0 16px rgb(0 212 255 / 12%);
}

/* 面板标题：青色竖条 + 发光 */
.panel-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0;
  font-size: var(--font-title);
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text);
}

.panel-title::before {
  content: '';
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
}

/* 列表隔行变色 */
.row-odd {
  background: var(--row-alt-bg);
}
```

- [ ] **Step 3: 验证样式门禁**

Run: `npx stylelint "src/**/*.{css,vue}"`
Expected: 无输出、exit 0（0 errors）。

---

### Task 2: 大屏式布局（AppLayout）

**Files:**
- Modify(覆盖): `src/components/layout/AppLayout.vue`

**Interfaces:**
- 消费：`usePermission().filterRoutesByPerm`（已有）、`useAuthStore()`/`ROLE_PERMS`/`RoleId`（已有，签名不变）。
- 产出：顶部 header（左：盾牌 Logo + 发光品牌名，点击返回 `/`；中：模块导航 RouterLink 按 meta.perm 过滤并高亮；右：秒级时钟 + 角色 Select）；全屏内容区 `<RouterView />`。

- [ ] **Step 1: 重写 `src/components/layout/AppLayout.vue`**

```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { usePermission } from '@/composables/usePermission'
import { useAuthStore, ROLE_PERMS, type RoleId } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { filterRoutesByPerm } = usePermission()

const now = ref('')
let timer: ReturnType<typeof setInterval> | null = null

// 大屏模块导航：按当前角色 meta.perm 动态过滤（未授权菜单不渲染）
const menuRoutes = computed(() => {
  const root = router.options.routes.find((r) => r.path === '/')
  return root ? filterRoutesByPerm(root.children ?? []) : []
})

const roleOptions = computed(() => Object.keys(ROLE_PERMS) as RoleId[])

function onRoleChange(id: RoleId): void {
  auth.setRole(id)
}

function tick(): void {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  now.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function goHome(): void {
  router.push('/')
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="screen">
    <header class="header">
      <div class="brand" title="返回首页" @click="goHome">
        <!-- 盾牌 Logo：风格化占位，正式接入时替换为中石化品牌资产 -->
        <svg class="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 15v-3h2.5v3" />
          <path d="M13.5 15v-5h2.5v5" />
          <path d="M7 15h10" />
        </svg>
        <span class="brand-title">安全管控指挥系统</span>
      </div>

      <nav class="nav" aria-label="模块导航">
        <RouterLink
          v-for="item in menuRoutes"
          :key="item.path"
          :to="'/' + item.path"
          class="nav-item"
          :class="{ active: route.path.startsWith('/' + item.path) }"
        >
          {{ item.meta?.title }}
        </RouterLink>
      </nav>

      <div class="header-right">
        <span class="clock">{{ now }}</span>
        <el-select :model-value="auth.roleId" class="role-select" size="small" @change="onRoleChange">
          <el-option v-for="role in roleOptions" :key="role" :label="role" :value="role" />
        </el-select>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  height: 56px;
  padding: 0 var(--space-lg);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgb(15 30 54 / 92%), rgb(15 30 54 / 65%));
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
}

/* 底部青色亮线 */
.header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(0 212 255 / 55%), transparent);
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.logo {
  width: 30px;
  height: 30px;
  color: var(--color-accent);
  filter: drop-shadow(0 0 6px var(--color-accent-glow));
}

.brand-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-text);
  text-shadow: 0 0 14px var(--color-accent-glow);
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: var(--space-xs);
  flex: 1;
  justify-content: center;
}

.nav-item {
  padding: 6px 18px;
  border-radius: 20px;
  font-size: var(--font-body);
  letter-spacing: 1px;
  color: var(--color-text-muted);
  text-decoration: none;
  border: 1px solid transparent;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-accent-soft);
}

.nav-item.active {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-color: var(--glass-border);
  box-shadow: 0 0 12px rgb(0 212 255 / 15%);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.clock {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--color-text);
  text-shadow: 0 0 8px rgb(0 212 255 / 30%);
  white-space: nowrap;
}

.role-select {
  width: 140px;
}

.role-select :deep(.el-select__wrapper) {
  background: rgb(0 0 0 / 25%);
  box-shadow: 0 0 0 1px var(--glass-border) inset;
}

.role-select :deep(.el-select__placeholder),
.role-select :deep(.el-select__selected-item) {
  color: var(--color-text);
}

.content {
  flex: 1;
  padding: var(--space-md);
  overflow: auto;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `npx vue-tsc -b && npx stylelint "src/**/*.{css,vue}" && npx eslint . --ext .js,.ts,.vue`
Expected: 全部无输出、exit 0。

---

### Task 3: Dashboard 视觉升级

**Files:**
- Modify(覆盖): `src/views/dashboard/index.vue`

**Interfaces:**
- 消费：`--space-*`/`--color-*`/`--glass-*` token；全局 `.glass-panel`/`.panel-title`/`.row-odd` 类；全局注册的 Element Plus 图标（Odometer/Monitor/Bell/CircleCheck）。
- 产出：4 张发光指标卡 + 近 24h 告警/处置发光趋势图 + 隔行变色实时告警列表。

- [ ] **Step 1: 重写 `src/views/dashboard/index.vue`**

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, type LineSeriesOption } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'

// 按需注册 ECharts 模块，控制产物体积
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

type ECOption = ComposeOption<LineSeriesOption>

// 图表配置色值（ECharts 不消费 CSS 变量，此处集中定义避免魔法字符串）
const CHART_ACCENT = '#00d4ff'
const CHART_SUCCESS = '#52c41a'
const CHART_TEXT = '#7e9bb8'

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const stats = [
  { label: '安全运行天数', value: '128', unit: '天', icon: 'Odometer', tone: 'accent' },
  { label: '在线点位', value: '864', unit: '个', icon: 'Monitor', tone: 'accent' },
  { label: '今日告警', value: '12', unit: '条', icon: 'Bell', tone: 'danger' },
  { label: '设备完好率', value: '98.6%', unit: '', icon: 'CircleCheck', tone: 'success' },
]

const alarms = [
  { id: 1, level: '重大', tone: 'danger', device: '一号储罐区 · 液位超高', time: '14:32:05' },
  { id: 2, level: '预警', tone: 'warning', device: '反应釜 B 区 · 压力波动', time: '14:28:41' },
  { id: 3, level: '提示', tone: 'info', device: '工业视频 · 摄像头离线', time: '14:15:09' },
  { id: 4, level: '提示', tone: 'info', device: '环境监测 · 雨水排口 COD 偏高', time: '13:52:20' },
  { id: 5, level: '重大', tone: 'danger', device: '甲醇仓库 · 温度超限', time: '13:31:44' },
]

function hours(): string[] {
  const list: string[] = []
  const nowTime = new Date()
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowTime.getTime() - i * 3600 * 1000)
    list.push(`${String(d.getHours()).padStart(2, '0')}:00`)
  }
  return list
}

function renderChart(): void {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  const option: ECOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 30, 54, 0.92)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      textStyle: { color: '#eaf2fb' },
    },
    legend: { data: ['告警', '处置'], textStyle: { color: CHART_TEXT } },
    grid: { left: 48, right: 24, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours(),
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: CHART_TEXT },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.12)' } },
      axisLabel: { color: CHART_TEXT },
    },
    series: [
      {
        name: '告警',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [0, 1, 0, 2, 1, 3, 2, 1, 0, 2, 4, 3, 2, 1, 3, 5, 4, 6, 3, 2, 4, 3, 2, 1],
        lineStyle: { color: CHART_ACCENT, width: 2, shadowColor: 'rgba(0, 212, 255, 0.6)', shadowBlur: 10 },
        itemStyle: { color: CHART_ACCENT },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.28)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0)' },
          ]),
        },
      },
      {
        name: '处置',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [0, 0, 1, 1, 0, 2, 2, 1, 0, 1, 3, 2, 2, 1, 2, 4, 3, 5, 3, 2, 3, 3, 1, 1],
        lineStyle: { color: CHART_SUCCESS, width: 2 },
        itemStyle: { color: CHART_SUCCESS },
      },
    ],
  }
  chart.setOption(option)
}

function onResize(): void {
  chart?.resize()
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="dashboard">
    <div class="stat-grid">
      <div v-for="s in stats" :key="s.label" class="glass-panel stat-card">
        <el-icon class="stat-icon" :class="'tone-' + s.tone" :size="22">
          <component :is="s.icon" />
        </el-icon>
        <div class="stat-meta">
          <span class="stat-label">{{ s.label }}</span>
          <span class="stat-value" :class="'tone-' + s.tone">
            {{ s.value }}<i v-if="s.unit">{{ s.unit }}</i>
          </span>
        </div>
      </div>
    </div>

    <div class="middle-grid">
      <div class="glass-panel chart-panel">
        <h2 class="panel-title">近 24 小时告警 / 处置趋势</h2>
        <div ref="chartRef" class="chart" />
      </div>

      <div class="glass-panel alarm-panel">
        <h2 class="panel-title">实时告警</h2>
        <ul class="alarm-list">
          <li
            v-for="(a, index) in alarms"
            :key="a.id"
            class="alarm-row"
            :class="{ 'row-odd': index % 2 === 1 }"
          >
            <span class="alarm-dot" :class="'tone-' + a.tone" />
            <span class="alarm-level" :class="'tone-' + a.tone">{{ a.level }}</span>
            <span class="alarm-device">{{ a.device }}</span>
            <span class="alarm-time">{{ a.time }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.stat-icon {
  color: var(--color-accent);
}

.stat-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  text-shadow: 0 0 12px rgb(0 212 255 / 25%);
}

.stat-value i {
  margin-left: var(--space-xs);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  color: var(--color-text-muted);
}

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

.middle-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--space-md);
  flex: 1;
  min-height: 360px;
}

.chart-panel {
  padding: var(--space-lg);
}

.chart {
  height: 320px;
  width: 100%;
  margin-top: var(--space-sm);
}

.alarm-panel {
  padding: var(--space-lg);
  overflow: auto;
}

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
  font-family: Consolas, 'Courier New', monospace;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `npx vue-tsc -b && npx stylelint "src/**/*.{css,vue}" && npx eslint . --ext .js,.ts,.vue`
Expected: 全部无输出、exit 0。

---

### Task 4: 其余页面统一面板形态

**Files:**
- Modify(覆盖): `src/views/fire-alarm/index.vue`
- Modify(覆盖): `src/views/industrial-video/index.vue`
- Modify(覆盖): `src/views/system/users.vue`
- Modify(覆盖): `src/views/error/NotFound.vue`

**Interfaces:**
- 消费：全局 `.glass-panel`/`.panel-title` 类与 token。
- 产出：统一精致面板页面（发光标题 + 占位文案），`NotFound` 含发光 404。

- [ ] **Step 1: 重写 `src/views/fire-alarm/index.vue`**

```vue
<script setup lang="ts">
// 火灾报警模块（占位）；后续接入 realtime-channel 实时订阅火灾告警数据
</script>

<template>
  <section class="glass-panel page-panel">
    <h2 class="panel-title">火灾报警</h2>
    <p class="panel-empty">模块开发中：接入 realtime-channel 实时订阅火灾告警数据。</p>
  </section>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
}

.panel-empty {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
}
</style>
```

- [ ] **Step 2: 重写 `src/views/industrial-video/index.vue`**

```vue
<script setup lang="ts">
// 工业视频模块（占位）；后续接入视频流渲染与摄像头状态订阅
</script>

<template>
  <section class="glass-panel page-panel">
    <h2 class="panel-title">工业视频</h2>
    <p class="panel-empty">模块开发中：接入视频流渲染与摄像头状态订阅。</p>
  </section>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
}

.panel-empty {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
}
</style>
```

- [ ] **Step 3: 重写 `src/views/system/users.vue`**

```vue
<script setup lang="ts">
// 用户与权限模块（占位）；演示 RBAC 按钮级权限（v-permission / hasPerm）
</script>

<template>
  <section class="glass-panel page-panel">
    <h2 class="panel-title">用户与权限</h2>
    <p class="panel-empty">模块开发中：用户管理、角色与按钮级权限配置。</p>
  </section>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
}

.panel-empty {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
}
</style>
```

- [ ] **Step 4: 重写 `src/views/error/NotFound.vue`**

```vue
<script setup lang="ts">
// 404 页面
</script>

<template>
  <section class="glass-panel page-panel not-found">
    <h2 class="panel-title">页面不存在</h2>
    <p class="code">404</p>
    <p class="panel-empty">您访问的页面不存在或已被移除。</p>
  </section>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
  text-align: center;
}

.code {
  margin: var(--space-lg) 0 var(--space-sm);
  font-size: 72px;
  font-weight: 700;
  color: var(--color-accent);
  text-shadow: 0 0 24px var(--color-accent-glow);
}

.panel-empty {
  color: var(--color-text-muted);
}
</style>
```

- [ ] **Step 5: 验证**

Run: `npx vue-tsc -b && npx stylelint "src/**/*.{css,vue}" && npx eslint . --ext .js,.ts,.vue`
Expected: 全部无输出、exit 0。

---

### Task 5: 全量门禁与目验

**Files:** 无（仅验证）。

- [ ] **Step 1: 全量门禁**

Run: `npm run lint && npm run test && npm run build && npx stylelint "src/**/*.{css,vue}"`
Expected:
- eslint 0 error；
- vitest 26/26 通过（`src/constants/deviceCode.spec.ts` 5、`src/composables/usePermission.spec.ts` 12、`src/services/ws.spec.ts` 9）；
- build 成功并产出 `.js`/`.css` 与对应 `.gz`；
- stylelint 0 error。

- [ ] **Step 2: 目验**

Run: `npm run dev`，浏览器打开 `http://localhost:5173`。
Expected：深蓝渐变底、顶部发光标题栏（Logo 点击返回首页、导航高亮、时钟走秒）、dashboard 发光指标卡/趋势图/斑马纹告警列表；切换角色后导航随之过滤。
