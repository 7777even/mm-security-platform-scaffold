<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { orders } from '../data/mock';

/**
 * 报修工单详情（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/OrderDetail.vue）：
 * - 流程节点上提为共享类 `.mb-steps*`：已完成 / 当前 / 未开始三态走语义色 token，
 *   替换参考内联的 `.steps span` + `#f0f4f8` 硬编码底。
 * - 只读字段由「一字段一白卡」改为共享类 `.mb-detail` 分组卡，与 alarm-detail 一致。
 * - 处置结果录入用共享类 `.mb-textarea`；现场照片占位用 `.mb-photo`（热区 64）。
 * - 参考的 `<button style="margin-top:8px">` 内联样式删除，间距统一走 `.mb-stack` 的 gap。
 */
const route = useRoute();
const order = computed(() => orders.find((x) => x.id === route.params.id) ?? orders[0]);

const STEPS = ['待确认', '已确认', '已派单', '维修中', '待验收', '已闭环'];

const currentStep = computed(() => Math.max(0, STEPS.indexOf(order.value.st)));

function stepClass(i: number): string {
  if (i < currentStep.value) return 'mb-steps__item mb-steps__item--done';
  if (i === currentStep.value) return 'mb-steps__item mb-steps__item--on';
  return 'mb-steps__item';
}
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="工单详情" back-to="/orders" />

    <div class="mb-stack">
      <div class="mb-steps">
        <span v-for="(s, i) in STEPS" :key="s" :class="stepClass(i)">{{ s }}</span>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">工单编号</span>
          <span class="mb-detail__value">{{ order.id }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">故障设备</span>
          <span class="mb-detail__value">{{ order.device }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">故障类型 / 级别</span>
          <span class="mb-detail__value">{{ order.type }} · {{ order.level }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">故障现象</span>
          <span class="mb-detail__value">{{ order.phen }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">负责人 / 期限</span>
          <span class="mb-detail__value">{{ order.owner }} · 预计 {{ order.deadline }}</span>
        </div>
      </div>

      <h2 class="mb-section__title order-detail__sec">处置操作</h2>

      <textarea class="mb-textarea" placeholder="填写处理结果（必填）" />

      <div class="order-detail__photos">
        <button type="button" class="mb-photo" aria-label="新增现场照片">
          <Icon name="plus" size="var(--mb-ico-lg)" />
        </button>
        <button type="button" class="mb-photo" aria-label="拍照上传">
          <Icon name="camera" size="var(--mb-ico-lg)" />
        </button>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">完成维修并提交验收</button>
      <button type="button" class="mb-btn-ghost mb-btn-block">验收（合格关闭 / 不合格退回）</button>
    </div>
  </div>
</template>

<style scoped>
.order-detail__sec {
  margin: var(--space-md) 0 calc(-1 * var(--space-sm));
}

.order-detail__photos {
  display: flex;
  gap: var(--space-sm);
}
</style>
