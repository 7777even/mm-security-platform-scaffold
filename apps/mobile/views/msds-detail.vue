<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { fetchMsdsDetail, type MsdsDetail } from '@/services/msds';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// MSDS 详情（详情页模板，docs/UI规范-移动端.md §5 / §5.1）
// 数据源：后端 /api/v1/msds/{cas}（化学品 MSDS 详情），经 fetchMsdsDetail 拉取。
// 取消原 data/mock.ts 静态数据；未连后端 / 未命中走空态 + 全局离线告警（不回灌假数据）。
// - 多字段只读详情统一收进 .mb-detail 分组卡（标签左 / 值右），行高 48。
// - 主操作「离线缓存」唯一（§4 一屏一个主按钮）。

const route = useRoute();
const loading = ref(false);
const m = ref<MsdsDetail | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('msds', '/msds/{cas}');
      m.value = null;
      return;
    }
    m.value = await fetchMsdsDetail(String(route.params.cas));
  } catch {
    m.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="MSDS 详情" back-to="/msds" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!m" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该化学品 MSDS</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">名称 / CAS</span>
          <span class="mb-detail__value">{{ m.name }} · {{ m.cas }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">危险性分类</span>
          <span class="mb-detail__value">{{ m.classification || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">物理状态 / 沸点 / 闪点</span>
          <span class="mb-detail__value"
            >{{ m.state }} · {{ m.boilingPoint }} · {{ m.flashPoint }}</span
          >
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">爆炸极限</span>
          <span class="mb-detail__value">{{ m.explosionLimit }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">储存要求</span>
          <span class="mb-detail__value">{{ m.storage || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">安全措施</span>
          <span class="mb-detail__value">{{ m.safety || '—' }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">应急处置</span>
          <span class="mb-detail__value">{{ m.emergency || '—' }}</span>
        </div>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">离线缓存</button>
    </div>
  </div>
</template>

<style scoped>
.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
