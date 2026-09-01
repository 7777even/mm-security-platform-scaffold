import { stagePercentStringToWorldPosition } from '@/utils/mapDesignGeo';

export interface EmergencyEventItem {
  id: number;
  /** 所属厂区，供大屏默认炼油区筛选使用 */
  areaCode?: 'refinery' | 'chemical' | 'port';
  title: string;
  location: string;
  description: string;
  time: string;
  reported: boolean;
  status: 'processing' | 'pending' | 'done';
  statusLabel: string;
  left: string;
  top: string;
  longitude: number;
  latitude: number;
  /** 应急事件 / 应急演练（应急指挥板块地图标记区分） */
  kind?: 'event' | 'drill';
  /** 事件业务分类：默认走事故详情，极端天气走专用详情页 */
  eventCategory?: 'default' | 'extremeWeather';
  /** 手动新增极端天气事件的专属业务字段 */
  weatherMeta?: {
    weatherType: string;
    warningLevel: string;
    affectedArea: string;
    monitoringPeriod: string;
    source: string;
    measures: string;
  };
  /** 重大危险源等级，如一级、二级 */
  hazardSourceLevel?: string;
  /** 已结束事件的结束时间 */
  endedAt?: string;
}

export interface EmergencyEventGroup {
  id: string;
  label: string;
  events: EmergencyEventItem[];
}

export interface RescueForceStat {
  label: string;
  value: number;
  iconIndex: number;
}

export interface KnowledgeItem {
  id: number;
  line1: string;
  line2: string;
  count: number;
  countTone: 'lime' | 'cyan';
  iconIndex: number;
}

export interface DutyWatchPerson {
  id: number;
  name: string;
  role: string;
  phone: string;
  avatarIndex: number;
}

function eventWithPosition(
  partial: Omit<EmergencyEventItem, 'longitude' | 'latitude'>,
): EmergencyEventItem {
  const world = stagePercentStringToWorldPosition(partial.left, partial.top);
  return {
    ...partial,
    longitude: world.longitude,
    latitude: world.latitude,
  };
}

export const emergencyEventGroups: EmergencyEventGroup[] = [
  {
    id: 'device',
    label: '装置异常报警',
    events: [
      eventWithPosition({
        id: 1,
        title: '乙烯装置火灾',
        location: '东厂区-A装置东北角',
        description: 'A装置操作员-张三接听异常报警',
        time: '2026-03-17 14:21:54',
        reported: true,
        status: 'processing',
        statusLabel: '压力报警',
        left: '47.1%',
        top: '22.6%',
      }),
      eventWithPosition({
        id: 2,
        title: 'B装置温度超限',
        location: '东厂区-B装置南侧',
        description: '反应器出口温度超过联锁阈值',
        time: '2026-03-17 13:58:12',
        reported: true,
        status: 'pending',
        statusLabel: '温度报警',
        left: '54.2%',
        top: '25.3%',
      }),
      eventWithPosition({
        id: 3,
        title: 'C装置泄漏预警',
        location: '东厂区-C装置西北角',
        description: '可燃气体检测浓度异常升高',
        time: '2026-03-17 13:12:08',
        reported: false,
        status: 'processing',
        statusLabel: '泄漏报警',
        left: '33.8%',
        top: '28.1%',
      }),
    ],
  },
  {
    id: 'tank',
    label: '储罐压力报警',
    events: [
      eventWithPosition({
        id: 4,
        title: '储罐区B-3压力异常',
        location: '储罐区B-3',
        description: '储罐顶部压力表读数持续偏高',
        time: '2026-03-17 12:45:33',
        reported: true,
        status: 'processing',
        statusLabel: '压力报警',
        left: '44.9%',
        top: '31.6%',
      }),
      eventWithPosition({
        id: 5,
        title: '储罐区A-2液位波动',
        location: '储罐区A-2',
        description: '液位计短时大幅波动需复核',
        time: '2026-03-17 11:30:21',
        reported: true,
        status: 'pending',
        statusLabel: '液位报警',
        left: '36.0%',
        top: '33.5%',
      }),
    ],
  },
  {
    id: 'patrol',
    label: '日常巡检发现',
    events: [
      eventWithPosition({
        id: 6,
        title: '催化区异味上报',
        location: '催化裂化装置区',
        description: '巡检员上报装置区存在轻微异味',
        time: '2026-03-17 10:55:47',
        reported: true,
        status: 'done',
        statusLabel: '已处置',
        left: '46.5%',
        top: '46.4%',
      }),
      eventWithPosition({
        id: 7,
        title: '泵房振动异常',
        location: '原料泵房-2#',
        description: '机泵振动值超过日常巡检标准',
        time: '2026-03-17 09:18:06',
        reported: false,
        status: 'pending',
        statusLabel: '设备异常',
        left: '52.3%',
        top: '42.8%',
      }),
    ],
  },
  {
    id: 'video',
    label: '视频联动报警',
    events: [
      eventWithPosition({
        id: 8,
        title: '厂界人员闯入',
        location: '厂区南门西侧',
        description: '视频监控识别非授权人员进入限制区域',
        time: '2026-03-17 08:42:19',
        reported: true,
        status: 'processing',
        statusLabel: '区域入侵',
        left: '41.2%',
        top: '52.6%',
      }),
      eventWithPosition({
        id: 9,
        title: '装卸区烟火检测',
        location: '液体装卸站台',
        description: 'AI视频分析识别疑似烟火特征',
        time: '2026-03-17 07:26:55',
        reported: true,
        status: 'processing',
        statusLabel: '烟火检测',
        left: '58.6%',
        top: '48.2%',
      }),
    ],
  },
];

export const emergencyEvents: EmergencyEventItem[] = emergencyEventGroups.flatMap(
  (group) => group.events,
);

export const dutyWatchPersons: DutyWatchPerson[] = [
  { id: 1, name: '杨恒明', role: '值班领导', phone: '13792536966', avatarIndex: 0 },
  { id: 2, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 1 },
  { id: 3, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 2 },
  { id: 4, name: '高颖', role: '值班员', phone: '18300556145', avatarIndex: 3 },
];

export const rescueForceStats: RescueForceStat[] = [
  { label: '应急专家', value: 47, iconIndex: 0 },
  { label: '应急物资', value: 3510, iconIndex: 1 },
  { label: '救援队伍', value: 10, iconIndex: 2 },
  { label: '装备车辆', value: 55, iconIndex: 3 },
  { label: '应急场所', value: 62, iconIndex: 4 },
  { label: '医疗机构', value: 80, iconIndex: 5 },
  { label: '应急车辆', value: 33, iconIndex: 6 },
  { label: '消防设施', value: 11, iconIndex: 7 },
];

export const safetyKnowledgeItems: KnowledgeItem[] = [
  { id: 1, line1: '岗位应急', line2: '处置卡', count: 158, countTone: 'lime', iconIndex: 0 },
  { id: 2, line1: '危险化学品', line2: '知识库', count: 158, countTone: 'cyan', iconIndex: 1 },
  { id: 3, line1: '生产区域', line2: '疏散路线图', count: 158, countTone: 'cyan', iconIndex: 2 },
];

export const preliminaryZoneOverlays = [
  { left: '27.9%', top: '31.6%', width: '17.5%', height: '19.1%' },
  { left: '44.9%', top: '28.7%', width: '25.6%', height: '17.7%' },
  { left: '36.0%', top: '45.6%', width: '24.2%', height: '20.6%' },
];

export const preliminaryMapControls = [
  { key: 'layers', label: '图层' },
  { key: 'areas', label: '区域' },
  { key: 'search', label: '搜索' },
  { key: '3d', label: '三维视角' },
  { key: 'heatmap', label: '热力模式' },
  { key: 'labels', label: '标签默认' },
  { key: 'toggle', label: '地图控件切换' },
];
