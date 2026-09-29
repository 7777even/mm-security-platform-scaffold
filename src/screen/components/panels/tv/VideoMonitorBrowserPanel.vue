<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PanelCard from '../../common/PanelCard.vue';
import { fetchTvMapPoints, type TvMapPoint } from '@/services/tv';
import { openTvVideoDetail } from '../../../lib/composables/useTvVideoDetail';

/** 防区分组中文标签（与 TvMapPoint.group 对齐）。 */
const GROUP_LABELS: Record<string, string> = {
  'high-ar': '高空AR',
  focus: '重点部位',
  hazard: '危险源',
  boundary: '厂界',
};

const router = useRouter();

const monitors = ref<TvMapPoint[]>([]);
const keyword = ref('');

async function loadMonitors() {
  try {
    monitors.value = await fetchTvMapPoints();
  } catch {
    monitors.value = [];
  }
}

onMounted(loadMonitors);

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return monitors.value;
  return monitors.value.filter(
    (m) => m.label.toLowerCase().includes(kw) || (m.group && GROUP_LABELS[m.group]?.includes(kw)),
  );
});

const grouped = computed(() => {
  const map: Record<string, TvMapPoint[]> = {};
  for (const m of filtered.value) {
    const g = m.group || 'other';
    (map[g] ??= []).push(m);
  }
  return Object.entries(map).map(([group, items]) => ({
    group,
    label: GROUP_LABELS[group] ?? group,
    items,
  }));
});

function pick(m: TvMapPoint) {
  openTvVideoDetail({ id: m.id, label: m.label });
}

/** 二级跳转：进入「设备/防区筛选 + 历史回放」平台；可带监控点位编码预选设备。 */
function goPlayback(code?: string) {
  if (code) {
    void router.push({ path: '/tv/playback', query: { monitor: code } });
  } else {
    void router.push('/tv/playback');
  }
}
</script>

<template>
  <PanelCard title="监控设备检索" variant="videoOverview" module="tv" :show-more="false">
    <div class="monitor-browser">
      <div class="monitor-browser__search-row">
        <input
          v-model="keyword"
          class="monitor-browser__search"
          type="text"
          placeholder="按名称/防区检索监控点"
          aria-label="检索监控点"
        />
        <button type="button" class="monitor-browser__replay-entry" @click="goPlayback()">
          历史回放 ›
        </button>
      </div>

      <div class="monitor-browser__list ar-scroll">
        <section v-for="g in grouped" :key="g.group" class="browser-group">
          <h4 class="browser-group__title">{{ g.label }}（{{ g.items.length }}）</h4>
          <button
            v-for="m in g.items"
            :key="m.id"
            type="button"
            class="browser-item"
            :class="{ 'browser-item--offline': !m.online }"
            :title="`查看 ${m.label} 详情与抓拍回放`"
            @click="pick(m)"
          >
            <span class="browser-item__dot" :class="{ 'browser-item__dot--off': !m.online }" />
            <span class="browser-item__name">{{ m.label }}</span>
            <span class="browser-item__code">{{ m.id }}</span>
            <span
              class="browser-item__replay"
              role="button"
              tabindex="0"
              title="进入该设备历史回放"
              @click.stop="goPlayback(m.id)"
              @keydown.enter.stop.prevent="goPlayback(m.id)"
              >回放</span
            >
          </button>
        </section>

        <p v-if="!grouped.length" class="browser-empty">无匹配监控点</p>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 10px 10px;
}

.monitor-browser {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 8px;
}

.monitor-browser__search-row {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
  align-items: center;
}

.monitor-browser__search {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 150 230 / 38%);
  border-radius: 3px;
  background: rgb(0 28 56 / 70%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  box-sizing: border-box;
  outline: none;
}

.monitor-browser__replay-entry {
  flex-shrink: 0;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 200 255 / 45%);
  border-radius: 3px;
  background: rgb(0 60 110 / 55%);
  color: #8fe3ff;
  font-size: 12px;
  font-family: var(--font-body);
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.monitor-browser__replay-entry:hover {
  border-color: rgb(0 220 255 / 80%);
  background: rgb(0 80 140 / 70%);
}

.monitor-browser__search:focus {
  border-color: rgb(0 200 255 / 70%);
}

.monitor-browser__search::placeholder {
  color: var(--color-text-muted);
}

.monitor-browser__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
}

.browser-group__title {
  margin: 0 0 5px;
  font-size: 12px;
  font-weight: 500;
  color: #7cdbff;
  border-left: 3px solid var(--color-accent);
  padding-left: 6px;
  line-height: 1.2;
}

.browser-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 30px;
  padding: 3px 8px;
  margin-bottom: 4px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 3px;
  background: linear-gradient(180deg, rgb(0 44 80 / 55%), rgb(0 26 54 / 50%));
  color: var(--color-text-strong);
  font-family: var(--font-body);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.browser-item:hover {
  border-color: rgb(0 200 255 / 60%);
  background: linear-gradient(180deg, rgb(0 60 110 / 70%), rgb(0 34 70 / 60%));
}

.browser-item--offline {
  opacity: 0.72;
}

.browser-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px rgb(61 214 140 / 60%);
}

.browser-item__dot--off {
  background: var(--color-text-muted);
  box-shadow: none;
}

.browser-item__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.browser-item__code {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 11px;
}

.browser-item__replay {
  flex-shrink: 0;
  padding: 2px 7px;
  border: 1px solid rgb(0 200 255 / 40%);
  border-radius: 3px;
  color: #8fe3ff;
  font-size: 11px;
  line-height: 1.4;
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.browser-item__replay:hover {
  border-color: rgb(0 220 255 / 80%);
  background: rgb(0 80 140 / 60%);
}

.browser-empty {
  margin: 0;
  padding: 16px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
