/**
 * 地图相机缩放与场景模式：纯函数，便于单测（不依赖 Cesium 运行时）。
 * 由 `MaomingPetroCesiumMap` 在 viewer 就绪后桥接调用。
 */

export type SceneModeName = '2D' | '3D' | 'COLUMBUS_VIEW';

/** Cesium.SceneMode 数值常量（避免在本模块直接 import Cesium，便于测试） */
export const CESIUM_SCENE_MODE = {
  MORPHING: 0,
  SCENE2D: 1,
  COLUMBUS_VIEW: 2,
  SCENE3D: 3,
} as const;

/** 缩小/放大步长占当前相机高度的比例 */
const ZOOM_HEIGHT_RATIO = 0.3;
const ZOOM_MIN_MAGNITUDE = 50;
const ZOOM_MAX_MAGNITUDE = 8000;

export interface ZoomableCamera {
  zoomIn: (magnitude: number) => void;
  zoomOut: (magnitude: number) => void;
  positionCartographic?: { height: number } | null;
}

/** 按当前相机高度比例计算缩放步长（米），并钳制到合理区间 */
export function computeZoomMagnitude(cameraHeight: number): number {
  const clampedHeight = Number.isFinite(cameraHeight) ? Math.max(0, cameraHeight) : 0;
  const mag = clampedHeight * ZOOM_HEIGHT_RATIO;
  return Math.min(ZOOM_MAX_MAGNITUDE, Math.max(ZOOM_MIN_MAGNITUDE, mag));
}

/** 沿当前视线方向放大（direction=1）或缩小（direction=-1） */
export function zoomCamera(camera: ZoomableCamera | null | undefined, direction: 1 | -1): void {
  if (!camera) return;
  const height = camera.positionCartographic?.height ?? 0;
  const mag = computeZoomMagnitude(height);
  if (direction > 0) camera.zoomIn(mag);
  else camera.zoomOut(mag);
}

/** 场景模式数值 → 语义名 */
export function getSceneModeName(sceneMode: number): SceneModeName {
  if (sceneMode === CESIUM_SCENE_MODE.SCENE2D) return '2D';
  if (sceneMode === CESIUM_SCENE_MODE.COLUMBUS_VIEW) return 'COLUMBUS_VIEW';
  return '3D';
}
