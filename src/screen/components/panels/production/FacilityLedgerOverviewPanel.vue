<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchMgmtLedgerList, type MgmtLedgerCell } from '@/services/mgmtLedger';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 大屏「设施台账总览」：读取 5 个设施类通用台账域（储罐/罐区/装置/仓库/库区），
// 与后台管理端共用 mgmt-ledger 单一广播域；任一端（管理端/大屏/移动端）改写通用台账，
// 本面板按 mgmt-ledger.changed 自动重拉，实现跨端实时联动。仅 GET，零下行控制。
const FACILITY_DOMAINS = [
  { code: 'ef-tank', title: '储罐' },
  { code: 'ef-tankfarm', title: '罐区' },
  { code: 'ef-unit', title: '装置' },
  { code: 'ef-warehouse', title: '仓库' },
  { code: 'ef-warehouse-zone', title: '库区' },
] as const;

interface FacilitySection {
  code: string;
  title: string;
  total: number;
  rows: MgmtLedgerCell[][];
}

const loading = ref(false);
const error = ref(false);
const lastRefreshedAt = ref<Date | null>(null);
const sections = ref<FacilitySection[]>(
  FACILITY_DOMAINS.map((d) => ({ code: d.code, title: d.title, total: 0, rows: [] })),
);

function rowLabel(row: MgmtLedgerCell[]): string {
  return (
    row
      .slice(0, 2)
      .map((c) => c?.text)
      .filter((t): t is string => !!t && t.length > 0)
      .join(' · ') || '—'
  );
}

function formatTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 分页拉全量：单域可能超过单页上限（size=200），循环翻页直到取尽，避免静默截断。
// 上限保护最多 200 页，防止后端异常导致死循环。
async function fetchAllRows(domain: string): Promise<{ total: number; rows: MgmtLedgerCell[][] }> {
  const all: MgmtLedgerCell[][] = [];
  const size = 200;
  let page = 1;
  while (page <= 200) {
    const res = await fetchMgmtLedgerList(domain, { page, size });
    all.push(...res.rows);
    if (all.length >= res.total || res.rows.length < size) break;
    page += 1;
  }
  return { total: all.length, rows: all };
}

async function loadSection(d: { code: string }, index: number) {
  const { total, rows } = await fetchAllRows(d.code);
  return { index, total, rows };
}

async function load() {
  loading.value = true;
  error.value = false;
  try {
    const results = await Promise.all(
      FACILITY_DOMAINS.map((d, i) =>
        loadSection(d, i).catch(() => ({ index: i, total: 0, rows: [] as MgmtLedgerCell[][] })),
      ),
    );
    for (const r of results) {
      sections.value[r.index].total = r.total;
      sections.value[r.index].rows = r.rows;
    }
    lastRefreshedAt.value = new Date();
  } catch {
    // 暴露式降级：后端不可用保持上一帧，不白屏、不静默回落假数据
    error.value = true;
  } finally {
    loading.value = false;
  }
}

// 挂载即拉取 + 订阅 mgmt-ledger：管理端改设施台账后本面板自动刷新
useDomainAutoRefresh('mgmt-ledger', load, { immediate: true });
</script>

<template>
  <PanelCard title="设施台账总览" variant="devices" module="production" :show-more="false">
    <div class="facility-ledger">
      <div class="facility-ledger__status">
        <span v-if="loading" class="facility-ledger__loading">刷新中…</span>
        <span v-else-if="lastRefreshedAt" class="facility-ledger__updated">
          更新于 {{ formatTime(lastRefreshedAt) }}
        </span>
      </div>
      <div v-for="sec in sections" :key="sec.code" class="facility-ledger__sec">
        <div class="facility-ledger__head">
          <span class="facility-ledger__title">{{ sec.title }}</span>
          <span class="facility-ledger__count">{{ sec.total }}</span>
        </div>
        <div class="facility-ledger__rows">
          <div
            v-for="(row, i) in sec.rows"
            :key="i"
            class="facility-ledger__row"
            :title="rowLabel(row)"
          >
            {{ rowLabel(row) }}
          </div>
          <div v-if="!sec.rows.length" class="facility-ledger__empty">暂无数据</div>
        </div>
      </div>
      <div v-if="error" class="facility-ledger__error">数据获取失败，显示上一帧</div>
    </div>
  </PanelCard>
</template>

<style scoped>
.facility-ledger {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 6px;
}

.facility-ledger__status {
  flex-shrink: 0;
  height: 16px;
  font-size: 11px;
  line-height: 16px;
  color: rgb(150 170 190 / 80%);
}

.facility-ledger__loading {
  color: #4db8ff;
}

.facility-ledger__sec {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
}

.facility-ledger__head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  height: 28px;
  flex-shrink: 0;
  padding: 0 10px;
  box-sizing: border-box;
  border-bottom: 1px solid rgb(0 120 200 / 20%);
  color: var(--map-device-offline);
  font-size: 12px;
}

.facility-ledger__title {
  font-weight: 600;
}

.facility-ledger__count {
  color: #4db8ff;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}

.facility-ledger__rows {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 8px;
  box-sizing: border-box;
}

.facility-ledger__row {
  min-height: 22px;
  display: flex;
  align-items: center;
  color: #e8f2fc;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.facility-ledger__empty {
  color: rgb(150 170 190 / 70%);
  font-size: 12px;
  padding: 4px 2px;
}

.facility-ledger__error {
  flex-shrink: 0;
  color: #ffb74d;
  font-size: 11px;
  padding: 2px 4px;
}
</style>
