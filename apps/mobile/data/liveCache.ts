import { reactive } from 'vue';
import type { EmergencyEventItem } from '@/services/emergencyEvent';
import type { AlarmItem } from '@/services/alarm';

/**
 * 移动端「事件 / 告警」实时数据缓存。
 *
 * 后端未提供按 id 详情端点（仅分组列表 / 分页列表），
 * 列表页拉取后写入本缓存，详情页按 id 从缓存读取，
 * 保证「列表卡片 → 详情」跳转在 SPA 会话内可用。
 *
 * 深链 / 刷新导致缓存为空时，详情页降级为「未找到」空态，
 * 不回灌任何假数据（遵循 offline 三态纪律）。
 */
export const liveEvents = reactive<{ items: EmergencyEventItem[] }>({ items: [] });
export const liveAlarms = reactive<{ items: AlarmItem[] }>({ items: [] });
