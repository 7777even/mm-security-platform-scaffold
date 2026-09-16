<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchSpecialOperations, type SpecialOperationItem } from '@/services/specialOperation';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

/**
 * 操作票执行（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/special-operations（特殊作业票），取首条作为当前执行票。
 * 取消原 data/mock.ts 静态数据；未连后端走空态 + 全局离线告警（不回灌假数据）。
 * - 票头信息取自后端作业票；作业步骤后端暂无对应端点，暂以占位步骤渲染（标注待接入）。
 */
interface ExecStep {
  name: string;
  tip: string;
  done: boolean;
  cur: boolean;
}

interface TicketHead {
  name: string;
  grade: string;
  st: string;
}

const loading = ref(false);
const ticket = ref<TicketHead | null>(null);

// TODO(后端接续)：作业票步骤/唱票明细暂无端点，步骤为占位；补端点后改为真实数据源。
const TOTAL_STEPS = 12;
const CURRENT_STEP = 3;

const steps: ExecStep[] = [
  { name: '确认隔离阀关闭', tip: '已确认 · 签字完成', done: true, cur: false },
  { name: '确认盲板位置', tip: '已确认 · 照片已上传', done: true, cur: false },
  { name: '切换泵组运行状态', tip: '当前步骤 · 请唱票确认', done: false, cur: true },
  { name: '核对出口压力', tip: '待执行', done: false, cur: false },
];

function toHead(o: SpecialOperationItem): TicketHead {
  return {
    name: o.content || `${o.area} · ${o.type}`,
    grade: o.level,
    st: o.status,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('special-operation', '/special-operations');
      ticket.value = null;
      return;
    }
    const page = await fetchSpecialOperations({ page: 1, size: 1 });
    const first = page.list?.[0];
    ticket.value = first ? toHead(first) : null;
  } catch {
    ticket.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page mb-page--bar">
    <MobileHeader variant="back" title="操作票执行" back-to="/tickets" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!ticket" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">暂无执行中的操作票</p>
    </div>

    <div v-else class="mb-stack">
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

    <div v-if="ticket" class="mb-safe-bar">
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

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
