import { vi } from 'vitest';

// —— 移动端单测环境适配 ——
// 组件里大量调用 uni.*（showToast / navigateTo 等）。uni-app 真实运行时注入全局 `uni`，
// 但 Node 测试环境没有，故在此提供 no-op stub。
// 注意：stub 不含 getStorageSync，使 @/platform/storage 自动走「内存 Map」降级分支（更干净）。
vi.stubGlobal('uni', {
  showToast: vi.fn(),
  showModal: vi.fn(),
  navigateTo: vi.fn(),
  navigateBack: vi.fn(),
  switchTab: vi.fn(),
  reLaunch: vi.fn(),
  redirectTo: vi.fn(),
  getLocation: vi.fn(),
  chooseLocation: vi.fn(),
  openLocation: vi.fn(),
  previewImage: vi.fn(),
});

// @dcloudio/uni-app 的页面生命周期（onLoad 等）在 Node 测试环境无法真实触发，
// mock 为「注册即立即调用」——对应 duty / patrol-exec 等页「onLoad 即拉数据」的行为。
vi.mock('@dcloudio/uni-app', () => ({
  onLoad: (cb: () => unknown) => {
    // 同步立即调用，让 setup 阶段排定的数据加载在 mount 后即可通过 flushPromises 等待完成
    void cb();
  },
}));
