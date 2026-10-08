<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import PanelCard from '../../common/PanelCard.vue';
import { fetchAlarmPoints, fetchDevicePoints, type MapPoint } from '@/services/map';
import { useMonitoringPointsLayer } from '../../../lib/composables/useMonitoringPointsLayer';

const {
  alarmPointsVisible,
  devicePointsVisible,
  toggleAlarmPointsVisible,
  toggleDevicePointsVisible,
} = useMonitoringPointsLayer();

const layerHint = computed(() => {
  if (loading.value) return '正在加载实时监测点位…';
  if (alarmPointsVisible.value && devicePointsVisible.value)
    return `已在地图底座显示报警 ${alarmCount.value} + 设备 ${deviceCount.value} 个点位`;
  if (alarmPointsVisible.value) return `已在地图底座显示 ${alarmCount.value} 个报警点位`;
  if (devicePointsVisible.value) return `已在地图底座显示 ${deviceCount.value} 个设备点位`;
  return '点击卡片，在地图底座查看对应点位';
});

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

async function loadPoints() {
  try {
    const [alarms, devices] = await Promise.all([fetchAlarmPoints(), fetchDevicePoints()]);
    alarmPoints.value = alarms;
    devicePoints.value = devices;
  } finally {
    loading.value = false;
  }
}

// 监测点位随报警/设备变化（alarm / device）实时刷新
['alarm', 'device'].forEach((domain) =>
  useDomainAutoRefresh(domain, loadPoints, { immediate: false }),
);

onMounted(loadPoints);
</script>

<template>
  <!-- variant 必须取 SecurityPanelVariant：原先误用生产域的 'devices'，
       security 切图映射里没有该键 → 头/底/图标/底纹四张切图全部 404（面板 chrome 残缺） -->
  <PanelCard title="安全监测点位" variant="patrolAlarm" module="security" :show-more="false">
    <template #header-extra>
      <span class="mp__badge">实时 · 报警 {{ alarmCount }} / 设备 {{ deviceCount }}</span>
    </template>

    <div class="mp">
      <button
        type="button"
        class="mp__toggle mp__toggle--alarm"
        :class="{ 'mp__toggle--on': alarmPointsVisible }"
        :aria-pressed="alarmPointsVisible"
        @click="toggleAlarmPointsVisible"
      >
        <span class="mp__stat-num">{{ alarmCount }}</span>
        <span class="mp__stat-label">报警点位</span>
        <span class="mp__stat-sub"
          >Ⅰ/Ⅱ/Ⅲ：{{ alarmByLevel[1] }}/{{ alarmByLevel[2] }}/{{ alarmByLevel[3] }}</span
        >
        <i class="mp__toggle-dot" />
      </button>

      <button
        type="button"
        class="mp__toggle mp__toggle--device"
        :class="{ 'mp__toggle--on': devicePointsVisible }"
        :aria-pressed="devicePointsVisible"
        @click="toggleDevicePointsVisible"
      >
        <span class="mp__stat-num">{{ deviceCount }}</span>
        <span class="mp__stat-label">设备点位</span>
        <span class="mp__stat-sub"
          >在线/故障/离线：{{ deviceByStatus.online }}/{{ deviceByStatus.fault }}/{{
            deviceByStatus.offline
          }}</span
        >
        <i class="mp__toggle-dot" />
      </button>

      <span class="mp__hint"><i class="mp__hint-dot" />{{ layerHint }}</span>
    </div>
  </PanelCard>
</template>

<style scoped>
.mp__badge {
  font-size: 12px;
  color: var(--map-device-offline);
}

.mp {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 100%;
  min-height: 0;
}

.mp__toggle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 10px 4px 8px;
  border: 1px solid rgb(0 100 180 / 18%);
  border-radius: 3px;
  background: rgb(0 24 50 / 40%);
  font-family: var(--font-body);
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.mp__toggle--alarm .mp__stat-num {
  color: var(--color-danger);
}

.mp__toggle--device .mp__stat-num {
  color: var(--color-success);
}

.mp__stat-num {
  font-size: 26px;
  font-weight: 600;
  line-height: 1;
}

.mp__stat-label {
  font-size: 12px;
  color: var(--color-text-strong);
}

.mp__stat-sub {
  font-size: 11px;
  color: var(--map-device-offline);
}

.mp__toggle-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--map-device-offline);
  box-shadow: 0 0 6px rgb(120 150 180 / 40%);
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.mp__toggle--on {
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 46 86 / 55%);
  box-shadow: inset 0 0 14px rgb(0 170 255 / 10%);
}

.mp__toggle--on .mp__toggle-dot {
  background: var(--color-success);
  box-shadow: 0 0 8px rgb(46 204 113 / 60%);
}

.mp__toggle:hover {
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 55 100 / 55%);
}

.mp__hint {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px dashed rgb(0 120 200 / 28%);
  border-radius: 3px;
  background: rgb(0 24 50 / 30%);
  color: var(--map-device-offline);
  font-size: 12px;
}

.mp__hint-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--map-device-offline);
  box-shadow: 0 0 6px rgb(120 150 180 / 40%);
}
</style>
