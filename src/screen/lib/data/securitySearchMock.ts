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

export interface VehicleSearchDetail extends VehicleSearchResult {
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  company: string;
  appointmentNo: string;
  appointmentTime: string;
  visitPurpose: string;
  waybillNo: string;
  cargo: string;
  destination: string;
}

export interface PersonSearchDetail extends PersonSearchResult {
  gender: string;
  phone: string;
  company: string;
  idNumber: string;
  appointmentNo: string;
  appointmentTime: string;
  visitPurpose: string;
  specialOperation: string;
  operationArea: string;
}

const vehicleDetailExtras: Record<number, Omit<VehicleSearchDetail, keyof VehicleSearchResult>> = {
  1: {
    vehicleType: '危化品运输车',
    driverName: '刘师傅',
    driverPhone: '138****4521',
    company: '茂名顺达物流有限公司',
    appointmentNo: 'YY202601200018',
    appointmentTime: '2026-01-20 09:00 — 18:00',
    visitPurpose: '原料配送',
    waybillNo: 'YD202601200031',
    cargo: '工业乙醇',
    destination: '炼油一区装卸点',
  },
  2: {
    vehicleType: '未知',
    driverName: '—',
    driverPhone: '—',
    company: '—',
    appointmentNo: '—',
    appointmentTime: '—',
    visitPurpose: '—',
    waybillNo: '—',
    cargo: '—',
    destination: '—',
  },
  3: {
    vehicleType: '普通货车',
    driverName: '王师傅',
    driverPhone: '139****8820',
    company: '粤西运输队',
    appointmentNo: 'YY202601200012',
    appointmentTime: '2026-01-20 08:30 — 17:30',
    visitPurpose: '设备检修物资',
    waybillNo: 'YD202601200022',
    cargo: '检修工具及配件',
    destination: '机修车间',
  },
  4: {
    vehicleType: '厢式货车',
    driverName: '陈师傅',
    driverPhone: '137****1208',
    company: '茂名石化物资供应中心',
    appointmentNo: 'YY202601190045',
    appointmentTime: '2026-01-20 07:00 — 16:00',
    visitPurpose: '日常物资配送',
    waybillNo: 'YD202601200015',
    cargo: '劳保用品',
    destination: '仓储中心',
  },
  5: {
    vehicleType: '未知',
    driverName: '—',
    driverPhone: '—',
    company: '—',
    appointmentNo: '—',
    appointmentTime: '—',
    visitPurpose: '—',
    waybillNo: '—',
    cargo: '—',
    destination: '—',
  },
  6: {
    vehicleType: '罐车',
    driverName: '张师傅',
    driverPhone: '136****5560',
    company: '华南化工物流',
    appointmentNo: 'YY202601200009',
    appointmentTime: '2026-01-20 06:00 — 15:00',
    visitPurpose: '化工原料入厂',
    waybillNo: 'YD202601200008',
    cargo: '丙烯',
    destination: '化工装置区',
  },
};

const personDetailExtras: Record<number, Omit<PersonSearchDetail, keyof PersonSearchResult>> = {
  1: {
    gender: '男',
    phone: '138****1001',
    company: '茂名石化检修公司',
    idNumber: '4409**********1234',
    appointmentNo: 'YY202601200021',
    appointmentTime: '2026-01-20 08:00 — 17:00',
    visitPurpose: '设备检修',
    specialOperation: '高处作业',
    operationArea: '炼油二区',
  },
  2: {
    gender: '男',
    phone: '139****2002',
    company: '广东安环检测中心',
    idNumber: '4409**********5678',
    appointmentNo: 'YY202601200019',
    appointmentTime: '2026-01-20 09:00 — 16:00',
    visitPurpose: '环保检测',
    specialOperation: '受限空间作业',
    operationArea: '污水处理站',
  },
  3: {
    gender: '女',
    phone: '137****3003',
    company: '茂名石化设计院',
    idNumber: '4409**********9012',
    appointmentNo: 'YY202601200015',
    appointmentTime: '2026-01-20 10:00 — 18:00',
    visitPurpose: '现场勘察',
    specialOperation: '—',
    operationArea: '—',
  },
  4: {
    gender: '男',
    phone: '136****4004',
    company: '中石化工程公司',
    idNumber: '4409**********3456',
    appointmentNo: 'YY202601190038',
    appointmentTime: '2026-01-19 08:00 — 17:00',
    visitPurpose: '工程施工',
    specialOperation: '动火作业',
    operationArea: '化工新区',
  },
  5: {
    gender: '男',
    phone: '135****5005',
    company: '茂名石化保卫部',
    idNumber: '4409**********7890',
    appointmentNo: '—',
    appointmentTime: '—',
    visitPurpose: '内部巡检',
    specialOperation: '—',
    operationArea: '全厂区',
  },
  6: {
    gender: '女',
    phone: '134****6006',
    company: '华南设备供应商',
    idNumber: '4409**********2345',
    appointmentNo: 'YY202601190032',
    appointmentTime: '2026-01-19 09:00 — 17:00',
    visitPurpose: '设备安装调试',
    specialOperation: '吊装作业',
    operationArea: '动力站',
  },
};

export function getVehicleSearchDetail(id: number | null): VehicleSearchDetail | null {
  if (id == null) return null;
  const base = vehicleSearchResults.find((item) => item.id === id);
  const extra = vehicleDetailExtras[id];
  if (!base || !extra) return null;
  return { ...base, ...extra };
}

export function getPersonSearchDetail(id: number | null): PersonSearchDetail | null {
  if (id == null) return null;
  const base = personSearchResults.find((item) => item.id === id);
  const extra = personDetailExtras[id];
  if (!base || !extra) return null;
  return { ...base, ...extra };
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
