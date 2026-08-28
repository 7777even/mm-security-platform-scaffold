<script setup lang="ts">
import { ref } from 'vue';
import { tokenSource } from '../bridges';

// 我的页占位：登录态由 bridges/tokenSource 提供（dev 为 sessionStorage 垫底，
// 原生壳方案落地后由原生层注入），页面不感知实现
const hasToken = ref(false);
tokenSource.getToken().then((token) => {
  hasToken.value = token !== null;
});
</script>

<template>
  <div class="mb-page">
    <div class="mb-card placeholder">
      <p class="placeholder__title">我的</p>
      <p class="placeholder__hint">登录态：{{ hasToken ? '已注入' : '未登录（dev 垫底）' }}</p>
      <p class="placeholder__hint">
        待接入：适老大字切换 / 户外强光皮肤开关（data-skin="outdoor"）
      </p>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.placeholder__title {
  margin: 0;
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.placeholder__hint {
  margin: 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
</style>
