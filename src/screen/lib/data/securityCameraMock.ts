export type PatrolCameraStatus = '正常' | '离线' | '故障';

export interface PatrolCameraItem {
  id: number;
  name: string;
  zone: string;
  status: PatrolCameraStatus;
  longitude: number;
  latitude: number;
}

export const patrolCameraPageSize = 10;

export const patrolCameras: PatrolCameraItem[] = [
  {
    id: 1,
    name: '北环路1#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.88165,
    latitude: 21.68112,
  },
  {
    id: 2,
    name: '北环路1#',
    zone: '路网防控',
    status: '离线',
    longitude: 110.8821,
    latitude: 21.6811,
  },
  {
    id: 3,
    name: '北环路1#',
    zone: '路网防控',
    status: '故障',
    longitude: 110.8826,
    latitude: 21.68108,
  },
  {
    id: 4,
    name: '北环路2#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8832,
    latitude: 21.68106,
  },
  {
    id: 5,
    name: '东卡口3#',
    zone: '门禁卡口防控',
    status: '正常',
    longitude: 110.89175,
    latitude: 21.67778,
  },
  {
    id: 6,
    name: '东卡口4#',
    zone: '门禁卡口防控',
    status: '离线',
    longitude: 110.8917,
    latitude: 21.6757,
  },
  {
    id: 7,
    name: '核心区A-1#',
    zone: '核心区防控',
    status: '正常',
    longitude: 110.88962,
    latitude: 21.67569,
  },
  {
    id: 8,
    name: '核心区A-2#',
    zone: '核心区防控',
    status: '故障',
    longitude: 110.88736,
    latitude: 21.6757,
  },
  {
    id: 9,
    name: '周界西段1#',
    zone: '周界防控',
    status: '正常',
    longitude: 110.87651,
    latitude: 21.68121,
  },
  {
    id: 10,
    name: '周界西段2#',
    zone: '周界防控',
    status: '离线',
    longitude: 110.87382,
    latitude: 21.68353,
  },
  {
    id: 11,
    name: '外围南门1#',
    zone: '外围防控',
    status: '正常',
    longitude: 110.88162,
    latitude: 21.67038,
  },
  {
    id: 12,
    name: '外围南门2#',
    zone: '外围防控',
    status: '正常',
    longitude: 110.88307,
    latitude: 21.67044,
  },
  {
    id: 13,
    name: '炼油大道5#',
    zone: '路网防控',
    status: '故障',
    longitude: 110.88731,
    latitude: 21.6778,
  },
  {
    id: 14,
    name: '炼油大道6#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8815,
    latitude: 21.67776,
  },
  {
    id: 15,
    name: '西门岗1#',
    zone: '门禁卡口防控',
    status: '离线',
    longitude: 110.87648,
    latitude: 21.68357,
  },
  {
    id: 16,
    name: '西门岗2#',
    zone: '门禁卡口防控',
    status: '正常',
    longitude: 110.87386,
    latitude: 21.68471,
  },
  {
    id: 17,
    name: '核心区B-1#',
    zone: '核心区防控',
    status: '正常',
    longitude: 110.88519,
    latitude: 21.67357,
  },
  {
    id: 18,
    name: '核心区B-2#',
    zone: '核心区防控',
    status: '离线',
    longitude: 110.88307,
    latitude: 21.67359,
  },
  {
    id: 19,
    name: '周界东段1#',
    zone: '周界防控',
    status: '正常',
    longitude: 110.8918,
    latitude: 21.67476,
  },
  {
    id: 20,
    name: '周界东段2#',
    zone: '周界防控',
    status: '故障',
    longitude: 110.89178,
    latitude: 21.67051,
  },
  {
    id: 21,
    name: '外围北门1#',
    zone: '外围防控',
    status: '正常',
    longitude: 110.87449,
    latitude: 21.6847,
  },
  {
    id: 22,
    name: '外围北门2#',
    zone: '外围防控',
    status: '离线',
    longitude: 110.88156,
    latitude: 21.68091,
  },
  {
    id: 23,
    name: '南环路3#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8898,
    latitude: 21.67808,
  },
  {
    id: 24,
    name: '南环路4#',
    zone: '路网防控',
    status: '正常',
    longitude: 110.8917,
    latitude: 21.67769,
  },
  {
    id: 25,
    name: '东门岗1#',
    zone: '门禁卡口防控',
    status: '故障',
    longitude: 110.89195,
    latitude: 21.6777,
  },
];

export function countPlayableCameras(items: PatrolCameraItem[]): number {
  return items.filter((item) => item.status === '正常').length;
}
