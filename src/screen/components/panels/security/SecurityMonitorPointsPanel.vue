<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchAlarmPoints, fetchDevicePoints, type MapPoint } from '@/services/map';

const loading = ref(true);
const alarmPoints = ref<MapPoint[]>([]);
const devicePoints = ref<MapPoint[]>([]);

const alarmCount = computed(() => alarmPoints.value.length);
const deviceCount = computed(() => devicePoints.value.length);

const alarmByLevel = computed(() => {
  const acc: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const p of alarmPoints.value) {
    const lv = p.level ?? 0;
    if (lv >= 1 && lv <= 3) acc[lv] += 1;
  }
  return acc;
});

const deviceByStatus = computed(() => {
  let online = 0;
  let fault = 0;
  let offline = 0;
  for (const p of devicePoints.value) {
    const s = (p.status ?? '').toUpperCase();
    if (s === 'ONLINE') online += 1;
    else if (s === 'FAULT' || s === 'ALARM') fault += 1;
    else offline += 1;
  }
  return { online, fault, offline };
});

interface PointRow {
  id: string;
  name: string;
  kind: 'alarm' | 'device';
  tag: string;
  tone: 'danger' | 'warn' | 'ok' | 'muted';
}

function alarmTag(p: MapPoint): { tag: string; tone: PointRow['tone'] } {
  const lv = p.level ?? 0;
  if (lv >= 3) return { tag: `三级报警`, tone: 'danger' };
  if (lv === 2) return { tag: `二级报警`, tone: 'warn' };
  if (lv === 1) return { tag: `一级报警`, tone: 'ok' };
  return { tag: '监测报警', tone: 'muted' };
}

function deviceTag(p: MapPoint): { tag: string; tone: PointRow['tone'] } {
  const s = (p.status ?? '').toUpperCase();
  if (s === 'ONLINE') return { tag: '在线', tone: 'ok' };
  if (s === 'FAULT' || s === 'ALARM') return { tag: '故障', tone: 'danger' };
  return { tag: '离线', tone: 'muted' };
}

const rows = computed<PointRow[]>(() => {
  const a: PointRow[] = alarmPoints.value.map((p) => {
    const { tag, tone } = alarmTag(p);
    return { id: `a-${p.id}`, name: p.name, kind: 'alarm', tag, tone };
  });
  const d: PointRow[] = devicePoints.value.map((p) => {
    const { tag, tone } = deviceTag(p);
    return { id: `d-${p.id}`, name: p.name, kind: 'device', tag, tone };
  });
  return [...a, ...d];
});

onMounted(async () => {
  try {
    const [alarms, devices] = await Promise.all([fetchAlarmPoints(), fetchDevicePoints()]);
    alarmPoints.value = alarms;
    devicePoints.value = devices;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="安全监测点位" variant="devices" module="security" :show-more="false">
    <template #header-extra>
      <span class="mp__badge">实时 · 报警 {{ alarmCount }} / 设备 {{ deviceCount }}</span>
    </template>

    <div class="mp">
      <div class="mp__stats">
        <div class="mp__stat mp__stat--alarm">
          <span class="mp__stat-num">{{ alarmCount }}</span>
          <span class="mp__stat-label">报警点位</span>
          <span class="mp__stat-sub"
            >Ⅰ/Ⅱ/Ⅲ：{{ alarmByLevel[1] }}/{{ alarmByLevel[2] }}/{{ alarmByLevel[3] }}</span
          >
        </div>
        <div class="mp__stat mp__stat--device">
          <span class="mp__stat-num">{{ deviceCount }}</span>
          <span class="mp__stat-label">设备点位</span>
          <span class="mp__stat-sub"
            >在线/故障/离线：{{ deviceByStatus.online }}/{{ deviceByStatus.fault }}/{{
              deviceByStatus.offline
            }}</span
          >
        </div>
      </div>

      <div v-if="loading" class="mp__state">正在加载实时监测点位…</div>
      <div v-else-if="!rows.length" class="mp__state">暂无监测点位</div>

      <div v-else class="mp__list">
        <div v-for="row in rows" :key="row.id" class="mp__row" :class="`mp__row--${row.kind}`">
          <span class="mp__dot" :class="`mp__dot--${row.tone}`" />
          <span class="mp__name" :title="row.name">{{ row.name }}</span>
          <span class="mp__tag" :class="`mp__tag--${row.tone}`">{{ row.tag }}</span>
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.mp__badge {
  font-size: 12px;
  color: var(--map-device-offline);
}

.mp {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.mp__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  flex-shrink: 0;
}

.mp__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid rgb(0 100 180 / 18%);
  border-radius: 3px;
  background: rgb(0 24 50 / 40%);
}

.mp__stat-num {
  font-size: 26px;
  font-weight: 600;
  line-height: 1;
}

.mp__stat--alarm .mp__stat-num {
  color: var(--color-danger);
}

.mp__stat--device .mp__stat-num {
  color: var(--color-success);
}

.mp__stat-label {
  font-size: 12px;
  color: var(--color-text-strong);
}

.mp__stat-sub {
  font-size: 11px;
  color: var(--map-device-offline);
}

.mp__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.mp__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.mp__row {
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

.mp__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.mp__dot--danger {
  background: var(--color-danger);
  box-shadow: 0 0 6px rgb(255 77 79 / 60%);
}

.mp__dot--warn {
  background: #ffa940;
  box-shadow: 0 0 6px rgb(255 169 64 / 60%);
}

.mp__dot--ok {
  background: var(--color-success);
  box-shadow: 0 0 6px rgb(46 204 113 / 60%);
}

.mp__dot--muted {
  background: var(--map-device-offline);
}

.mp__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mp__tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid transparent;
}

.mp__tag--danger {
  color: var(--color-danger);
  border-color: rgb(255 77 79 / 40%);
  background: rgb(255 77 79 / 12%);
}

.mp__tag--warn {
  color: #ffa940;
  border-color: rgb(255 169 64 / 40%);
  background: rgb(255 169 64 / 12%);
}

.mp__tag--ok {
  color: var(--color-success);
  border-color: rgb(46 204 113 / 40%);
  background: rgb(46 204 113 / 12%);
}

.mp__tag--muted {
  color: var(--map-device-offline);
  border-color: rgb(120 150 180 / 30%);
  background: rgb(120 150 180 / 10%);
}
</style>
