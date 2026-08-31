import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/styles/tokens.css';
import './styles/mobile.css';
import { initAccessibilityModes } from './composables/useAccessibilityModes';

// 移动端 H5 独立应用入口（详设 V1.5 §5.3：Android 原生壳（hybrid）内嵌业务页，
// 集成方式待与设计方确认，见 docs/详细设计V1.5偏差分析.md §2.1）
// - 主题：data-theme="mobile" 由 index.html 静态挂载；
//   无障碍模式（户外高对比 / 适老三档）在挂载前从 localStorage 注入根节点，杜绝首屏闪烁。
// - 基座样式：./styles/mobile.css（勿引入 src/styles/global.css，其 body 为大屏深色底语言）
// - 原生能力（定位/离线落盘/推送/令牌注入）一律经 ./bridges/ 接口访问，页面禁止直调原生 API；
//   决策未定期间由 bridges 的 H5 降级实现垫底，决策落地只换适配器实现，业务页零改动
initAccessibilityModes();
createApp(App).use(createPinia()).use(router).mount('#app');
