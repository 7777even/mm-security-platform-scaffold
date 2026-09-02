export interface EvacuationPerson {
  id: string;
  name: string;
  org: string;
  job: string;
  longitude: number;
  latitude: number;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pickPointAlongRoute(route: Array<{ longitude: number; latitude: number }>, t: number) {
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

export function resolveEvacuationPeople(options: {
  count?: number;
  route: Array<{ longitude: number; latitude: number }>;
  seed?: number;
}): EvacuationPerson[] {
  const count = options.count ?? 20;
  const route = options.route;
  if (!route.length) return [];

  const rand = mulberry32(options.seed ?? 20260625);
  const names = ['张建', '李明', '王强', '陈伟', '刘洋', '赵磊', '黄军', '周鹏', '吴涛', '郑凯'];
  const orgs = ['生产管理部', '装置运行一班', '装置运行二班', '应急抢险组', '现场指挥组'];
  const jobs = ['班长', '主操', '外操', '安全员', '调度'];

  const people: EvacuationPerson[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const base = pickPointAlongRoute(route, t);
    const jitterLng = (rand() - 0.5) * 0.0012;
    const jitterLat = (rand() - 0.5) * 0.0012;
    people.push({
      id: `p-${i + 1}`,
      name: names[i % names.length],
      org: orgs[Math.floor(rand() * orgs.length)],
      job: jobs[Math.floor(rand() * jobs.length)],
      longitude: base.longitude + jitterLng,
      latitude: base.latitude + jitterLat,
    });
  }
  return people;
}
