<!--
  HazardSourceDialog — 危险源清单（安全防恐 hazardSource，告警列表「危险源」）
  列出重大危险源（majorHazardMock.majorHazards）：等级徽标 + 名称 + 企业 + 类别 + 监测/视频点数。
  图标：压缩包 fire-situation 图标（PkgIcon，confined-space=危险源/有限空间）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { majorHazards } from '@/services/map-data/majorHazardMock';
import type { HazardLevel } from '@/services/map-data/majorHazardMock';

const emit = defineEmits<{ close: [] }>();

const levelColor: Record<HazardLevel, string> = {
  一级: 'var(--color-danger)',
  二级: 'var(--color-warning)',
  三级: 'var(--color-accent)',
  四级: 'var(--color-success)',
};

function tone(l: HazardLevel): string {
  return levelColor[l] ?? 'var(--color-text-muted)';
}
</script>

<template>
  <ScreenDialog :open="true" title="危险源清单" icon="confined-space" @close="emit('close')">
    <ul class="list">
      <li v-for="h in majorHazards" :key="h.id" class="item">
        <PkgIcon name="confined-space" size="18px" class="item__icon" />
        <div class="item__body">
          <div class="item__head">
            <span class="item__name">{{ h.name }}</span>
            <span
              class="item__level"
              :style="{
                color: tone(h.level),
                background: `color-mix(in srgb, ${tone(h.level)} 14%, transparent)`,
                borderColor: `color-mix(in srgb, ${tone(h.level)} 45%, transparent)`,
              }"
              >{{ h.level }}</span
            >
          </div>
          <div class="item__meta">
            {{ h.enterprise }} · {{ h.category }} · 监测 {{ h.monitorCount }} / 视频
            {{ h.videoCount }}
          </div>
        </div>
        <span class="item__code">{{ h.code }}</span>
      </li>
    </ul>
  </ScreenDialog>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 560px;
  overflow: auto;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.item__icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.item__body {
  flex: 1;
  min-width: 0;
}

.item__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.item__name {
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  color: var(--color-text-strong);
}

.item__level {
  font-size: var(--font-size-date);
  padding: 1px 8px;
  border-radius: var(--radius-xs);
  border: 1px solid;
  flex-shrink: 0;
}

.item__meta {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.item__code {
  font-family: var(--font-number);
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  flex-shrink: 0;
}
</style>
