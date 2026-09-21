<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useMapSearch, type SearchableMapMarker } from '../../lib/composables/useMapSearchRegistry';

const { query, results, select, mapSearchOpen, closeMapSearchPanel } = useMapSearch();

const inputEl = ref<HTMLInputElement | null>(null);

watch(mapSearchOpen, async (open) => {
  if (open) {
    await nextTick();
    inputEl.value?.focus();
  }
});

function onSelect(marker: SearchableMapMarker) {
  select(marker);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMapSearchPanel();
}
</script>

<template>
  <div v-if="mapSearchOpen" class="map-search-panel" role="dialog" aria-label="地图点位搜索">
    <div class="map-search-panel__head">
      <span class="map-search-panel__icon" aria-hidden="true">⌕</span>
      <input
        ref="inputEl"
        v-model="query"
        class="map-search-panel__input"
        type="text"
        placeholder="搜索当前页点位名称 / 类型"
        aria-label="搜索点位"
        @keydown="onKeydown"
      />
      <button
        type="button"
        class="map-search-panel__close"
        aria-label="关闭搜索"
        @click="closeMapSearchPanel"
      >
        ×
      </button>
    </div>

    <div class="map-search-panel__meta">当前页可搜点位：{{ results.length }}</div>

    <ul v-if="results.length" class="map-search-panel__list">
      <li v-for="marker in results" :key="marker.id" class="map-search-panel__item">
        <button type="button" class="map-search-panel__row" @click="onSelect(marker)">
          <span class="map-search-panel__type">{{ marker.type }}</span>
          <span class="map-search-panel__name" :title="marker.name">{{ marker.name }}</span>
        </button>
      </li>
    </ul>

    <div v-else-if="query.trim()" class="map-search-panel__empty">无匹配点位</div>
    <div v-else class="map-search-panel__empty">当前页暂无可搜点位</div>
  </div>
</template>

<style scoped>
.map-search-panel {
  position: absolute;

  /* 左侧栏下方：与常驻「厂区范围」选择器（top: header+66、高 34）错开，避免遮挡 */
  top: calc(var(--header-height) + 110px);
  left: calc(var(--sidebar-width) + 28px);
  z-index: var(--z-overlay);
  width: 260px;
  max-height: 52vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  border-radius: 4px;
  background: var(--glass-bg);
  box-shadow: 0 10px 28px var(--map-layer-shadow);
  pointer-events: auto;
  font-size: 13px;
  color: var(--color-text);
}

.map-search-panel__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
}

.map-search-panel__icon {
  color: var(--color-text-muted);
  font-size: 15px;
}

.map-search-panel__input {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 6px;
  border: 1px solid var(--btn-border);
  border-radius: 3px;
  background: var(--input-bg, rgb(0 0 0 / 20%));
  color: var(--color-text);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.map-search-panel__input:focus {
  border-color: var(--color-accent);
}

.map-search-panel__close {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
}

.map-search-panel__meta {
  padding: 4px 10px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.map-search-panel__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: auto;
  list-style: none;
}

.map-search-panel__row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 30px;
  padding: 0 10px;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}

.map-search-panel__row:hover {
  background: var(--row-alt-bg);
}

.map-search-panel__type {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 2px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 11px;
  white-space: nowrap;
}

.map-search-panel__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-search-panel__empty {
  padding: 12px 10px;
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
