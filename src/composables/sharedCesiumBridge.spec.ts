import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  bindSharedMap,
  zoomInSharedMap,
  zoomOutSharedMap,
  toggleSharedMapSceneMode,
  getSharedMapSceneMode,
} from '@/composables/sharedCesiumBridge';

function makeMockMap() {
  return {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    toggleSceneMode: vi.fn(),
    getSceneMode: vi.fn(() => '3D'),
    restoreModuleDefaultView: vi.fn(),
    toggleMapLayerPanel: vi.fn(),
    setModule: vi.fn(),
    applyMapMode: vi.fn(),
    flyToModuleOverview: vi.fn(),
    toggleAccidentRescueDisplayMode: vi.fn(),
  };
}

describe('sharedCesiumBridge：新增缩放/场景模式桥接', () => {
  beforeEach(() => {
    bindSharedMap(null);
  });

  it('zoomInSharedMap 转发到地图 expose.zoomIn', () => {
    const map = makeMockMap();
    bindSharedMap(map as never);
    zoomInSharedMap();
    expect(map.zoomIn).toHaveBeenCalledTimes(1);
  });

  it('zoomOutSharedMap 转发到地图 expose.zoomOut', () => {
    const map = makeMockMap();
    bindSharedMap(map as never);
    zoomOutSharedMap();
    expect(map.zoomOut).toHaveBeenCalledTimes(1);
  });

  it('toggleSharedMapSceneMode 转发到地图 expose.toggleSceneMode', () => {
    const map = makeMockMap();
    bindSharedMap(map as never);
    toggleSharedMapSceneMode();
    expect(map.toggleSceneMode).toHaveBeenCalledTimes(1);
  });

  it('getSharedMapSceneMode 转发到地图 expose.getSceneMode', () => {
    const map = makeMockMap();
    bindSharedMap(map as never);
    expect(getSharedMapSceneMode()).toBe('3D');
    expect(map.getSceneMode).toHaveBeenCalledTimes(1);
  });

  it('未绑定地图时调用不抛错', () => {
    expect(() => {
      zoomInSharedMap();
      zoomOutSharedMap();
      toggleSharedMapSceneMode();
    }).not.toThrow();
  });
});
