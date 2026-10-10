<script setup lang="ts">
// uni-app 应用入口生命周期。安装 @dcloudio/uni-app 后本导入解析为官方生命周期钩子。
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import './styles/index.css';

onLaunch(() => {
  console.log('[mobile-uni] App Launch');
});
onShow(() => {
  console.log('[mobile-uni] App Show');
});
onHide(() => {
  console.log('[mobile-uni] App Hide');
});
</script>

<style>
page {
  background: #f5f6f8;
  font-family:
    -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}
</style>
