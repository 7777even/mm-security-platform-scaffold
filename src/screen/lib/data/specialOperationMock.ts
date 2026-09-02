export const specialOperationTypes = [
  '全部类型',
  '动火作业',
  '盲板抽堵',
  '吊装作业',
  '动土作业',
  '受限空间',
  '高处作业',
  '临时用电',
  '断路作业',
] as const;

export const specialOperationAreas = [
  '全部区域',
  '重油加氢装置',
  '乙烯装置区',
  '芳烃装置区',
  '罐区',
  '公用工程区',
  '仓储区',
] as const;

export const specialOperationLevels = ['全部等级', '一级', '二级', '三级'] as const;

export const specialOperationStatuses = [
  '全部状态',
  '已签发',
  '进行中',
  '已完成',
  '已取消',
] as const;

export interface SpecialOperationVideo {
  id: number;
  name: string;
  location: string;
}

export interface SpecialOperationGasPoint {
  id: number;
  name: string;
  value: string;
  status: string;
}

export interface SpecialOperationPerson {
  id: number;
  name: string;
  role: string;
  phone: string;
}

export interface SpecialOperationRecord {
  id: number;
  area: string;
  type: string;
  level: string;
  status: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  unit: string;
  applyUnit: string;
  operationDate: string;
  location: string;
  isContractor: string;
  hazardType: string;
  leaderName: string;
  leaderPhone: string;
  position: string;
  longitude: number;
  latitude: number;
  changeReason: string;
  cancelReason: string;
  guardianName: string;
  workers: string;
  permitNo: string;
  content: string;
  videoCount: number;
  gasMonitorCount: number;
  personnelCount: number;
  videos: SpecialOperationVideo[];
  gasPoints: SpecialOperationGasPoint[];
  personnel: SpecialOperationPerson[];
}

const types = specialOperationTypes.filter((t) => t !== '全部类型');
const areas = specialOperationAreas.filter((a) => a !== '全部区域');
const levels = specialOperationLevels.filter((l) => l !== '全部等级');
const statuses = specialOperationStatuses.filter((s) => s !== '全部状态');

function buildRecord(id: number): SpecialOperationRecord {
  const type = types[(id - 1) % types.length]!;
  const area = areas[(id - 1) % areas.length]!;
  const level = levels[id % levels.length]!;
  const status = statuses[id % statuses.length]!;
  const day = String((id % 28) + 1).padStart(2, '0');
  const startTime = `2026-06-${day} 09:30:00`;
  const endTime = `2026-06-${day} 17:00:00`;

  return {
    id,
    area,
    type,
    level,
    status,
    startTime,
    endTime,
    timeRange: `${startTime.replace(/-/g, '.')} - ${endTime.replace(/-/g, '.')}`,
    unit: '中国石油天然气第六建设有限公司',
    applyUnit: '化工一部',
    operationDate: startTime,
    location: `${area}`,
    isContractor: id % 4 === 0 ? '是' : '否',
    hazardType: id % 5 === 0 ? '火灾爆炸' : '--',
    leaderName: '赵忠阳',
    leaderPhone: '11111111',
    position: `${area}一层阀口`,
    longitude: 110.88 + (id % 12) * 0.0011,
    latitude: 21.674 + (id % 10) * 0.0009,
    changeReason: '--',
    cancelReason: '--',
    guardianName: '王学龙',
    workers: '阮国述, 孙业光',
    permitNo: `2026060115000${String(1320 + id)}.pdf`,
    content: type === '动火作业' ? '雨水池堵漏' : `${type}现场施工`,
    videoCount: 26,
    gasMonitorCount: 3,
    personnelCount: 2,
    videos: Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      name: `现场视频-${i + 1}`,
      location: `${area}监控点${i + 1}`,
    })),
    gasPoints: [
      { id: 1, name: '可燃气体', value: '0.2%LEL', status: '正常' },
      { id: 2, name: '氧气', value: '20.8%', status: '正常' },
      { id: 3, name: '硫化氢', value: '0ppm', status: '正常' },
    ],
    personnel: [
      { id: 1, name: '阮国述', role: '施工人员', phone: '13800001111' },
      { id: 2, name: '孙业光', role: '监护人员', phone: '13800002222' },
    ],
  };
}

/** 列表分页展示条目；业务总量 892 条 */
export const specialOperationTotalCount = 892;

export const specialOperationItems: SpecialOperationRecord[] = Array.from({ length: 89 }, (_, i) =>
  buildRecord(i + 1),
);

export function getSpecialOperationItem(
  id: number | null | undefined,
): SpecialOperationRecord | null {
  if (!id) return null;
  return specialOperationItems.find((item) => item.id === id) ?? null;
}
