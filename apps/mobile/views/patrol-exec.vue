<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchFirePatrols, type FirePatrolRecord } from '@/services/fireMonitoring';

/**
 * 防火巡查执行（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/fire/patrols（防火巡查记录），取首条作为当前执行任务，
 * 检查项按后端 checkItems 的 category 分组渲染。取消原 data/mock.ts 静态数据；
 * 未连后端走空态（不回灌假数据）。
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

const loading = ref(false);
const patrol = ref<FirePatrolRecord | null>(null);
const groups = ref<CheckGroup[]>([]);
const loaded = ref(false);
const clocked = ref(false);

/** 检查项编号 → 当前选项，默认取后端 result（缺省「正常」） */
const answers = ref<Record<string, Option>>({});

function buildGroups(record: FirePatrolRecord | null): CheckGroup[] {
  if (!record) return [];
  const map = new Map<string, CheckItem[]>();
  (record.checkItems ?? []).forEach((it) => {
    const key = it.category || '检查项';
    const arr = map.get(key) ?? [];
    arr.push({ code: it.itemCode, name: it.content });
    map.set(key, arr);
  });
  return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const records = await fetchFirePatrols();
    const record = records[0] ?? null;
    patrol.value = record;
    groups.value = buildGroups(record);
    const init: Record<string, Option> = {};
    groups.value.forEach((g) =>
      g.items.forEach((i) => {
        init[i.code] = '正常';
      }),
    );
    answers.value = init;
  } catch {
    patrol.value = null;
    groups.value = [];
  } finally {
    loading.value = false;
    loaded.value = true;
  }
}

const total = computed(() => (patrol.value?.checkItems ?? []).length);
const progress = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0));
const percent = computed(() =>
  total.value ? `${Math.round((progress.value / total.value) * 100)}%` : '0%',
);

const abnormalCount = computed(
  () => Object.values(answers.value).filter((v) => v === '异常').length,
);

function pick(code: string, opt: Option) {
  answers.value[code] = opt;
}

onMounted(load);
</script>

<template>
  <div class="mb-page mb-page--bar">
    <MobileHeader variant="back" title="巡查执行" back-to="/patrols" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!loaded || !patrol" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无执行中的巡查任务</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{
            patrol.locations?.filter(Boolean).join('、') || patrol.patrolCount || '防火巡查'
          }}</span>
          <span class="tag tag--info">{{ patrol.completed ? '已提交' : '执行中' }}</span>
        </div>
        <p class="mb-card__desc">
          {{ patrol.patrolDate }} {{ patrol.shift }} · 巡查人 {{ patrol.dutyPerson }} · 任务进度
          {{ progress }}/{{ total }}
        </p>
        <div class="mb-progress patrol-exec__bar">
          <i class="mb-progress__bar" :style="{ width: percent }" />
        </div>
      </div>

      <div class="mb-card">
        <div class="mb-card__title">
          <span>巡查打卡</span>
          <span class="tag" :class="clocked ? 'tag--success' : 'tag--warning'">
            {{ clocked ? '已签到' : '未签到' }}
          </span>
        </div>
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
              :aria-pressed="answers[item.code] === opt"
              @click="pick(item.code, opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="!groups.length" class="mb-empty">
        <div class="mb-empty__art" />
        <p class="mb-empty__text">该巡查任务暂无检查项</p>
      </div>
    </div>

    <div v-if="loaded && patrol" class="mb-safe-bar">
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

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
