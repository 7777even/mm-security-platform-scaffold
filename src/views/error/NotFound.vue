<script setup lang="ts">
// 404 页面
</script>

<template>
  <section class="glass-panel page-panel not-found">
    <h2 class="panel-title">页面不存在</h2>
    <p class="code">404</p>
    <p class="panel-empty">您访问的页面不存在或已被移除。</p>
  </section>
</template>

<style scoped>
.page-panel {
  min-height: 100%;
  padding: var(--space-lg);
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
