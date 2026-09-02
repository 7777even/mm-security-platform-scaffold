export type FireAlarmTypeTone = 'fire' | 'smoke' | 'gds' | 'muted';

export interface FireAlarmListItem {
  id: number;
  /** 列表展示：火灾报警 / 烟雾报警 / GDS报警 */
  typeLabel: string;
  typeTone: FireAlarmTypeTone;
  source: string;
  objectType: string;
  objectName: string;
  level: string;
  description: string;
  location: string;
  time: string;
  falseAlarm: string;
  listStatus: string;
  rescueEventId: number;
  monitorId: string;
  monitorLabel: string;
  onsiteMonitorId: string;
  onsiteMonitorLabel: string;
  title: string;
}

export const fireAlarmSourceOptions = [
  '全部来源',
  '火灾报警',
  'DCS/GDS',
  '视频识别',
  '人工上报',
] as const;

export const fireAlarmObjectTypeOptions = ['全部类型', '装置', '储罐', '仓库', '管网'] as const;

export const fireAlarmObjectOptions = [
  '全部对象',
  '蜡油加氢装置',
  '催化裂化装置',
  '重整装置',
  '储罐区B-3',
  '仓储区A库',
  '火炬系统',
] as const;

export const fireAlarmListTypeOptions = [
  '全部类型',
  '火灾报警',
  '烟雾报警',
  'GDS报警',
  '设备故障',
] as const;

export const fireAlarmListStatusOptions = ['全部状态', '报警中', '已关闭'] as const;

const templates: Omit<FireAlarmListItem, 'id' | 'time'>[] = [
  {
    typeLabel: '火灾报警',
    typeTone: 'fire',
    source: '火灾报警',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    level: '-',
    description: '蜡油加氢装置区疑似出现明火，请核实。',
    location: '化工区-蜡油加氢装置区',
    falseAlarm: '未核实',
    listStatus: '报警中',
    rescueEventId: 1,
    monitorId: 'cam-a-east',
    monitorLabel: '蜡油加氢东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: '蜡油加氢现场监控',
    title: '蜡油加氢装置火灾',
  },
  {
    typeLabel: '烟雾报警',
    typeTone: 'smoke',
    source: '火灾报警',
    objectType: '储罐',
    objectName: '储罐区B-3',
    level: '-',
    description: '储罐区B-3顶部烟雾浓度异常升高，请现场复核。',
    location: '储运区-储罐区B-3',
    falseAlarm: '否',
    listStatus: '报警中',
    rescueEventId: 2,
    monitorId: 'cam-tank-b3',
    monitorLabel: '储罐区B-3监控',
    onsiteMonitorId: 'cam-tank-b3-site',
    onsiteMonitorLabel: '储罐区现场监控',
    title: '储罐区B-3烟雾',
  },
  {
    typeLabel: 'GDS报警',
    typeTone: 'gds',
    source: 'DCS/GDS',
    objectType: '装置',
    objectName: '催化裂化装置',
    level: '高高报',
    description: '催化裂化装置可燃气检测点浓度超限，请立即处置。',
    location: '炼油区-催化裂化装置',
    falseAlarm: '未核实',
    listStatus: '报警中',
    rescueEventId: 3,
    monitorId: 'cam-fcc-01',
    monitorLabel: '催化裂化监控',
    onsiteMonitorId: 'cam-fcc-site',
    onsiteMonitorLabel: '催化裂化现场监控',
    title: '催化裂化GDS报警',
  },
  {
    typeLabel: '烟雾报警',
    typeTone: 'muted',
    source: '视频识别',
    objectType: '仓库',
    objectName: '仓储区A库',
    level: '-',
    description: '仓储区A库视频监控识别烟雾，经核实为维保测试，已关闭。',
    location: '仓储区-A库',
    falseAlarm: '是',
    listStatus: '已关闭',
    rescueEventId: 4,
    monitorId: 'cam-store-a',
    monitorLabel: '仓储区监控',
    onsiteMonitorId: 'cam-store-site',
    onsiteMonitorLabel: '仓库现场监控',
    title: '仓储区A库烟雾',
  },
  {
    typeLabel: '火灾报警',
    typeTone: 'fire',
    source: '火灾报警',
    objectType: '装置',
    objectName: '重整装置',
    level: '-',
    description: '重整装置泵房感温电缆报警，请派员现场确认。',
    location: '化工区-重整装置泵房',
    falseAlarm: '否',
    listStatus: '报警中',
    rescueEventId: 5,
    monitorId: 'cam-reform-01',
    monitorLabel: '重整装置监控',
    onsiteMonitorId: 'cam-reform-site',
    onsiteMonitorLabel: '重整现场监控',
    title: '重整装置火灾',
  },
  {
    typeLabel: 'GDS报警',
    typeTone: 'gds',
    source: 'DCS/GDS',
    objectType: '管网',
    objectName: '火炬系统',
    level: '高报',
    description: '火炬系统周边可燃气检测短时波动，请关注。',
    location: '公用工程区-火炬系统',
    falseAlarm: '未核实',
    listStatus: '报警中',
    rescueEventId: 6,
    monitorId: 'cam-torch-01',
    monitorLabel: '火炬系统监控',
    onsiteMonitorId: 'cam-torch-site',
    onsiteMonitorLabel: '火炬现场监控',
    title: '火炬系统GDS',
  },
  {
    typeLabel: '设备故障',
    typeTone: 'muted',
    source: '火灾报警',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    level: '-',
    description: '感烟探测器通讯中断，已派维保人员检修。',
    location: '化工区-蜡油加氢装置区',
    falseAlarm: '-',
    listStatus: '已关闭',
    rescueEventId: 7,
    monitorId: 'cam-a-east',
    monitorLabel: '蜡油加氢东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: '蜡油加氢现场监控',
    title: '蜡油加氢设备故障',
  },
  {
    typeLabel: '火灾报警',
    typeTone: 'fire',
    source: '人工上报',
    objectType: '储罐',
    objectName: '储罐区B-3',
    level: '-',
    description: '巡检人员报告储罐区有异味，请联动气体检测复核。',
    location: '储运区-储罐区B-3',
    falseAlarm: '未核实',
    listStatus: '报警中',
    rescueEventId: 8,
    monitorId: 'cam-tank-b3',
    monitorLabel: '储罐区B-3监控',
    onsiteMonitorId: 'cam-tank-b3-site',
    onsiteMonitorLabel: '储罐区现场监控',
    title: '储罐区人工上报',
  },
  {
    typeLabel: '烟雾报警',
    typeTone: 'smoke',
    source: '视频识别',
    objectType: '装置',
    objectName: '催化裂化装置',
    level: '-',
    description: '催化裂化装置西侧视频识别到烟雾团，请核实。',
    location: '炼油区-催化裂化装置西侧',
    falseAlarm: '否',
    listStatus: '报警中',
    rescueEventId: 9,
    monitorId: 'cam-fcc-01',
    monitorLabel: '催化裂化监控',
    onsiteMonitorId: 'cam-fcc-site',
    onsiteMonitorLabel: '催化裂化现场监控',
    title: '催化裂化烟雾',
  },
  {
    typeLabel: 'GDS报警',
    typeTone: 'gds',
    source: 'DCS/GDS',
    objectType: '装置',
    objectName: '蜡油加氢装置',
    level: '高高报',
    description: '蜡油加氢装置硫化氢检测点高高报，请启动应急预案。',
    location: '化工区-蜡油加氢装置区',
    falseAlarm: '否',
    listStatus: '报警中',
    rescueEventId: 10,
    monitorId: 'cam-a-east',
    monitorLabel: '蜡油加氢东侧监控',
    onsiteMonitorId: 'cam-a-site',
    onsiteMonitorLabel: '蜡油加氢现场监控',
    title: '蜡油加氢GDS高高报',
  },
];

function formatAlarmTime(index: number): string {
  const day = 31 - Math.floor(index / 3);
  const hour = 10 + (index % 8);
  const minute = 14 + (index % 45);
  const second = 12 + (index % 48);
  return `2026.5.${day} ${hour}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

export const fireAlarmListItems: FireAlarmListItem[] = Array.from({ length: 50 }, (_, index) => {
  const base = templates[index % templates.length]!;
  return {
    ...base,
    id: index + 1,
    time: formatAlarmTime(index),
  };
});

export const fireAlarmListTotalCount = fireAlarmListItems.length;
