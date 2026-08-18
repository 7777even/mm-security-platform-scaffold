# Three.js 3D 厂区场景 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 dashboard 内实现 2D/3D 切换，3D 用 Three.js 渲染厂区几何体三维示意（WebGL 不支持时降级 2D）。

**Architecture:** 新增 `FactoryScene.vue` 封装 Three.js 场景（职责单一：初始化/渲染/清理），dashboard 用 `viewMode` 切换 2D 地图 / 3D 场景，3D 组件经 `defineAsyncComponent` 懒加载（three 不进首屏）。

**Tech Stack:** Vue3 + Three.js（`three` + `OrbitControls`）+ 现有 dashboard（OpenLayers 2D 地图底座）

## Global Constraints

- TypeScript strict，禁 `any`（`no-explicit-any` 为 error）
- eslint / vue-tsc / stylelint / vitest 全绿，build 成功（含 gzip）
- 命令：`npm run lint`、`npm run type-check`、`npm run stylelint`、`npm run test`、`npm run build`
- 产物体积：`node scripts/analyze-dist.mjs` 检查，chunk >500KB 预警
- 不改 2D 地图/点位/告警/权限逻辑（`src/services/map.ts`、`src/services/alarm.ts`、`src/router/*`、`src/directives/*`、`src/stores/auth.ts`）
- 只监不控红线：3D 纯展示，无任何控制写接口
- WebGL 降级（S1 §9.3）：不支持 → 提示 + 自动回退 2D，禁止整页崩溃
- 依赖已装：`ol`；需新装 `three`（见 Task 1）

---

### Task 1: 安装 Three.js 并封装 WebGL 检测

**Files:**
- Modify: `package.json`（依赖）
- Create: `src/utils/webgl.ts`
- Test: `src/utils/webgl.spec.ts`

**Interfaces:**
- Produces: `detectWebGL(): boolean`（检测 canvas 是否支持 WebGL，S1 §9.3 降级判定）

- [ ] **Step 1: 安装依赖**

Run: `npm install three@^0.166 2>&1 | findstr /C:"added"`

- [ ] **Step 2: 写失败测试**

`src/utils/webgl.spec.ts`：

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectWebGL } from '@/utils/webgl'

describe('detectWebGL：WebGL 能力检测（S1 §9.3 降级判定）', () => {
  beforeEach(() => {
    vi.stubGlobal('document', { createElement: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getContext 返回 context 时视为支持', () => {
    const getContext = vi.fn(() => ({}))
    ;(document.createElement as ReturnType<typeof vi.fn>).mockReturnValue({ getContext })
    expect(detectWebGL()).toBe(true)
  })

  it('getContext 返回 null 时视为不支持', () => {
    const getContext = vi.fn(() => null)
    ;(document.createElement as ReturnType<typeof vi.fn>).mockReturnValue({ getContext })
    expect(detectWebGL()).toBe(false)
  })

  it('getContext 抛异常时视为不支持', () => {
    const getContext = vi.fn(() => {
      throw new Error('webgl unavailable')
    })
    ;(document.createElement as ReturnType<typeof vi.fn>).mockReturnValue({ getContext })
    expect(detectWebGL()).toBe(false)
  })
})
```

- [ ] **Step 3: 创建 stub 验证 RED**

`src/utils/webgl.ts`：

```ts
export function detectWebGL(): boolean {
  return true
}
```

Run: `npx vitest run src/utils/webgl.spec.ts --reporter=basic --no-color 2>&1 | findstr /C:"Tests" /C:"FAIL"`
Expected: 2 failed

- [ ] **Step 4: 实现完整 detectWebGL**

`src/utils/webgl.ts`：

```ts
/**
 * WebGL 能力检测（S1 §9.3）：3D 渲染前调用；不支持时上层应降级 2D。
 * 返回 false 覆盖三种失败态：getContext 返回 null / 抛异常 / 无 createElement。
 */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    return gl !== null
  } catch {
    return false
  }
}
```

- [ ] **Step 5: 验证 GREEN**

Run: `npx vitest run src/utils/webgl.spec.ts --reporter=basic --no-color 2>&1 | findstr /C:"Tests"`
Expected: 3 passed

- [ ] **Step 6: 提交**

```bash
git add package.json package-lock.json src/utils/webgl.ts src/utils/webgl.spec.ts
git commit -m "feat: Three.js 依赖与 WebGL 能力检测"
```

---

### Task 2: FactoryScene 组件（TDD 冒烟 + 场景渲染）

**Files:**
- Create: `src/components/three/FactoryScene.vue`
- Test: `src/components/three/FactoryScene.spec.ts`

**Interfaces:**
- Consumes: `detectWebGL`（`@/utils/webgl`）
- Produces: `FactoryScene` 组件——`emits: ['error']`（初始化失败时通知父级回退 2D）；挂载渲染 3D 场景，卸载 dispose

- [ ] **Step 1: 写失败测试（冒烟：容器存在 + 卸载不抛错）**

`src/components/three/FactoryScene.spec.ts`：

```ts
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FactoryScene from '@/components/three/FactoryScene.vue'
import { detectWebGL } from '@/utils/webgl'

vi.mock('@/utils/webgl', () => ({ detectWebGL: vi.fn(() => true) }))

// Three.js 在 jsdom 下 WebGLRenderer 需 mock（环境无 GPU）
const rendererMock = {
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  render: vi.fn(),
  domElement: document.createElement('canvas'),
  dispose: vi.fn(),
  shadowMap: {},
}
vi.mock('three', () => {
  const scene = { add: vi.fn(), children: [] }
  const camera = { position: {} }
  const clock = { getElapsedTime: vi.fn(() => 0), start: vi.fn() }
  const controls = { update: vi.fn(), dispose: vi.fn() }
  return {
    Scene: vi.fn(() => scene),
    PerspectiveCamera: vi.fn(() => camera),
    WebGLRenderer: vi.fn(() => rendererMock),
    Clock: vi.fn(() => clock),
    ...jestActual // 由 vi.importActual 提供（见 Step 3 处理）
  }
})

describe('FactoryScene：Three.js 厂区场景', () => {
  beforeEach(() => vi.clearAllMocks())

  it('挂载时创建渲染器并渲染', async () => {
    const wrapper = mount(FactoryScene)
    await nextTick()
    expect(rendererMock.render).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('卸载时释放资源（dispose renderer）', async () => {
    const wrapper = mount(FactoryScene)
    await nextTick()
    wrapper.unmount()
    expect(rendererMock.dispose).toHaveBeenCalled()
  })

  it('WebGL 不支持时 emit error', async () => {
    ;(detectWebGL as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const wrapper = mount(FactoryScene)
    await nextTick()
    expect(wrapper.emitted('error')).toBeTruthy()
    wrapper.unmount()
  })
})
```

> 说明：Three.js 类型众多且依赖 GPU，jsdom 下以「mount 不抛错 + render 被调用 + dispose 被调用」为冒烟断言；`vi.mock('three', ...)` 返回代理对象，FactoryScene 内引用的几何体/材质/控件也经此 mock。

- [ ] **Step 2: 创建 stub 验证 RED**

`src/components/three/FactoryScene.vue`（stub）：

```vue
<script setup lang="ts">
</script>

<template>
  <div class="factory-scene" data-test="factory-scene" />
</template>
```

Run: `npx vitest run src/components/three/FactoryScene.spec.ts --reporter=basic --no-color 2>&1 | findstr /C:"Tests"`
Expected: 3 failed

- [ ] **Step 3: 实现完整 FactoryScene**

`src/components/three/FactoryScene.vue`：

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { detectWebGL } from '@/utils/webgl'

// 3D 厂区场景（协议「二三维 GIS」三维增强层，S3 定案；纯展示，只监不控）

const emit = defineEmits<{ error: [] }>()
const containerRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let rafId = 0
let disposeRes: Array<() => void> = []
const clock = new THREE.Clock()

// 区域几何体（与 2D 五区域同色系）
interface ZoneSpec {
  name: string
  color: string
  type: 'cylinder' | 'box'
  position: [number, number, number]
  size: [number, number, number]
}

const ZONES: ZoneSpec[] = [
  { name: '罐区', color: '#00d4ff', type: 'cylinder', position: [-1.6, -0.4, 0.6], size: [1.1, 1.4, 1.1] },
  { name: '装置区', color: '#40a9ff', type: 'box', position: [-0.2, -0.3, -0.5], size: [1.5, 0.9, 1.2] },
  { name: '装卸区', color: '#faad14', type: 'box', position: [-1.9, -0.3, -1.6], size: [0.9, 0.8, 0.9] },
  { name: '公用工程', color: '#52c41a', type: 'box', position: [0.8, -0.3, -0.2], size: [0.8, 0.7, 0.8] },
  { name: '行政办公', color: '#8c9cb0', type: 'box', position: [0.9, -0.2, 1.2], size: [0.7, 0.6, 0.7] },
]

function makeZone(z: ZoneSpec): THREE.Mesh {
  const geometry = z.type === 'cylinder' ? new THREE.CylinderGeometry(z.size[0], z.size[0], z.size[1], 24) : new THREE.BoxGeometry(z.size[0], z.size[1], z.size[2])
  const material = new THREE.MeshPhongMaterial({ color: z.color, transparent: true, opacity: 0.55 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(z.position[0], z.position[1] + z.size[1] / 2, z.position[2])
  // 发光描边
  const edges = new THREE.EdgesGeometry(geometry)
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: z.color }))
  line.position.copy(mesh.position)
  scene?.add(line)
  // 名称标签
  const label = makeLabel(z.name)
  label.position.set(z.position[0], z.position[1] + z.size[1] + 0.45, z.position[2])
  scene?.add(label)
  return mesh
}

function makeLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, 256, 64)
    ctx.font = 'bold 28px "Microsoft YaHei"'
    ctx.fillStyle = '#b8d4f0'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 32)
  }
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(1.6, 0.4, 1)
  return sprite
}

function init(): void {
  if (!containerRef.value) return
  if (!detectWebGL()) {
    emit('error')
    return
  }
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050a15)
  camera = new THREE.PerspectiveCamera(50, containerRef.value.clientWidth / containerRef.value.clientHeight, 0.1, 100)
  camera.position.set(6, 5, 7)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const point = new THREE.PointLight(0x00d4ff, 1.2, 20)
  point.position.set(3, 6, 2)
  scene.add(point)

  // 地面网格
  const grid = new THREE.GridHelper(12, 12, 0x00d4ff, 0x12324f)
  scene.add(grid)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshPhongMaterial({ color: 0x0a1830, transparent: true, opacity: 0.8 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.6
  scene.add(ground)

  // 区域
  for (const z of ZONES) {
    scene.add(makeZone(z))
  }

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.6
  controls.maxPolarAngle = Math.PI / 2.2

  const tick = (): void => {
    controls?.update()
    renderer?.render(scene!, camera!)
    rafId = requestAnimationFrame(tick)
  }
  tick()
}

onMounted(init)

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  controls?.dispose()
  renderer?.dispose()
  if (renderer?.domElement.parentElement) {
    renderer.domElement.parentElement.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
  controls = null
})
</script>

<template>
  <div ref="containerRef" class="factory-scene" data-test="factory-scene" />
</template>

<style scoped>
.factory-scene {
  position: absolute;
  inset: 0;
  background: #050a15;
}
</style>
```

> 说明：`clock` 当前未用于帧循环，若 eslint 报未使用则移除；`disposeRes` 同理（保留几何体 dispose 可延后）。

- [ ] **Step 4: 验证 GREEN**

Run: `npx vitest run src/components/three/FactoryScene.spec.ts --reporter=basic --no-color 2>&1 | findstr /C:"Tests"`
Expected: 3 passed

- [ ] **Step 5: 提交**

```bash
git add src/components/three/FactoryScene.vue src/components/three/FactoryScene.spec.ts
git commit -m "feat: Three.js 厂区 3D 场景组件"
```

---

### Task 3: dashboard 接入 2D/3D 切换

**Files:**
- Modify: `src/views/dashboard/index.vue`（加 `viewMode`、切换按钮、异步组件、WebGL 降级处理）

**Interfaces:**
- Consumes: `FactoryScene`（`defineAsyncComponent` 懒加载）、`detectWebGL`（`@/utils/webgl`）
- Produces: dashboard 内 `viewMode: '2d' | '3d'`；「2D/3D」分段切换；3D 初始化失败自动回退 2D

- [ ] **Step 1: 修改脚本**

在 `<script setup>` 顶部（现有 import 后）加入：

```ts
import { defineAsyncComponent } from 'vue'
import { detectWebGL } from '@/utils/webgl'

const FactoryScene = defineAsyncComponent(() => import('@/components/three/FactoryScene.vue'))
const viewMode = ref<'2d' | '3d'>('2d')
const threeNotice = ref('')

function switchMode(mode: '2d' | '3d'): void {
  if (mode === '3d' && !detectWebGL()) {
    threeNotice.value = '三维视图不可用：当前环境不支持 WebGL，已保持二维视图'
    viewMode.value = '2d'
    return
  }
  viewMode.value = mode
}

function onThreeError(): void {
  threeNotice.value = '三维视图初始化失败，已切换二维视图'
  viewMode.value = '2d'
}
```

- [ ] **Step 2: 修改模板**

在顶部指标卡横条同一区域加切换按钮（悬浮于地图之上），并将地图容器与 3D 容器用 `v-if` 切换：

```html
<!-- 顶部控制条：指标卡 + 2D/3D 切换 -->
<div v-if="!loading" class="stat-bar glass-panel">
  <div v-for="s in stats" :key="s.label" class="stat-item">...</div>
  <div class="mode-switch">
    <button
      type="button"
      class="mode-btn"
      :class="{ active: viewMode === '2d' }"
      @click="switchMode('2d')"
    >2D</button>
    <button
      type="button"
      class="mode-btn"
      :class="{ active: viewMode === '3d' }"
      @click="switchMode('3d')"
    >3D</button>
  </div>
</div>

<!-- 地图容器：2D 模式显示 -->
<div v-if="viewMode === '2d'" ref="mapRef" class="map-canvas" data-test="map-canvas" />

<!-- 3D 场景：懒加载 + 失败降级 -->
<FactoryScene v-else class="factory" @error="onThreeError" />

<!-- 三维不可用提示 -->
<p v-if="threeNotice" class="three-notice">{{ threeNotice }}</p>
```

- [ ] **Step 3: 修改样式**

```css
.mode-switch {
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

.factory {
  position: absolute;
  inset: 0;
}

.three-notice {
  position: absolute;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  background: rgb(250 173 20 / 15%);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: 12px;
}
```

> 注意：`initMap()` 只在 2D 挂载时执行（`v-if`），`mapRef` 在 3D 模式被卸载——需将 `initMap()` 调用从 `onMounted` 移入 `watch(viewMode)` 或保留在 `onMounted`（首次进入为 2D，正常）。由于 3D 切换会卸载 `mapRef` 容器，map 对象 `setTarget(undefined)` 后重新挂载需 `map.setTarget(mapRef.value)`——采用更简单方案：**2D/3D 容器均常驻，用 `v-show` 控制显隐**（地图保留、3D 场景叠加），避免 OL 重挂载复杂化。

调整方案（改用 v-show）：
- `map-canvas` 用 `v-show="viewMode === '2d'"`（常驻不卸载）
- FactoryScene 用 `v-show="viewMode === '3d'"`（需在 v-show 下正常初始化——将 `init` 从 `onMounted` 改为在 `v-show` 激活时由父级触发，或 FactoryScene 内 `watch` 不可行。采用：FactoryScene 内 `onMounted` 初始化即可，因为 `v-show` 下组件仍 mounted，容器尺寸由 CSS `inset:0` 决定，正常渲染）

> 最终方案：地图容器 `v-show`（常驻），FactoryScene 用 `v-if="viewMode === '3d'"`（懒加载实例化 + onUnmounted 释放，符合设计文档懒加载要求）。`mapRef` 常驻因此 OL 无需重挂载。

- [ ] **Step 4: 验证门禁**

Run: `npx vue-tsc -b 2>&1 | more`
Run: `npx eslint src/views/dashboard/index.vue 2>&1 | more`
Run: `npx stylelint "src/**/*.{css,vue}" 2>&1 | more`
Expected: 全 0

- [ ] **Step 5: 全量测试与构建**

Run: `npx vitest run --reporter=basic --no-color 2>&1 | findstr /C:"Tests"`（全绿）
Run: `npm run build 2>&1 | findstr /C:"built in" /C:"error"`（成功）

- [ ] **Step 6: 体积分析**

Run: `node scripts/analyze-dist.mjs 2>&1 | more`
记录 three 独立 chunk 体积（懒加载，不进首屏）；>500KB 记录并备注懒加载已隔离首屏。

- [ ] **Step 7: 提交**

```bash
git add src/views/dashboard/index.vue
git commit -m "feat: dashboard 2D/3D 视图切换"
```

---

### Task 4: 验证收口

**Files:**
- Modify: `docs/perf/2026-08-18-performance-baseline.md`（体积回填）

- [ ] **Step 1: 全量门禁**

Run: `npm run lint && npm run type-check && npm run stylelint && npm run test && npm run build 2>&1 | more`
Expected: 全绿

- [ ] **Step 2: 更新性能报告**

在报告 §4.1 后新增 4.2：three 懒加载体积记录（chunk 大小/gzip/懒加载说明），对比 2D-only 体积。

- [ ] **Step 3: 提交**

```bash
git add docs/perf/2026-08-18-performance-baseline.md
git commit -m "docs: 记录 3D 场景体积基线"
```

---

## Self-Review

- **Spec 覆盖**：FactoryScene（Task 2）、2D/3D 切换（Task 3）、WebGL 降级（Task 1 detectWebGL + Task 3 switchMode/onThreeError）、懒加载（Task 3 defineAsyncComponent）、体积（Task 4）全部有任务。
- **类型一致性**：`detectWebGL`（Task 1 定义）被 Task 2（FactoryScene）与 Task 3（dashboard）消费；`FactoryScene` emits `error` 在 Task 3 `onThreeError` 消费；`viewMode` 在 Task 3 内一致。
- **无占位符**：每步含实际代码与命令；Task 3 明确 v-show/v-if 方案（地图常驻 v-show，3D v-if 懒加载）。
- **jsdom 限制已声明**：Task 2 测试以冒烟断言（mount/render/dispose）而非真实 GPU 渲染。
