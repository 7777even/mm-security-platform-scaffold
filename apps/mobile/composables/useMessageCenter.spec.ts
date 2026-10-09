import { describe, it, expect, beforeEach } from 'vitest';
import { useMessageCenter } from './useMessageCenter';
import { __setNotificationFetch, type NotificationItem } from '@/services/message';

// 封闭测试：通过 src/services/message 的 __setNotificationFetch 注入点替换取数实现，
// 避免真实网络依赖（node 环境下相对 URL 无 baseURL 会抛 Invalid URL）。
const mockList: NotificationItem[] = [
  {
    id: 1,
    category: 'alarm',
    title: '火焰报警',
    summary: 'A 区火焰探测',
    createdAt: '2026-10-09 10:00:00',
    read: false,
  },
  {
    id: 2,
    category: 'alarm',
    title: '烟雾报警',
    summary: 'B 区烟雾探测',
    createdAt: '2026-10-09 10:01:00',
    read: true,
  },
  {
    id: 3,
    category: 'event',
    title: '应急演练',
    summary: '演练已开始',
    createdAt: '2026-10-09 10:02:00',
    read: false,
  },
  {
    id: 4,
    category: 'task',
    title: '巡检任务',
    summary: '待办巡检项',
    createdAt: '2026-10-09 10:03:00',
    read: false,
  },
  {
    id: 5,
    category: 'system',
    title: '系统通知',
    summary: '平台版本更新',
    createdAt: '2026-10-09 10:04:00',
    read: true,
  },
];

beforeEach(() => {
  __setNotificationFetch(() => Promise.resolve({ list: mockList }));
});

describe('useMessageCenter', () => {
  it('loads messages and exposes unread count', async () => {
    const c = useMessageCenter();
    expect(c.loading.value).toBe(false);
    await c.load();
    expect(c.messages.value.length).toBeGreaterThan(0);
    expect(c.unreadCount.value).toBeGreaterThan(0);
  });

  it('filters by category', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('alarm');
    expect(c.activeFilter.value).toBe('alarm');
    expect(c.filtered.value.length).toBeGreaterThan(0);
    expect(c.filtered.value.every((m) => m.category === 'alarm')).toBe(true);
  });

  it('markAllRead clears unread in current filter', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('alarm');
    c.markAllRead();
    expect(c.filtered.value.every((m) => m.read)).toBe(true);
  });

  it('resets to all filter', async () => {
    const c = useMessageCenter();
    await c.load();
    c.setFilter('system');
    c.setFilter('all');
    expect(c.filtered.value.length).toBe(c.messages.value.length);
  });
});
