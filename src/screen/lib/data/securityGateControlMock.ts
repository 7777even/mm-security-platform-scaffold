export type GateControlStatus = '正常' | '离线' | '故障';

export interface GateControlItem {
  id: number;
  name: string;
  location: string;
  status: GateControlStatus;
  longitude: number;
  latitude: number;
}

export const gateControlPageSize = 10;

export const gateControls: GateControlItem[] = [
  {
    id: 1,
    name: '1#门-道闸1',
    location: '1#门',
    status: '正常',
    longitude: 110.89175,
    latitude: 21.67778,
  },
  {
    id: 2,
    name: '1#门-道闸2',
    location: '1#门',
    status: '正常',
    longitude: 110.8917,
    latitude: 21.6777,
  },
  {
    id: 3,
    name: '1#门-道闸3',
    location: '1#门',
    status: '离线',
    longitude: 110.89165,
    latitude: 21.67762,
  },
  {
    id: 4,
    name: '2#门-道闸1',
    location: '2#门',
    status: '正常',
    longitude: 110.88162,
    latitude: 21.68112,
  },
  {
    id: 5,
    name: '2#门-道闸2',
    location: '2#门',
    status: '故障',
    longitude: 110.88156,
    latitude: 21.68091,
  },
  {
    id: 6,
    name: '3#门-道闸1',
    location: '3#门',
    status: '正常',
    longitude: 110.87648,
    latitude: 21.68357,
  },
  {
    id: 7,
    name: '3#门-道闸2',
    location: '3#门',
    status: '离线',
    longitude: 110.87386,
    latitude: 21.68471,
  },
  {
    id: 8,
    name: '东门-道闸1',
    location: '东门',
    status: '正常',
    longitude: 110.894,
    latitude: 21.6855,
  },
  {
    id: 9,
    name: '南门-道闸1',
    location: '南门',
    status: '正常',
    longitude: 110.8806,
    latitude: 21.6707,
  },
  {
    id: 10,
    name: '西门-道闸1',
    location: '西门',
    status: '正常',
    longitude: 110.8664,
    latitude: 21.6784,
  },
  {
    id: 11,
    name: '北门-道闸1',
    location: '北门',
    status: '离线',
    longitude: 110.8776,
    latitude: 21.6898,
  },
];
