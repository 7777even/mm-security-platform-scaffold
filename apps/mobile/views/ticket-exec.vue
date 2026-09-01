<script setup lang="ts">
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { tickets } from '../data/mock';

/**
 * 操作票执行（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/TicketExec.vue）：
 * - 步骤序号上提为共享类 `.mb-stepno`（复用既有 `--mb-step-dot` 尺寸 token），
 *   替换参考内联的 `.idx`；已完成节点转成功色，与 patrol-exec 的执行语义一致。
 * - 附件区上提为共享类 `.mb-upload`（虚线描边占位）。
 * - 主操作「确认本步完成」改为 `.mb-safe-bar` 固定底部条：执行页步骤长、需单手连点，
 *   固定条可避免滚到页尾才能提交；页面用 `.mb-page--bar` 预留底部安全区。
 * - 票头信息取 `data/mock.ts` 的 tickets[0]，替换参考的写死文案。
 */
interface ExecStep {
  name: string;
  tip: string;
  done: boolean;
  cur: boolean;
}

const ticket = tickets[0];
const TOTAL_STEPS = 12;
const CURRENT_STEP = 3;

const steps: ExecStep[] = [
  { name: '确认隔离阀关闭', tip: '已确认 · 签字完成', done: true, cur: false },
  { name: '确认盲板位置', tip: '已确认 · 照片已上传', done: true, cur: false },
  { name: '切换泵组运行状态', tip: '当前步骤 · 请唱票确认', done: false, cur: true },
  { name: '核对出口压力', tip: '待执行', done: false, cur: false },
];
</script>

<template>
  <div class="mb-page mb-page--bar">
    <MobileHeader variant="back" title="操作票执行" back-to="/tickets" />

    <div class="mb-stack">
      <div class="mb-card">
        <h2 class="mb-card__title">{{ ticket.name }}</h2>
        <p class="mb-card__desc">
          {{ ticket.grade }} 级 · {{ ticket.st }} · 步骤 {{ CURRENT_STEP }} / {{ TOTAL_STEPS }}
        </p>
      </div>

      <div
        v-for="(s, i) in steps"
        :key="s.name"
        class="mb-card ticket-exec__step"
        :class="{ 'ticket-exec__step--cur': s.cur }"
      >
        <span class="mb-stepno" :class="{ 'mb-stepno--done': s.done }">{{ i + 1 }}</span>
        <div class="ticket-exec__main">
          <p class="mb-row__title">{{ s.name }}</p>
          <p class="mb-row__desc">{{ s.tip }}</p>
        </div>
      </div>

      <button type="button" class="mb-upload">
        <Icon name="plus" size="var(--mb-ico-md)" />
        上传现场照片
      </button>
    </div>

    <div class="mb-safe-bar">
      <button type="button" class="mb-btn-primary mb-btn-block">确认本步完成</button>
    </div>
  </div>
</template>

<style scoped>
.ticket-exec__step {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

/* 当前步骤：主色描边 + 软底强调，与已完成（序号转绿）区分 */
.ticket-exec__step--cur {
  border-color: var(--primary-mobile);
  background: var(--primary-mobile-soft);
}

.ticket-exec__main {
  flex: 1;
  min-width: 0;
}
</style>
