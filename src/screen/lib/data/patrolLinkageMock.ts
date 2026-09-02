export interface PatrolLinkagePoint {
  id: number;
  name: string;
  location: string;
  status: '正常' | '离线' | '故障';
  camera: {
    id: number;
    name: string;
    zone: string;
    status: string;
    longitude: number;
    latitude: number;
  };
}

const ZONE_POINTS: Record<string, PatrolLinkagePoint[]> = {
  核心区防控: [
    {
      id: 1,
      name: '核心区A-1',
      location: '核心区东北角',
      status: '正常',
      camera: {
        id: 101,
        name: '核心区A-1#',
        zone: '核心区防控',
        status: '正常',
        longitude: 110.88962,
        latitude: 21.67569,
      },
    },
    {
      id: 2,
      name: '核心区A-2',
      location: '核心区西南角',
      status: '正常',
      camera: {
        id: 102,
        name: '核心区A-2#',
        zone: '核心区防控',
        status: '正常',
        longitude: 110.88772,
        latitude: 21.67451,
      },
    },
    {
      id: 3,
      name: '核心区A-3',
      location: '核心区中央',
      status: '故障',
      camera: {
        id: 103,
        name: '核心区A-3#',
        zone: '核心区防控',
        status: '故障',
        longitude: 110.88882,
        latitude: 21.67512,
      },
    },
  ],
  路网防控: [
    {
      id: 11,
      name: '北环路1',
      location: '北环路东段',
      status: '正常',
      camera: {
        id: 111,
        name: '北环路1#',
        zone: '路网防控',
        status: '正常',
        longitude: 110.88165,
        latitude: 21.68112,
      },
    },
    {
      id: 12,
      name: '北环路2',
      location: '北环路西段',
      status: '离线',
      camera: {
        id: 112,
        name: '北环路2#',
        zone: '路网防控',
        status: '离线',
        longitude: 110.8832,
        latitude: 21.68106,
      },
    },
    {
      id: 13,
      name: '南环路1',
      location: '南环路中段',
      status: '正常',
      camera: {
        id: 113,
        name: '南环路1#',
        zone: '路网防控',
        status: '正常',
        longitude: 110.8862,
        latitude: 21.6742,
      },
    },
  ],
  周界防控: [
    {
      id: 21,
      name: '周界东段',
      location: '厂区东周界',
      status: '正常',
      camera: {
        id: 121,
        name: '周界东段1#',
        zone: '周界防控',
        status: '正常',
        longitude: 110.8952,
        latitude: 21.6782,
      },
    },
    {
      id: 22,
      name: '周界西段',
      location: '厂区西周界',
      status: '正常',
      camera: {
        id: 122,
        name: '周界西段1#',
        zone: '周界防控',
        status: '正常',
        longitude: 110.8742,
        latitude: 21.6764,
      },
    },
  ],
  门禁卡口防控: [
    {
      id: 31,
      name: '东卡口',
      location: '厂区东门',
      status: '正常',
      camera: {
        id: 131,
        name: '东卡口3#',
        zone: '门禁卡口防控',
        status: '正常',
        longitude: 110.89175,
        latitude: 21.67778,
      },
    },
    {
      id: 32,
      name: '西门卡口',
      location: '厂区西门',
      status: '离线',
      camera: {
        id: 132,
        name: '西门卡口2#',
        zone: '门禁卡口防控',
        status: '离线',
        longitude: 110.8782,
        latitude: 21.6786,
      },
    },
  ],
  外围防控: [
    {
      id: 41,
      name: '外围北点',
      location: '厂区北外围',
      status: '正常',
      camera: {
        id: 141,
        name: '外围北点1#',
        zone: '外围防控',
        status: '正常',
        longitude: 110.8856,
        latitude: 21.6844,
      },
    },
    {
      id: 42,
      name: '外围南点',
      location: '厂区南外围',
      status: '正常',
      camera: {
        id: 142,
        name: '外围南点1#',
        zone: '外围防控',
        status: '正常',
        longitude: 110.8872,
        latitude: 21.6716,
      },
    },
  ],
};

export function patrolLinkagePointsForZone(zoneLabel: string): PatrolLinkagePoint[] {
  return ZONE_POINTS[zoneLabel] ?? [];
}
