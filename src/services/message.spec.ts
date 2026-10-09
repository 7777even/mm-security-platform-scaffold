import { describe, it, expect, afterEach } from 'vitest';
import {
  CATEGORY_LABELS,
  MESSAGE_CATEGORIES,
  fetchMessages,
  fetchNotifications,
  __setNotificationFetch,
  type NotificationQuery,
  type NotificationPageResult,
} from './message';

const basePage: NotificationPageResult = {
  list: [
    {
      id: 1,
      category: 'alarm',
      title: 'B3 区烟感报警',
      summary: '请核实',
      read: false,
      createdAt: '2026-10-09 09:12:00',
    },
    {
      id: 2,
      category: 'system',
      title: '版本升级',
      summary: '23:00 升级',
      read: true,
      createdAt: '2026-10-09 08:50:00',
    },
  ],
  total: 2,
  page: 1,
  size: 50,
  unreadCount: 1,
};

describe('message service', () => {
  afterEach(() => {
    // 还原为内置 mock，保证用例隔离
    __setNotificationFetch(() => Promise.resolve(basePage));
  });

  it('exposes 4 categories with labels', () => {
    expect(MESSAGE_CATEGORIES).toHaveLength(4);
    expect(CATEGORY_LABELS.alarm).toBe('报警通知');
    expect(CATEGORY_LABELS.event).toBe('事件通知');
    expect(CATEGORY_LABELS.task).toBe('任务通知');
    expect(CATEGORY_LABELS.system).toBe('系统通知');
  });

  it('fetchMessages maps backend items to MessageItem with HH:mm time', async () => {
    __setNotificationFetch(() => Promise.resolve(basePage));
    const list = await fetchMessages();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('1');
    expect(list[0].time).toBe('09:12');
    expect(list[0].read).toBe(false);
    expect(list[1].time).toBe('08:50');
  });

  it('fetchNotifications forwards query and returns page', async () => {
    let captured: NotificationQuery | undefined;
    __setNotificationFetch((q) => {
      captured = q;
      return Promise.resolve(basePage);
    });
    const r = await fetchNotifications({ page: 2, size: 10, category: 'alarm' });
    expect(r.total).toBe(2);
    expect(captured).toMatchObject({ page: 2, size: 10, category: 'alarm' });
  });

  it('includes unread items for badge', async () => {
    __setNotificationFetch(() => Promise.resolve(basePage));
    expect((await fetchMessages()).some((m) => !m.read)).toBe(true);
  });

  it('covers all 4 categories in mock', async () => {
    const fullPage: NotificationPageResult = {
      ...basePage,
      list: MESSAGE_CATEGORIES.map((c, i) => ({
        id: i + 1,
        category: c,
        title: c,
        summary: '',
        read: false,
        createdAt: '2026-10-09 09:00:00',
      })),
    };
    __setNotificationFetch(() => Promise.resolve(fullPage));
    const set = new Set((await fetchMessages()).map((m) => m.category));
    expect(MESSAGE_CATEGORIES.every((c) => set.has(c))).toBe(true);
  });
});
