<script setup lang="ts">
// MgmtFilterBar：列表页筛选卡（docs/UI规范-后台管理端.md §4）
// 控件等高 40（--el-component-size 已在 mgmt.css 指向 --mgmt-ctrl-h）；
// 右侧「主查询（实色主色）+ 次重置（白底描边）」成组
defineEmits<{ (e: 'search'): void; (e: 'reset'): void }>();
</script>

<template>
  <section class="mgmt-filter">
    <div class="mgmt-filter__fields">
      <slot />
    </div>
    <div class="mgmt-filter__actions">
      <el-button type="primary" @click="$emit('search')">查询</el-button>
      <el-button @click="$emit('reset')">重置</el-button>
    </div>
  </section>
</template>

<style scoped>
.mgmt-filter {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.mgmt-filter__fields {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

.mgmt-filter__actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-sm);
}
</style>
