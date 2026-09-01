import { fireEquipmentCategories } from './mock';

/** 13 类标准类型（含“维护保养记录”，作为子表不参与监控卡片） */
export const fireFacilityTypeOptions = [
  '全部类型',
  ...fireEquipmentCategories,
  '维护保养记录',
] as const;

export type FacilityMonitorStatus = '正常' | '告警' | '离线';
export type AlarmLevel = '紧急' | '重要' | '一般';
export type AlarmCategory = '火灾' | '故障' | '动作';
export type FaultStatus = '待确认' | '已确认' | '已派单' | '维修中' | '待验收' | '已闭环';
export type WorkOrderStatus = '已派发' | '执行中' | '待验收' | '已完成';

export interface MonitorParam {
  label: string;
  value: string;
  tone: 'normal' | 'warning' | 'danger';
}

export interface FacilityMonitorSummary {
  key: string;
  facilityType: string;
  total: number;
  online: number;
  offline: number;
  fault: number;
  status: FacilityMonitorStatus;
  params: MonitorParam[];
  lastReportTime: string;
}

export interface MaintenanceRecordItem {
  date: string;
  content: string;
  reportFile?: string;
}

export interface FacilityLedgerItem {
  facilityCode: string;
  facilityName: string;
  facilityType: string;
  location: string;
  device: string;
  maintainerName: string;
  maintainerPhone: string;
  enabled: boolean;
  maintenanceRecords: MaintenanceRecordItem[];
}

export interface FaultTimelineItem {
  time: string;
  operator: string;
  action: string;
  detail: string;
}

export interface FacilityFaultItem {
  id: number;
  faultCode: string;
  facilityCode: string;
  facilityName: string;
  facilityType: string;
  faultType: string;
  faultLevel: AlarmLevel;
  discoverTime: string;
  discoverMethod: string;
  phenomenon: string;
  cause: string;
  status: FaultStatus;
  workOrderNo?: string;
  repairPerson?: string;
  estimatedFinish?: string;
  actualFinish?: string;
  repairMeasures?: string;
  acceptancePerson?: string;
  acceptanceResult?: string;
  timeline: FaultTimelineItem[];
}

export interface FacilityAlarmItem {
  id: string;
  source: string;
  facilityType: string;
  level: AlarmLevel;
  category: AlarmCategory;
  content: string;
  time: string;
  status: FaultStatus;
  faultCode: string;
}

export interface FacilityWorkOrderItem {
  id: number;
  workOrderNo: string;
  faultCode: string;
  facilityCode: string;
  facilityName: string;
  facilityType: string;
  faultLevel: AlarmLevel;
  description: string;
  status: WorkOrderStatus;
  dispatchTime: string;
  repairPerson: string;
  estimatedFinish: string;
  actualFinish?: string;
  timeline: FaultTimelineItem[];
}

export const fireFacilityMonitorSummaries: FacilityMonitorSummary[] = [
  {
    key: 'fas',
    facilityType: '火灾自动报警系统',
    total: 128,
    online: 124,
    offline: 4,
    fault: 2,
    status: '告警',
    params: [
      { label: '运行状态', value: '报警', tone: 'danger' },
      { label: '通信状态', value: '正常', tone: 'normal' },
      { label: '探测器在线', value: '124/128', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:23:15',
  },
  {
    key: 'water',
    facilityType: '消防水源',
    total: 46,
    online: 44,
    offline: 1,
    fault: 1,
    status: '告警',
    params: [
      { label: '水泵运行', value: '运行', tone: 'normal' },
      { label: '水位', value: '32%', tone: 'warning' },
      { label: '报警阈值', value: '<30%', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:22:40',
  },
  {
    key: 'hydrant',
    facilityType: '室外消火栓系统',
    total: 86,
    online: 85,
    offline: 1,
    fault: 0,
    status: '正常',
    params: [
      { label: '报警状态', value: '正常', tone: 'normal' },
      { label: '水压状态', value: '正常', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:21:05',
  },
  {
    key: 'sprinkler',
    facilityType: '自动喷水灭火系统',
    total: 64,
    online: 62,
    offline: 1,
    fault: 1,
    status: '告警',
    params: [
      { label: '阀门状态', value: '正常', tone: 'normal' },
      { label: '最近动作', value: '2026-08-18 06:12', tone: 'normal' },
      { label: '联动状态', value: '已联动', tone: 'warning' },
    ],
    lastReportTime: '2026-08-20 10:20:12',
  },
  {
    key: 'gas',
    facilityType: '气体灭火系统',
    total: 38,
    online: 37,
    offline: 0,
    fault: 1,
    status: '告警',
    params: [
      { label: '工作模式', value: '自动', tone: 'normal' },
      { label: '阀驱动状态', value: '正常', tone: 'normal' },
      { label: '管网压力', value: '异常', tone: 'danger' },
    ],
    lastReportTime: '2026-08-20 10:19:48',
  },
  {
    key: 'foam',
    facilityType: '泡沫灭火系统',
    total: 22,
    online: 21,
    offline: 1,
    fault: 0,
    status: '正常',
    params: [
      { label: '控制盘状态', value: '自动', tone: 'normal' },
      { label: '电动阀状态', value: '关闭', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:18:30',
  },
  {
    key: 'powder',
    facilityType: '干粉灭火系统',
    total: 16,
    online: 16,
    offline: 0,
    fault: 0,
    status: '正常',
    params: [
      { label: '工作模式', value: '自动', tone: 'normal' },
      { label: '管网压力', value: '正常', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:17:22',
  },
  {
    key: 'smoke',
    facilityType: '防烟排烟系统',
    total: 52,
    online: 50,
    offline: 1,
    fault: 1,
    status: '告警',
    params: [
      { label: '风机运行', value: '故障', tone: 'danger' },
      { label: '排烟阀状态', value: '正常', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:16:58',
  },
  {
    key: 'partition',
    facilityType: '防火分隔设施',
    total: 75,
    online: 74,
    offline: 1,
    fault: 0,
    status: '正常',
    params: [
      { label: '控制器状态', value: '正常', tone: 'normal' },
      { label: '当前位态', value: '常闭', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:15:44',
  },
  {
    key: 'broadcast',
    facilityType: '消防应急广播',
    total: 40,
    online: 39,
    offline: 1,
    fault: 0,
    status: '正常',
    params: [
      { label: '广播状态', value: '停止', tone: 'normal' },
      { label: '分路状态', value: '正常', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:14:20',
  },
  {
    key: 'lighting',
    facilityType: '应急照明及疏散指示系统',
    total: 320,
    online: 318,
    offline: 2,
    fault: 0,
    status: '正常',
    params: [
      { label: '故障状态', value: '正常', tone: 'normal' },
      { label: '应急模式', value: '未触发', tone: 'normal' },
    ],
    lastReportTime: '2026-08-20 10:13:08',
  },
  {
    key: 'power',
    facilityType: '消防电源',
    total: 96,
    online: 93,
    offline: 2,
    fault: 1,
    status: '告警',
    params: [
      { label: '工作状态', value: '欠压', tone: 'warning' },
      { label: '备用电源', value: '正常', tone: 'normal' },
      { label: 'UPS/EPS', value: '异常', tone: 'danger' },
    ],
    lastReportTime: '2026-08-20 10:12:36',
  },
];

export const fireFacilityLedgerItems: FacilityLedgerItem[] = [
  {
    facilityCode: 'XF-001',
    facilityName: '火灾自动报警系统-1#联合装置',
    facilityType: '火灾自动报警系统',
    location: '炼油一部 1#联合装置',
    device: '1#联合装置',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110001',
    enabled: true,
    maintenanceRecords: [
      { date: '2026-08-05', content: '季度维保：控制器巡检、探测器抽测，全部正常。' },
      { date: '2026-05-12', content: '半年检：联动测试、报警点位核对。' },
    ],
  },
  {
    facilityCode: 'XF-002',
    facilityName: '消防水罐-1#',
    facilityType: '消防水源',
    location: '消防泵房',
    device: '消防泵房',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110002',
    enabled: true,
    maintenanceRecords: [{ date: '2026-08-01', content: '月度维保：水位计校验、水泵盘车。' }],
  },
  {
    facilityCode: 'XF-003',
    facilityName: '室外消火栓系统-东厂区',
    facilityType: '室外消火栓系统',
    location: '东厂区主干道',
    device: '东厂区',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110003',
    enabled: true,
    maintenanceRecords: [{ date: '2026-07-28', content: '月度维保：栓体、水压抽查。' }],
  },
  {
    facilityCode: 'XF-004',
    facilityName: '自动喷水灭火系统-储运罐区',
    facilityType: '自动喷水灭火系统',
    location: '储运部罐区',
    device: '储运部',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110004',
    enabled: true,
    maintenanceRecords: [{ date: '2026-07-20', content: '月度维保：报警阀组、末端试水。' }],
  },
  {
    facilityCode: 'XF-005',
    facilityName: '气体灭火系统-中央控制室',
    facilityType: '气体灭火系统',
    location: '中央控制室',
    device: '中央控制室',
    maintainerName: '七氟丙烷维保单位',
    maintainerPhone: '0668-2110005',
    enabled: true,
    maintenanceRecords: [{ date: '2026-07-15', content: '季度维保：钢瓶称重、管网气密性。' }],
  },
  {
    facilityCode: 'XF-006',
    facilityName: '泡沫灭火系统-储罐区',
    facilityType: '泡沫灭火系统',
    location: '储运部罐区',
    device: '储运部',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110006',
    enabled: true,
    maintenanceRecords: [{ date: '2026-07-10', content: '季度维保：泡沫液比例、电动阀动作。' }],
  },
  {
    facilityCode: 'XF-007',
    facilityName: '干粉灭火系统-装卸区',
    facilityType: '干粉灭火系统',
    location: '装卸区',
    device: '装卸区',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110007',
    enabled: true,
    maintenanceRecords: [{ date: '2026-06-30', content: '季度维保：干粉罐压力、驱动装置。' }],
  },
  {
    facilityCode: 'XF-008',
    facilityName: '防烟排烟系统-常减压装置',
    facilityType: '防烟排烟系统',
    location: '常减压装置',
    device: '常减压装置',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110008',
    enabled: true,
    maintenanceRecords: [{ date: '2026-06-22', content: '季度维保：风机、防火阀动作测试。' }],
  },
  {
    facilityCode: 'XF-009',
    facilityName: '防火分隔设施-全厂',
    facilityType: '防火分隔设施',
    location: '各装置区',
    device: '全厂',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110009',
    enabled: true,
    maintenanceRecords: [{ date: '2026-06-15', content: '季度维保：防火门、防火卷帘功能测试。' }],
  },
  {
    facilityCode: 'XF-010',
    facilityName: '消防应急广播-全厂',
    facilityType: '消防应急广播',
    location: '各装置区',
    device: '全厂',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110010',
    enabled: true,
    maintenanceRecords: [{ date: '2026-06-08', content: '月度维保：分区广播试音。' }],
  },
  {
    facilityCode: 'XF-011',
    facilityName: '应急照明及疏散指示系统-全厂',
    facilityType: '应急照明及疏散指示系统',
    location: '各装置区',
    device: '全厂',
    maintainerName: '茂名石化消防维保公司',
    maintainerPhone: '0668-2110011',
    enabled: true,
    maintenanceRecords: [{ date: '2026-06-01', content: '季度维保：应急照明切换测试。' }],
  },
  {
    facilityCode: 'XF-012',
    facilityName: '消防电源-消防泵房',
    facilityType: '消防电源',
    location: '消防泵房/泡沫站',
    device: '消防泵房',
    maintainerName: '电气维保单位',
    maintainerPhone: '0668-2110012',
    enabled: true,
    maintenanceRecords: [{ date: '2026-07-25', content: '月度维保：主备电切换测试、电池巡检。' }],
  },
];

const faultBaseTimeline = (
  faultCode: string,
  discoverTime: string,
  phenomenon: string,
): FaultTimelineItem[] => [
  {
    time: discoverTime,
    operator: '系统',
    action: '发现故障',
    detail: `${faultCode} ${phenomenon}`,
  },
];

export const fireFacilityFaults: FacilityFaultItem[] = [
  {
    id: 1,
    faultCode: 'FLT-20260820-001',
    facilityCode: 'XF-001',
    facilityName: '火灾自动报警系统-1#联合装置',
    facilityType: '火灾自动报警系统',
    faultType: '硬件故障',
    faultLevel: '紧急',
    discoverTime: '2026-08-20 10:23:15',
    discoverMethod: '系统告警',
    phenomenon: '3#装置区感烟探测器报警',
    cause: '',
    status: '待确认',
    timeline: faultBaseTimeline(
      'FLT-20260820-001',
      '2026-08-20 10:23:15',
      '3#装置区感烟探测器报警',
    ),
  },
  {
    id: 2,
    faultCode: 'FLT-20260820-002',
    facilityCode: 'XF-002',
    facilityName: '消防水罐-1#',
    facilityType: '消防水源',
    faultType: '通信故障',
    faultLevel: '重要',
    discoverTime: '2026-08-20 09:56:40',
    discoverMethod: '系统告警',
    phenomenon: '消防水罐水位低于 30% 报警阈值',
    cause: '',
    status: '待确认',
    timeline: faultBaseTimeline(
      'FLT-20260820-002',
      '2026-08-20 09:56:40',
      '消防水罐水位低于 30% 报警阈值',
    ),
  },
  {
    id: 3,
    faultCode: 'FLT-20260819-003',
    facilityCode: 'XF-005',
    facilityName: '气体灭火系统-中央控制室',
    facilityType: '气体灭火系统',
    faultType: '软件故障',
    faultLevel: '重要',
    discoverTime: '2026-08-19 16:42:10',
    discoverMethod: '系统告警',
    phenomenon: '管网压力数据异常',
    cause: '压力变送器漂移',
    status: '已确认',
    workOrderNo: '',
    timeline: [
      ...faultBaseTimeline('FLT-20260819-003', '2026-08-19 16:42:10', '管网压力数据异常'),
      {
        time: '2026-08-19 16:50:22',
        operator: '值班员-高策',
        action: '确认故障',
        detail: '确认为重要故障，待派单',
      },
    ],
  },
  {
    id: 4,
    faultCode: 'FLT-20260819-004',
    facilityCode: 'XF-008',
    facilityName: '防烟排烟系统-常减压装置',
    facilityType: '防烟排烟系统',
    faultType: '硬件故障',
    faultLevel: '紧急',
    discoverTime: '2026-08-19 08:30:05',
    discoverMethod: '系统告警',
    phenomenon: '1#排烟风机故障停机',
    cause: '风机电机过载',
    status: '已派单',
    workOrderNo: 'WO-20260819-001',
    repairPerson: '李维修',
    estimatedFinish: '2026-08-20 18:00:00',
    timeline: [
      ...faultBaseTimeline('FLT-20260819-004', '2026-08-19 08:30:05', '1#排烟风机故障停机'),
      {
        time: '2026-08-19 08:38:00',
        operator: '值班员-高策',
        action: '确认故障',
        detail: '确认为紧急故障',
      },
      {
        time: '2026-08-19 08:42:31',
        operator: '值班员-高策',
        action: '生成工单并派发',
        detail: '派发至 李维修（电气车间）',
      },
    ],
  },
  {
    id: 5,
    faultCode: 'FLT-20260818-005',
    facilityCode: 'XF-010',
    facilityName: '消防应急广播-全厂',
    facilityType: '消防应急广播',
    faultType: '通信故障',
    faultLevel: '一般',
    discoverTime: '2026-08-18 14:12:33',
    discoverMethod: '维保发现',
    phenomenon: '广播分路 2 故障',
    cause: '分路模块通讯中断',
    status: '已派单',
    workOrderNo: 'WO-20260818-002',
    repairPerson: '王维修',
    estimatedFinish: '2026-08-20 12:00:00',
    timeline: [
      ...faultBaseTimeline('FLT-20260818-005', '2026-08-18 14:12:33', '广播分路 2 故障'),
      {
        time: '2026-08-18 14:20:11',
        operator: '值班员-杨恒朋',
        action: '确认故障',
        detail: '确认故障并派单',
      },
      {
        time: '2026-08-18 14:22:46',
        operator: '值班员-杨恒朋',
        action: '生成工单并派发',
        detail: '派发至 王维修',
      },
    ],
  },
  {
    id: 6,
    faultCode: 'FLT-20260818-006',
    facilityCode: 'XF-004',
    facilityName: '自动喷水灭火系统-储运罐区',
    facilityType: '自动喷水灭火系统',
    faultType: '老化',
    faultLevel: '重要',
    discoverTime: '2026-08-18 09:05:20',
    discoverMethod: '人工巡检',
    phenomenon: '报警阀组渗漏',
    cause: '密封圈老化',
    status: '维修中',
    workOrderNo: 'WO-20260818-003',
    repairPerson: '张维修',
    estimatedFinish: '2026-08-21 18:00:00',
    timeline: [
      ...faultBaseTimeline('FLT-20260818-006', '2026-08-18 09:05:20', '报警阀组渗漏'),
      {
        time: '2026-08-18 09:12:44',
        operator: '值班员-高策',
        action: '确认故障',
        detail: '确认为重要故障',
      },
      {
        time: '2026-08-18 09:15:02',
        operator: '值班员-高策',
        action: '生成工单并派发',
        detail: '派发至 张维修',
      },
      {
        time: '2026-08-18 14:30:00',
        operator: '张维修',
        action: '开始维修',
        detail: '现场更换密封圈',
      },
    ],
  },
  {
    id: 7,
    faultCode: 'FLT-20260817-007',
    facilityCode: 'XF-009',
    facilityName: '防火分隔设施-全厂',
    facilityType: '防火分隔设施',
    faultType: '硬件故障',
    faultLevel: '一般',
    discoverTime: '2026-08-17 11:26:48',
    discoverMethod: '系统告警',
    phenomenon: '防火卷帘动作后未复位',
    cause: '限位开关故障',
    status: '维修中',
    workOrderNo: 'WO-20260817-004',
    repairPerson: '赵维修',
    estimatedFinish: '2026-08-20 16:00:00',
    timeline: [
      ...faultBaseTimeline('FLT-20260817-007', '2026-08-17 11:26:48', '防火卷帘动作后未复位'),
      {
        time: '2026-08-17 11:35:20',
        operator: '值班员-杨恒朋',
        action: '确认故障',
        detail: '确认故障',
      },
      {
        time: '2026-08-17 11:40:09',
        operator: '值班员-杨恒朋',
        action: '生成工单并派发',
        detail: '派发至 赵维修',
      },
      {
        time: '2026-08-17 15:10:00',
        operator: '赵维修',
        action: '开始维修',
        detail: '更换限位开关',
      },
    ],
  },
  {
    id: 8,
    faultCode: 'FLT-20260816-008',
    facilityCode: 'XF-012',
    facilityName: '消防电源-消防泵房',
    facilityType: '消防电源',
    faultType: '电源故障',
    faultLevel: '重要',
    discoverTime: '2026-08-16 07:58:12',
    discoverMethod: '系统告警',
    phenomenon: 'UPS/EPS 电池欠压',
    cause: '电池组老化',
    status: '待验收',
    workOrderNo: 'WO-20260816-005',
    repairPerson: '李维修',
    estimatedFinish: '2026-08-18 18:00:00',
    actualFinish: '2026-08-18 16:40:00',
    repairMeasures: '更换 UPS 电池组并完成充放电测试',
    timeline: [
      ...faultBaseTimeline('FLT-20260816-008', '2026-08-16 07:58:12', 'UPS/EPS 电池欠压'),
      {
        time: '2026-08-16 08:05:40',
        operator: '值班员-高策',
        action: '确认故障',
        detail: '确认为重要故障',
      },
      {
        time: '2026-08-16 08:10:22',
        operator: '值班员-高策',
        action: '生成工单并派发',
        detail: '派发至 李维修',
      },
      {
        time: '2026-08-16 10:00:00',
        operator: '李维修',
        action: '开始维修',
        detail: '更换 UPS 电池组',
      },
      {
        time: '2026-08-18 16:40:00',
        operator: '李维修',
        action: '提交验收',
        detail: '更换 UPS 电池组并完成充放电测试',
      },
    ],
  },
  {
    id: 9,
    faultCode: 'FLT-20260816-009',
    facilityCode: 'XF-001',
    facilityName: '火灾自动报警系统-1#联合装置',
    facilityType: '火灾自动报警系统',
    faultType: '硬件故障',
    faultLevel: '一般',
    discoverTime: '2026-08-16 06:22:35',
    discoverMethod: '系统告警',
    phenomenon: '手动报警按钮 5# 线路故障',
    cause: '线路老化',
    status: '待验收',
    workOrderNo: 'WO-20260816-006',
    repairPerson: '王维修',
    estimatedFinish: '2026-08-17 12:00:00',
    actualFinish: '2026-08-17 10:20:00',
    repairMeasures: '更换 5# 按钮线路',
    timeline: [
      ...faultBaseTimeline('FLT-20260816-009', '2026-08-16 06:22:35', '手动报警按钮 5# 线路故障'),
      {
        time: '2026-08-16 06:30:18',
        operator: '值班员-杨恒朋',
        action: '确认故障',
        detail: '确认故障',
      },
      {
        time: '2026-08-16 06:35:02',
        operator: '值班员-杨恒朋',
        action: '生成工单并派发',
        detail: '派发至 王维修',
      },
      { time: '2026-08-16 09:00:00', operator: '王维修', action: '开始维修', detail: '排查线路' },
      {
        time: '2026-08-17 10:20:00',
        operator: '王维修',
        action: '提交验收',
        detail: '更换 5# 按钮线路',
      },
    ],
  },
  {
    id: 10,
    faultCode: 'FLT-20260810-010',
    facilityCode: 'XF-003',
    facilityName: '室外消火栓系统-东厂区',
    facilityType: '室外消火栓系统',
    faultType: '硬件故障',
    faultLevel: '紧急',
    discoverTime: '2026-08-10 09:14:50',
    discoverMethod: '系统告警',
    phenomenon: '室外消火栓水压无压',
    cause: '管网阀门误关闭',
    status: '已闭环',
    workOrderNo: 'WO-20260810-007',
    repairPerson: '张维修',
    estimatedFinish: '2026-08-10 18:00:00',
    actualFinish: '2026-08-10 15:30:00',
    repairMeasures: '开启管网阀门并恢复水压',
    acceptancePerson: '高策',
    acceptanceResult: '合格',
    timeline: [
      ...faultBaseTimeline('FLT-20260810-010', '2026-08-10 09:14:50', '室外消火栓水压无压'),
      {
        time: '2026-08-10 09:20:12',
        operator: '值班员-高策',
        action: '确认故障',
        detail: '确认为紧急故障',
      },
      {
        time: '2026-08-10 09:25:33',
        operator: '值班员-高策',
        action: '生成工单并派发',
        detail: '派发至 张维修',
      },
      {
        time: '2026-08-10 10:00:00',
        operator: '张维修',
        action: '开始维修',
        detail: '现场排查管网',
      },
      {
        time: '2026-08-10 15:30:00',
        operator: '张维修',
        action: '提交验收',
        detail: '开启管网阀门并恢复水压',
      },
      { time: '2026-08-10 16:10:22', operator: '高策', action: '验收合格', detail: '水压恢复正常' },
    ],
  },
  {
    id: 11,
    faultCode: 'FLT-20260808-011',
    facilityCode: 'XF-011',
    facilityName: '应急照明及疏散指示系统-全厂',
    facilityType: '应急照明及疏散指示系统',
    faultType: '硬件故障',
    faultLevel: '一般',
    discoverTime: '2026-08-08 15:42:10',
    discoverMethod: '人工巡检',
    phenomenon: '疏散指示标志故障',
    cause: '灯珠损坏',
    status: '已闭环',
    workOrderNo: 'WO-20260808-008',
    repairPerson: '王维修',
    estimatedFinish: '2026-08-09 12:00:00',
    actualFinish: '2026-08-09 10:00:00',
    repairMeasures: '更换疏散指示标志',
    acceptancePerson: '杨恒朋',
    acceptanceResult: '合格',
    timeline: [
      ...faultBaseTimeline('FLT-20260808-011', '2026-08-08 15:42:10', '疏散指示标志故障'),
      {
        time: '2026-08-08 15:50:00',
        operator: '值班员-杨恒朋',
        action: '确认故障',
        detail: '确认故障',
      },
      {
        time: '2026-08-08 15:55:22',
        operator: '值班员-杨恒朋',
        action: '生成工单并派发',
        detail: '派发至 王维修',
      },
      { time: '2026-08-09 08:30:00', operator: '王维修', action: '开始维修', detail: '更换指示灯' },
      {
        time: '2026-08-09 10:00:00',
        operator: '王维修',
        action: '提交验收',
        detail: '更换疏散指示标志',
      },
      {
        time: '2026-08-09 10:30:45',
        operator: '杨恒朋',
        action: '验收合格',
        detail: '指示灯恢复正常',
      },
    ],
  },
  {
    id: 12,
    faultCode: 'FLT-20260805-012',
    facilityCode: 'XF-006',
    facilityName: '泡沫灭火系统-储罐区',
    facilityType: '泡沫灭火系统',
    faultType: '软件故障',
    faultLevel: '重要',
    discoverTime: '2026-08-05 11:20:15',
    discoverMethod: '系统告警',
    phenomenon: '泡沫电动阀动作反馈异常',
    cause: '控制盘程序版本问题',
    status: '已闭环',
    workOrderNo: 'WO-20260805-009',
    repairPerson: '赵维修',
    estimatedFinish: '2026-08-06 18:00:00',
    actualFinish: '2026-08-06 16:20:00',
    repairMeasures: '升级控制盘程序并复位',
    acceptancePerson: '高策',
    acceptanceResult: '合格',
    timeline: [
      ...faultBaseTimeline('FLT-20260805-012', '2026-08-05 11:20:15', '泡沫电动阀动作反馈异常'),
      {
        time: '2026-08-05 11:28:40',
        operator: '值班员-高策',
        action: '确认故障',
        detail: '确认为重要故障',
      },
      {
        time: '2026-08-05 11:32:11',
        operator: '值班员-高策',
        action: '生成工单并派发',
        detail: '派发至 赵维修',
      },
      {
        time: '2026-08-05 14:00:00',
        operator: '赵维修',
        action: '开始维修',
        detail: '升级控制盘程序',
      },
      {
        time: '2026-08-06 16:20:00',
        operator: '赵维修',
        action: '提交验收',
        detail: '升级控制盘程序并复位',
      },
      {
        time: '2026-08-06 17:05:30',
        operator: '高策',
        action: '验收合格',
        detail: '动作反馈恢复正常',
      },
    ],
  },
  {
    id: 13,
    faultCode: 'FLT-20260819-010',
    facilityCode: 'XF-009',
    facilityName: '防火分隔设施-全厂',
    facilityType: '防火分隔设施',
    faultType: '人为损坏',
    faultLevel: '一般',
    discoverTime: '2026-08-19 09:40:00',
    discoverMethod: '人工巡检',
    phenomenon: '常闭防火门未处于正常关闭状态',
    cause: '门体被挡块撑开',
    status: '已派单',
    workOrderNo: 'WO-20260819-010',
    repairPerson: '王维修',
    estimatedFinish: '2026-08-21 12:00:00',
    timeline: [
      ...faultBaseTimeline(
        'FLT-20260819-010',
        '2026-08-19 09:40:00',
        '常闭防火门未处于正常关闭状态',
      ),
      {
        time: '2026-08-19 09:45:20',
        operator: '值班员-杨恒朋',
        action: '确认故障',
        detail: '确认故障并派单',
      },
      {
        time: '2026-08-19 09:48:12',
        operator: '值班员-杨恒朋',
        action: '生成工单并派发',
        detail: '派发至 王维修',
      },
    ],
  },
];

export const fireFacilityAlarms: FacilityAlarmItem[] = fireFacilityFaults.map((fault) => ({
  id: `AL-${fault.faultCode.replace('FLT-', '').replace(/-/g, '')}`,
  source: fault.facilityType,
  facilityType: fault.facilityType,
  level: fault.faultLevel,
  category: fault.faultType === '硬件故障' || fault.faultType === '通信故障' ? '故障' : '动作',
  content: fault.phenomenon,
  time: fault.discoverTime,
  status: fault.status,
  faultCode: fault.faultCode,
}));

function buildWorkOrder(fault: FacilityFaultItem, index: number): FacilityWorkOrderItem | null {
  if (!fault.workOrderNo) return null;
  const statusMap: Record<FaultStatus, WorkOrderStatus> = {
    待确认: '已派发',
    已确认: '已派发',
    已派单: '已派发',
    维修中: '执行中',
    待验收: '待验收',
    已闭环: '已完成',
  };
  return {
    id: index,
    workOrderNo: fault.workOrderNo,
    faultCode: fault.faultCode,
    facilityCode: fault.facilityCode,
    facilityName: fault.facilityName,
    facilityType: fault.facilityType,
    faultLevel: fault.faultLevel,
    description: fault.phenomenon,
    status: statusMap[fault.status],
    dispatchTime: fault.timeline.find((t) => t.action.includes('派发'))?.time ?? fault.discoverTime,
    repairPerson: fault.repairPerson ?? '',
    estimatedFinish: fault.estimatedFinish ?? '',
    actualFinish: fault.actualFinish,
    timeline: fault.timeline,
  };
}

export const fireFacilityWorkOrders: FacilityWorkOrderItem[] = fireFacilityFaults
  .map(buildWorkOrder)
  .filter((item): item is FacilityWorkOrderItem => item !== null);

export function resolveFacilityLedgerByType(facilityType: string): FacilityLedgerItem {
  return (
    fireFacilityLedgerItems.find((item) => item.facilityType === facilityType) ??
    fireFacilityLedgerItems[0]!
  );
}
