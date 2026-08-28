import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/styles/tokens.css';
import './styles/mgmt.css';

// 后台管理端独立应用入口（方案一：本仓库独立应用入口，见 AGENTS.md §1）
// - 主题：data-theme="mgmt" 由 index.html 静态挂载，tokens.css 的 mgmt 块随之生效
// - 基座样式：./styles/mgmt.css（勿引入 src/styles/global.css，其 body 为大屏深色底语言）
// - Element Plus：由 unplugin-vue-components + ElementPlusResolver 按需自动引入（主配置已全局生效）
createApp(App).use(createPinia()).use(router).mount('#app');
