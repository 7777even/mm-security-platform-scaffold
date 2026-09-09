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

// firePatrolRecords 业务数据已迁移后端 /fire/patrols（V10 落地），由 services/fireMonitoring.fetchFirePatrols 提供；
// 本文件仅保留巡检检查项定义与下拉选项等前端 UI 配置，勿回填业务数据。

export const patrolShiftOptions = ['全部班次', '上午', '下午', '夜间'] as const;
export const patrolStatusOptions = ['全部状态', '已完成', '未完成'] as const;
