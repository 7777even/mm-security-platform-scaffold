export type EntryCaptureMode = 'person' | 'vehicle' | 'hazmat';

export interface EntryCaptureItem {
  id: number;
  mode: EntryCaptureMode;
  title: string;
  gate: string;
  direction: '入厂' | '出厂';
  time: string;
  confidence?: number;
  statusTag?: string;
}

export const entryCaptureItems: EntryCaptureItem[] = [
  {
    id: 1,
    mode: 'vehicle',
    title: '粤KA4543',
    gate: '东门-入',
    direction: '入厂',
    time: '2026-01-20 10:23:23',
    confidence: 80,
    statusTag: '已备案',
  },
  {
    id: 2,
    mode: 'vehicle',
    title: '粤K·B8821',
    gate: '西门-出',
    direction: '出厂',
    time: '2026-01-20 09:56:41',
    confidence: 92,
    statusTag: '临时',
  },
  {
    id: 3,
    mode: 'vehicle',
    title: '未识别',
    gate: '南门-入',
    direction: '入厂',
    time: '2026-01-20 10:18:05',
    confidence: 30,
    statusTag: '异常',
  },
  {
    id: 4,
    mode: 'person',
    title: '张三',
    gate: '东门-入',
    direction: '入厂',
    time: '2026-01-20 08:02:15',
    statusTag: '门禁抓拍',
  },
  {
    id: 5,
    mode: 'person',
    title: '李四',
    gate: '南门-入',
    direction: '入厂',
    time: '2026-01-20 09:06:42',
    statusTag: '门禁抓拍',
  },
  {
    id: 6,
    mode: 'person',
    title: '王五',
    gate: '西门-出',
    direction: '出厂',
    time: '2026-01-20 10:01:19',
    statusTag: '门禁抓拍',
  },
  {
    id: 7,
    mode: 'hazmat',
    title: '粤K·D5560',
    gate: '南门-出',
    direction: '出厂',
    time: '2026-01-20 09:15:33',
    confidence: 88,
    statusTag: '危化',
  },
  {
    id: 8,
    mode: 'hazmat',
    title: '粤K·C1208',
    gate: '北门-入',
    direction: '入厂',
    time: '2026-01-20 09:42:17',
    statusTag: '危化',
  },
];

export const ENTRY_CAPTURE_PAGE_SIZE = 8;
