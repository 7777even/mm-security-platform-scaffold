// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { Bell } from '@element-plus/icons-vue';
import BottomMessageBar from './BottomMessageBar.vue';
import * as messageApi from '@/services/message';

const SAMPLE = [
  { id: 'a', level: 'alarm' as const, text: '报警一条', time: '09:00' },
  { id: 'b', level: 'system' as const, text: '系统一条', time: '08:00' },
];

describe('BottomMessageBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('渲染品牌标识', async () => {
    vi.spyOn(messageApi, 'fetchMessages').mockResolvedValue(SAMPLE);
    const wrapper = mount(BottomMessageBar);
    await flushMessages(wrapper);
    expect(wrapper.find('.msg-bar__brand-text').text()).toContain('实时播报');
    expect(wrapper.findComponent(Bell).exists()).toBe(true);
  });

  it('加载后渲染消息并按级别打标签', async () => {
    vi.spyOn(messageApi, 'fetchMessages').mockResolvedValue(SAMPLE);
    const wrapper = mount(BottomMessageBar);
    await flushMessages(wrapper);
    const items = wrapper.findAll('.msg-item');
    // 轨道重复两遍列表
    expect(items.length).toBe(SAMPLE.length * 2);
    expect(wrapper.find('.msg-item--alarm').exists()).toBe(true);
    expect(wrapper.find('.msg-item--system').exists()).toBe(true);
    expect(wrapper.find('.msg-item__tag').text()).toBe('报警');
  });

  it('无消息时显示占位', async () => {
    vi.spyOn(messageApi, 'fetchMessages').mockResolvedValue([]);
    const wrapper = mount(BottomMessageBar);
    await flushMessages(wrapper);
    expect(wrapper.find('.msg-bar__placeholder').text()).toContain('暂无播报消息');
  });
});

async function flushMessages(wrapper: ReturnType<typeof mount>) {
  // 等待 onMounted 内的 fetchMessages 完成并触发 DOM 更新
  await new Promise((r) => setTimeout(r, 0));
  await wrapper.vm.$nextTick();
}
