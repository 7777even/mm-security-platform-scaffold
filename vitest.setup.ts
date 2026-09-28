import { afterEach } from 'vitest';

// vitest 全局 setup：为组件测试补齐 Teleport 目标容器。
// 大屏弹窗组件统一使用 <Teleport to="#app">（wujie 子应用下 to="body" 会挂进隐藏 iframe 导致弹窗不可见，
// 见 InfoDetailDialog.vue 顶部注释），jsdom/happy-dom 默认 body 为空，需保证 #app 存在。
// 部分 spec 的 afterEach 会 `document.body.innerHTML = ''`，全局 afterEach（注册早→执行晚）在其后兜底重建。
function ensureTeleportTarget(): void {
  if (typeof document !== 'undefined' && !document.getElementById('app')) {
    const el = document.createElement('div');
    el.id = 'app';
    document.body.appendChild(el);
  }
}
ensureTeleportTarget();
afterEach(ensureTeleportTarget);
