<script setup lang="ts">
// 404 页面
import { useRouter } from 'vue-router';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
</script>

<template>
  <div class="not-found">
    <PanelCard title="页面不存在" class="nf-card">
      <p class="code">404</p>
      <p class="panel-empty">您访问的页面不存在或已被移除。</p>
      <AppButton variant="primary" size="md" @click="router.push('/')">返回首页</AppButton>
    </PanelCard>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.nf-card :deep(.panel-card__body) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  text-align: center;
}

.code {
  margin: var(--space-lg) 0 var(--space-sm);
  font-size: 72px;
  font-weight: 700;
  color: var(--color-accent);
  text-shadow: 0 0 24px var(--color-accent-glow);
}

.panel-empty {
  color: var(--color-text-muted);
}
</style>
