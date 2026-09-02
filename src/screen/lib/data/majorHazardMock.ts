import { stagePercentStringToWorldPosition } from '../../utils/mapDesignGeo';

export type HazardLevel = '一级' | '二级' | '三级' | '四级';

export interface MajorHazardItem {
  id: number;
  name: string;
  level: HazardLevel;
  rValue: number;
  monitorCount: number;
  videoCount: number;
  enterprise: string;
  category: string;
  code: string;
  longitude: number;
  latitude: number;
}

export interface MajorHazardContact {
  role: string;
  name: string;
  phone: string;
}

export interface MajorHazardFile {
  id: number;
  name: string;
}

export interface MajorHazardDetail extends MajorHazardItem {
  commissionDate: string;
  keyProcess: boolean;
  inChemicalPark: boolean;
  contacts: MajorHazardContact[];
  files: MajorHazardFile[];
  monitors: Array<{ id: number; name: string; status: string }>;
  videos: Array<{ id: number; name: string; status: string }>;
  chemicals: Array<{ id: number; name: string; amount: string }>;
  evacuationRoutes: Array<{
    id: number;
    name: string;
    from: string;
    via: string;
    to: string;
    status: string;
  }>;
  operations: Array<{ id: number; name: string; type: string; owner: string; status: string }>;
}

const names = [
  '4#脱硫脱硝装置',
  '15万吨/年顺丁橡胶装置',
  '乙烯裂解装置',
  '催化裂化装置',
  '蜡油加氢装置',
  '重整装置',
  '储罐区B-3',
  '环氧乙烷装置',
  '芳烃抽提装置',
  '硫磺回收装置',
  '加氢精制装置',
  '气体分馏装置',
];

const levels: HazardLevel[] = ['一级', '二级', '三级', '四级'];
const enterprises = ['茂名石化', '乙烯厂', '炼油厂', '化工分部'];
const categories = ['装置', '储罐', '仓库', '管廊'];

const positions = [
  ['42%', '32%'],
  ['48%', '38%'],
  ['55%', '30%'],
  ['38%', '45%'],
  ['52%', '48%'],
  ['60%', '42%'],
  ['45%', '55%'],
  ['35%', '36%'],
  ['58%', '52%'],
  ['50%', '28%'],
  ['40%', '50%'],
  ['62%', '35%'],
] as const;

export const majorHazards: MajorHazardItem[] = names.map((name, index) => {
  const [left, top] = positions[index]!;
  const world = stagePercentStringToWorldPosition(left, top);
  const level = levels[index % levels.length]!;
  return {
    id: index + 1,
    name,
    level,
    rValue: 20 + ((index * 17) % 120),
    monitorCount: 4 + (index % 8),
    videoCount: 2 + (index % 6),
    enterprise: enterprises[index % enterprises.length]!,
    category: categories[index % categories.length]!,
    code: `3706809170${String(80 + index).padStart(2, '0')}`,
    longitude: world.longitude,
    latitude: world.latitude,
  };
});

export const majorHazardLevelSummary = {
  total: majorHazards.length,
  一级: majorHazards.filter((h) => h.level === '一级').length,
  二级: majorHazards.filter((h) => h.level === '二级').length,
  三级: majorHazards.filter((h) => h.level === '三级').length,
  四级: majorHazards.filter((h) => h.level === '四级').length,
};

export const hazardEnterpriseOptions = ['全部企业', ...enterprises] as const;
export const hazardLevelOptions = ['全部等级', ...levels] as const;

export function resolveMajorHazardDetail(id?: number | string): MajorHazardDetail {
  const num = Number(id);
  const item = majorHazards.find((h) => h.id === num) ?? majorHazards[0]!;
  return {
    ...item,
    commissionDate: '2024-10-15',
    keyProcess: item.level === '一级' || item.level === '二级',
    inChemicalPark: true,
    contacts: [
      { role: '主要负责人', name: '程仁策', phone: '13705456799' },
      { role: '技术负责人', name: '王立新', phone: '13800138001' },
      { role: '操作负责人', name: '李明华', phone: '13900139002' },
    ],
    files: [
      { id: 1, name: `${item.name}SIL定级报告.pdf` },
      { id: 2, name: `${item.name}安全评价报告.pdf` },
      { id: 3, name: `${item.name}应急预案.pdf` },
    ],
    monitors: Array.from({ length: item.monitorCount }, (_, i) => ({
      id: i + 1,
      name: `监测点-${String(i + 1).padStart(2, '0')}`,
      status: i % 5 === 0 ? '离线' : '正常',
    })),
    videos: Array.from({ length: item.videoCount }, (_, i) => ({
      id: i + 1,
      name: `视频点位-${String(i + 1).padStart(2, '0')}`,
      status: i % 4 === 0 ? '离线' : '正常',
    })),
    evacuationRoutes: [
      {
        id: 1,
        name: '主疏散路线-东',
        from: `${item.name}东侧`,
        via: '东二路',
        to: '厂区东门集结点',
        status: '畅通',
      },
      {
        id: 2,
        name: '主疏散路线-西',
        from: `${item.name}西侧`,
        via: '西一路',
        to: '厂区西门集结点',
        status: '畅通',
      },
      {
        id: 3,
        name: '备用疏散路线',
        from: `${item.name}北侧`,
        via: '北环路',
        to: '厂区北门集结点',
        status: '待确认',
      },
    ],
    operations: [
      { id: 1, name: '启动喷淋降温', type: '应急操作', owner: '装置操作员', status: '待执行' },
      { id: 2, name: '切断进料阀门', type: '应急操作', owner: '装置操作员', status: '待执行' },
      { id: 3, name: '呼叫消防救援', type: '应急联络', owner: '应急指挥', status: '待执行' },
      { id: 4, name: '开启应急广播', type: '应急联络', owner: '值班长', status: '待执行' },
    ],
    chemicals: [
      { id: 1, name: '丁二烯', amount: '120 t' },
      { id: 2, name: '氢气', amount: '8 t' },
      { id: 3, name: '氮气', amount: '15 t' },
    ],
  };
}

export function levelTone(level: HazardLevel): 'l1' | 'l2' | 'l3' | 'l4' {
  if (level === '一级') return 'l1';
  if (level === '二级') return 'l2';
  if (level === '三级') return 'l3';
  return 'l4';
}
