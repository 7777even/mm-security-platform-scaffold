import type {
  DutyWatchPerson,
  EmergencyEventGroup,
  EmergencyEventItem,
  KnowledgeItem,
  RescueForceStat,
} from './preliminaryMock';
import { stagePercentStringToWorldPosition } from '../../utils/mapDesignGeo';

export type { EmergencyEventItem, EmergencyEventGroup };

function eventWithPosition(
  partial: Omit<EmergencyEventItem, 'longitude' | 'latitude'>,
): EmergencyEventItem {
  const world = stagePercentStringToWorldPosition(partial.left, partial.top);
  const hazardLevels = ['一级', '二级', '三级', '四级'];
  return {
    kind: 'event',
    hazardSourceLevel: partial.hazardSourceLevel ?? hazardLevels[partial.id % hazardLevels.length],
    ...partial,
    longitude: world.longitude,
    latitude: world.latitude,
  };
}

function drillWithPosition(
  partial: Omit<EmergencyEventItem, 'longitude' | 'latitude' | 'kind'>,
): EmergencyEventItem {
  const world = stagePercentStringToWorldPosition(partial.left, partial.top);
  return {
    kind: 'drill',
    ...partial,
    longitude: world.longitude,
    latitude: world.latitude,
  };
}

function weatherEventWithPosition(
  partial: Omit<EmergencyEventItem, 'longitude' | 'latitude' | 'kind' | 'eventCategory'>,
): EmergencyEventItem {
  const world = stagePercentStringToWorldPosition(partial.left, partial.top);
  return {
    kind: 'event',
    eventCategory: 'extremeWeather',
    ...partial,
    longitude: world.longitude,
    latitude: world.latitude,
  };
}

export const fireEmergencyEventGroups: EmergencyEventGroup[] = [
  {
    id: 'phone',
    label: '消防电话报警',
    events: [
      eventWithPosition({
        id: 1,
        areaCode: 'chemical',
        title: '乙烯裂解炉炉管泄漏着火',
        location: '化工区乙烯裂解装置东北侧',
        description: '现场报告裂解炉炉管疑似泄漏并伴有明火，已启动装置紧急停车',
        time: '2026-03-17 14:21:54',
        reported: true,
        status: 'processing',
        statusLabel: '泄漏着火',
        left: '47.1%',
        top: '22.6%',
      }),
      eventWithPosition({
        id: 2,
        areaCode: 'port',
        title: '液体化工码头装卸臂泄漏着火',
        location: '港区液体化工码头2号泊位',
        description: '装卸臂连接法兰发生介质泄漏并出现明火，现场已停止装卸作业',
        time: '2026-03-17 13:58:12',
        reported: true,
        status: 'pending',
        statusLabel: '泄漏着火',
        left: '54.2%',
        top: '25.3%',
      }),
      eventWithPosition({
        id: 3,
        areaCode: 'refinery',
        title: '芳烃联合装置泵区物料泄漏',
        location: '炼油区芳烃联合装置泵区',
        description: '巡检人员发现机泵密封处物料持续泄漏并触发现场手动报警',
        time: '2026-03-17 13:12:08',
        reported: false,
        status: 'processing',
        statusLabel: '物料泄漏',
        left: '33.8%',
        top: '28.1%',
      }),
    ],
  },
  {
    id: 'tank',
    label: '储罐消防报警',
    events: [
      eventWithPosition({
        id: 4,
        areaCode: 'chemical',
        title: '乙烯球罐区储罐呼吸阀异常超压',
        location: '化工区乙烯球罐组B-3',
        description: '储罐压力持续升高，初步判断呼吸阀堵塞，已完成泄压处置',
        time: '2026-03-17 12:45:33',
        reported: true,
        status: 'done',
        statusLabel: '已处置',
        endedAt: '2026-03-17 14:10:22',
        left: '48.5%',
        top: '29.6%',
      }),
      eventWithPosition({
        id: 5,
        areaCode: 'port',
        title: '成品油罐区泡沫灭火系统失效',
        location: '港区成品油罐组A-2',
        description: '泡沫比例混合装置通讯及联动测试失败，罐组消防保护能力受限',
        time: '2026-03-17 11:30:21',
        reported: true,
        status: 'pending',
        statusLabel: '消防系统失效',
        left: '36.0%',
        top: '33.5%',
      }),
    ],
  },
  {
    id: 'facility',
    label: '消防设施异常',
    events: [
      eventWithPosition({
        id: 6,
        areaCode: 'refinery',
        title: '稳高压消防水管网压力骤降',
        location: '炼油区1号消防泵站',
        description: '消防水管网压力短时跌破运行下限，已启动备用消防泵恢复供水',
        time: '2026-03-17 10:55:47',
        reported: true,
        status: 'done',
        statusLabel: '已处置',
        endedAt: '2026-03-17 12:05:18',
        left: '46.5%',
        top: '46.4%',
      }),
      eventWithPosition({
        id: 7,
        areaCode: 'chemical',
        title: '化工原料罐区消防栓无法启用',
        location: '化工区原料罐组西侧',
        description: '现场检查发现消防栓阀门卡涩，无法正常开启，正在组织抢修',
        time: '2026-03-17 09:18:06',
        reported: false,
        status: 'pending',
        statusLabel: '消防设施故障',
        left: '52.3%',
        top: '42.8%',
      }),
    ],
  },
  {
    id: 'video',
    label: '视频烟火联动',
    events: [
      eventWithPosition({
        id: 8,
        areaCode: 'port',
        title: '港区输油管廊疑似火情',
        location: '港区码头输油管廊北段',
        description: '视频智能分析识别输油管廊出现异常烟火特征，已通知码头岗位人员核查',
        time: '2026-03-17 08:42:19',
        reported: true,
        status: 'processing',
        statusLabel: '疑似火情',
        left: '41.2%',
        top: '52.6%',
      }),
      eventWithPosition({
        id: 9,
        areaCode: 'refinery',
        title: '汽柴油装车栈台鹤管泄漏升温',
        location: '炼油区汽柴油装车栈台',
        description: '红外热成像发现装车鹤管法兰局部温度异常，疑似介质泄漏引发升温',
        time: '2026-03-17 07:26:55',
        reported: true,
        status: 'processing',
        statusLabel: '泄漏升温',
        left: '58.6%',
        top: '48.2%',
      }),
    ],
  },
  {
    id: 'extreme-weather',
    label: '极端天气',
    events: [
      weatherEventWithPosition({
        id: 100,
        areaCode: 'refinery',
        title: '台风沙迦防台防汛工作',
        location: '全厂范围',
        description: '台风"沙迦"逼近，启动防台防汛Ⅱ级响应，重点监测内涝与排涝设施',
        time: '2026-06-25 08:12:00',
        reported: true,
        status: 'processing',
        statusLabel: '防台防汛',
        left: '42.0%',
        top: '38.5%',
      }),
    ],
  },
];

export const fireEmergencyDrillEventGroups: EmergencyEventGroup[] = [
  {
    id: 'drill-plan',
    label: '计划演练',
    events: [
      drillWithPosition({
        id: 101,
        areaCode: 'refinery',
        title: '储罐区消防演练',
        location: '储罐区B-1',
        description: '储罐火灾应急处置联合演练',
        time: '2026-03-16 10:00:00',
        reported: true,
        status: 'processing',
        statusLabel: '演练进行中',
        left: '44.0%',
        top: '35.2%',
      }),
      drillWithPosition({
        id: 102,
        areaCode: 'chemical',
        title: '装置区疏散演练',
        location: '东厂区-A装置',
        description: '装置区人员紧急疏散演练',
        time: '2026-03-15 14:30:00',
        reported: true,
        status: 'done',
        statusLabel: '演练结束',
        endedAt: '2026-03-15 16:00:00',
        left: '50.5%',
        top: '27.8%',
      }),
    ],
  },
  {
    id: 'drill-special',
    label: '专项演练',
    events: [
      drillWithPosition({
        id: 103,
        areaCode: 'port',
        title: '危化品泄漏演练',
        location: '装卸区东侧',
        description: '危险化学品泄漏应急处置演练',
        time: '2026-03-14 09:00:00',
        reported: false,
        status: 'pending',
        statusLabel: '待演练',
        left: '55.8%',
        top: '44.5%',
      }),
      drillWithPosition({
        id: 104,
        areaCode: 'refinery',
        title: '夜间消防联动演练',
        location: '消防泵房北侧',
        description: '夜间消防力量联动响应演练',
        time: '2026-03-13 20:00:00',
        reported: true,
        status: 'processing',
        statusLabel: '演练进行中',
        left: '38.5%',
        top: '40.0%',
      }),
    ],
  },
];

export const fireEmergencyAllEventGroups: EmergencyEventGroup[] = [
  ...fireEmergencyEventGroups,
  ...fireEmergencyDrillEventGroups,
];

/** 初始数据快照（页面重置时恢复） */
export const initialFireEmergencyEventGroups = fireEmergencyEventGroups;
export const initialFireEmergencyDrillEventGroups = fireEmergencyDrillEventGroups;

export const fireEmergencyEvents: EmergencyEventItem[] = fireEmergencyEventGroups.flatMap(
  (group) => group.events,
);

export const fireDutyWatchPersons: DutyWatchPerson[] = [
  { id: 1, name: '杨恒明', role: '值班领导', phone: '13792536966', avatarIndex: 0 },
  { id: 2, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 1 },
  { id: 3, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 2 },
  { id: 4, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 3 },
];

export const fireRescueForceStats: RescueForceStat[] = [
  { label: '应急专家', value: 47, iconIndex: 0 },
  { label: '应急物资', value: 3510, iconIndex: 1 },
  { label: '救援队伍', value: 10, iconIndex: 2 },
  { label: '装备车辆', value: 55, iconIndex: 3 },
  { label: '应急场所', value: 52, iconIndex: 4 },
  { label: '医疗机构', value: 80, iconIndex: 5 },
  { label: '应急车辆', value: 33, iconIndex: 6 },
  { label: '消防设施', value: 11, iconIndex: 7 },
];

export const fireSafetyKnowledgeItems: KnowledgeItem[] = [
  { id: 1, line1: '岗位应急', line2: '处置卡', count: 158, countTone: 'lime', iconIndex: 0 },
  { id: 2, line1: '危险化学品', line2: '知识库', count: 158, countTone: 'cyan', iconIndex: 1 },
  { id: 3, line1: '生产区域', line2: '疏散路线图', count: 158, countTone: 'cyan', iconIndex: 2 },
];

export const fireEmergencyZoneOverlays = [
  { left: '27.9%', top: '31.6%', width: '17.5%', height: '19.1%' },
  { left: '44.9%', top: '28.7%', width: '25.6%', height: '17.7%' },
  { left: '36.0%', top: '45.6%', width: '24.2%', height: '20.6%' },
];

export const fireEmergencyMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
