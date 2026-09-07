<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchWorkstations, type Workstation } from '@/services/dashboard';

const loading = ref(true);
const failed = ref(false);
const workstations = ref<Workstation[]>([]);

const onlineCount = computed(() => workstations.value.filter((w) => w.online).length);

// 按区域分组，组内保持后端返回顺序
const grouped = computed(() => {
  const map = new Map<string, Workstation[]>();
  for (const ws of workstations.value) {
    const list = map.get(ws.zone) ?? [];
    list.push(ws);
    map.set(ws.zone, list);
  }
  return Array.from(map.entries()).map(([zone, items]) => ({ zone, items }));
});

onMounted(async () => {
  try {
    workstations.value = await fetchWorkstations();
    failed.value = false;
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="值守工位" variant="facilities" module="production" :show-more="false">
    <template #header-extra>
      <span class="ws__badge">实时 · 在线 {{ onlineCount }}/{{ workstations.length }}</span>
    </template>

    <div class="ws">
      <div v-if="loading" class="ws__state">正在加载实时值守数据…</div>
      <div v-else-if="failed" class="ws__state ws__state--warn">
        实时数据获取失败，暂无可展示记录
      </div>
      <div v-else-if="!workstations.length" class="ws__state">暂无值守工位</div>

      <div v-else class="ws__list">
        <div v-for="group in grouped" :key="group.zone" class="ws__group">
          <div class="ws__group-head">
            <span class="ws__zone">{{ group.zone }}</span>
            <span class="ws__zone-count">{{ group.items.length }} 个</span>
          </div>
          <ul class="ws__items">
            <li v-for="item in group.items" :key="item.id" class="ws__item">
              <span class="ws__dot" :class="item.online ? 'ws__dot--on' : 'ws__dot--off'" />
              <span class="ws__name">{{ item.name }}</span>
              <span class="ws__status" :class="item.online ? 'ws__status--on' : 'ws__status--off'">
                {{ item.online ? '在线' : '离线' }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.ws__badge {
  font-size: 12px;
  color: var(--map-device-offline);
}

.ws {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.ws__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.ws__state--warn {
  color: var(--color-alarm-2);
}

.ws__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.ws__group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}

.ws__zone {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.ws__zone-count {
  font-size: 12px;
  color: var(--map-device-offline);
}

.ws__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ws__item {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 40%);
  font-size: 12px;
  color: #e8f2fc;
}

.ws__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.ws__dot--on {
  background: var(--color-success);
  box-shadow: 0 0 6px rgb(46 204 113 / 60%);
}

.ws__dot--off {
  background: var(--map-device-offline);
}

.ws__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws__status {
  font-size: 12px;
}

.ws__status--on {
  color: var(--color-success);
}

.ws__status--off {
  color: var(--map-device-offline);
}
</style>
