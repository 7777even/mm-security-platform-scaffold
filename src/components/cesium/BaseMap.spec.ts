// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import BaseMap from '@/components/cesium/BaseMap.vue';
import { detectWebGL } from '@/utils/webgl';
import type { MapPoint, RiskZone } from '@/services/map';

vi.mock('@/utils/webgl', () => ({ detectWebGL: vi.fn(() => true) }));

// 注入 fake viewer 工厂，避免在 jsdom 下实例化真实 Cesium
const h = vi.hoisted(() => {
  const viewer = {
    destroy: vi.fn(),
    scene: { sceneMode: '3d' },
    camera: { flyTo: vi.fn() },
    entities: { removeAll: vi.fn(), add: vi.fn() },
    container: {} as HTMLElement,
  };
  const factory = vi.fn().mockResolvedValue(viewer);
  return { viewer, factory };
});

const props = {
  tileUrl: 'https://tiles.example/{z}/{x}/{y}.png',
  alarms: [] as MapPoint[],
  devices: [] as MapPoint[],
  zones: [] as RiskZone[],
  sceneMode: '3d' as const,
};

describe('BaseMap：Cesium 二三维一体化地图容器', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(detectWebGL).mockReturnValue(true);
    h.factory.mockResolvedValue(h.viewer);
  });

  it('WebGL 不可用时降级且不初始化 viewer', async () => {
    vi.mocked(detectWebGL).mockReturnValue(false);
    const wrapper = mount(BaseMap, { props: { ...props, viewerFactory: h.factory } });
    await nextTick();
    expect(h.factory).not.toHaveBeenCalled();
    expect(wrapper.emitted('error')).toBeTruthy();
    wrapper.unmount();
  });

  it('挂载时调用 viewerFactory 并注入容器', async () => {
    const wrapper = mount(BaseMap, { props: { ...props, viewerFactory: h.factory } });
    await nextTick();
    await nextTick();
    expect(h.factory).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('卸载时销毁 viewer', async () => {
    const wrapper = mount(BaseMap, { props: { ...props, viewerFactory: h.factory } });
    await nextTick();
    await nextTick();
    wrapper.unmount();
    expect(h.viewer.destroy).toHaveBeenCalled();
  });

  it('sceneMode 变化时更新 viewer 场景模式', async () => {
    const wrapper = mount(BaseMap, { props: { ...props, viewerFactory: h.factory } });
    await nextTick();
    await nextTick();
    await wrapper.setProps({ sceneMode: '2d' });
    expect(wrapper.emitted('mode-change')).toBeTruthy();
    wrapper.unmount();
  });
});
