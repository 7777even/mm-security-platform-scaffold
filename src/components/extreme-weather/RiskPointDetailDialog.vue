<!--
  RiskPointDetailDialog — 极端天气风险点详情（二级界面 riskPointDetail）
  左：全部风险点列表（critical 优先排序，可点击切换）；右：选中点位详情。
  联动：查看现场监控 → openVideoWall；处置调度 → openDispatch（均走统一调度，关闭本层由分发层卸载）。
  数据：weatherRiskPoints（real shapes，派生自 TyphoonMapRiskPoint）。
  关闭 emit('close') → 分发层 ia.close() 卸载。
-->
<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { useExtremeWeatherInteraction } from '@/composables/useExtremeWeatherInteraction';
import {
  weatherRiskPoints,
  type WeatherRiskPoint,
  type WeatherMonitorStatus,
} from '@/services/map-data/extremeWeatherPanelMock';

const props = defineProps<{ point?: WeatherRiskPoint }>();
const emit = defineEmits<{ close: [] }>();

const ia = useExtremeWeatherInteraction();

// critical 优先，便于"查看全部"默认聚焦最高风险点
const ordered = computed(() =>
  [...weatherRiskPoints].sort((a, b) => rank(a.status) - rank(b.status)),
);
function rank(s: WeatherMonitorStatus): number {
  return s === 'critical' ? 0 : s === 'warning' ? 1 : 2;
}

const selectedId = ref<string>(props.point?.id ?? ordered.value[0]?.id ?? '');
const selected = computed(
  () => ordered.value.find((p) => p.id === selectedId.value) ?? ordered.value[0],
);

function statusToken(s: WeatherMonitorStatus): string {
  if (s === 'critical') return 'var(--color-danger)';
  if (s === 'warning') return 'var(--color-warning)';
  return 'var(--color-accent)';
}
function statusLabel(s: WeatherMonitorStatus): string {
  return s === 'critical' ? '超限' : s === 'warning' ? '预警' : '正常';
}

function openVideo(): void {
  ia.openVideoWall();
}
function openDispatch(): void {
  if (selected.value) ia.openDispatch(selected.value);
}
</script>

<template>
  <ScreenDialog :open="true" title="极端天气风险点" icon="bell-ringing" @close="emit('close')">
    <div class="risk">
      <aside class="risk__list">
        <h4 class="risk__list-title">风险点清单（{{ ordered.length }}）</h4>
        <button
          v-for="p in ordered"
          :key="p.id"
          type="button"
          :class="['risk__item', { 'risk__item--active': p.id === selectedId }]"
          @click="selectedId = p.id"
        >
          <span
            class="risk__dot"
            :style="{ background: statusToken(p.status) }"
            aria-hidden="true"
          />
          <span class="risk__item-name">{{ p.title }}</span>
          <span class="risk__item-status" :style="{ color: statusToken(p.status) }">{{
            statusLabel(p.status)
          }}</span>
        </button>
      </aside>

      <section v-if="selected" class="risk__detail">
        <header class="risk__head">
          <span class="risk__title">{{ selected.title }}</span>
          <span
            class="risk__badge"
            :style="{
              color: statusToken(selected.status),
              borderColor: `color-mix(in srgb, ${statusToken(selected.status)} 55%, transparent)`,
              background: `color-mix(in srgb, ${statusToken(selected.status)} 14%, transparent)`,
            }"
            >{{ selected.statusText }}</span
          >
        </header>

        <dl class="risk__meta">
          <div class="risk__row">
            <dt>责任单位</dt>
            <dd>{{ selected.responsibleUnit }}</dd>
          </div>
          <div class="risk__row">
            <dt>处置部署</dt>
            <dd>{{ selected.deployment }}</dd>
          </div>
          <div class="risk__row">
            <dt>预置状态</dt>
            <dd>{{ selected.predeployed ? '已预置' : '未预置' }}</dd>
          </div>
          <div class="risk__row">
            <dt>坐标</dt>
            <dd>{{ selected.latitude.toFixed(4) }}, {{ selected.longitude.toFixed(4) }}</dd>
          </div>
        </dl>

        <div class="risk__actions">
          <button type="button" class="risk__btn" @click="openVideo">查看现场监控</button>
          <button type="button" class="risk__btn risk__btn--primary" @click="openDispatch">
            处置调度
          </button>
        </div>
      </section>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.risk {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-md);
  height: 100%;
}

.risk__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  padding-right: var(--space-sm);
}

.risk__list-title {
  margin: 0 0 4px;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.risk__item {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  cursor: pointer;
  text-align: left;
}

.risk__item--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.risk__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.risk__item-status {
  font-size: var(--font-size-caption);
}

.risk__detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 0;
}

.risk__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.risk__title {
  font-size: var(--font-size-h3, 18px);
  font-weight: 700;
  color: var(--color-text-strong);
}

.risk__badge {
  font-size: var(--font-size-helper);
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.risk__meta {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.risk__row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  align-items: baseline;
}

.risk__row dt {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.risk__row dd {
  margin: 0;
  font-size: var(--font-size-biz);
  color: var(--color-text);
  line-height: 1.6;
}

.risk__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
}

.risk__btn {
  height: 36px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.risk__btn:hover {
  border-color: var(--color-accent);
}

.risk__btn--primary {
  border: none;
  color: #fff;
  background: var(--btn-bg-primary);
  font-weight: 600;
}

.risk__btn--primary:hover {
  filter: brightness(1.08);
}
</style>
