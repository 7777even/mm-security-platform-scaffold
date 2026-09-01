<!--
  ProductionAreaFacilityDetailDialog — 设施详情（二级界面 facilityDetail）
  展示：设施基础信息（名称/编号/设备总数）+ 分区列表（含告警数，按 token 着色）+ 设备分类指标 + 区域实景位图。
  位图使用语义场景图（src/assets/map/semantic-scenes），按 facilityId 取图，不用脚手架图标。
  数据消费 resolveProductionAreaDetail / resolveFacilityItem。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import {
  resolveProductionAreaDetail,
  resolveFacilityItem,
} from '@/services/map-data/productionAreaMock';
import productionGasLeak from '@/assets/map/semantic-scenes/production-gas-leak.png';
import productionPersonGathering from '@/assets/map/semantic-scenes/production-person-gathering.png';
import productionPersonFall from '@/assets/map/semantic-scenes/production-person-fall.png';
import productionUnauthorizedEntry from '@/assets/map/semantic-scenes/production-unauthorized-entry.png';

const props = defineProps<{ facilityId?: number | string }>();
const emit = defineEmits<{ close: [] }>();

const detail = computed(() => resolveProductionAreaDetail(props.facilityId));
const facility = computed(() => resolveFacilityItem(props.facilityId));

// 区域实景位图：语义场景图，按 facilityId 取图（缺失则回退首图）
const sceneBitmaps = [
  productionGasLeak,
  productionPersonGathering,
  productionPersonFall,
  productionUnauthorizedEntry,
];
const bitmap = computed(() => {
  const idx = Number(props.facilityId);
  const i = Number.isFinite(idx) ? Math.abs(Math.trunc(idx)) % sceneBitmaps.length : 0;
  return sceneBitmaps[i] ?? sceneBitmaps[0];
});

function zoneTone(count: number): 'has-alarm' | 'safe' {
  return count > 0 ? 'has-alarm' : 'safe';
}
</script>

<template>
  <ScreenDialog :open="true" title="设施详情" icon="gas" @close="emit('close')">
    <div class="facility">
      <header class="facility__info">
        <PkgIcon name="gas" size="22px" class="facility__info-icon" />
        <div class="facility__info-main">
          <div class="facility__name">{{ facility.name }}</div>
          <div class="facility__sub">
            <span>设施编号 {{ facility.id }}</span>
            <span class="facility__dot">·</span>
            <span>设备总数 {{ facility.count }}</span>
          </div>
        </div>
      </header>

      <section class="facility__block">
        <h4 class="facility__block-title">分区态势</h4>
        <ul class="zones">
          <li
            v-for="zone in detail.zones"
            :key="zone.id"
            class="zone"
            :class="`zone--${zoneTone(zone.alarmCount)}`"
          >
            <span class="zone__name">{{ zone.name }}</span>
            <span class="zone__count">
              {{ zone.alarmCount > 0 ? `${zone.alarmCount} 项告警` : '正常' }}
            </span>
          </li>
        </ul>
      </section>

      <section class="facility__block">
        <h4 class="facility__block-title">设备分类</h4>
        <div class="metrics">
          <div v-for="metric in detail.metrics" :key="metric.id" class="metric">
            <span class="metric__label">{{ metric.label }}</span>
            <span class="metric__value">{{ metric.value }}</span>
          </div>
        </div>
      </section>

      <section class="facility__block">
        <h4 class="facility__block-title">区域实景</h4>
        <div
          class="facility__bitmap"
          :style="{ backgroundImage: `url(${bitmap})` }"
          aria-hidden="true"
        />
      </section>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.facility {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
  min-height: 0;
}

.facility__info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.facility__info-icon {
  color: var(--color-accent);
}

.facility__name {
  font-size: var(--font-size-h3, 18px);
  font-weight: 700;
  color: var(--color-text-strong);
}

.facility__sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.facility__dot {
  opacity: 0.6;
}

.facility__block-title {
  margin: 0 0 8px;
  font-size: var(--font-size-biz);
  font-weight: 600;
  color: var(--color-text-strong);
}

.zones {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.zone--has-alarm {
  border-color: color-mix(in srgb, var(--color-warning) 55%, transparent);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
}

.zone__name {
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.zone--has-alarm .zone__count {
  color: var(--color-warning);
}

.zone__count {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.metric__label {
  font-size: var(--font-size-helper);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric__value {
  font-family: var(--font-number);
  font-size: var(--font-size-biz);
  font-weight: 600;
  color: var(--color-accent);
}

.facility__bitmap {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
