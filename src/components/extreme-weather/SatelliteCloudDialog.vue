<!--
  SatelliteCloudDialog — 卫星云图 / 台风路径（二级界面 satelliteCloud）
  真实位图：src/assets/map/semantic-scenes/typhoon-flood-cctv-grid.png（压缩包语义场景图，台风/洪涝 CCTV 拼图）。
  数据来源语义参考 useSatelliteCloudMap（日本气象厅葵花卫星 · 降雨雷达）。
  联动：查看现场监控 → openVideoWall。
  关闭 emit('close') → 分发层 ia.close() 卸载。
  零硬编码色：仅 token / currentColor（内联 SVG 台风螺旋用 currentColor，由父级 color 决定）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { useExtremeWeatherInteraction } from '@/composables/useExtremeWeatherInteraction';
import typhoonFloodCctvGrid from '@/assets/map/semantic-scenes/typhoon-flood-cctv-grid.png';

const emit = defineEmits<{ close: [] }>();
const ia = useExtremeWeatherInteraction();

function openVideo(): void {
  ia.openVideoWall();
}
</script>

<template>
  <ScreenDialog :open="true" title="卫星云图 / 台风路径" @close="emit('close')">
    <div class="sat">
      <div class="sat__stage">
        <img class="sat__img" :src="typhoonFloodCctvGrid" alt="台风路径与云图实况" />
        <!-- 内联 SVG 台风螺旋（currentColor，由父级 color token 着色，不引入 emoji） -->
        <span class="sat__spiral" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M24 24 m0 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0 a12 12 0 1 1 -24 0"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="sat__scan" aria-hidden="true" />
      </div>

      <div class="sat__bar">
        <div class="sat__src">
          <span class="sat__src-dot" />
          数据源：日本气象厅葵花卫星 · 降雨雷达（实况拼图）
        </div>
        <button type="button" class="sat__btn" @click="openVideo">查看现场监控</button>
      </div>

      <p class="sat__tip">
        台风路径与云系实况由气象局数据源接入，叠加厂区防洪排涝力量布置图。点击「查看现场监控」可轮巡低洼点位视频。
      </p>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.sat {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.sat__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-panel) 70%, transparent);
}

.sat__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 台风螺旋角标：currentColor 由下方 color 决定（token） */
.sat__spiral {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 44px;
  height: 44px;
  color: var(--color-accent);
  filter: drop-shadow(0 0 10px var(--color-accent-glow));
}

.sat__spiral svg {
  width: 100%;
  height: 100%;
}

/* 扫描线（纯 CSS） */
.sat__scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    color-mix(in srgb, var(--color-accent) 8%, transparent) 0,
    color-mix(in srgb, var(--color-accent) 8%, transparent) 1px,
    transparent 1px,
    transparent 4px
  );
  pointer-events: none;
}

.sat__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.sat__src {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.sat__src-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent-glow);
}

.sat__btn {
  height: 34px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.sat__btn:hover {
  border-color: var(--color-accent);
}

.sat__tip {
  margin: 0;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
