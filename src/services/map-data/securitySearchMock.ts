export interface VehicleSearchResult {
  id: number;
  plate: string;
  confidence?: number;
  gate: string;
  status: string;
  time: string;
}

export interface PersonSearchResult {
  id: number;
  name: string;
  gate: string;
  status: string;
  date: string;
}

export const vehicleSearchResults: VehicleSearchResult[] = [
  {
    id: 1,
    plate: '粤KA4543',
    confidence: 80,
    gate: '东门-入',
    status: '入厂',
    time: '2026-01-20 10:23:23',
  },
  {
    id: 2,
    plate: '未识别',
    confidence: 30,
    gate: '南门-入',
    status: '入厂',
    time: '2026-01-20 10:18:05',
  },
  {
    id: 3,
    plate: '粤K·B8821',
    confidence: 92,
    gate: '西门-出',
    status: '出厂',
    time: '2026-01-20 09:56:41',
  },
  {
    id: 4,
    plate: '粤K·C1208',
    gate: '北门-入',
    status: '入厂',
    time: '2026-01-20 09:42:17',
  },
  {
    id: 5,
    plate: '未识别',
    confidence: 45,
    gate: '东门-入',
    status: '入厂',
    time: '2026-01-20 09:31:08',
  },
  {
    id: 6,
    plate: '粤K·D5560',
    confidence: 88,
    gate: '南门-出',
    status: '出厂',
    time: '2026-01-20 09:15:33',
  },
];

export const personSearchResults: PersonSearchResult[] = [
  { id: 1, name: '张三', gate: '东门-入', status: '入厂', date: '2026-01-20' },
  { id: 2, name: '李四', gate: '南门-入', status: '入厂', date: '2026-01-20' },
  { id: 3, name: '王五', gate: '西门-出', status: '出厂', date: '2026-01-20' },
  { id: 4, name: '赵六', gate: '北门-入', status: '入厂', date: '2026-01-19' },
  { id: 5, name: '陈七', gate: '东门-出', status: '出厂', date: '2026-01-19' },
  { id: 6, name: '周八', gate: '南门-入', status: '入厂', date: '2026-01-19' },
];
