import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus 组件由 unplugin-vue-components 按需自动引入（B4 性能优化），此处仅保留基础样式
import 'element-plus/theme-chalk/base.css'
import { Odometer, Monitor, Bell } from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { vPermission } from './directives/permission'
import { mark, measure } from './utils/perf'
import './styles/tokens.css'
import './styles/global.css'

// 渲染层埋点起点：入口 JS 开始执行（SLO 渲染层口径）
mark('app:start')

const app = createApp(App)
// 仅注册用到的图标（避免全量图标包 400KB+）
for (const icon of [Odometer, Monitor, Bell]) {
  app.component(icon.name!, icon)
}
app.directive('permission', vPermission)
app.use(createPinia())
app.use(router)
app.mount('#app')
mark('app:ready')
// 渲染层耗时 = 入口 JS 执行 → 首屏挂载完成（真机复测对比 SLO ≤1000ms）
measure('render', 'app:start', 'app:ready')
