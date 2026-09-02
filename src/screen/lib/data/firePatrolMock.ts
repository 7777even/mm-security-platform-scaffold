export type PatrolShift = '上午' | '下午' | '夜间';
export type PatrolResult = '正常' | '异常' | '不适用';
export type PatrolStatus = '已完成' | '未完成';

export interface PatrolCheckItem {
  itemCode: string;
  category: string;
  content: string;
  result: PatrolResult;
  abnormalDesc?: string;
  photoFile?: string;
}

export interface PatrolRecord {
  id: number;
  patrolDate: string;
  shift: PatrolShift;
  dutyPerson: string;
  patrolCount: string;
  locations: string[];
  completed: boolean;
  checkItems: PatrolCheckItem[];
  workOrderNo?: string;
}

export interface PatrolCheckItemDef {
  itemCode: string;
  category: string;
  content: string;
}

export const patrolCheckItemDefs: PatrolCheckItemDef[] = [
  { itemCode: 'A1', category: '用火用电安全管理', content: '有无违章用火情况' },
  { itemCode: 'A2', category: '用火用电安全管理', content: '有无违章用电情况' },
  { itemCode: 'B1', category: '疏散通道', content: '安全出口、疏散通道、疏散楼梯是否畅通' },
  { itemCode: 'B2', category: '疏散通道', content: '疏散走道、疏散楼梯、安全出口是否堆放可燃物' },
  { itemCode: 'B3', category: '疏散通道', content: '疏散走道、疏散楼梯、顶棚装修材料是否合格' },
  { itemCode: 'C1', category: '防火分隔设施', content: '常闭防火门是否处于正常关闭状态' },
  { itemCode: 'C2', category: '防火分隔设施', content: '常闭防火门是否被锁闭' },
  { itemCode: 'C3', category: '防火分隔设施', content: '防火卷帘是否处于正常工作状态' },
  { itemCode: 'C4', category: '防火分隔设施', content: '防火卷帘下方是否堆放物品' },
  { itemCode: 'D1', category: '消防设施器材', content: '疏散指示标志是否完好' },
  { itemCode: 'D2', category: '消防设施器材', content: '应急照明是否完好' },
  { itemCode: 'D3', category: '消防设施器材', content: '火灾探测器是否正常' },
  { itemCode: 'D4', category: '消防设施器材', content: '自动喷水灭火系统组件是否完好' },
  { itemCode: 'D5', category: '消防设施器材', content: '室内外消火栓是否完好' },
  { itemCode: 'D6', category: '消防设施器材', content: '灭火器是否处于正常完好状态' },
];

function buildCheckItems(
  abnormal: Partial<Record<string, { desc: string }>>,
  notApplicable: string[] = [],
): PatrolCheckItem[] {
  return patrolCheckItemDefs.map((def) => {
    const abnormalItem = abnormal[def.itemCode];
    const result: PatrolResult = abnormalItem
      ? '异常'
      : notApplicable.includes(def.itemCode)
        ? '不适用'
        : '正常';
    return {
      itemCode: def.itemCode,
      category: def.category,
      content: def.content,
      result,
      abnormalDesc: abnormalItem?.desc,
      photoFile: abnormalItem ? 'patrol-photo-placeholder.png' : undefined,
    };
  });
}

export const firePatrolRecords: PatrolRecord[] = [
  {
    id: 1,
    patrolDate: '2026-08-20',
    shift: '上午',
    dutyPerson: '张三',
    patrolCount: '第1次',
    locations: ['1#联合装置', '中央控制室'],
    completed: true,
    checkItems: buildCheckItems({}),
  },
  {
    id: 2,
    patrolDate: '2026-08-20',
    shift: '下午',
    dutyPerson: '王值班长',
    patrolCount: '第2次',
    locations: ['储运部罐区', '装卸区'],
    completed: false,
    checkItems: buildCheckItems({}),
  },
  {
    id: 3,
    patrolDate: '2026-08-20',
    shift: '夜间',
    dutyPerson: '赵四',
    patrolCount: '第3次',
    locations: ['常减压装置', '消防泵房'],
    completed: false,
    checkItems: buildCheckItems({}),
  },
  {
    id: 4,
    patrolDate: '2026-08-19',
    shift: '上午',
    dutyPerson: '张三',
    patrolCount: '第1次',
    locations: ['1#联合装置', '中央控制室'],
    completed: true,
    checkItems: buildCheckItems({ C1: { desc: '3F 常闭防火门被挡块撑开' } }),
    workOrderNo: 'WO-20260819-010',
  },
  {
    id: 5,
    patrolDate: '2026-08-19',
    shift: '下午',
    dutyPerson: '王值班长',
    patrolCount: '第2次',
    locations: ['储运部罐区', '装卸区'],
    completed: true,
    checkItems: buildCheckItems({ D5: { desc: '装卸区 5# 室内消火栓阀门锈死' } }),
  },
  {
    id: 6,
    patrolDate: '2026-08-19',
    shift: '夜间',
    dutyPerson: '赵四',
    patrolCount: '第3次',
    locations: ['常减压装置', '消防泵房'],
    completed: true,
    checkItems: buildCheckItems({}),
  },
  {
    id: 7,
    patrolDate: '2026-08-18',
    shift: '上午',
    dutyPerson: '李五',
    patrolCount: '第1次',
    locations: ['1#联合装置', '中央控制室', '储运部罐区'],
    completed: true,
    checkItems: buildCheckItems({ B2: { desc: '疏散走道堆放施工材料' } }, ['C3', 'C4']),
  },
  {
    id: 8,
    patrolDate: '2026-08-18',
    shift: '下午',
    dutyPerson: '张三',
    patrolCount: '第2次',
    locations: ['装卸区', '消防泵房'],
    completed: true,
    checkItems: buildCheckItems({}),
  },
  {
    id: 9,
    patrolDate: '2026-08-18',
    shift: '夜间',
    dutyPerson: '王值班长',
    patrolCount: '第3次',
    locations: ['常减压装置'],
    completed: true,
    checkItems: buildCheckItems({ D3: { desc: '5#装置区探测器指示灯不亮' } }),
  },
  {
    id: 10,
    patrolDate: '2026-08-17',
    shift: '上午',
    dutyPerson: '赵四',
    patrolCount: '第1次',
    locations: ['1#联合装置', '中央控制室'],
    completed: true,
    checkItems: buildCheckItems({}),
  },
  {
    id: 11,
    patrolDate: '2026-08-17',
    shift: '下午',
    dutyPerson: '李五',
    patrolCount: '第2次',
    locations: ['储运部罐区', '装卸区'],
    completed: true,
    checkItems: buildCheckItems({ A2: { desc: '临时用电线路私拉乱接' } }),
  },
  {
    id: 12,
    patrolDate: '2026-08-17',
    shift: '夜间',
    dutyPerson: '张三',
    patrolCount: '第3次',
    locations: ['常减压装置', '消防泵房'],
    completed: true,
    checkItems: buildCheckItems({}),
  },
];

export const patrolShiftOptions = ['全部班次', '上午', '下午', '夜间'] as const;
export const patrolStatusOptions = ['全部状态', '已完成', '未完成'] as const;
