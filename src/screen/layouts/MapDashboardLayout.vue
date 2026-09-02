<script setup lang="ts">
import SharedCesiumMap from '../components/map/SharedCesiumMap.vue';
</script>

<template>
  <!-- wujie 子应用以 default slot 注入视图（如 SectorEmergencyCommand）；
       SharedCesiumMap 维持单一中央 Cesium 背景，slot 内容叠加在地图之上。
       原 <router-view /> 改为 <slot />：子应用无独立路由树，路由决策在主壳完成；
       旧 6 子应用（dashboard/extreme-weather 等）不直接挂载此布局，不受影响。 -->
  <div class="map-dashboard-layout">
    <SharedCesiumMap class="map-dashboard-layout__cesium" />
    <div class="map-dashboard-layout__pages">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.map-dashboard-layout {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

.map-dashboard-layout__cesium {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
}

.map-dashboard-layout__pages {
  position: absolute;
  inset: 0;
  z-index: var(--z-chrome);
  pointer-events: none;
}
</style>
