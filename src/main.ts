import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus 组件由 unplugin-vue-components 按需自动引入（B4 性能优化），此处仅保留基础样式
import 'element-plus/theme-chalk/base.css'
import { Odometer, Monitor, Bell } from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { vPermission } from './directives/permission'
import './styles/tokens.css'
import './styles/global.css'

const app = createApp(App)
// 仅注册用到的图标（避免全量图标包 400KB+）
for (const icon of [Odometer, Monitor, Bell]) {
  app.component(icon.name!, icon)
}
app.directive('permission', vPermission)
app.use(createPinia())
app.use(router)
app.mount('#app')
