export interface EvacuationPerson {
  id: string;
  name: string;
  org: string;
  job: string;
  longitude: number;
  latitude: number;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** 沿路线按进度 t(0~1) 取坐标点，供疏散人员名册落位（t 来自后端 routeProgress） */
export function pickPointAlongRoute(
  route: Array<{ longitude: number; latitude: number }>,
  t: number,
): { longitude: number; latitude: number } {
  if (route.length === 1) return route[0];
  const idxF = clamp01(t) * (route.length - 1);
  const i = Math.floor(idxF);
  const j = Math.min(route.length - 1, i + 1);
  const localT = idxF - i;
  return {
    longitude: lerp(route[i].longitude, route[j].longitude, localT),
    latitude: lerp(route[i].latitude, route[j].latitude, localT),
  };
}
