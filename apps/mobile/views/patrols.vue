<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchFirePatrols, type FirePatrolRecord } from '@/services/fireMonitoring';

// 日常防火巡查（列表页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 数据源：后端 /api/v1/fire/patrols（防火巡查记录），经 fetchFirePatrols 拉取。
//   取消原 data/mock.ts 静态数据；未连后端由 service 内部走空态 + 全局离线告警（不回灌假数据）。
// - 卡片流 + 共享进度条 .mb-progress；状态标签只用 .tag--* 枚举。

interface PatrolItem {
  id: number;
  name: string;
  range: string;
  st: string;
  progress: number;
  total: number;
  abn: number;
}

const loading = ref(false);
const list = ref<PatrolItem[]>([]);

function toItem(r: FirePatrolRecord): PatrolItem {
  const items = r.checkItems ?? [];
  const total = items.length;
  const abn = items.filter((i) => i.result === '异常').length;
  // 已提交记录视为全部完成；未完成时按已判定项（非「不适用」）计进度
  const progress = r.completed ? total : items.filter((i) => i.result !== '不适用').length;
  return {
    id: r.id,
    name: r.locations?.filter(Boolean).join('、') || r.patrolCount || '防火巡查',
    range: `${r.patrolDate} ${r.shift}`,
    st: r.completed ? '已提交' : '执行中',
    progress,
    total,
    abn,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const records = await fetchFirePatrols();
    list.value = records.map(toItem);
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const STATUS_TAG: Record<string, string> = {
  执行中: 'tag--info',
  待执行: 'tag--warning',
  已提交: 'tag--success',
};

function percent(p: PatrolItem): string {
  if (!p.total) return '0%';
  return `${Math.round((p.progress / p.total) * 100)}%`;
}

function abnText(p: PatrolItem): string {
  return p.abn > 0 ? ` · 异常 ${p.abn} 项` : '';
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="日常防火巡查" back-to="/home" />

    <h2 class="mb-section__title patrol-sec">
      <Icon name="patrol" />
      日常防火巡查
    </h2>

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="list.length" class="mb-stack">
      <RouterLink v-for="p in list" :key="p.id" class="mb-card mb-card--link" to="/patrol-exec">
        <div class="mb-card__title">
          <span class="patrol-card__name">
            <Icon name="pin" size="var(--mb-ico-sm)" color="var(--primary-mobile)" />
            {{ p.name }}
          </span>
          <span class="tag" :class="STATUS_TAG[p.st] ?? 'tag--info'">{{ p.st }}</span>
        </div>
        <p class="mb-card__desc">
          {{ p.range }} · 进度 {{ p.progress }}/{{ p.total }}{{ abnText(p) }}
        </p>
        <div class="mb-progress patrol-card__bar">
          <i class="mb-progress__bar" :style="{ width: percent(p) }" />
        </div>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无巡查记录</p>
    </div>
  </div>
</template>

<style scoped>
.patrol-sec {
  margin: 0 0 var(--mb-card-gap);
}

.patrol-card__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.patrol-card__bar {
  margin-top: var(--space-sm);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
