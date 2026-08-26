// 弱 GPU（石化窗 Chromium 86 / 海光 C86 / 麒麟 V10）地图渲染降负配置。
//
// 将原本散落在 services/cesium.ts 的渲染参数收敛为「按机器能力分档」的预设，
// 便于真机按硬件能力调参、统一维护，并支持环境变量覆盖：
//   - VITE_CESIUM_RENDER_TIER：渲染档位，取值 high | low | auto，缺省 low（保持原生产降负行为）。
//       auto 会运行时探测 WebGL 渲染器，命中弱 GPU 名单则降为 low，否则 high。
//   - VITE_CESIUM_RESOLUTION_SCALE：仅覆盖 resolutionScale（帧缓冲降采样），便于单参数微调。
//
// 应用见 services/cesium.ts 的 applyRenderConfig()。

export type RenderTier = 'high' | 'low';

export interface RenderConfig {
  /** 帧缓冲降采样比例：1.0 原生分辨率；越低片元越少、画面越糊 */
  resolutionScale: number;
  /** 多重采样抗锯齿（WebGL2）。默认 4；0 关闭，每帧片元着色随之成倍下降 */
  msaaSamples: number;
  /** 地形/影像细节层级：越大瓦片越粗糙，平移时请求/解码/绘制越少 */
  globeMaximumScreenSpaceError: number;
  /** 关闭瓦片预加载，减少平移时无关祖先/兄弟瓦片的请求与解码抖动 */
  globePreloadAncestors: boolean;
  globePreloadSiblings: boolean;
  /** 地面/天空大气辉光：全屏逐片元开销，弱 GPU 平移卡顿主因之一 */
  globeShowGroundAtmosphere: boolean;
  skyAtmosphereShow: boolean;
  /** 太阳/月亮光照逐片元计算 */
  sunShow: boolean;
  moonShow: boolean;
  /** FXAA 全屏后处理抗锯齿 */
  fxaaEnabled: boolean;
  /** 远景雾化 */
  fogEnabled: boolean;
  /** 地面大气光照强度，仅在 low 档保留少量以保立体感 */
  globeAtmosphereLightIntensity: number;
}

export const RENDER_PRESETS: Record<RenderTier, RenderConfig> = {
  // 高配：接近 Cesium 默认但保留合理清晰度，适用于独立显卡/开发机
  high: {
    resolutionScale: 1.0,
    msaaSamples: 4,
    globeMaximumScreenSpaceError: 2,
    globePreloadAncestors: true,
    globePreloadSiblings: true,
    globeShowGroundAtmosphere: true,
    skyAtmosphereShow: true,
    sunShow: true,
    moonShow: false,
    fxaaEnabled: true,
    fogEnabled: false,
    globeAtmosphereLightIntensity: 10,
  },
  // 弱 GPU（石化窗/海光 C86）：激进降负，对应原生产硬编码值
  low: {
    resolutionScale: 0.6,
    msaaSamples: 0,
    globeMaximumScreenSpaceError: 8,
    globePreloadAncestors: false,
    globePreloadSiblings: false,
    globeShowGroundAtmosphere: false,
    skyAtmosphereShow: false,
    sunShow: false,
    moonShow: false,
    fxaaEnabled: false,
    fogEnabled: false,
    globeAtmosphereLightIntensity: 8,
  },
};

// 弱 GPU 渲染器关键词：auto 探测命中其一即降为 low 档。
// 信创/软件渲染环境下 WebGL renderer 多含 swiftshader/llvmpipe；信创独显名作为补充。
const WEAK_GPU_KEYWORDS = [
  'swiftshader',
  'llvmpipe',
  'software',
  'jingjia',
  'jm9',
  'jm7',
  'phytium',
  'kylin',
  'hygon',
  'zhaoxin',
  'loongson',
];

function detectWeakGpu(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase();
    return WEAK_GPU_KEYWORDS.some((k) => renderer.includes(k));
  } catch {
    return false;
  }
}

/** 解析渲染档位：VITE_CESIUM_RENDER_TIER 可显式覆盖 high/low/auto；缺省 low（生产降负）。 */
export function resolveRenderTier(): RenderTier {
  const raw = (import.meta.env.VITE_CESIUM_RENDER_TIER ?? 'low').toString().trim().toLowerCase();
  if (raw === 'high') return 'high';
  if (raw === 'low') return 'low';
  // auto 或其他值：运行时探测弱 GPU，命中降档，否则 high
  return detectWeakGpu() ? 'low' : 'high';
}

/** 取当前渲染配置；resolutionScale 额外支持 VITE_CESIUM_RESOLUTION_SCALE 单独覆盖微调。 */
export function getRenderConfig(): RenderConfig {
  const tier = resolveRenderTier();
  const preset = RENDER_PRESETS[tier];
  const override = Number(import.meta.env.VITE_CESIUM_RESOLUTION_SCALE);
  return {
    ...preset,
    resolutionScale: Number.isFinite(override) && override > 0 ? override : preset.resolutionScale,
  };
}
