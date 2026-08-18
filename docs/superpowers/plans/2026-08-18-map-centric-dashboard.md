# dashboard「应急一张图」地图底座 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 dashboard 重构为全屏 OpenLayers 地图底座，叠加报警/设备/区域图层，悬浮指标卡/告警列表/趋势图面板。

**Architecture:** OpenLayers 2D 地图占满 dashboard；mock 地图接口（GeoJSON Feature）驱动点位图层；半透明玻璃面板悬浮于地图之上；ws 实时告警联动点位。

**Tech Stack:** Vue3 + OpenLayers(`ol`) + ECharts（已有）+ mock（`/map/alarms`、`/map/devices`、`/dashboard/risk-heatmap`）

## Global Constraints

- TypeScript strict，禁 `any`（`no-explicit-any` 为 error）
- eslint / vue-tsc / stylelint / vitest 全绿，build 成功（含 gzip）
- 命令：`npm run lint`、`npm run type-check`、`npm run stylelint`、`npm run test`、`npm run build`
- 产物体积：`node scripts/analyze-dist.mjs` 检查，chunk >500KB 预警
- 不改路由/权限/动态菜单/错误边界（`src/router/*`、`src/directives/*`、`src/stores/auth.ts`、`src/components/AppErrorBoundary.vue`）
- 只监不控红线：地图/列表仅展示，无任何硬控写接口
- mock 不可达时静态兜底 + 黄色提示，不白屏

---

### Task 1: 安装 OpenLayers 并接入 CSP 放行

**Files:**
- Modify: `package.json`（依赖）
- Modify: `vite.config.ts:10-17`（CSP）

**Interfaces:**
- Produces: `ol` 依赖可用；开发态 CSP `img-src` 放行 `https:`（OSM 瓦片外域）

- [ ] **Step 1: 安装依赖**

Run: `npm install ol@^10 2>&1 | findstr /C:"added"`

- [ ] **Step 2: 修改 CSP 放行瓦片外域**

`vite.config.ts` 中 csp 数组 `img-src` 行改为：

```ts
"img-src 'self' data: blob: https: http:",
```

- [ ] **Step 3: 验证构建可用**

Run: `npm run build 2>&1 | findstr /C:"built in" /C:"error"`
Expected: built in（ol 已可解析）

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "feat: 引入 OpenLayers 与瓦片 CSP 放行"
```

---

### Task 2: map service 层（TDD）

**Files:**
- Create: `src/services/map.ts`
- Test: `src/services/map.spec.ts`

**Interfaces:**
- Consumes: `request`（`@/services/http`）、`ApiResponse`/`PageResult`（`@/types`）
- Produces:
  - `interface MapPoint { id: string; name: string; lng: number; lat: number; status?: string; level?: number }`
  - `interface RiskZone { name: string; score: number; polygon: [number, number][] }`
  - `fetchAlarmPoints(): Promise<MapPoint[]>`
  - `fetchDevicePoints(): Promise<MapPoint[]>`
  - `fetchRiskZones(): Promise<RiskZone[]>`
  - `FALLBACK_ALARM_POINTS` / `FALLBACK_DEVICE_POINTS` / `FALLBACK_RISK_ZONES`（静态兜底）

- [ ] **Step 1: 写失败测试**

`src/services/map.spec.ts`：

```ts
import { describe, it, expect } from 'vitest'
import {
  normalizeFeature,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
  FALLBACK_RISK_ZONES,
  type MapPoint,
} from '@/services/map'

describe('map service：GeoJSON Feature 归一化', () => {
  it('报警 Feature → MapPoint', () => {
    const p = normalizeFeature(
      { type: 'Feature', properties: { alarmId: 'A1', level: 1, type: 'FIRE' }, geometry: { type: 'Point', coordinates: [110.951, 21.672] } },
      'alarm',
    )
    expect(p.id).toBe('A1')
    expect(p.level).toBe(1)
    expect(p.lng).toBe(110.951)
    expect(p.lat).toBe(21.672)
  })

  it('设备 Feature → MapPoint', () => {
    const p = normalizeFeature(
      { type: 'Feature', properties: { deviceCode: 'D1', name: '烟感', status: 'ONLINE' }, geometry: { type: 'Point', coordinates: [110.95, 21.67] } },
      'device',
    )
    expect(p.id).toBe('D1')
    expect(p.status).toBe('ONLINE')
  })

  it('兜底点位非空且含坐标', () => {
    expect(FALLBACK_ALARM_POINTS.length).toBeGreaterThan(0)
    expect(FALLBACK_DEVICE_POINTS.length).toBeGreaterThan(0)
    for (const p of [...FALLBACK_ALARM_POINTS, ...FALLBACK_DEVICE_POINTS]) {
      expect(p.lng).toBeGreaterThan(0)
      expect(p.lat).toBeGreaterThan(0)
    }
  })

  it('兜底区域含五区域且各有 polygon', () => {
    expect(FALLBACK_RISK_ZONES).toHaveLength(5)
    for (const z of FALLBACK_RISK_ZONES) {
      expect(z.polygon.length).toBeGreaterThanOrEqual(3)
    }
  })
})
```

- [ ] **Step 2: 创建 stub 使 import 可解析**

`src/services/map.ts`：

```ts
import type { MapPoint, RiskZone } from './map'

export function normalizeFeature(): MapPoint {
  throw new Error('not implemented')
}
export async function fetchAlarmPoints(): Promise<MapPoint[]> {
  throw new Error('not implemented')
}
export async function fetchDevicePoints(): Promise<MapPoint[]> {
  throw new Error('not implemented')
}
export async function fetchRiskZones(): Promise<RiskZone[]> {
  throw new Error('not implemented')
}
export const FALLBACK_ALARM_POINTS: MapPoint[] = []
export const FALLBACK_DEVICE_POINTS: MapPoint[] = []
export const FALLBACK_RISK_ZONES: RiskZone[] = []
```

- [ ] **Step 3: 运行验证 RED**

Run: `npx vitest run src/services/map.spec.ts --reporter=basic --no-color 2>&1 | findstr /C:"Tests" /C:"FAIL"`
Expected: 4 failed

- [ ] **Step 4: 实现完整 map.ts**

```ts
import { request } from '@/services/http'

export interface MapPoint {
  id: string
  name: string
  lng: number
  lat: number
  status?: string
  level?: number
}

export interface RiskZone {
  name: string
  score: number
  polygon: [number, number][]
}

interface GeoJsonFeature {
  type: string
  properties: Record<string, unknown>
  geometry: { type: string; coordinates: number[] | number[][] }
}

const ZONE_COORDS: Record<string, [number, number][]> = {
  罐区: [[110.945, 21.678], [110.955, 21.678], [110.955, 21.67], [110.945, 21.67]],
  装置区: [[110.953, 21.674], [110.962, 21.674], [110.962, 21.665], [110.953, 21.665]],
  装卸区: [[110.94, 21.668], [110.948, 21.668], [110.948, 21.66], [110.94, 21.66]],
  公用工程: [[110.958, 21.68], [110.965, 21.68], [110.965, 21.675], [110.958, 21.675]],
  行政办公: [[110.948, 21.68], [110.956, 21.68], [110.956, 21.676], [110.948, 21.676]],
}

export function normalizeFeature(f: GeoJsonFeature, kind: 'alarm' | 'device'): MapPoint {
  const [lng, lat] = f.geometry.coordinates as [number, number]
  const props = f.properties
  const id = kind === 'alarm' ? String(props.alarmId ?? '') : String(props.deviceCode ?? '')
  return {
    id,
    name: String(props.name ?? props.type ?? id),
    lng,
    lat,
    status: props.status !== undefined ? String(props.status) : undefined,
    level: typeof props.level === 'number' ? props.level : undefined,
  }
}

export async function fetchAlarmPoints(): Promise<MapPoint[]> {
  const features = await request<GeoJsonFeature[]>({ url: '/map/alarms', method: 'GET' })
  return features.map((f) => normalizeFeature(f, 'alarm'))
}

export async function fetchDevicePoints(): Promise<MapPoint[]> {
  const features = await request<GeoJsonFeature[]>({ url: '/map/devices', method: 'GET' })
  return features.map((f) => normalizeFeature(f, 'device'))
}

export async function fetchRiskZones(): Promise<RiskZone[]> {
  const zones = await request<{ zone: string; score: number }[]>({ url: '/dashboard/risk-heatmap', method: 'GET' })
  return zones
    .filter((z) => ZONE_COORDS[z.zone])
    .map((z) => ({ name: z.zone, score: z.score, polygon: ZONE_COORDS[z.zone] }))
}

export const FALLBACK_ALARM_POINTS: MapPoint[] = [
  { id: 'A-FB-1', name: '罐区-01 烟感报警', lng: 110.951, lat: 21.672, level: 1 },
  { id: 'A-FB-2', name: '装置区-03 可燃报警', lng: 110.955, lat: 21.67, level: 2 },
  { id: 'A-FB-3', name: '装卸区-02 温度报警', lng: 110.944, lat: 21.665, level: 3 },
]

export const FALLBACK_DEVICE_POINTS: MapPoint[] = [
  { id: 'D-FB-1', name: '罐区-01 烟感', lng: 110.951, lat: 21.672, status: 'ONLINE' },
  { id: 'D-FB-2', name: '装置区-03 可燃', lng: 110.953, lat: 21.67, status: 'ONLINE' },
  { id: 'D-FB-3', name: '装卸区-02 温度', lng: 110.944, lat: 21.665, status: 'FAULT' },
]

export const FALLBACK_RISK_ZONES: RiskZone[] = Object.entries(ZONE_COORDS).map(([name, polygon]) => ({
  name,
  score: name === '罐区' ? 4.2 : name === '装置区' ? 3.1 : name === '装卸区' ? 2.6 : 1.5,
  polygon,
}))
```

> 注：spec.ts 需 `import type { MapPoint, RiskZone }`——实现含显式 `MapPoint`/`RiskZone` export，stub 阶段测试 import 即可解析。

- [ ] **Step 5: 运行验证 GREEN**

Run: `npx vitest run src/services/map.spec.ts --reporter=basic --no-color 2>&1 | findstr /C:"Tests"`
Expected: 4 passed

- [ ] **Step 6: 提交**

```bash
git add src/services/map.ts src/services/map.spec.ts
git commit -m "feat: 地图数据 service 层与兜底"
```

---

### Task 3: dashboard 重构为地图底座

**Files:**
- Rewrite: `src/views/dashboard/index.vue`
- Modify: `src/views/dashboard/index.vue`（保留原 stat-grid/趋势图/告警列表样式为悬浮面板）

**Interfaces:**
- Consumes: `ol`（Map/View/TileLayer/OSM/VectorLayer/VectorSource/Feature/Point/fromLonLat/Icon/Stroke/Fill/Circle`、`fetchAlarmPoints`/`fetchDevicePoints`/`fetchRiskZones`/`FALLBACK_*`、`RealtimeClient`、`fetchDashboardOverview`/`fetchAlarmTrend`/`fetchAlarmPage`、`markOnce`
- Produces: 地图底座 dashboard；`map:ready` 埋点；ws 告警联动地图点位

- [ ] **Step 1: 重写 dashboard 脚本与模板**

核心结构（要点，非全量代码）：

```vue
<script setup lang="ts">
// 引入 ol 按需模块
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { OSM } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style'
// ... map service / alarm service / ws / echarts / perf

const mapRef = ref<HTMLDivElement | null>(null)
let map: Map | null = null

const LEVEL_COLORS: Record<number, string> = { 1: '#ff4d4f', 2: '#faad14', 3: '#40a9ff', 4: '#8c9cb0' }
const STATUS_COLORS: Record<string, string> = { ONLINE: '#52c41a', OFFLINE: '#8c9cb0', FAULT: '#ff4d4f' }

function zoneColor(score: number): string {
  if (score >= 4) return 'rgba(255,77,79,0.22)'
  if (score >= 3) return 'rgba(250,173,20,0.2)'
  if (score >= 2) return 'rgba(64,169,255,0.18)'
  return 'rgba(140,156,176,0.14)'
}

function initMap(): void {
  if (!mapRef.value) return
  map = new Map({
    target: mapRef.value,
    layers: [
      // 底图：OSM + CSS 暗色滤镜（容器 class 加 .map-dark 滤镜）
      new TileLayer({ source: new OSM() }),
    ],
    view: new View({ center: fromLonLat([110.952, 21.672]), zoom: 14 }),
  })
  // 设备点图层 / 报警点图层 / 区域图层（VectorLayer + VectorSource + Feature）
}

// 渲染区域轮廓 → renderZones(zones)
// 渲染设备点 → renderDevices(points)（状态色圆点 + name label）
// 渲染报警点 → renderAlarms(points)（等级色圆点 + 点击 popup）
// 实时联动 → handleWsMessage 里新增 alarm point upsert
</script>
```

- [ ] **Step 2: 模板改为地图容器 + 悬浮面板**

```vue
<template>
  <div class="dashboard dashboard-map">
    <!-- 地图容器（全屏底） -->
    <div ref="mapRef" class="map-canvas" data-test="map-canvas" />

    <!-- 顶部指标卡横条 -->
    <div class="stat-bar glass-panel">
      <div v-for="s in stats" :key="s.label" class="stat-item">
        <span class="stat-value" :class="'tone-' + s.tone">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- 右侧告警列表 -->
    <aside class="alarm-panel glass-panel">
      <!-- 原 alarm-head + alarm-list 内容 -->
    </aside>

    <!-- 左下迷你趋势图 -->
    <div class="mini-trend glass-panel">
      <div ref="chartRef" class="chart" />
    </div>

    <!-- 骨架屏（加载期覆盖地图） -->
    <div v-if="loading" class="dashboard-skeleton">...</div>
  </div>
</template>
```

- [ ] **Step 3: 样式：地图暗化 + 悬浮面板定位**

```css
.dashboard-map { position: relative; height: 100%; overflow: hidden; }
.map-canvas { position: absolute; inset: 0; }
/* OSM 暗色滤镜（指挥大屏深色视觉） */
.map-canvas :deep(.ol-viewport) { filter: invert(1) hue-rotate(180deg) saturate(0.7) brightness(0.9); }
.stat-bar { position: absolute; top: var(--space-md); left: 50%; transform: translateX(-50%); display: flex; gap: var(--space-lg); padding: var(--space-md) var(--space-lg); z-index: 5; }
.alarm-panel { position: absolute; top: var(--space-md); right: var(--space-md); bottom: var(--space-md); width: 320px; z-index: 5; overflow: auto; }
.mini-trend { position: absolute; left: var(--space-md); bottom: var(--space-md); width: 360px; height: 200px; z-index: 5; }
.dashboard-skeleton { position: absolute; inset: 0; z-index: 10; ... }
```

- [ ] **Step 4: 数据加载与联动**

在 `loadData()` 中并行拉取 overview/trend/alarms + map 三接口；成功后 `renderZones`/`renderDevices`/`renderAlarms`，`markOnce('map:ready')`；失败用 `FALLBACK_*`。`handleWsMessage` 新增报警点 upsert（按 id 更新/插入 VectorSource feature）。

- [ ] **Step 5: 验证门禁**

Run: `npx vue-tsc -b 2>&1 | more` 与 `npx eslint src/views/dashboard/index.vue 2>&1 | more` 与 `npx stylelint "src/**/*.{css,vue}" 2>&1 | more`
Expected: 全 0

- [ ] **Step 6: 运行全量测试与体积分析**

Run: `npx vitest run --reporter=basic --no-color 2>&1 | findstr /C:"Tests"`（全绿）
Run: `npm run build 2>&1 | findstr /C:"built in" /C:"error"` 与 `node scripts/analyze-dist.mjs 2>&1 | more`（记录 ol 体积，>500KB 预警则记录并评估）

- [ ] **Step 7: 提交**

```bash
git add src/views/dashboard/index.vue
git commit -m "feat: dashboard 地图底座与点位图层"
```

---

### Task 4: 验证与体积收口

**Files:**
- Verify: `docs/perf/2026-08-18-performance-baseline.md`（体积回填）

**Interfaces:**
- Consumes: Task 3 产物；`scripts/analyze-dist.mjs`

- [ ] **Step 1: 全量门禁**

Run: `npm run lint && npm run type-check && npm run stylelint && npm run test && npm run build 2>&1 | more`
Expected: 全绿，build 成功

- [ ] **Step 2: 体积对比**

Run: `node scripts/analyze-dist.mjs 2>&1 | more`
记录 ol 引入前后体积变化；若 chunk >500KB，在报告中标注预警与后续拆包建议。

- [ ] **Step 3: 更新性能报告**

在 `docs/perf/2026-08-18-performance-baseline.md` §4 增加一行：OpenLayers 引入后体积变化与地图底座说明。

- [ ] **Step 4: 提交**

```bash
git add docs/perf/2026-08-18-performance-baseline.md
git commit -m "docs: 记录地图底座体积基线"
```

---

## Self-Review

- **Spec 覆盖**：布局（Task 3）、三图层（Task 2 service + Task 3 渲染）、数据降级（Task 2 FALLBACK + Task 3）、ws 联动（Task 3）、CSP（Task 1）、体积（Task 4）全部有任务。
- **类型一致性**：`MapPoint`/`RiskZone` 在 Task 2 定义，Task 3 消费；`normalizeFeature`/`fetch*`/`FALLBACK_*` 签名一致。
- **无占位符**：每步含实际代码与命令。
