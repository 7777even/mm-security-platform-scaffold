<script setup lang="ts">
import { computed } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { duty } from '../data/mock';

/**
 * 今日值班（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Duty.vue）：
 * - 月历上提为共享类 `.mb-calendar__grid` / `.mb-cell`（原为页面内联 `.days`），
 *   并补齐参考实现缺失的星期表头与「1 号对齐真实星期」的前置空格，
 *   否则整月日期会整体错位一列。
 * - 值班列表复用 `.mb-row`（行高 48）+ `.mb-avatar`；参考实现的 `.av` 内联样式删除。
 * - `!important` 提权（.today / .duty 的 color）取消：共享类已按 token 取值，无需覆盖。
 * - 数据来源改用 `data/mock.ts` 的 duty（含 shift / room / tel），替换参考的内联数组。
 */
const YEAR = 2026;
const MONTH = 8;
const DAYS_IN_MONTH = 31;
const TODAY = 21;
const DUTY_DAYS = [18, 22];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const days = computed(() => Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1));

/** 1 号落在星期几 → 前置空格数，保证日期与星期列对齐 */
const leadingBlanks = computed(() => new Date(YEAR, MONTH - 1, 1).getDay());

const list = duty;
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="今日值班" back-to="/home" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-calendar__head">{{ YEAR }}年{{ MONTH }}月</div>
        <div class="mb-calendar__grid duty__week">
          <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
        </div>
        <div class="mb-calendar__grid">
          <span v-for="b in leadingBlanks" :key="`blank-${b}`" class="mb-cell" />
          <span
            v-for="d in days"
            :key="d"
            class="mb-cell"
            :class="{ 'mb-cell--today': d === TODAY, 'mb-cell--duty': DUTY_DAYS.includes(d) }"
          >
            {{ d }}
          </span>
        </div>
      </div>

      <h2 class="mb-section__title duty__sec">今日值班（{{ MONTH }}月{{ TODAY }}日）</h2>

      <div v-for="d in list" :key="d.tel" class="mb-row">
        <span class="mb-avatar mb-avatar--sm">{{ d.name.slice(0, 1) }}</span>
        <div class="mb-row__main">
          <p class="mb-row__title">{{ d.name }}</p>
          <p class="mb-row__desc">{{ d.shift }} · {{ d.room }}</p>
        </div>
        <button type="button" class="mb-btn-primary mb-btn-sm">
          <Icon name="phone" size="var(--mb-ico-xs)" />
          拨号
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.duty__week {
  margin-bottom: var(--space-xs);
  font-weight: 600;
  color: var(--mb-muted);
}

.duty__sec {
  margin: var(--space-md) 0 0;
}
</style>
