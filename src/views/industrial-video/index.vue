<!--
  工业视频模块占位 — §12.4 视频监控（图 5-14）
  本轮仅以设计稿 §9.1 统计卡占位，未来接入：视频流渲染 / 摄像头状态订阅 / AI 识别事件
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import AppButton from '@/components/common/AppButton.vue';

// §9.1 视频统计卡组（设计稿图 5-14 左上）
const stats = [
  { title: '视频总数 / 路', value: 665, icon: 'VideoCamera' },
  { title: '在线 / 路', value: 596, icon: 'VideoPlay' },
  { title: '故障 / 路', value: 23, icon: 'WarningFilled' },
  { title: '完好率 / %', value: 98, icon: 'DataLine' },
] as const;
</script>

<template>
  <PanelCard class="page-panel" title="工业视频" icon="VideoCamera" more="查看全部">
    <p class="panel-empty">模块开发中：接入视频流渲染与摄像头状态订阅。</p>

    <!-- §9.1 统计卡 2×2 网格（与设计稿图 5-14「视频监控概览」一致） -->
    <section class="stat-grid">
      <StatCard
        v-for="s in stats"
        :key="s.title"
        :title="s.title"
        :value="s.value"
        :icon="s.icon"
      />
    </section>

    <!-- §9.3 主操作按钮（科技深蓝渐变） -->
    <div class="actions">
      <AppButton variant="primary" size="md">实时监控</AppButton>
      <AppButton variant="ghost" size="md">视频回放</AppButton>
      <AppButton variant="default" size="md">AI 识别配置</AppButton>
    </div>
  </PanelCard>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
}

.panel-empty {
  margin: 0 0 var(--space-md);
  color: var(--color-text-muted);
}

/* §9.1 统计卡网格：2 列 16px 间距 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* §9.3 按钮组：左对齐，间距 12px */
.actions {
  display: flex;
  gap: var(--space-sm);
}
</style>
