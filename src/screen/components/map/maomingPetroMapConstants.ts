/**
 * 茂名石化 Cesium 地图 —— 静态配置常量
 *
 * 从 `MaomingPetroCesiumMap.vue`（6000+ 行巨型组件）抽离的**纯数据 / 配置常量**，
 * 均不依赖组件状态、不含副作用。
 *
 * 目的：为巨型组件的低风险拆分铺路 —— 先把与渲染流程无关的常量集中管理，
 * 让组件本体逐步收敛为「流程编排」。本文件**只放常量，不放任何响应式状态**。
 */

/** 电影级景深（Depth of Field）后处理着色器：径向模糊 + 远景模糊叠加。 */
export const CINEMATIC_DOF_SHADER = `
  uniform sampler2D colorTexture;
  uniform sampler2D blurTexture;
  uniform sampler2D depthTexture;
  uniform float focalDistance;
  uniform float focusRadius;
  uniform float radialStrength;
  uniform float depthStrength;
  uniform float farBlurStart;

  in vec2 v_textureCoordinates;

  vec4 toEye(vec2 uv, float depth)
  {
    vec2 xy = vec2((uv.x * 2.0 - 1.0), ((1.0 - uv.y) * 2.0 - 1.0));
    vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
    posInCamera = posInCamera / posInCamera.w;
    return posInCamera;
  }

  float computeFarBlur(float eyeDepth)
  {
    if (eyeDepth <= focalDistance + farBlurStart) {
      return 0.0;
    }
    float t = (eyeDepth - focalDistance - farBlurStart);
    t /= max(czm_currentFrustum.y - focalDistance - farBlurStart, 1.0);
    t = clamp(t, 0.0, 1.0);
    return pow(t, 0.42) * depthStrength;
  }

  float computeRadialBlur(vec2 uv)
  {
    float dist = length(uv - vec2(0.5)) * 2.0;
    return smoothstep(focusRadius, 1.0, dist) * radialStrength;
  }

  void main(void)
  {
    vec4 sharp = texture(colorTexture, v_textureCoordinates);
    vec4 blurred = texture(blurTexture, v_textureCoordinates);
    float radialBlur = computeRadialBlur(v_textureCoordinates);

    float depth = czm_readDepth(depthTexture, v_textureCoordinates);
    if (depth >= 1.0) {
      out_FragColor = mix(sharp, blurred, clamp(radialBlur, 0.0, 1.0));
      return;
    }

    vec4 posInCamera = toEye(v_textureCoordinates, depth);
    float farBlur = computeFarBlur(-posInCamera.z);
    float blurAmount = clamp(max(radialBlur, farBlur), 0.0, 1.0);
    out_FragColor = mix(sharp, blurred, blurAmount);
  }
`;

/* ---------------------------------- 电视巡检圆 ---------------------------------- */

/** 圆的几何精度（分段数） */
export const TV_INSPECTION_CIRCLE_SEGMENTS = 128;
export const TV_INSPECTION_CIRCLE_COLOR = '#FFFF00';
export const TV_INSPECTION_CIRCLE_FILL_ALPHA = 0.22;
export const TV_INSPECTION_CIRCLE_SEPARATION_GAP = 24;
export const TV_INSPECTION_CIRCLE_LINE_WIDTH = 5;
export const TV_INSPECTION_RADIAL_LINE_WIDTH = 4;
export const TV_INSPECTION_CENTER_POINT_SIZE = 10;
/** 相对边界顶面再抬高，避免被模型遮挡 */
export const TV_INSPECTION_HEIGHT_OFFSET = 12;
export const TV_INSPECTION_RING_SAMPLES = 72;
/** 径向线方向（弧度）：圆心 → 圆边 */
export const TV_INSPECTION_RADIAL_ANGLES = {
  0: (225 * Math.PI) / 180,
  1: (315 * Math.PI) / 180,
};
/** 边界环未就绪时的回退圆（茂名石化边界实测坐标） */
export const TV_INSPECTION_FALLBACK_CIRCLES = [
  {
    id: 'inspection-north',
    variant: 0,
    longitude: 110.874766,
    latitude: 21.681671,
    radiusMeters: 332,
  },
  {
    id: 'inspection-south',
    variant: 1,
    longitude: 110.885214,
    latitude: 21.678325,
    radiusMeters: 332,
  },
];
export const TV_INSPECTION_CENTER_GRID_STEPS = 40;
export const TV_INSPECTION_SCAN_DURATION_MS = 3200;
export const TV_INSPECTION_SCAN_CAMERA_FLY_SEC = 1.25;
export const TV_INSPECTION_SCAN_TOP_DOWN_PADDING = 1.14;

/** 巡检圆线条公共渲染参数：不贴地 + 关闭深度测试，避免被地形/模型遮挡 */
export const TV_INSPECTION_LINE_COMMON = {
  clampToGround: false,
  disableDepthTestDistance: Number.POSITIVE_INFINITY,
};
