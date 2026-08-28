// 消息中心数据服务（设计稿 §5.3.5.5 列表与消息栏 / 消息中心原型）
// 当前返回脚手架演示数据；后端契约（消息流接口）到位后替换 fetchMessages 实现即可。

export type MessageCategory = 'alarm' | 'event' | 'task' | 'system';

export interface MessageTarget {
  type: 'alarm' | 'event' | 'task';
  id: string;
}

export interface MessageItem {
  id: string;
  category: MessageCategory;
  title: string;
  summary: string;
  time: string;
  read: boolean;
  target?: MessageTarget;
}

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  alarm: '报警通知',
  event: '事件通知',
  task: '任务通知',
  system: '系统通知',
};

export const MESSAGE_CATEGORIES: MessageCategory[] = ['alarm', 'event', 'task', 'system'];

const MOCK_MESSAGES: MessageItem[] = [
  {
    id: 'm1',
    category: 'alarm',
    title: 'B3 区烟感探测器触发报警',
    summary: '请立即核实处置',
    time: '09:12',
    read: false,
    target: { type: 'alarm', id: 'm1' },
  },
  {
    id: 'm2',
    category: 'system',
    title: '平台例行版本升级通知',
    summary: '今日 23:00-23:30 进行升级',
    time: '08:50',
    read: false,
  },
  {
    id: 'm3',
    category: 'task',
    title: 'A2 区火情处置任务',
    summary: '处置已完成，待确认归档',
    time: '08:31',
    read: true,
    target: { type: 'task', id: 'm3' },
  },
  {
    id: 'm4',
    category: 'alarm',
    title: 'C1 区电气柜温度超阈值',
    summary: '当前 72℃，请关注',
    time: '08:20',
    read: false,
    target: { type: 'alarm', id: 'm4' },
  },
  {
    id: 'm5',
    category: 'system',
    title: '防爆移动端在线巡检完成',
    summary: '12 台设备已完成巡检',
    time: '08:05',
    read: true,
  },
  {
    id: 'm6',
    category: 'system',
    title: '全员应急演练公告',
    summary: '今日 16:00 开展演练',
    time: '07:48',
    read: true,
  },
  {
    id: 'm7',
    category: 'event',
    title: 'D2 区气体泄漏预警',
    summary: '浓度超阈值，建议撤离',
    time: '07:30',
    read: false,
    target: { type: 'event', id: 'm7' },
  },
];

export function fetchMessages(): Promise<MessageItem[]> {
  return Promise.resolve(MOCK_MESSAGES.map((m) => ({ ...m })));
}
