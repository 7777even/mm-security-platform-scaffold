// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import FireAlarm from './index.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import AppButton from '@/components/common/AppButton.vue';

// 闭环 useAlarmView，避免真实网络请求，并固定无报警的渲染分支
vi.mock('@/composables/useAlarmView', () => ({
  useAlarmView: () => ({
    page: ref(1),
    size: ref(10),
    levelFilter: ref<number | undefined>(undefined),
    statusFilter: ref<string | undefined>(undefined),
    detail: ref(null),
    pageResult: ref({ list: [], total: 0 }),
    activeCount: ref(0),
    refresh: vi.fn(async () => {}),
    openDetail: vi.fn(),
    ack: vi.fn(async () => true),
  }),
}));

// records.vue 引入 element-plus 表格样式，测试环境 stub 掉以免 .css 转换失败
vi.mock('./records.vue', () => ({
  default: { name: 'RecordsView', template: '<div class="records-view" />' },
}));

describe('消防报警 模块', () => {
  const mountView = () =>
    mount(FireAlarm, {
      global: {
        stubs: {
          BaseMap: true,
          SecondaryPageOverlay: true,
          'el-select': true,
          'el-option': true,
          'el-pagination': true,
          'el-drawer': true,
        },
      },
    });

  it('渲染双栏面板骨架与 4 张等级告警卡', () => {
    const wrapper = mountView();
    expect(wrapper.find('.module-shell').exists()).toBe(true);
    // 左侧报警态势：4 个等级色块
    expect(wrapper.findAllComponents(AlarmCard).length).toBe(4);
  });

  it('无报警时展示空态并提供刷新操作', () => {
    const wrapper = mountView();
    expect(wrapper.find('.alarm-empty').exists()).toBe(true);
    expect(wrapper.findAllComponents(AppButton).length).toBeGreaterThan(0);
  });
});
