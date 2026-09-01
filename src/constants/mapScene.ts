/**
 * Cesium 场景引擎级颜色常量（单一真源）
 *
 * 背景：Cesium 引擎级颜色（Color.fromCssColorString / Color.fromBytes /
 * 材质与 Shader 参数 / canvas 2D fillStyle 等）无法使用 CSS 变量，
 * 按项目红线（AGENTS.md §3）集中收编到本模块，组件内禁止再散落同类硬编码颜色。
 * DOM 层颜色不受此约束，仍走 tokens.css 的 var(--token)。
 *
 * 注意：本模块颜色以字面量维护（引擎无法解析 var(--token)），
 * 其中与状态/报警语义相关的色值已在注释标注与 tokens.css 的对应关系；
 * 调整任一侧时需同步评审，避免三端视觉漂移。
 */

// ============================================================
// 一、场景底色（scene.background / globe.baseColor）
// ============================================================

/** 科技感场景：场景背景色（applyTechSceneStyle） */
export const SCENE_BG_TECH = '#020810';

/** 科技感场景：地球基色（applyTechSceneStyle） */
export const SCENE_GLOBE_BASE_TECH = '#061428';

/** 浅色场景：场景背景与地球基色（applyLightSceneStyle） */
export const SCENE_BG_LIGHT = '#0b1624';

// ============================================================
// 二、企业边界（事故救援顶视：贴地填面 + 虚线描边）
// ============================================================

/** 企业边界虚线描边（青色，喂给 Cesium 边界填面材质 glowColor） */
export const BOUNDARY_STROKE_CYAN = '#00EEFF';

/** 企业边界填色（亮蓝，透明度 0.2 由调用处 ACCIDENT_RESCUE_FLAT 控制） */
export const BOUNDARY_FILL_BLUE = '#299FFF';

// ============================================================
// 三、装置区立体框架（顶面填色调色板 / 棱线 / 侧壁渐变）
// ============================================================

/**
 * 装置区红色区块填色（告警语义，与 tokens.css --color-alarm-1 同语义；
 * 保留源项目值 #dc3737，不改观感）
 */
export const PLANT_ZONE_FILL_RED = '#dc3737';

/** 装置区红色区块描边（红区亮描边） */
export const PLANT_ZONE_LINE_RED = 'rgba(255, 100, 100, 0.92)';

/** 装置区橙色区块填色（预警语义，与 tokens.css --color-alarm-2 同语义；保留源值） */
export const PLANT_ZONE_FILL_ORANGE = '#ff8c23';

/** 装置区橙色区块描边 */
export const PLANT_ZONE_LINE_ORANGE = 'rgba(255, 185, 90, 0.92)';

/** 装置区黄色区块填色（预警语义，与 tokens.css --color-alarm-3 同语义；保留源值） */
export const PLANT_ZONE_FILL_YELLOW = '#ffd237';

/** 装置区黄色区块描边 */
export const PLANT_ZONE_LINE_YELLOW = 'rgba(255, 235, 130, 0.92)';

/**
 * 装置区蓝色区块填色（强调语义，与 tokens.css --color-accent #00b4ff 同系；
 * 保留源值；同时作为 Billboard 标签缺省主题色的兜底值）
 */
export const PLANT_ZONE_FILL_BLUE = '#377dff';

/** 装置区蓝色区块描边 */
export const PLANT_ZONE_LINE_BLUE = 'rgba(110, 165, 255, 0.92)';

/**
 * 装置区填色调色板（fill 顶面填色 / line 描边，按 colorIndex 循环取用）；
 * 供 MAP_THEME.colors.plantPalette 与标签 Billboard 主题派生共用
 */
export const PLANT_ZONE_PALETTE = [
  { fill: PLANT_ZONE_FILL_RED, line: PLANT_ZONE_LINE_RED },
  { fill: PLANT_ZONE_FILL_ORANGE, line: PLANT_ZONE_LINE_ORANGE },
  { fill: PLANT_ZONE_FILL_YELLOW, line: PLANT_ZONE_LINE_YELLOW },
  { fill: PLANT_ZONE_FILL_BLUE, line: PLANT_ZONE_LINE_BLUE },
];

/** 装置区棱线常显色（青色；与 --color-accent 科技青系同语义，保留源值） */
export const PLANT_EDGE_LINE = '#00e4ff';

/** 装置区悬停高亮棱线色 */
export const PLANT_EDGE_HIGHLIGHT = '#00e4ff';

/** 装置区棱线发光色（PolylineGlow 材质） */
export const PLANT_EDGE_GLOW = 'rgba(0, 228, 255, 0.72)';

/** 侧壁渐变第 1 档：顶缘亮青 */
export const SIDE_WALL_TOP = 'rgba(110, 238, 255, 0.99)';

/** 侧壁渐变第 2 档：高亮青 */
export const SIDE_WALL_HIGHLIGHT = 'rgba(55, 198, 255, 0.96)';

/** 侧壁渐变第 3 档：中间蓝 */
export const SIDE_WALL_MID = 'rgba(22, 98, 178, 0.9)';

/** 侧壁渐变第 4 档：底部深蓝黑 */
export const SIDE_WALL_BOTTOM = 'rgba(3, 14, 42, 0.94)';

// ============================================================
// 四、疏散路线与疏散边界
// ============================================================

/** 疏散路线主色（警示黄，与 tokens.css --color-warning 同语义；保留源值；alpha 0.28/0.55/0.95 由调用处派生） */
export const EVACUATION_ROUTE_YELLOW = '#ffd54a';

/** 疏散边界虚线描边 / 发光主色（亮蓝青，alpha 0.9/0.95/0.35 由调用处派生） */
export const EVACUATION_BOUNDARY_BLUE = '#00baff';

// ============================================================
// 五、运行监控：布防聚焦边界
// ============================================================

/** 布防聚焦边界底衬线色（深蓝，压住底面形成对比） */
export const MONITOR_FOCUS_BASE_LINE = '#001a2c';

/** 布防聚焦边界虚线色（亮青，与 --color-accent 同语义；保留源值） */
export const MONITOR_FOCUS_DASH_CYAN = '#27d5ff';

// ============================================================
// 六、TV 巡检布防圈
// ============================================================

/** TV 巡检布防圈描边/填充色（黄色警示圈，与 --color-warning 同语义；保留源值） */
export const TV_INSPECTION_CIRCLE_COLOR = '#FFFF00';

// ============================================================
// 七、化工区 / 港区演示边界与标签
// ============================================================

/** 化工区边界主题色（青绿） */
export const FACTORY_AREA_CHEMICAL = '#15d7a8';

/** 港区边界主题色（蓝） */
export const FACTORY_AREA_PORT = '#42a5ff';

/** 化工区/港区未知编码的兜底主题色（科技青） */
export const FACTORY_AREA_FALLBACK = '#00eeff';

/** 化工区/港区标签描边色（深蓝黑） */
export const FACTORY_LABEL_OUTLINE = '#00182e';

/** 化工区/港区标签背景色（深蓝，alpha 0.86 由调用处派生） */
export const FACTORY_LABEL_BG = '#032746';

// ============================================================
// 八、厂区中心点与名称标签
// ============================================================

/** 厂区中心点填充色（亮青） */
export const SITE_CENTER_POINT_COLOR = '#78dcff';

/** 厂区中心点描边色（深蓝） */
export const SITE_CENTER_POINT_OUTLINE = '#143c64';

/** 厂区中心标签文字色（浅蓝白） */
export const SITE_CENTER_LABEL_COLOR = '#c8ebff';

/** 厂区中心标签描边色（深蓝） */
export const SITE_CENTER_LABEL_OUTLINE = '#0a1e3c';

// ============================================================
// 九、顶面影像画布处理（canvas 2D）
// ============================================================

/** 导出顶面影像铺底色（消除 PNG 透明通道/预乘 alpha） */
export const MAP_CANVAS_BASE_BLACK = '#000000';

// ============================================================
// 十、装置区标签 Billboard（canvas 2D 离屏绘制，plantZoneTagBillboard.ts）
// ============================================================

/** 毛玻璃信息牌底色（浅层叠色，铺在主题色之上） */
export const BILLBOARD_FROST_BASE = 'rgba(6, 28, 42, 0.72)';

/** 毛玻璃信息牌底色（深层叠色， Gloss 渐变后再压一层） */
export const BILLBOARD_FROST_BASE_DEEP = 'rgba(6, 28, 42, 0.78)';

/** 毛玻璃信息牌内部光斑色（模拟环境反光的椭圆斑） */
export const BILLBOARD_FROST_BLOB_COLORS = [
  'rgba(28, 72, 58, 0.55)',
  'rgba(72, 88, 108, 0.5)',
  'rgba(48, 96, 120, 0.45)',
  'rgba(90, 70, 50, 0.38)',
] as const;

/** 信息牌顶部高光渐变（白系 Gloss，三档透明度） */
export const BILLBOARD_GLOSS_WHITE_STOPS = [
  'rgba(255, 255, 255, 0.2)',
  'rgba(255, 255, 255, 0.06)',
  'rgba(255, 255, 255, 0)',
] as const;

/** 信息牌标题文字色（纯白） */
export const BILLBOARD_TITLE_WHITE = '#ffffff';

/** AI 诊断告警标签主色（红，告警语义，与 tokens.css --color-alarm-1 同语义；保留源值） */
export const ALARM_TAG_RED = '#dc3737';

/** AI 诊断告警标签外发光色 */
export const ALARM_TAG_SHADOW = 'rgba(211, 50, 50, 0.48)';

/** AI 诊断告警标签渐变顶部（暗红） */
export const ALARM_TAG_GRADIENT_TOP = 'rgba(48, 10, 14, 0.94)';

/** AI 诊断告警标签渐变底部（更深暗红） */
export const ALARM_TAG_GRADIENT_BOTTOM = 'rgba(24, 6, 10, 0.9)';

/** AI 诊断告警标签描边 / 尖角色（亮红） */
export const ALARM_TAG_BORDER = 'rgba(255, 110, 110, 0.58)';

/** AI 诊断告警标签尖角填充色 */
export const ALARM_TAG_TIP_FILL = 'rgba(24, 6, 10, 0.92)';

/** AI 诊断告警标签次要文字色（浅红） */
export const ALARM_TAG_TEXT_SOFT = '#ffc4c4';

/** AI 诊断告警状态点 / 状态文字色（警示红） */
export const ALARM_TAG_STATUS_RED = '#ff2121';
