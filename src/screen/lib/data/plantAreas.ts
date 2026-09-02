export type PlantAreaCode = 'all' | 'refinery' | 'chemical' | 'port';
export type ConcretePlantAreaCode = Exclude<PlantAreaCode, 'all'>;

export interface PlantAreaDefinition {
  code: PlantAreaCode;
  label: string;
  centers: Array<{ longitude: number; latitude: number }>;
}

/**
 * 厂区中心与演示边界均为 WGS84。
 * 炼油区沿用项目现有正式演示数据；化工区、港区依据公开资料及卫星影像勾画，
 * 后续取得客户正式红线后仅需替换坐标文件，不影响业务筛选逻辑。
 */
export const plantAreaDefinitions: PlantAreaDefinition[] = [
  {
    code: 'all',
    label: '全厂区',
    centers: [
      { longitude: 110.88633, latitude: 21.67502 },
      { longitude: 110.9646, latitude: 21.5779 },
      { longitude: 111.083, latitude: 21.474 },
      { longitude: 111.302, latitude: 21.421 },
    ],
  },
  {
    code: 'refinery',
    label: '炼油区',
    centers: [{ longitude: 110.88633, latitude: 21.67502 }],
  },
  {
    code: 'chemical',
    label: '化工区',
    centers: [{ longitude: 110.9646, latitude: 21.5779 }],
  },
  {
    code: 'port',
    label: '港区',
    centers: [
      { longitude: 111.083, latitude: 21.474 },
      { longitude: 111.302, latitude: 21.421 },
    ],
  },
];

export const plantAreaBoundaryRings: Record<ConcretePlantAreaCode, number[][][]> = {
  // 炼油区使用 MaomingPetroCesiumMap 已有的“边界.geojson”，此处仅供总览包围计算。
  refinery: [
    [
      [110.868, 21.688],
      [110.899, 21.688],
      [110.906, 21.676],
      [110.902, 21.657],
      [110.871, 21.658],
      [110.864, 21.671],
      [110.868, 21.688],
    ],
  ],
  chemical: [
    [
      [110.944, 21.5945],
      [110.9745, 21.596],
      [110.9855, 21.585],
      [110.984, 21.562],
      [110.97, 21.5535],
      [110.946, 21.558],
      [110.9385, 21.573],
      [110.944, 21.5945],
    ],
  ],
  port: [
    // 水东港区
    [
      [111.067, 21.491],
      [111.0945, 21.493],
      [111.105, 21.478],
      [111.101, 21.4555],
      [111.078, 21.451],
      [111.063, 21.466],
      [111.067, 21.491],
    ],
    // 博贺新港区（与水东港区共同归入“港区”）
    [
      [111.274, 21.449],
      [111.325, 21.449],
      [111.334, 21.421],
      [111.321, 21.392],
      [111.283, 21.394],
      [111.266, 21.419],
      [111.274, 21.449],
    ],
  ],
};

export function getPlantAreaDefinition(code: PlantAreaCode) {
  return plantAreaDefinitions.find((item) => item.code === code) ?? plantAreaDefinitions[0];
}

/** 原型数据缺少厂区字段时按稳定序号分配，保证筛选结果可重复。 */
export function resolvePlantAreaCode(
  item: { areaCode?: ConcretePlantAreaCode; id?: string | number } | undefined,
  index = 0,
): ConcretePlantAreaCode {
  if (item?.areaCode) return item.areaCode;
  const raw = String(item?.id ?? index);
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  return (['refinery', 'chemical', 'port'] as const)[hash % 3];
}

/** 将现有炼油区原型坐标稳定映射到所属厂区，用于多厂区演示撒点。 */
export function resolvePlantAreaWorldPosition(
  item: { areaCode?: ConcretePlantAreaCode; id?: string | number } | undefined,
  index: number,
  longitude: number,
  latitude: number,
) {
  const code = resolvePlantAreaCode(item, index);
  if (code === 'refinery') return { longitude, latitude };
  const definition = getPlantAreaDefinition(code);
  const raw = Number(item?.id ?? index);
  const center =
    definition.centers[Math.abs(Number.isFinite(raw) ? raw : index) % definition.centers.length];
  const refineryCenter = getPlantAreaDefinition('refinery').centers[0];
  return {
    longitude: center.longitude + (longitude - refineryCenter.longitude) * 0.55,
    latitude: center.latitude + (latitude - refineryCenter.latitude) * 0.55,
  };
}
