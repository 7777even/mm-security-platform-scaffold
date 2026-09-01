<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { plans } from '../data/mock';

// 预案详情（详情页模板，docs/UI规范-移动端.md §5）
// - 只读字段用 .mb-detail 分组卡（标签左 / 值右）
// - 响应流程用 .mb-timeline 时间轴呈现阶段顺序（参考原型为带序号卡片，语义等价）
// - 主操作「离线缓存」唯一（§4 一屏一个主按钮）
// - 数据为演示数据（data/mock.ts）；接入后由预案详情接口驱动

const route = useRoute();
const plan = computed(() => plans.find((x) => x.id === route.params.id) ?? plans[0]);

interface PlanStep {
  id: string;
  phase: string;
  text: string;
}

/** 阶段文案自带「阶段 N：」前缀，时间轴上提为时间位，正文只留阶段动作 */
const steps = computed<PlanStep[]>(() =>
  plan.value.steps.map((s, i) => ({
    id: `step-${i}`,
    phase: `阶段 ${i + 1}`,
    text: s.replace(/^阶段\s*\d+[:：]\s*/, ''),
  })),
);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="预案详情" back-to="/plans" />

    <div class="mb-stack">
      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">预案编号 / 名称</span>
          <span class="mb-detail__value">{{ plan.id }} · {{ plan.name }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">适用 / 级别 / 版本</span>
          <span class="mb-detail__value">{{ plan.scope }} · {{ plan.level }} · {{ plan.ver }}</span>
        </div>
      </div>
    </div>

    <section class="mb-section plan__section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="task" size="var(--mb-ico-sm)" mono />
          响应流程
        </span>
      </div>
      <div class="mb-timeline">
        <div v-for="s in steps" :key="s.id" class="mb-timeline__item">
          <div class="mb-timeline__time">{{ s.phase }}</div>
          <div class="mb-timeline__body">{{ s.text }}</div>
        </div>
      </div>
    </section>

    <button type="button" class="mb-btn-primary mb-btn-block">离线缓存</button>
  </div>
</template>

<style scoped>
.plan__section {
  margin-top: var(--mb-card-gap);
}
</style>
