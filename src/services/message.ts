// 底部消息栏数据服务（设计稿 §5.3.5.5 列表与消息栏）
// 当前返回脚手架演示数据；后端契约（消息流接口）到位后替换 fetchMessages 实现即可。

export type MessageLevel = 'system' | 'alarm' | 'disposition';

export interface MessageItem {
  id: string;
  level: MessageLevel;
  text: string;
  time?: string;
}

const MOCK_MESSAGES: MessageItem[] = [
  { id: 'm1', level: 'alarm', text: 'B3 区烟感探测器触发报警，请立即核实处置', time: '09:12' },
  { id: 'm2', level: 'system', text: '平台将于今日 23:00-23:30 进行例行版本升级', time: '08:50' },
  { id: 'm3', level: 'disposition', text: 'A2 区火情已处置完毕，设备状态恢复正常', time: '08:31' },
  { id: 'm4', level: 'alarm', text: 'C1 区电气柜温度超过阈值（72℃），请关注', time: '08:20' },
  { id: 'm5', level: 'system', text: '防爆移动端 12 台设备已完成在线巡检', time: '08:05' },
  { id: 'm6', level: 'disposition', text: 'D4 区门禁异常已远程复位，记录已归档', time: '07:48' },
];

export function fetchMessages(): Promise<MessageItem[]> {
  return Promise.resolve(MOCK_MESSAGES.slice());
}

export function levelLabel(level: MessageLevel): string {
  switch (level) {
    case 'alarm':
      return '报警';
    case 'disposition':
      return '处置';
    case 'system':
    default:
      return '系统';
  }
}
