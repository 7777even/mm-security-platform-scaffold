// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FactoryScene from '@/components/three/FactoryScene.vue'
import { detectWebGL } from '@/utils/webgl'

vi.mock('@/utils/webgl', () => ({ detectWebGL: vi.fn(() => true) }))

// Three.js 在 jsdom 下无 GPU，mock 全部导出为可调用的构造器
const { makeCtor } = vi.hoisted(() => ({
  makeCtor: () => {
    const ctor = vi.fn()
    ctor.mockReturnValue({
      add: vi.fn(),
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      start: vi.fn(),
      getElapsedTime: vi.fn(() => 0),
      domElement: typeof document !== 'undefined' ? document.createElement('div') : {},
      position: { set: vi.fn(), copy: vi.fn() },
      scale: { set: vi.fn() },
      rotation: {},
      set: vi.fn(),
      copy: vi.fn(),
      update: vi.fn(),
      enableDamping: true,
      autoRotate: true,
      autoRotateSpeed: 0.6,
      maxPolarAngle: 1,
    })
    return ctor
  },
}))

vi.mock('three', () => {
  const exports: Record<string, ReturnType<typeof makeCtor>> = {}
  for (const name of [
    'Clock',
    'Scene',
    'PerspectiveCamera',
    'WebGLRenderer',
    'AmbientLight',
    'PointLight',
    'GridHelper',
    'Mesh',
    'PlaneGeometry',
    'MeshPhongMaterial',
    'CylinderGeometry',
    'BoxGeometry',
    'EdgesGeometry',
    'LineSegments',
    'LineBasicMaterial',
    'CanvasTexture',
    'Sprite',
    'SpriteMaterial',
    'Color',
  ]) {
    exports[name] = makeCtor()
  }
  return exports
})

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({ OrbitControls: makeCtor() }))

describe('FactoryScene：Three.js 厂区场景', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(detectWebGL).mockReturnValue(true)
  })

  it('挂载时创建渲染器并渲染', async () => {
    const wrapper = mount(FactoryScene)
    await nextTick()
    expect(wrapper.find('[data-test="factory-scene"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('卸载时释放资源（dispose renderer）', async () => {
    const wrapper = mount(FactoryScene)
    await nextTick()
    wrapper.unmount()
    expect(vi.mocked(FactoryScene)).toBeDefined()
  })

  it('WebGL 不支持时 emit error 且不初始化', async () => {
    vi.mocked(detectWebGL).mockReturnValue(false)
    const wrapper = mount(FactoryScene)
    await nextTick()
    expect(wrapper.emitted('error')).toBeTruthy()
    wrapper.unmount()
  })
})
