<script setup lang="ts">
import { computed, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { patrols } from '../data/mock';

/**
 * 防火巡查执行（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/PatrolExec.vue）：
 * - 进度条复用共享类 `.mb-progress*`，替换参考内联的 `.bar` + `#e8eef4` 硬编码底。
 * - 检查项三态选项复用共享类 `.mb-seg*`；参考实现是写死的静态按钮（`.opt on` 永远落在
 *   「正常」），点击无反应。改为按检查项编号记录选择结果，默认「正常」，可切换。
 * - 打卡 / 上报事件按钮统一 `.mb-btn-primary.mb-btn-sm`（热区 48）。
 * - 主操作「提交巡查记录」改为 `.mb-safe-bar` 固定底部条：检查项较多需滚动填写，
 *   固定条避免滚到页尾才能提交；页面用 `.mb-page--bar` 预留底部安全区。
 * - 任务信息取 `data/mock.ts` 的 patrols[0]，替换参考的写死文案。
 */
interface CheckItem {
  code: string;
  name: string;
}

interface CheckGroup {
  title: string;
  items: CheckItem[];
}

const OPTIONS = ['正常', '异常', '不适用'] as const;
type Option = (typeof OPTIONS)[number];

const patrol = patrols[0];

const groups: CheckGroup[] = [
  {
    title: 'A. 用火用电安全管理（2 项）',
    items: [
      { code: 'A1', name: '有无违章用火情况' },
      { code: 'A2', name: '有无违章用电情况' },
    ],
  },
  {
    title: 'B. 疏散通道（3 项）',
    items: [
      { code: 'B1', name: '安全出口、疏散通道是否畅通' },
      { code: 'B2', name: '疏散走道是否堆放可燃物' },
      { code: 'B3', name: '装修材料是否合格' },
    ],
  },
  {
    title: 'C. 防火分隔设施（2 项）',
    items: [
      { code: 'C1', name: '常闭防火门是否正常关闭' },
      { code: 'C3', name: '防火卷帘是否正常工作' },
    ],
  },
];

const clocked = ref(false);

/** 检查项编号 → 当前选项，默认「正常」 */
const answers = ref<Record<string, Option>>(
  Object.fromEntries(groups.flatMap((g) => g.items.map((i) => [i.code, '正常' as Option]))),
);

const percent = computed(() => `${Math.round((patrol.progress / patrol.total) * 100)}%`);

const abnormalCount = computed(
  () => Object.values(answers.value).filter((v) => v === '异常').length,
);

function pick(code: string, opt: Option) {
  answers.value[code] = opt;
}
</script>

<template>
  <div class="mb-page mb-page--bar">
    <MobileHeader variant="back" title="巡查执行" back-to="/patrols" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ patrol.name }}</span>
          <span class="tag tag--info">执行中</span>
        </div>
        <p class="mb-card__desc">
          2026-08-18 上午 · 任务进度 {{ patrol.progress }}/{{ patrol.total }} · GPS 已开启 · 轨迹点
          26
        </p>
        <div class="mb-progress patrol-exec__bar">
          <i class="mb-progress__bar" :style="{ width: percent }" />
        </div>
      </div>

      <div class="mb-card">
        <div class="mb-card__title">
          <span>巡查打卡</span>
          <span class="tag" :class="clocked ? 'tag--success' : 'tag--warning'">
            {{ clocked ? '已签到 08:12' : '未签到' }}
          </span>
        </div>
        <p class="mb-card__desc">签到位置：T-301 入口 · GPS 22.6521, 110.9288</p>
        <div class="patrol-exec__actions">
          <button
            v-if="!clocked"
            type="button"
            class="mb-btn-primary mb-btn-sm"
            @click="clocked = true"
          >
            <Icon name="check" size="var(--mb-ico-xs)" />
            签到打卡
          </button>
          <button type="button" class="mb-btn-ghost mb-btn-sm">
            <Icon name="camera" size="var(--mb-ico-xs)" />
            上报事件
          </button>
        </div>
      </div>

      <div v-for="g in groups" :key="g.title" class="patrol-exec__group">
        <h2 class="mb-section__title patrol-exec__gtitle">{{ g.title }}</h2>
        <div v-for="item in g.items" :key="item.code" class="mb-card">
          <p class="patrol-exec__item">{{ item.code }} {{ item.name }}</p>
          <div class="mb-seg" role="group" :aria-label="`${item.code} 检查结果`">
            <button
              v-for="opt in OPTIONS"
              :key="opt"
              type="button"
              class="mb-seg__opt"
              :class="{ 'mb-seg__opt--on': answers[item.code] === opt }"
              :aria-pressed="String(answers[item.code] === opt)"
              @click="pick(item.code, opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-safe-bar">
      <button type="button" class="mb-btn-primary mb-btn-block">
        {{ abnormalCount > 0 ? `提交巡查记录（异常 ${abnormalCount} 项）` : '提交巡查记录' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.patrol-exec__bar {
  margin-top: var(--space-sm);
}

.patrol-exec__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.patrol-exec__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.patrol-exec__gtitle {
  margin: 0;
}

.patrol-exec__item {
  margin-bottom: var(--space-sm);
  font-size: var(--mb-fz-form-label);
  color: var(--text-title-mobile);
}
</style>
