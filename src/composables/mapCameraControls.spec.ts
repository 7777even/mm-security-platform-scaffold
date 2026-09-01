import { describe, it, expect, vi } from 'vitest';
import {
  computeZoomMagnitude,
  zoomCamera,
  getSceneModeName,
  CESIUM_SCENE_MODE,
} from '@/composables/mapCameraControls';

describe('mapCameraControls：地图相机缩放与场景模式', () => {
  describe('computeZoomMagnitude：按当前高度比例计算步长', () => {
    it('默认按高度 30% 计算', () => {
      expect(computeZoomMagnitude(1000)).toBe(300);
    });

    it('高度过低时下限钳制为 50', () => {
      expect(computeZoomMagnitude(0)).toBe(50);
      expect(computeZoomMagnitude(100)).toBe(50);
    });

    it('高度过高时上限钳制为 8000', () => {
      expect(computeZoomMagnitude(1_000_000)).toBe(8000);
    });

    it('非有限值按 0 处理并落下限', () => {
      expect(computeZoomMagnitude(Number.NaN)).toBe(50);
    });
  });

  describe('zoomCamera：沿视线放大/缩小', () => {
    it('direction=1 调用 zoomIn 且步长=高度比例钳制值', () => {
      const camera = {
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        positionCartographic: { height: 2000 },
      };
      zoomCamera(camera, 1);
      expect(camera.zoomIn).toHaveBeenCalledWith(600);
      expect(camera.zoomOut).not.toHaveBeenCalled();
    });

    it('direction=-1 调用 zoomOut', () => {
      const camera = {
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        positionCartographic: { height: 2000 },
      };
      zoomCamera(camera, -1);
      expect(camera.zoomOut).toHaveBeenCalledWith(600);
      expect(camera.zoomIn).not.toHaveBeenCalled();
    });

    it('camera 缺失不抛错', () => {
      expect(() => zoomCamera(undefined as never, 1)).not.toThrow();
    });
  });

  describe('getSceneModeName：场景模式映射', () => {
    it('SCENE2D=1 → 2D', () => {
      expect(getSceneModeName(CESIUM_SCENE_MODE.SCENE2D)).toBe('2D');
    });
    it('COLUMBUS_VIEW=2 → COLUMBUS_VIEW', () => {
      expect(getSceneModeName(CESIUM_SCENE_MODE.COLUMBUS_VIEW)).toBe('COLUMBUS_VIEW');
    });
    it('SCENE3D=3 → 3D', () => {
      expect(getSceneModeName(CESIUM_SCENE_MODE.SCENE3D)).toBe('3D');
    });
    it('MORPHING/未知 → 3D', () => {
      expect(getSceneModeName(CESIUM_SCENE_MODE.MORPHING)).toBe('3D');
      expect(getSceneModeName(99)).toBe('3D');
    });
  });
});
