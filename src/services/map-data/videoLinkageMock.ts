export interface VideoLinkageConfig {
  id: string;
  name: string;
  code: string;
  category: string;
  linkageCount: number;
  businessObjects: string;
}

export interface LinkageRuleRow {
  id: string;
  presetPoint: string;
  objectCategory: string;
  objectName: string;
}

export const videoLinkageConfigs: VideoLinkageConfig[] = [
  {
    id: 'lk-001',
    name: 'XX强3-2棚伯',
    code: 'HKJK-5124863',
    category: '枪机',
    linkageCount: 4,
    businessObjects: '石脑油罐区、催化裂化装置、催化氢解装置、储油罐区',
  },
  {
    id: 'lk-002',
    name: 'XX强3-5棚伯',
    code: 'HKJK-5124864',
    category: '枪机',
    linkageCount: 1,
    businessObjects: '石脑油罐区',
  },
  {
    id: 'lk-003',
    name: '1#厂区高空AR',
    code: 'HKJK-5124865',
    category: '高空AR',
    linkageCount: 2,
    businessObjects: 'A生产区、B生产区',
  },
  {
    id: 'lk-004',
    name: '北2路33#枪机',
    code: 'HKJK-5124866',
    category: '枪机',
    linkageCount: 3,
    businessObjects: '北2路、储油罐区、炼化厂区门口',
  },
  {
    id: 'lk-005',
    name: '储油罐区-2#球机',
    code: 'HKJK-5124867',
    category: '球机',
    linkageCount: 2,
    businessObjects: '储油罐区、消防水系统',
  },
];

export const monitorNameOptions = [
  'XX强3-2棚伯',
  'XX强3-5棚伯',
  '1#厂区高空AR',
  '北2路33#枪机',
  '储油罐区-2#球机',
  'A装置区-5#球机',
];

export const presetPointOptions = [
  '石脑油罐区-东南角',
  '催化裂化装置-北侧',
  '催化氢解装置-西侧',
  '储油罐区-西侧出入口',
  '炼化厂区门口',
  '北2路中段',
];

export const businessObjectCategoryOptions = [
  '重大危险源',
  '生产装置',
  '储罐',
  '库区',
  '仓库',
  '消防设备',
  '摄像头',
];

export const businessObjectOptions = [
  '石脑油罐区',
  '催化裂化装置',
  '催化氢解装置',
  '储油罐区',
  'A生产区',
  'B生产区',
  '炼化厂区门口',
  '北2路',
  '1#消防泵房',
];

export function getVideoLinkageConfig(id: string | null) {
  return videoLinkageConfigs.find((item) => item.id === id) ?? null;
}

export function buildLinkageRules(configId: string): LinkageRuleRow[] {
  const map: Record<string, LinkageRuleRow[]> = {
    'lk-001': [
      {
        id: 'r1',
        presetPoint: '石脑油罐区-东南角',
        objectCategory: '重大危险源',
        objectName: '石脑油罐区',
      },
      {
        id: 'r2',
        presetPoint: '催化裂化装置-北侧',
        objectCategory: '生产装置',
        objectName: '催化裂化装置',
      },
      {
        id: 'r3',
        presetPoint: '催化氢解装置-西侧',
        objectCategory: '生产装置',
        objectName: '催化氢解装置',
      },
      {
        id: 'r4',
        presetPoint: '储油罐区-西侧出入口',
        objectCategory: '储罐',
        objectName: '储油罐区',
      },
    ],
    'lk-002': [
      {
        id: 'r1',
        presetPoint: '石脑油罐区-东南角',
        objectCategory: '重大危险源',
        objectName: '石脑油罐区',
      },
    ],
    'lk-003': [
      { id: 'r1', presetPoint: '炼化厂区门口', objectCategory: '库区', objectName: 'A生产区' },
      { id: 'r2', presetPoint: '北2路中段', objectCategory: '库区', objectName: 'B生产区' },
    ],
  };
  return (
    map[configId] ?? [
      {
        id: 'r1',
        presetPoint: '炼化厂区门口',
        objectCategory: '摄像头',
        objectName: '炼化厂区门口',
      },
    ]
  );
}
