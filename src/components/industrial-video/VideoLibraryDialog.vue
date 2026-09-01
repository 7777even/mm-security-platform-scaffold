<!--
  VideoLibraryDialog — 视频库（工业电视 videoLibrary）
  列出重要视频监控点（tvMock.importantVideos），点击单条进入监控点详情。
  图标：压缩包 fire-situation 图标（PkgIcon，ladder=监控设备）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { importantVideos } from '@/services/map-data/tvMock';
import { useIndustrialVideoInteraction } from '@/composables/useIndustrialVideoInteraction';

const emit = defineEmits<{ close: [] }>();
const ia = useIndustrialVideoInteraction();

function openCam(label: string): void {
  ia.openVideoMonitor({ label });
}
</script>

<template>
  <ScreenDialog :open="true" title="视频库" icon="ladder" @close="emit('close')">
    <ul class="lib">
      <li v-for="v in importantVideos" :key="v.id" class="lib__item" @click="openCam(v.label)">
        <PkgIcon name="ladder" size="18px" class="lib__icon" />
        <span class="lib__label">{{ v.label }}</span>
        <span :class="['lib__status', v.online ? 'is-on' : 'is-off']">
          {{ v.online ? '在线' : '离线' }}
        </span>
        <span class="lib__arrow">›</span>
      </li>
    </ul>
  </ScreenDialog>
</template>

<style scoped>
.lib {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.lib__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.lib__item:hover {
  background: var(--color-accent-faint);
  border-color: var(--color-accent-glow);
}

.lib__icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.lib__label {
  flex: 1;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.lib__status {
  font-size: var(--font-size-helper);
}

.lib__status.is-on {
  color: var(--color-success);
}

.lib__status.is-off {
  color: var(--color-danger);
}

.lib__arrow {
  color: var(--color-text-muted);
}
</style>
