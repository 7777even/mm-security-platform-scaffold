<!--
  ProductionAreaPersonnelDialog — 区域人员详情（二级界面 personnel）
  展示：在岗总人数 + 人员构成切片（本厂/承包商/访客）条形可视化（颜色取自 mock 数据映射，非硬编码 CSS 色）。
  数据由面板透传（total + slices），与 ProductionAreaPersonnelPanel 同源。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import type { ProductionPersonnelPayload } from '@/composables/useProductionAreaInteraction';

const props = defineProps<{ payload?: ProductionPersonnelPayload }>();
const emit = defineEmits<{ close: [] }>();

const total = computed(() => props.payload?.total ?? 0);
const slices = computed(() => props.payload?.slices ?? []);
const maxValue = computed(() => Math.max(1, ...slices.value.map((s) => s.value)));
</script>

<template>
  <ScreenDialog :open="true" title="区域人员详情" icon="helmet" @close="emit('close')">
    <div class="personnel">
      <div class="personnel__total">
        <span class="personnel__total-value">{{ total }}</span>
        <span class="personnel__total-label">在岗总人数（人）</span>
      </div>

      <ul class="slices">
        <li v-for="slice in slices" :key="slice.name" class="slice">
          <div class="slice__head">
            <span class="slice__dot" :style="{ background: slice.color }" />
            <span class="slice__name">{{ slice.name }}</span>
            <span class="slice__value">{{ slice.value }}</span>
          </div>
          <div class="slice__track">
            <span
              class="slice__bar"
              :style="{ width: `${(slice.value / maxValue) * 100}%`, background: slice.color }"
            />
          </div>
        </li>
      </ul>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.personnel {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg, 18px);
  height: 100%;
  min-height: 0;
}

.personnel__total {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.personnel__total-value {
  font-family: var(--font-number);
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-accent);
  text-shadow: 0 0 12px color-mix(in srgb, var(--color-accent) 35%, transparent);
}

.personnel__total-label {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.slices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.slice__head {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.slice__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.slice__name {
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.slice__value {
  font-family: var(--font-number);
  font-size: var(--font-size-biz);
  font-weight: 600;
  color: var(--color-text);
}

.slice__track {
  height: 10px;
  border-radius: 999px;
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  overflow: hidden;
}

.slice__bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
</style>
