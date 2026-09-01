<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { drills } from '../data/mock';

// 演练详情（详情页模板，docs/UI规范-移动端.md §5）
// - 只读字段用 .mb-detail 分组卡（标签左 / 值右），热区 48 保证可读
// - 主操作「提交演练反馈」唯一（§4 一屏一个主按钮），任务级「确认接收」用白底描边次按钮
// - 数据为演示数据（data/mock.ts）；接入后由演练详情接口驱动

const route = useRoute();
const drill = computed(() => drills.find((x) => x.id === route.params.id) ?? drills[0]);

/** 演练状态 → 标签类 */
const STATUS_TAG: Record<string, string> = {
  进行中: 'tag--danger',
  计划中: 'tag--info',
  已结束: 'tag--success',
};

/** 演练任务状态 → 标签类 */
const TASK_STATUS_TAG: Record<string, string> = {
  待确认: 'tag--warning',
  进行中: 'tag--warning',
  已提交: 'tag--success',
  未开始: 'tag--info',
};

const feedback = ref('');
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="演练详情" back-to="/drills" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ drill.name }}</span>
          <span class="tag" :class="STATUS_TAG[drill.st]">{{ drill.st }}</span>
        </div>
        <p class="mb-card__desc">{{ drill.id }}</p>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">类型 / 形式</span>
          <span class="mb-detail__value">{{ drill.type }} · {{ drill.form }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">时间 / 地点</span>
          <span class="mb-detail__value">{{ drill.time }} · {{ drill.place }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">参与部门</span>
          <span class="mb-detail__value">{{ drill.depts }}</span>
        </div>
      </div>
    </div>

    <section class="mb-section drill__section">
      <div class="mb-section__head">
        <span class="mb-section__title">我的演练任务</span>
      </div>
      <div class="mb-stack">
        <div v-for="(t, i) in drill.tasks" :key="i" class="mb-card">
          <div class="mb-card__title">
            <span>{{ t.n }}</span>
            <span class="tag" :class="TASK_STATUS_TAG[t.st]">{{ t.st }}</span>
          </div>
          <button
            v-if="t.st === '待确认'"
            type="button"
            class="mb-btn-ghost mb-btn-sm task__confirm"
          >
            确认接收
          </button>
        </div>
      </div>
    </section>

    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">演练反馈</span>
      </div>
      <textarea
        v-model="feedback"
        class="mb-input drill__feedback"
        placeholder="填写本次演练参与反馈（可选）"
      />
      <button type="button" class="mb-btn-primary mb-btn-block">提交演练反馈</button>
    </section>
  </div>
</template>

<style scoped>
.drill__section {
  margin-top: var(--mb-card-gap);
}

.task__confirm {
  margin-top: var(--space-sm);
}

.drill__feedback {
  min-height: calc(var(--mb-btn-h) * 2);
  margin-bottom: var(--mb-card-gap);
  padding: var(--space-sm) var(--space-md);
  line-height: 1.5;
}
</style>
