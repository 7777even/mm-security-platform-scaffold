<!--
  TyphoonRiskPointDetailDialog — 地图风险点详情（二级界面 riskPointDetail）
  深蓝 ScreenDialog 承载：风险点基础信息 + 关联语义位图（typhoon-flood-cctv-grid）。
  数据来自 useTyphoonInteraction 透传的 mapRiskPoint；不离开当前模块。
  零硬编码色：状态/色调仅取自 token；z-index 由 ScreenDialog 统一（--z-overlay）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import floodCctvGridUrl from '@/assets/map/semantic-scenes/typhoon-flood-cctv-grid.png';
import type { TyphoonMapRiskPoint } from '@/services/map-data/typhoonEmergencyMock';

const props = defineProps<{ point: TyphoonMapRiskPoint }>();
const emit = defineEmits<{ close: [] }>();

const statusClass = computed(() => `is-${props.point.status}`);
const coordText = computed(
  () => `${props.point.longitude.toFixed(5)}, ${props.point.latitude.toFixed(5)}`,
);
</script>

<template>
  <ScreenDialog :open="true" :title="point.name" icon="helmet" @close="emit('close')">
    <div class="rp">
      <div class="rp__head">
        <span class="rp__badge" :class="statusClass">{{ point.statusText }}</span>
        <span class="rp__unit">{{ point.responsibleUnit }}</span>
      </div>

      <dl class="rp__grid">
        <div class="rp__cell">
          <dt>风险状态</dt>
          <dd :class="statusClass">{{ point.statusText }}</dd>
        </div>
        <div class="rp__cell">
          <dt>预布置</dt>
          <dd>{{ point.predeployed ? '已布置' : '未布置' }}</dd>
        </div>
        <div class="rp__cell rp__cell--wide">
          <dt>布置情况</dt>
          <dd>{{ point.deployment }}</dd>
        </div>
        <div class="rp__cell rp__cell--wide">
          <dt>坐标</dt>
          <dd class="rp__coord">{{ coordText }}</dd>
        </div>
      </dl>

      <figure class="rp__shot">
        <img :src="floodCctvGridUrl" alt="风险点关联监控画面" />
        <figcaption>
          <PkgIcon name="helmet" size="14px" class="rp__cap-icon" />
          <span>关联监控 · 台风内涝防控点位（语义示意图）</span>
        </figcaption>
      </figure>

      <p class="rp__note">点击地图点位上的「视频监控」可查看该点位关联的实时视频墙。</p>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.rp {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.rp__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.rp__badge {
  padding: 3px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-helper);
  font-weight: 600;
  border: 1px solid transparent;
}

.rp__badge.is-normal {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-success) 45%, transparent);
}

.rp__badge.is-warning {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-warning) 45%, transparent);
}

.rp__badge.is-critical {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-danger) 45%, transparent);
}

.rp__unit {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.rp__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin: 0;
}

.rp__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.rp__cell--wide {
  grid-column: 1 / -1;
}

.rp__cell dt {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.rp__cell dd {
  margin: 0;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.rp__cell dd.is-normal {
  color: var(--color-success);
}

.rp__cell dd.is-warning {
  color: var(--color-warning);
}

.rp__cell dd.is-critical {
  color: var(--color-danger);
}

.rp__coord {
  font-family: var(--font-number);
}

.rp__shot {
  margin: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--panel-border);
  background: var(--panel-inner-bg);
}

.rp__shot img {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.rp__shot figcaption {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  border-top: 1px solid var(--panel-border);
}

.rp__cap-icon {
  color: var(--color-accent);
  flex: none;
}

.rp__note {
  margin: 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
