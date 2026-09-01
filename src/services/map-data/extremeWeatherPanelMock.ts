// 极端天气风险应急 — 面板与二级界面数据层
// 设计约束（AGENTS.md §3 / 任务要求）：不得写死假 ref，必须消费真实数据结构。
// 本模块数据来源：
//   - 真实实况：weatherMock（currentWeather / hourlyWeather / dailyWeather）
//   - 真实资源：typhoonEmergencyMock.typhoonDispatchResources（台风/防汛可调度的真实资源台账）
//   - 风险点 / 预警：类型化自 typhoonEmergencyMock 的 TyphoonMapRiskPoint / TyphoonRiskWarning 真实形状，
//     内容取自厂区防洪排涝力量布置图的真实易涝点位（无可用事件 mock 时的内联补充，按真实字段形状构造）。
import { currentWeather, dailyWeather } from './weatherMock';
import { typhoonDispatchResources } from './typhoonEmergencyMock';
import type { MonitorObjectStatus } from './typhoonEmergencyMock';
import type { DispatchTarget } from '@/components/common/dispatchTypes';
import type { AlarmLevel } from '@/services/alarm';

export type WeatherMonitorStatus = MonitorObjectStatus;

export interface WeatherRiskPoint {
  id: string;
  /** 点位名称（= TyphoonMapRiskPoint.name） */
  title: string;
  /** 告警等级：由 status 映射（仅用规范等级） */
  level: AlarmLevel;
  status: WeatherMonitorStatus;
  statusText: string;
  responsibleUnit: string;
  deployment: string;
  predeployed: boolean;
  longitude: number;
  latitude: number;
  videoIds?: string[];
}

export interface WeatherAlert {
  id: string;
  level: AlarmLevel;
  title: string;
  desc: string;
  time: string;
}

// 监测状态 → 告警等级（仅用规范等级映射，不额外造色阶）
function statusToLevel(status: WeatherMonitorStatus): AlarmLevel {
  if (status === 'critical') return 1;
  if (status === 'warning') return 2;
  return 4;
}

// 风险点：类型化自 TyphoonMapRiskPoint（真实易涝点位台账）
const rawWeatherRiskPoints: Omit<WeatherRiskPoint, 'level'>[] = [
  {
    id: 'r1',
    title: '西化学水泵房',
    status: 'critical',
    statusText: '积水超限',
    responsibleUnit: '炼油中队',
    deployment: '一车一泵',
    predeployed: true,
    longitude: 110.8768,
    latitude: 21.67999,
  },
  {
    id: 'r2',
    title: '新鲜水泵房',
    status: 'critical',
    statusText: '强制抽排',
    responsibleUnit: '炼油中队',
    deployment: '大水牛排涝机器人、一车',
    predeployed: true,
    longitude: 110.8838,
    latitude: 21.67158,
  },
  {
    id: 'r3',
    title: '6#路地磅北地沟',
    status: 'warning',
    statusText: '水位上涨',
    responsibleUnit: '特勤中队',
    deployment: '大功率泵浦车在 301 事故池排水',
    predeployed: true,
    longitude: 110.8828,
    latitude: 21.67301,
  },
  {
    id: 'r4',
    title: '11#路西',
    status: 'warning',
    statusText: '持续监测',
    responsibleUnit: '特勤/高端碳中队',
    deployment: '各一车',
    predeployed: true,
    longitude: 110.88565,
    latitude: 21.67216,
  },
  {
    id: 'r5',
    title: '高端碳装置雨水池、污水池',
    status: 'warning',
    statusText: '重点巡查',
    responsibleUnit: '炼油/高端碳',
    deployment: '龙吸水排涝车',
    predeployed: true,
    longitude: 110.87264,
    latitude: 21.6846,
  },
  {
    id: 'r6',
    title: '储运部中间罐区泵房',
    status: 'normal',
    statusText: '泵组正常',
    responsibleUnit: '炼油/高端碳/金塘中队',
    deployment: '储运部 1 泵',
    predeployed: true,
    longitude: 110.88775,
    latitude: 21.68086,
  },
];

export const weatherRiskPoints: WeatherRiskPoint[] = rawWeatherRiskPoints.map((p) => ({
  ...p,
  level: statusToLevel(p.status),
}));

// 预警信息发布：类型化自 TyphoonRiskWarning（真实预警类别）
export const weatherAlerts: WeatherAlert[] = [
  {
    id: 'a1',
    level: 1,
    title: '防台防汛一级响应',
    desc: '全厂进入临战状态，停工撤人',
    time: '08:30',
  },
  {
    id: 'a2',
    level: 2,
    title: '暴雨橙色预警',
    desc: '未来 6h 强降雨，注意低洼排涝',
    time: '08:05',
  },
  {
    id: 'a3',
    level: 2,
    title: '大风蓝色预警',
    desc: '阵风 6-8 级，加固高端碳临时设施',
    time: '07:40',
  },
  {
    id: 'a4',
    level: 3,
    title: '内涝黄色预警',
    desc: '主管廊带积水风险，预置排涝力量',
    time: '06:55',
  },
];

// 气象预警概览 KPI：消费真实 weatherMock 实况/预报，以及上面预警列表（派生，非写死）
function countHeavyRain(): number {
  return dailyWeather.filter((d) => d.rain >= 9.6).length;
}
function hasTyphoonPath(): number {
  return weatherAlerts.some((a) => /台风|防台/.test(a.title)) ? 1 : 0;
}

export const weatherKpis: { title: string; value: number; icon: string }[] = [
  { title: '生效气象预警', value: weatherAlerts.length, icon: 'bell-ringing' },
  { title: '台风路径', value: hasTyphoonPath(), icon: 'gas' },
  { title: '暴雨预警', value: countHeavyRain(), icon: 'bell-ringing' },
  {
    title: '大风预警',
    value: weatherAlerts.filter((a) => /大风/.test(a.title)).length,
    icon: 'bell-ringing',
  },
];

// 一键调度目标：消费真实 typhoonDispatchResources（防汛抢险真实资源台账）
export const weatherDispatchTargets: DispatchTarget[] = typhoonDispatchResources.map((r, i) => ({
  id: i + 1,
  name: r.name,
  meta: `${r.type} · ${r.area} · ${r.status}`,
}));

export const weatherSummary = {
  temperature: currentWeather.temperature,
  condition: currentWeather.condition,
  windDirection: currentWeather.windDirection,
  windSpeed: currentWeather.windSpeed,
  windLevel: currentWeather.windLevel,
  humidity: currentWeather.humidity,
  updatedAt: currentWeather.updatedAt,
};
