<!--
  运维监测（六大模块之六）
  参考设计说明 §12 运维监测原型（图 5-21）
  模块原型占位：本期暂不展开，仅保留一级入口与统一布局骨架（§5.4）
-->
<script setup lang="ts">
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';
</script>

<template>
  <ModuleLayout>
    <template #left>
      <PanelCard title="运维概览" icon="DataBoard">
        <div class="placeholder">
          <p class="placeholder__title">模块建设中</p>
          <p class="placeholder__desc">
            设备健康、DCS/PLC 状态、点检保养等运维监测能力将在后续迭代接入。
          </p>
          <AppButton variant="ghost" size="sm">关注上线通知</AppButton>
        </div>
      </PanelCard>
    </template>

    <template #right>
      <PanelCard title="监测点位" icon="Monitor">
        <div class="placeholder">
          <p class="placeholder__desc">运维监测点位与告警将在接入后展示于此。</p>
        </div>
      </PanelCard>
    </template>
  </ModuleLayout>
</template>

<style scoped>
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-2xl) 0;
}

.placeholder__title {
  margin: 0;
  font-size: var(--font-size-h2);
  color: var(--color-text);
  font-weight: 600;
}

.placeholder__desc {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  max-width: 520px;
  line-height: 1.6;
}
</style>
