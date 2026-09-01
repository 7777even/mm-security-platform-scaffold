export const RAINVIEWER_API_URL = 'https://api.rainviewer.com/public/weather-maps.json';
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
): string {
  return `${host}${path}/${size}/${z}/${x}/${y}/2/1_1.png`;
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
