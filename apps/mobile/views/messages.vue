<template>
  <!-- 消息页占位：脚手架骨架，接入 WS 推送订阅（src/services/ws.ts）后填充 -->
  <div class="mb-page">
    <div class="mb-card placeholder">
      <p class="placeholder__title">消息中心</p>
      <p class="placeholder__hint">
        待接入：警情推送（WS 订阅）+ 原生系统推送桥（bridges 决策落地）
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
