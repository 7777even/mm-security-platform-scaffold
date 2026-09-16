<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import IconTile from '../components/IconTile.vue';
import Icon from '../components/Icon.vue';
import {
  fetchRescueEquipment,
  fetchRescuePersonnel,
  fetchRescueVehicles,
  fetchFireBrigades,
  type FireBrigadeTeam,
} from '@/services/rescueResource';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 应急资源（列表页模板，docs/UI规范-移动端.md §5）
// 数据源：后端 /api/v1/rescue-resources/{vehicles,equipment,personnel,brigades}
// （应急救援资源台账）。取消原 data/mock.ts 静态数据；未连后端走空态 + 全局离线告警。
// - 概览卡片仅保留后端有对应数据源的 4 类（车辆 / 装备 / 人员 / 队伍）；
//   原 mock 的「消防水源 / 应急专家」后端无端点，按零下行控制原则不予展示（不编造）。
// - 分区列表取自消防队伍台账（每队区域 + 人员 / 车辆 / 装备数）。

interface StatCard {
  k: string;
  n: number;
  icon: string;
}

interface AreaRow {
  id: number;
  a: string;
  v: string;
}

const loading = ref(false);
const cards = ref<StatCard[]>([]);
const areas = ref<AreaRow[]>([]);

function toArea(t: FireBrigadeTeam): AreaRow {
  return {
    id: t.id,
    a: t.name,
    v: `人员 ${t.memberCount} · 车辆 ${t.rescueVehicles} · 装备 ${t.equipment?.length ?? 0}`,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('rescue-resource', '/rescue-resources');
      cards.value = [];
      areas.value = [];
      return;
    }
    const [vehicles, equipment, personnel, brigades] = await Promise.all([
      fetchRescueVehicles(),
      fetchRescueEquipment(),
      fetchRescuePersonnel(),
      fetchFireBrigades(),
    ]);
    cards.value = [
      { k: '消防车辆', n: vehicles.items?.length ?? 0, icon: 'ops' },
      { k: '救援装备', n: equipment.totalSets ?? equipment.items?.length ?? 0, icon: 'shield' },
      { k: '救援人员', n: personnel.totalCount ?? personnel.items?.length ?? 0, icon: 'user' },
      { k: '消防队伍', n: brigades.items?.length ?? 0, icon: 'plan' },
    ];
    areas.value = (brigades.items ?? []).map(toArea);
  } catch {
    cards.value = [];
    areas.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="应急资源" back-to="/profile" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <template v-else>
      <div v-if="cards.length" class="mb-stat-grid">
        <div v-for="c in cards" :key="c.k" class="mb-stat">
          <IconTile :name="c.icon" tone="blue" size="md" />
          <span class="mb-stat__num">{{ c.n }}</span>
          <span class="mb-stat__label">{{ c.k }}</span>
        </div>
      </div>

      <div v-else class="mb-empty">
        <div class="mb-empty__art" />
        <p class="mb-empty__text">暂无应急资源数据</p>
      </div>

      <section v-if="areas.length" class="mb-section resources-areas">
        <div class="mb-section__head">
          <span class="mb-section__title">
            <Icon name="pin" size="var(--mb-ico-sm)" mono />
            按区域查看
          </span>
        </div>
        <div class="mb-stack">
          <div v-for="a in areas" :key="a.id" class="mb-row">
            <div class="mb-row__main">
              <div class="mb-row__title">{{ a.a }}</div>
              <p class="mb-row__desc">{{ a.v }}</p>
            </div>
            <Icon name="chevron" size="var(--mb-ico-sm)" mono />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.resources-areas {
  margin-top: var(--space-md);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
