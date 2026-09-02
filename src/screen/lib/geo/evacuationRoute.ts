export type LngLat = [number, number];

type MultiLineStringGeometry = {
  type: 'MultiLineString';
  coordinates: LngLat[][];
};

type Feature = {
  type: 'Feature';
  geometry: MultiLineStringGeometry;
  properties?: Record<string, unknown>;
};

type FeatureCollection = {
  type: 'FeatureCollection';
  features: Feature[];
};

export interface EvacuationLine {
  id: string;
  positions: Array<{ longitude: number; latitude: number }>;
  lengthMeters: number;
}

function keyOf([lng, lat]: LngLat, precision = 6) {
  const x = lng.toFixed(precision);
  const y = lat.toFixed(precision);
  return `${x},${y}`;
}

function haversineMeters(a: LngLat, b: LngLat) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const dLat = lat2 - lat1;
  const dLng = toRad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(Math.max(0, Math.min(1, s))));
}

type Segment = {
  id: string;
  coords: LngLat[];
  a: LngLat;
  b: LngLat;
};

function segmentsFromGeoJson(geojson: FeatureCollection): Segment[] {
  const segments: Segment[] = [];
  let idx = 0;
  for (const f of geojson.features ?? []) {
    if (!f?.geometry || f.geometry.type !== 'MultiLineString') continue;
    const lines = f.geometry.coordinates ?? [];
    for (const line of lines) {
      if (!Array.isArray(line) || line.length < 2) continue;
      const coords = line.slice();
      segments.push({
        id: `seg-${idx++}`,
        coords,
        a: coords[0],
        b: coords[coords.length - 1],
      });
    }
  }
  return segments;
}

export function extractEvacuationLinesFromGeoJson(geojson: unknown): EvacuationLine[] {
  const fc = geojson as FeatureCollection;
  const lines: EvacuationLine[] = [];
  let idx = 0;
  for (const f of fc.features ?? []) {
    if (!f?.geometry || f.geometry.type !== 'MultiLineString') continue;
    for (const line of f.geometry.coordinates ?? []) {
      if (!Array.isArray(line) || line.length < 2) continue;
      const positions = line.map(([longitude, latitude]) => ({ longitude, latitude }));
      const lengthMeters = line.reduce((sum, pt, i) => {
        if (i === 0) return 0;
        return sum + haversineMeters(line[i - 1], pt);
      }, 0);
      lines.push({ id: `line-${idx++}`, positions, lengthMeters });
    }
  }
  return lines;
}

function pickStartEnd(endpoints: Array<{ key: string; pt: LngLat; degree: number }>) {
  const degree1 = endpoints.filter((n) => n.degree === 1);
  const candidates = degree1.length >= 2 ? degree1 : endpoints;
  const start = candidates.reduce(
    (best, cur) => (cur.pt[0] > best.pt[0] ? cur : best),
    candidates[0],
  );
  const end = candidates.reduce(
    (best, cur) => (cur.pt[0] < best.pt[0] ? cur : best),
    candidates[0],
  );
  return { startKey: start.key, endKey: end.key, startPt: start.pt, endPt: end.pt };
}

export function buildEvacuationRouteFromGeoJson(geojson: unknown) {
  const fc = geojson as FeatureCollection;
  const segs = segmentsFromGeoJson(fc);
  if (!segs.length) {
    return {
      positions: [] as Array<{ longitude: number; latitude: number }>,
      start: null as null | { longitude: number; latitude: number },
      end: null as null | { longitude: number; latitude: number },
      lengthMeters: 0,
    };
  }

  const nodeDegree = new Map<string, { pt: LngLat; degree: number }>();
  const adjacency = new Map<string, Segment[]>();
  for (const s of segs) {
    const ka = keyOf(s.a);
    const kb = keyOf(s.b);
    const a = nodeDegree.get(ka) ?? { pt: s.a, degree: 0 };
    const b = nodeDegree.get(kb) ?? { pt: s.b, degree: 0 };
    a.degree += 1;
    b.degree += 1;
    nodeDegree.set(ka, a);
    nodeDegree.set(kb, b);
    adjacency.set(ka, [...(adjacency.get(ka) ?? []), s]);
    adjacency.set(kb, [...(adjacency.get(kb) ?? []), s]);
  }

  const endpoints = [...nodeDegree.entries()].map(([key, v]) => ({
    key,
    pt: v.pt,
    degree: v.degree,
  }));
  const { startKey, endKey, startPt, endPt } = pickStartEnd(endpoints);

  const visited = new Set<string>();
  const ordered: LngLat[] = [];
  let currentKey = startKey;
  let guard = 0;
  while (guard++ < segs.length + 4) {
    const options = (adjacency.get(currentKey) ?? []).filter((s) => !visited.has(s.id));
    if (!options.length) break;
    const next = options[0];
    visited.add(next.id);
    const ka = keyOf(next.a);
    const kb = keyOf(next.b);
    const forward = ka === currentKey;
    const coords = forward ? next.coords : next.coords.slice().reverse();

    if (!ordered.length) {
      ordered.push(...coords);
    } else {
      const last = ordered[ordered.length - 1];
      const first = coords[0];
      const same = keyOf(last) === keyOf(first);
      ordered.push(...(same ? coords.slice(1) : coords));
    }

    currentKey = forward ? kb : ka;
    if (currentKey === endKey) break;
  }

  const lengthMeters = ordered.reduce((sum, pt, i) => {
    if (i === 0) return 0;
    return sum + haversineMeters(ordered[i - 1], pt);
  }, 0);

  return {
    positions: ordered.map(([longitude, latitude]) => ({ longitude, latitude })),
    start: { longitude: startPt[0], latitude: startPt[1] },
    end: { longitude: endPt[0], latitude: endPt[1] },
    lengthMeters,
  };
}
