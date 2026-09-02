<script setup lang="ts">
import SharedCesiumMap from '../components/map/SharedCesiumMap.vue';
</script>

<template>
  <div class="map-dashboard-layout">
    <SharedCesiumMap class="map-dashboard-layout__cesium" />
    <div class="map-dashboard-layout__pages">
      <router-view />
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
