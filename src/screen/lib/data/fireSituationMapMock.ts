export type FireSituationMarkerKind = 'event' | 'operation' | 'alarm';

export interface FireSituationMarkerItem {
  id: string;
  kind: FireSituationMarkerKind;
  title: string;
  subtitle: string;
  longitude: number;
  latitude: number;
  important: boolean;
  iconUrl: string;
  level?: string;
  targetId: number;
}

/** 消防态势地图演示点位；后续接口只需按此结构替换数据源。 */
export const fireSituationMarkers: FireSituationMarkerItem[] = [
  {
    id: 'event-1',
    kind: 'event',
    title: '当前应急事件',
    subtitle: 'A装置区火灾处置中',
    longitude: 110.875,
    latitude: 21.6855,
    important: true,
    iconUrl: '/icons/fire-situation/flame.svg',
    level: '处置中',
    targetId: 1,
  },
  {
    id: 'op-hot',
    kind: 'operation',
    title: '特级动火作业',
    subtitle: '芳烃装置区 · 进行中',
    longitude: 110.879,
    latitude: 21.6815,
    important: true,
    iconUrl: '/icons/fire-situation/flame.svg',
    level: '特级',
    targetId: 1,
  },
  {
    id: 'op-confined',
    kind: 'operation',
    title: '一级受限空间作业',
    subtitle: '罐区 · 进行中',
    longitude: 110.8828,
    latitude: 21.6828,
    important: true,
    iconUrl: '/icons/fire-situation/confined-space.svg',
    level: '一级',
    targetId: 5,
  },
  {
    id: 'op-lift',
    kind: 'operation',
    title: '一级吊装作业',
    subtitle: '乙烯装置区 · 进行中',
    longitude: 110.8835,
    latitude: 21.6752,
    important: false,
    iconUrl: '/icons/fire-situation/crane.svg',
    level: '一级',
    targetId: 3,
  },
  {
    id: 'op-height',
    kind: 'operation',
    title: '一级高处作业',
    subtitle: '芳烃装置区 · 进行中',
    longitude: 110.8872,
    latitude: 21.6728,
    important: false,
    iconUrl: '/icons/fire-situation/ladder.svg',
    level: '一级',
    targetId: 6,
  },
  {
    id: 'alarm-1',
    kind: 'alarm',
    title: '火灾报警',
    subtitle: '化工区A装置西侧 · 未销警',
    longitude: 110.888,
    latitude: 21.6854,
    important: true,
    iconUrl: '/icons/fire-situation/bell-ringing.svg',
    level: '未销警',
    targetId: 1,
  },
  {
    id: 'alarm-2',
    kind: 'alarm',
    title: 'GDS报警',
    subtitle: '输油管廊 · 未销警',
    longitude: 110.8902,
    latitude: 21.6752,
    important: false,
    iconUrl: '/icons/fire-situation/gas.svg',
    level: '未销警',
    targetId: 2,
  },
];
