/**
 * RainViewer 元数据接口基址（全球雷达为可选外源）。
 *
 * 原实现直连 `https://api.rainviewer.com` —— 浏览器直发跨域请求：受限网络（内网/企业代理）
 * 下响应缺 CORS 头即报 `blocked by CORS policy`；且生产 CSP `connect-src 'self' wss:` 明令
 * 禁止公网，直连必被拦。故改为**同源反向代理**：
 *   - dev → vite server.proxy（见 vite.config.ts）
 *   - 生产 → nginx location /rainviewer-api/（见 deploy/nginx.conf）
 * 部署侧如需直连 / 走自有网关，可用 `VITE_RAINVIEWER_API_BASE` 覆盖。
 *
 * 注：雷达瓦片（tilecache.rainviewer.com，作 Cesium 影像）不走此处，仍按图片加载。
 */
const RAINVIEWER_API_BASE = (
  (import.meta.env.VITE_RAINVIEWER_API_BASE as string | undefined) ?? '/rainviewer-api'
).replace(/\/+$/, '');

export const RAINVIEWER_API_URL = `${RAINVIEWER_API_BASE}/public/weather-maps.json`;
export const RAINVIEWER_TILE_SIZE = 512 as const;

export interface RainViewerFrame {
  time: number;
  path: string;
}

export interface RainViewerMapsResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
}

export function buildRainViewerTileUrl(
  host: string,
  path: string,
  z: number,
  x: number,
  y: number,
  size: 256 | 512 = 512,
  key?: string,
): string {
  const base = `${host}${path}/${size}/${z}/${x}/${y}/2/1_1.png`;
  return key ? `${base}?key=${encodeURIComponent(key)}` : base;
}

export function pickNearestRainViewerFrame(
  targetUnix: number,
  frames: RainViewerFrame[],
  maxDeltaSeconds = 900,
): RainViewerFrame | undefined {
  if (!frames.length) return undefined;

  let nearest: RainViewerFrame | undefined;
  let minDistance = Infinity;
  for (const frame of frames) {
    const distance = Math.abs(frame.time - targetUnix);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = frame;
    }
  }

  if (!nearest || minDistance > maxDeltaSeconds) return undefined;
  return nearest;
}

export async function fetchRainViewerMaps(): Promise<RainViewerMapsResponse> {
  const response = await fetch(RAINVIEWER_API_URL);
  if (!response.ok) {
    throw new Error(`RainViewer API 请求失败: ${response.status}`);
  }
  return response.json() as Promise<RainViewerMapsResponse>;
}
