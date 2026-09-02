export const JMA_HIMAWARI_TIMES_URL =
  'https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_fd.json';

/** 葵花8号全圆盘图层 */
export type JmaHimawariBand = 'REP/ETC' | 'B13/TBB' | 'SND/ETC';

export interface JmaHimawariFrame {
  basetime: string;
  validtime: string;
  time: number;
}

export function parseJmaTimeCode(code: string): number {
  const year = Number(code.slice(0, 4));
  const month = Number(code.slice(4, 6)) - 1;
  const day = Number(code.slice(6, 8));
  const hour = Number(code.slice(8, 10));
  const minute = Number(code.slice(10, 12));
  const second = Number(code.slice(12, 14));
  return Math.floor(Date.UTC(year, month, day, hour, minute, second) / 1000);
}

export function buildJmaFdTileUrl(
  basetime: string,
  validtime: string,
  band: JmaHimawariBand,
  z: number,
  x: number,
  y: number,
): string {
  return `https://www.jma.go.jp/bosai/himawari/data/satimg/${basetime}/fd/${validtime}/${band}/${z}/${x}/${y}.jpg`;
}

export async function fetchJmaHimawariFrames(): Promise<JmaHimawariFrame[]> {
  const response = await fetch(JMA_HIMAWARI_TIMES_URL);
  if (!response.ok) {
    throw new Error(`JMA 葵花卫星时次请求失败: ${response.status}`);
  }

  const raw = (await response.json()) as Array<{ basetime: string; validtime: string }>;
  return raw.map((item) => ({
    basetime: item.basetime,
    validtime: item.validtime,
    time: parseJmaTimeCode(item.validtime),
  }));
}

export function pickNearestJmaFrame(
  targetUnix: number,
  frames: JmaHimawariFrame[],
): JmaHimawariFrame | undefined {
  if (!frames.length) return undefined;

  let nearest = frames[0]!;
  let minDistance = Infinity;
  for (const frame of frames) {
    const distance = Math.abs(frame.time - targetUnix);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = frame;
    }
  }
  return nearest;
}
