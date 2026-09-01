// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MapToolBar from '@/components/map/MapToolBar.vue';

const { bridge, layerPanel, elMessage } = vi.hoisted(() => ({
  bridge: {
    zoomInSharedMap: vi.fn(),
    zoomOutSharedMap: vi.fn(),
    restoreSharedMapModuleView: vi.fn(),
    toggleSharedMapSceneMode: vi.fn(),
    getSharedMapSceneMode: vi.fn(() => '3D'),
  },
  layerPanel: { toggleMapLayerPanel: vi.fn() },
  elMessage: { warning: vi.fn() },
}));

vi.mock('@/composables/sharedCesiumBridge', () => bridge);
vi.mock('@/composables/useMapLayerPanel', () => layerPanel);
vi.mock('element-plus', () => ({ ElMessage: elMessage }));

describe('MapToolBar 大屏地图工具栏', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bridge.getSharedMapSceneMode.mockReturnValue('3D');
  });

  it('放大/缩小 触发对应桥接调用', async () => {
    const wrapper = mount(MapToolBar);
    await wrapper.find('[aria-label="放大"]').trigger('click');
    expect(bridge.zoomInSharedMap).toHaveBeenCalledTimes(1);
    await wrapper.find('[aria-label="缩小"]').trigger('click');
    expect(bridge.zoomOutSharedMap).toHaveBeenCalledTimes(1);
  });

  it('复位 触发 restoreSharedMapModuleView', async () => {
    const wrapper = mount(MapToolBar);
    await wrapper.find('[aria-label="视图复位"]').trigger('click');
    expect(bridge.restoreSharedMapModuleView).toHaveBeenCalledTimes(1);
  });

  it('图层切换 触发 toggleMapLayerPanel', async () => {
    const wrapper = mount(MapToolBar);
    await wrapper.find('[aria-label="图层切换"]').trigger('click');
    expect(layerPanel.toggleMapLayerPanel).toHaveBeenCalledTimes(1);
  });

  it('3D 视角 触发 toggleSharedMapSceneMode 并回显激活态', async () => {
    const wrapper = mount(MapToolBar);
    const btn = wrapper.find('[aria-label="切换到二维"]');
    await btn.trigger('click');
    expect(bridge.toggleSharedMapSceneMode).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[aria-label="切换到三维"]').exists()).toBe(true);
  });

  it('默认视角 触发 restoreSharedMapModuleView', async () => {
    const wrapper = mount(MapToolBar);
    await wrapper.find('[aria-label="默认视角"]').trigger('click');
    expect(bridge.restoreSharedMapModuleView).toHaveBeenCalledTimes(1);
  });

  it('占位按钮（区域框选/智能检索/热力模式）仅提示且不触发真实桥接', async () => {
    const wrapper = mount(MapToolBar);
    await wrapper.find('[aria-label="区域框选"]').trigger('click');
    await wrapper.find('[aria-label="智能检索"]').trigger('click');
    await wrapper.find('[aria-label="热力模式"]').trigger('click');
    expect(elMessage.warning).toHaveBeenCalledTimes(3);
    expect(elMessage.warning).toHaveBeenCalledWith('区域框选敬请期待');
    expect(elMessage.warning).toHaveBeenCalledWith('智能检索敬请期待');
    expect(elMessage.warning).toHaveBeenCalledWith('热力模式敬请期待');
    expect(bridge.zoomInSharedMap).not.toHaveBeenCalled();
  });
});
