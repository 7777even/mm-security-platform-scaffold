import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { onUnauthorized } from './platform/http';
import { clearAccessToken } from './platform/token';
import { initAccessibilityModes } from './platform/accessibility';

// 无障碍模式（户外高对比 / 适老三档）在挂载前初始化，杜绝首屏闪烁。
initAccessibilityModes();

// 401 全局处理：清内存态令牌并重拉登录（PoC 阶段先回到首页并提示）。
onUnauthorized(() => {
  clearAccessToken();
  uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' });
  uni.reLaunch({ url: '/pages/home/home' });
});

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  return { app };
}
