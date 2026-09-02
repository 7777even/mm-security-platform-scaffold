<script setup lang="ts">
import {
  closeMapLayerPanel,
  mapLayerPanelOpen,
  mapLayerTree,
  mapLayerWireframe,
  setAllLayers,
  toggleMapLayerGroup,
  toggleMapLayerNode,
  toggleMapLayerWireframe,
  type MapLayerNode,
} from '../../lib/composables/useMapLayerPanel';
import { getSharedMap } from '../../lib/composables/sharedCesiumBridge';

function onWireframeChange() {
  toggleMapLayerWireframe();
  const map = getSharedMap();
  if (!map?.plantWireframeEnabled) return;
  map.plantWireframeEnabled.value = mapLayerWireframe.value;
  map.applyPlantWireframeEnabled?.();
}

function rowClass(node: MapLayerNode) {
  return {
    'map-layer-panel__row--active': node.visible,
  };
}
</script>

<template>
  <aside v-if="mapLayerPanelOpen" class="map-layer-panel" aria-label="图层控制">
    <header class="map-layer-panel__header">
      <span class="map-layer-panel__collapse" aria-hidden="true">▾</span>
      <span class="map-layer-panel__root">消防资源</span>
      <button type="button" class="map-layer-panel__close" @click="closeMapLayerPanel">×</button>
    </header>

    <div class="map-layer-panel__wireframe">
      <label class="map-layer-panel__leaf">
        <input
          type="checkbox"
          class="map-layer-panel__checkbox"
          :checked="mapLayerWireframe"
          @change="onWireframeChange"
        />
        <span>装置线框</span>
      </label>
    </div>

    <ul class="map-layer-panel__list">
      <li v-for="node in mapLayerTree" :key="node.key" class="map-layer-panel__item">
        <template v-if="node.children">
          <button
            type="button"
            class="map-layer-panel__group"
            :class="{ 'map-layer-panel__group--expanded': node.expanded }"
            @click="toggleMapLayerGroup(node)"
          >
            <span class="map-layer-panel__arrow" aria-hidden="true">▶</span>
            <span class="map-layer-panel__icon" aria-hidden="true">▤</span>
            <span class="map-layer-panel__label">{{ node.label }}</span>
          </button>
          <ul v-if="node.expanded" class="map-layer-panel__children">
            <li v-for="child in node.children" :key="child.key">
              <label class="map-layer-panel__leaf" :class="rowClass(child)">
                <input
                  type="checkbox"
                  class="map-layer-panel__checkbox"
                  :checked="child.visible"
                  @change="toggleMapLayerNode(child)"
                />
                <span class="map-layer-panel__icon" aria-hidden="true">▤</span>
                <span class="map-layer-panel__label">{{ child.label }}</span>
              </label>
            </li>
          </ul>
        </template>
        <template v-else>
          <label class="map-layer-panel__leaf" :class="rowClass(node)">
            <input
              type="checkbox"
              class="map-layer-panel__checkbox"
              :checked="node.visible"
              @change="toggleMapLayerNode(node)"
            />
            <span class="map-layer-panel__icon" aria-hidden="true">▤</span>
            <span class="map-layer-panel__label">{{ node.label }}</span>
          </label>
        </template>
      </li>
    </ul>

    <footer class="map-layer-panel__footer">
      <button type="button" class="map-layer-panel__action" @click="setAllLayers(true)">
        全选
      </button>
      <button type="button" class="map-layer-panel__action" @click="setAllLayers(false)">
        清空
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.map-layer-panel {
  position: absolute;
  right: calc(100% + 8px);
  top: 0;
  z-index: var(--z-overlay);
  width: 320px;
  max-height: calc(100vh - var(--header-height) - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--map-layer-border);
  border-radius: 4px;
  background: var(--color-text-strong);
  box-shadow: 0 10px 28px var(--map-layer-shadow);
  pointer-events: auto;
  font-size: 13px;
}

.map-layer-panel__header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 10px;
  border-bottom: 1px solid var(--map-layer-divider);
}

.map-layer-panel__collapse {
  color: #2c3e50;
  font-size: 12px;
}

.map-layer-panel__root {
  color: var(--map-layer-text);
  font-weight: 600;
}

.map-layer-panel__close {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6b7a8d;
  font-size: 18px;
  cursor: pointer;
}

.map-layer-panel__wireframe {
  flex-shrink: 0;
  padding: 6px 10px;
  border-bottom: 1px dashed var(--map-layer-divider);
}

.map-layer-panel__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 4px 0 8px;
  overflow: auto;
  list-style: none;
}

.map-layer-panel__item {
  padding: 0 6px;
}

.map-layer-panel__group,
.map-layer-panel__leaf {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 30px;
  padding: 0 6px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #333;
  font-size: 13px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}

.map-layer-panel__group:hover,
.map-layer-panel__leaf:hover {
  background: var(--map-layer-hover-bg);
}

.map-layer-panel__group--expanded .map-layer-panel__arrow {
  transform: rotate(90deg);
}

.map-layer-panel__arrow {
  width: 12px;
  flex-shrink: 0;
  color: var(--map-layer-text-muted);
  font-size: 10px;
  transition: transform 0.18s ease;
}

.map-layer-panel__icon {
  flex-shrink: 0;
  color: var(--map-layer-text-muted);
  font-size: 12px;
}

.map-layer-panel__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-layer-panel__children {
  margin: 0;
  padding: 0 0 2px 22px;
  list-style: none;
}

.map-layer-panel__children .map-layer-panel__leaf {
  min-height: 28px;
}

.map-layer-panel__row--active {
  background: var(--map-layer-active-bg);
}

.map-layer-panel__row--active .map-layer-panel__label {
  color: var(--map-layer-active-fg);
  font-weight: 600;
}

.map-layer-panel__checkbox {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  accent-color: var(--map-layer-active-fg);
  cursor: pointer;
}

.map-layer-panel__footer {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  padding: 8px 10px;
  border-top: 1px solid var(--map-layer-divider);
}

.map-layer-panel__action {
  flex: 1;
  height: 26px;
  border: 1px solid #b8cfe8;
  border-radius: 3px;
  background: #f4f8fd;
  color: var(--map-layer-action-fg);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.map-layer-panel__action:hover {
  border-color: var(--map-layer-border);
  background: var(--map-layer-active-bg);
}
</style>
