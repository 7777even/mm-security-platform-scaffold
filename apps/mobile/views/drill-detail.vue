<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { fetchDrillDetail, type DrillDetail } from '@/services/drill';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 演练详情（详情页模板，docs/UI规范-移动端.md §5）
// 数据源：后端 /api/v1/drills/{id}（演练详情，含任务子项），经 fetchDrillDetail 拉取。
// 取消原 data/mock.ts 静态数据；未连后端 / 未命中走空态 + 全局离线告警（不回灌假数据）。
// - 只读字段用 .mb-detail 分组卡；任务级「确认接收」用白底描边次按钮。

const route = useRoute();
const loading = ref(false);
const drill = ref<DrillDetail | null>(null);
const feedback = ref('');

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

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('drills', '/drills/{id}');
      drill.value = null;
      return;
    }
    drill.value = await fetchDrillDetail(String(route.params.id));
  } catch {
    drill.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="演练详情" back-to="/drills" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!drill" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该演练</p>
    </div>

    <template v-else>
      <div class="mb-stack">
        <div class="mb-card">
          <div class="mb-card__title">
            <span>{{ drill.name }}</span>
            <span class="tag" :class="STATUS_TAG[drill.status] ?? 'tag--info'">{{
              drill.status
            }}</span>
          </div>
          <p class="mb-card__desc">{{ drill.drillCode }}</p>
        </div>

        <div class="mb-detail">
          <div class="mb-detail__row">
            <span class="mb-detail__label">类型 / 形式</span>
            <span class="mb-detail__value">{{ drill.drillType }} · {{ drill.form }}</span>
          </div>
          <div class="mb-detail__row">
            <span class="mb-detail__label">时间 / 地点</span>
            <span class="mb-detail__value">{{ drill.timeRange }} · {{ drill.place }}</span>
          </div>
          <div class="mb-detail__row">
            <span class="mb-detail__label">参与部门</span>
            <span class="mb-detail__value">{{ drill.departments || '—' }}</span>
          </div>
        </div>
      </div>

      <section class="mb-section drill__section">
        <div class="mb-section__head">
          <span class="mb-section__title">我的演练任务</span>
        </div>
        <div v-if="drill.tasks?.length" class="mb-stack">
          <div v-for="(t, i) in drill.tasks" :key="i" class="mb-card">
            <div class="mb-card__title">
              <span>{{ t.name }}</span>
              <span class="tag" :class="TASK_STATUS_TAG[t.status] ?? 'tag--info'">{{
                t.status
              }}</span>
            </div>
            <button
              v-if="t.status === '待确认'"
              type="button"
              class="mb-btn-ghost mb-btn-sm task__confirm"
            >
              确认接收
            </button>
          </div>
        </div>
        <div v-else class="mb-empty">
          <div class="mb-empty__art" />
          <p class="mb-empty__text">暂无演练任务</p>
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
    </template>
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

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
