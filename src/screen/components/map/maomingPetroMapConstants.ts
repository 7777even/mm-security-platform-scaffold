/**
 * 茂名石化 Cesium 地图 —— 静态配置常量
 *
 * 从 `MaomingPetroCesiumMap.vue`（6000+ 行巨型组件）抽离的**纯数据 / 配置常量**，
 * 均不依赖组件状态、不含副作用。
 *
 * 目的：为巨型组件的低风险拆分铺路 —— 先把与渲染流程无关的常量集中管理，
 * 让组件本体逐步收敛为「流程编排」。本文件**只放常量，不放任何响应式状态**。
 */

/** 茂名石化厂区基准坐标与默认相机位姿 */
export const MAOMING_PETRO = {
  longitude: 110.88633263354666,
  latitude: 21.675024846180317,
  /** 相机与目标点的水平距离（米） */
  cameraRange: 2800,
  /** 0 = 正北朝上，地图不旋转 */
  heading: 0,
  pitch: -38,
  /** 事故救援顶视模式俯仰角 */
  topDownPitch: -89.9,
};

/** 事故救援顶视：贴地分层高度（米，相对各点地形） */
export const ACCIDENT_RESCUE_FLAT = {
  /** 装置区块填色 */
  zoneSurfaceOffset: 1.2,
  /** 区块间错层，避免相邻面 z-fighting */
  zoneSurfaceStagger: 0.18,
  /** 企业边界内填色（贴地，微抬高避免 z-fighting） */
  enterpriseFillOffset: 0.15,
  /** 企业边界虚线（略高于装置区块，非立体模型） */
  boundaryEdgeOffset: 1.45,
  /** HTML 标记相对地形的抬高 */
  markerOffset: 6.5,
  boundaryStroke: '#00EEFF',
  boundaryFill: '#299FFF',
  boundaryFillAlpha: 0.2,
};

/** 3D 边界区块主题 */
export const MAP_THEME = {
  slabBase: -4,
  /** 侧壁顶缘（略低于顶面，由顶面压住接缝） */
  wallTop: 66.42,
  capHeight: 66.55,
  /** 顶面纹理水平翻转（修正 CCW 绕序后东西向镜像） */
  capTextureFlipX: true,
  /** 顶面纹理垂直翻转 */
  capTextureFlipY: false,
  /** 高亮边线贴在顶面边缘 */
  edgeHeight: 66.58,
  plantHeight: 66.05,
  /** 立体框架 resting 高度（米，底面贴 plantHeight） */
  plantFrameHeight: 6,
  /** 悬停时高度变为 resting 的倍数 */
  plantHoverHeightMultiplier: 6,
  /** 装置区默认填色（分区.palette 色，避免半透明发灰） */
  plantBaseAlpha: 0.42,
  /** 悬停变高后填色透明度 */
  plantElevatedAlpha: 0.5,
  /** 变高后填色 Shader（仅压暗内部，不含描边） */
  plantElevatedFill: {
    interiorDim: 0.52,
    interiorAlphaDim: 0.88,
  },
  /** 悬停扩高后向上位移时长（秒） */
  plantHoverLiftDuration: 0.35,
  plantAlphaEase: 0.14,
  plantOutline: {
    lineWidth: 1.2,
    lineAlpha: 0.72,
  },
  /** glTF 体块材质混合（无贴图时需 >0 才显分区色） */
  plantModelSilhouette: {
    colorBlendAmount: 0.88,
  },
  /** 常显线框：棱线 Entity（顶/底环 + 竖棱）；选中时同线框加粗 */
  plantWireframe: {
    enabled: true,
    lineWidth: 1.5,
    selectedLineWidth: 3.5,
    edgeColorAlpha: 0.92,
    selectedEdgeColorAlpha: 1,
    /** 外轮廓 Model silhouette；0 表示只用棱线 */
    silhouetteSize: 0,
    selectedSilhouetteSize: 0,
    showBottomRing: true,
  },
  // 红色区块信息牌 / 青色信息牌文案已改由 GET /map/zone-signs 下发（V42 fac_map_zone_sign），
  // 挂载时经 fetchMapZoneSigns 加载到 plantZonePopupPresets / plantZoneTealTagPresets；
  // 空态时不绘制信息牌（不回灌本地文案）。
  colors: {
    plantPalette: [
      { fill: '#dc3737', line: 'rgba(255, 100, 100, 0.92)' },
      { fill: '#ff8c23', line: 'rgba(255, 185, 90, 0.92)' },
      { fill: '#ffd237', line: 'rgba(255, 235, 130, 0.92)' },
      { fill: '#377dff', line: 'rgba(110, 165, 255, 0.92)' },
    ],
    edgeLine: '#00e4ff',
    edgeHighlight: '#00e4ff',
    edgeGlow: 'rgba(0, 228, 255, 0.72)',
    sideWallTop: 'rgba(110, 238, 255, 0.99)',
    sideWallHighlight: 'rgba(55, 198, 255, 0.96)',
    sideWallMid: 'rgba(22, 98, 178, 0.9)',
    sideWallBottom: 'rgba(3, 14, 42, 0.94)',
  },
};

/** 电影感景深：屏幕中心清晰，四周 + 远景渐进虚化 */
export const MAP_DOF = {
  enabled: true,
  sigma: 4.2,
  delta: 1.15,
  stepSize: 2.2,
  focusHeight: 66.55,
  /** 中心清晰区（0~1，越大中心越实） */
  focusRadius: 0.4,
  /** 四周径向虚化强度 */
  radialStrength: 0.96,
  /** 远景深度虚化强度 */
  depthStrength: 0.45,
  /** 超出对焦距离多少米开始远景虚化 */
  farBlurStart: 180,
};

/** 标签随相机距离缩放：距离 ≤ 参考距离时不缩放（1.0）；仅拉远时按 ref/distance 变小 */
export const PLANT_MARKER_SCALE_REF_DISTANCE = MAOMING_PETRO.cameraRange * 0.5;
export const PLANT_MARKER_SCALE_MIN_DISTANCE = 120;
export const PLANT_MARKER_SCALE_MIN = 0.1;
export const PLANT_MARKER_SCALE_MAX = 1;

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
