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

function makeZone(z: ZoneSpec): THREE.Mesh {
  const geometry =
    z.type === 'cylinder'
      ? new THREE.CylinderGeometry(z.size[0], z.size[0], z.size[1], 24)
      : new THREE.BoxGeometry(z.size[0], z.size[1], z.size[2])
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

function init(): void {
  if (!containerRef.value) return
  if (!detectWebGL()) {
    emit('error')
    return
  }
  try {
    buildScene(containerRef.value)
  } catch (err) {
    // S1 §9.3：3D 渲染失败须降级而非整页崩溃
    console.error('[3d] Three.js 场景初始化失败，降级二维', err)
    emit('error')
  }
}

function buildScene(container: HTMLDivElement): void {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050a15)
  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(6, 5, 7)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const point = new THREE.PointLight(0x00d4ff, 1.2, 20)
  point.position.set(3, 6, 2)
  scene.add(point)

  // 地面网格
  scene.add(new THREE.GridHelper(12, 12, 0x00d4ff, 0x12324f))
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
    if (renderer && scene && camera) renderer.render(scene, camera)
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
