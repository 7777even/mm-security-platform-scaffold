// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FireAlarm from './index.vue';

// 消防报警为自定义地图布局（非 ModuleLayout），子面板独立渲染；
// 测试仅验证容器与骨架屏挂载成功，面板/图表组件以 stub 隔离。
describe('消防报警 模块', () => {
  const mountView = () =>
    mount(FireAlarm, {
      global: {
        stubs: {
          BaseMap: true,
          FireStrengthPanel: true,
          SpecialWorkPanel: true,
          FireFacilityPanel: true,
          FireDevicePanel: true,
          FireAlarmPanel: true,
          FireDutyPanel: true,
          SystemMessageBar: true,
        },
      },
    });

  it('mount 不抛错并渲染地图骨架屏', () => {
    const wrapper = mountView();
    expect(wrapper.find('.dashboard').exists()).toBe(true);
    expect(wrapper.find('[data-test="firealarm-skeleton"]').exists()).toBe(true);
  });

  it('底部定位层存在', () => {
    const wrapper = mountView();
    expect(wrapper.find('.foot-tools').exists()).toBe(true);
    // 系统消息条（foot-tools__msg）当前临时注释，恢复时同步开启此断言
    // expect(wrapper.find('.foot-tools__msg').exists()).toBe(true);
  });
});
