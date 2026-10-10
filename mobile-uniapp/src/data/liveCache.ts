// 本地缓存（列表页拉取后写入，详情页按 id 读取；后端暂无按 id 详情端点）。
import type { AlarmItem, EmergencyEventItem } from '@/platform/api';

class AlarmCache {
  items: AlarmItem[] = [];
  set(list: AlarmItem[]): void {
    this.items = list;
  }
  get(id: string): AlarmItem | undefined {
    return this.items.find((a) => a.alarmId === id);
  }
}

class EventCache {
  items: EmergencyEventItem[] = [];
  set(list: EmergencyEventItem[]): void {
    this.items = list;
  }
  get(id: string): EmergencyEventItem | undefined {
    return this.items.find((e) => String(e.id) === String(id));
  }
}

export const liveAlarms = new AlarmCache();
export const liveEvents = new EventCache();
