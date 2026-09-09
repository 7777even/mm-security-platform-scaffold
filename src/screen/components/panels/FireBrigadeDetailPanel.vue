<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import { selectedFireBrigade } from '../../lib/composables/useFireBrigadeView';
import type { FireBrigadeEquipment, FireBrigadePerson } from '@/services/rescueResource';

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'vehicles', label: '救援车辆' },
  { key: 'personnel', label: '救援人员' },
  { key: 'equipment', label: '装备' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

const activeTab = ref<TabKey>('basic');

watch(
  () => selectedFireBrigade.value?.id,
  () => {
    activeTab.value = 'basic';
  },
);

const team = computed(() => selectedFireBrigade.value);

const personCount = computed(() => team.value?.personnel.length ?? 0);
const vehicleCount = computed(() => team.value?.vehicles.length ?? 0);
const equipment = computed(() => team.value?.equipment ?? []);
const equipCategoryCount = computed(
  () => new Set(equipment.value.map((item) => item.category)).size,
);
const equipTotal = computed(() => equipment.value.reduce((sum, item) => sum + item.count, 0));

const vehicleStatusCounts = computed(() => {
  const list = team.value?.vehicles ?? [];
  return {
    idle: list.filter((item) => item.status === '待命').length,
    dispatch: list.filter((item) => item.status === '出动').length,
    repair: list.filter((item) => item.status === '维修').length,
  };
});

const personStatusCounts = computed(() => {
  const list = team.value?.personnel ?? [];
  return {
    duty: list.filter((item) => item.dutyStatus === '在岗').length,
    standby: list.filter((item) => item.dutyStatus === '备勤').length,
    leave: list.filter((item) => item.dutyStatus === '休假').length,
  };
});

const equipStatusCounts = computed(() => {
  return {
    ok: equipment.value.filter((item) => item.status === '完好').length,
    maintenance: equipment.value.filter((item) => item.status === '待维护').length,
    scrap: equipment.value.filter((item) => item.status === '报废预警').length,
  };
});

const PERSON_GROUPS: Array<{ key: FireBrigadePerson['group']; label: string }> = [
  { key: '指挥', label: '指挥组' },
  { key: '战斗', label: '战斗组' },
  { key: '驾驶', label: '驾驶组' },
  { key: '通信', label: '通信组' },
  { key: '保障', label: '保障组' },
];

const personnelByGroup = computed(() =>
  PERSON_GROUPS.map((group) => ({
    ...group,
    items: (team.value?.personnel ?? []).filter((item) => item.group === group.key),
  })).filter((group) => group.items.length > 0),
);

const EQUIP_CATEGORIES: Array<{ key: FireBrigadeEquipment['category']; label: string }> = [
  { key: '防护装备', label: '防护装备' },
  { key: '灭火器材', label: '灭火器材' },
  { key: '破拆工具', label: '破拆工具' },
  { key: '侦检仪器', label: '侦检仪器' },
  { key: '通讯设备', label: '通讯设备' },
  { key: '照明排烟', label: '照明排烟' },
];

const equipmentByCategory = computed(() =>
  EQUIP_CATEGORIES.map((category) => {
    const items = equipment.value.filter((item) => item.category === category.key);
    return {
      ...category,
      items,
      subtotal: items.reduce((sum, item) => sum + item.count, 0),
    };
  }).filter((category) => category.items.length > 0),
);

const archiveRows = computed(() => {
  const t = team.value;
  if (!t) return [];
  return [
    { label: '队伍名称', value: t.name },
    { label: '值守区域', value: t.area },
    { label: '在编人数', value: `${t.memberCount} 人` },
    { label: '值班地点', value: t.location },
    { label: '负责人', value: t.leaderName },
    { label: '联系电话', value: t.leaderPhone },
  ];
});

function statusBadgeClass(status: string | null): string {
  const map: Record<string, string> = {
    待命: 'ok',
    在岗: 'ok',
    完好: 'ok',
    出动: 'info',
    备勤: 'info',
    维修: 'warn',
    待维护: 'warn',
    休假: 'muted',
    报废预警: 'danger',
  };
  return map[status ?? ''] ?? 'muted';
}
</script>

<template>
  <PanelCard title="消防队伍详情" variant="rescue" :show-more="false">
    <div class="brigade-detail">
      <div class="brigade-detail__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="brigade-detail__tab"
          :class="{ 'brigade-detail__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'basic'" class="brigade-detail__content">
        <div class="kpi-grid">
          <button type="button" class="kpi-card" @click="activeTab = 'personnel'">
            <span class="kpi-card__label">救援人员</span>
            <span class="kpi-card__value">{{ personCount }}<em>人</em></span>
          </button>
          <button type="button" class="kpi-card" @click="activeTab = 'vehicles'">
            <span class="kpi-card__label">救援车辆</span>
            <span class="kpi-card__value">{{ vehicleCount }}<em>辆</em></span>
          </button>
          <button type="button" class="kpi-card" @click="activeTab = 'equipment'">
            <span class="kpi-card__label">装备种类</span>
            <span class="kpi-card__value">{{ equipCategoryCount }}<em>类</em></span>
          </button>
          <button type="button" class="kpi-card" @click="activeTab = 'equipment'">
            <span class="kpi-card__label">装备总量</span>
            <span class="kpi-card__value">{{ equipTotal }}<em>件</em></span>
          </button>
        </div>

        <h4 class="detail-section__title">队伍档案</h4>
        <div class="archive-grid">
          <div v-for="row in archiveRows" :key="row.label" class="archive-item">
            <span class="archive-item__label">{{ row.label }}</span>
            <span class="archive-item__value">{{ row.value }}</span>
          </div>
          <div class="archive-item archive-item--full">
            <span class="archive-item__label">队伍描述</span>
            <span class="archive-item__value">{{ team?.description ?? '-' }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'vehicles'" class="brigade-detail__content">
        <div class="summary-strip">
          <span class="summary-strip__item"
            >共 <b>{{ vehicleCount }}</b> 辆</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--ok"></i>待命 {{ vehicleStatusCounts.idle }}</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--info"></i>出动 {{ vehicleStatusCounts.dispatch }}</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--warn"></i>维修 {{ vehicleStatusCounts.repair }}</span
          >
        </div>
        <table v-if="(team?.vehicles ?? []).length" class="sub-table">
          <thead>
            <tr>
              <th>车牌号</th>
              <th>车辆类型</th>
              <th>停放点位</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vehicle in team?.vehicles ?? []" :key="vehicle.id">
              <td class="mono">{{ vehicle.plate }}</td>
              <td>{{ vehicle.type }}</td>
              <td>{{ vehicle.parkingLocation }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="`status-badge--${statusBadgeClass(vehicle.status)}`"
                >
                  {{ vehicle.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-tip">暂无关联车辆</div>
      </div>

      <div v-else-if="activeTab === 'personnel'" class="brigade-detail__content">
        <div class="summary-strip">
          <span class="summary-strip__item"
            >共 <b>{{ personCount }}</b> 人</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--ok"></i>在岗 {{ personStatusCounts.duty }}</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--info"></i>备勤 {{ personStatusCounts.standby }}</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--muted"></i>休假 {{ personStatusCounts.leave }}</span
          >
        </div>
        <template v-for="group in personnelByGroup" :key="group.key">
          <h4 class="detail-section__title">
            {{ group.label }}
            <span class="detail-section__count">{{ group.items.length }} 人</span>
          </h4>
          <table class="sub-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>岗位</th>
                <th>联系电话</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="person in group.items" :key="person.id">
                <td>{{ person.name }}</td>
                <td>{{ person.role }}</td>
                <td class="mono">{{ person.phone }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="`status-badge--${statusBadgeClass(person.dutyStatus)}`"
                  >
                    {{ person.dutyStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>

      <div v-else class="brigade-detail__content">
        <div class="summary-strip">
          <span class="summary-strip__item"
            >共 <b>{{ equipCategoryCount }}</b> 类 <b>{{ equipTotal }}</b> 件</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--ok"></i>完好 {{ equipStatusCounts.ok }}</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--warn"></i>待维护 {{ equipStatusCounts.maintenance }}</span
          >
          <span class="summary-strip__item"
            ><i class="dot dot--danger"></i>报废预警 {{ equipStatusCounts.scrap }}</span
          >
        </div>
        <template v-for="category in equipmentByCategory" :key="category.key">
          <h4 class="detail-section__title">
            {{ category.label }}
            <span class="detail-section__count">小计 {{ category.subtotal }} 件</span>
          </h4>
          <table class="sub-table">
            <thead>
              <tr>
                <th>装备名称</th>
                <th>数量</th>
                <th>存放位置</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in category.items" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.count }} {{ item.unit }}</td>
                <td>{{ item.storageLocation }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="`status-badge--${statusBadgeClass(item.status)}`"
                  >
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.brigade-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.brigade-detail__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.brigade-detail__tab {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--stat-card-icon-bg);
  color: var(--map-device-offline);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.brigade-detail__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 50%);
}

.brigade-detail__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 2px;
}

.detail-section__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 10px 0 2px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.detail-section__title:first-child {
  margin-top: 0;
}

.detail-section__count {
  font-size: 11px;
  font-weight: 400;
  color: var(--map-device-offline);
}

/* ---- 基础信息：KPI 汇总卡 ---- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex-shrink: 0;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 55 105 / 45%), rgb(0 28 58 / 55%));
  color: var(--color-text-strong);
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.kpi-card:hover {
  border-color: rgb(0 180 255 / 55%);
  box-shadow: inset 0 0 12px rgb(0 170 255 / 8%);
}

.kpi-card__label {
  font-size: 12px;
  color: var(--map-device-offline);
}

.kpi-card__value {
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.kpi-card__value em {
  margin-left: 2px;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--map-device-offline);
}

/* ---- 基础信息：队伍档案 ---- */
.archive-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 12px;
}

.archive-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px 0;
  border-bottom: 1px solid rgb(0 120 200 / 14%);
}

.archive-item--full {
  grid-column: 1 / -1;
}

.archive-item__label {
  font-size: 11px;
  color: var(--map-device-offline);
}

.archive-item__value {
  font-size: 13px;
  color: var(--color-text-strong);
  line-height: 1.4;
  word-break: break-all;
}

/* ---- 汇总条 ---- */
.summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgb(0 120 200 / 20%);
  border-radius: 2px;
  background: rgb(0 24 52 / 45%);
  flex-shrink: 0;
}

.summary-strip__item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #c8d8ec;
  white-space: nowrap;
}

.summary-strip__item b {
  color: var(--color-text-strong);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot--ok {
  background: var(--color-success);
  box-shadow: 0 0 4px rgb(61 214 140 / 60%);
}

.dot--info {
  background: var(--color-accent);
  box-shadow: 0 0 4px rgb(0 180 255 / 60%);
}

.dot--warn {
  background: var(--accent-gold);
  box-shadow: 0 0 4px rgb(236 166 65 / 60%);
}

.dot--danger {
  background: var(--map-danger-deep);
  box-shadow: 0 0 4px rgb(211 50 50 / 60%);
}

.dot--muted {
  background: var(--color-text-muted);
}

/* ---- 子表 ---- */
.sub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.sub-table th {
  padding: 5px 6px;
  border-bottom: 1px solid var(--btn-border);
  color: var(--map-device-offline);
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
}

.sub-table td {
  padding: 6px;
  border-bottom: 1px solid rgb(0 120 200 / 12%);
  color: var(--color-text-strong);
  vertical-align: middle;
  line-height: 1.35;
}

.sub-table tr:last-child td {
  border-bottom: none;
}

.sub-table .mono {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 2px;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.status-badge--ok {
  color: var(--color-success);
  background: rgb(0 160 80 / 22%);
  border: 1px solid rgb(0 200 100 / 40%);
}

.status-badge--info {
  color: #7ec8ff;
  background: rgb(0 120 220 / 28%);
  border: 1px solid rgb(0 160 255 / 45%);
}

.status-badge--warn {
  color: var(--color-warning);
  background: rgb(200 120 0 / 24%);
  border: 1px solid rgb(255 160 0 / 45%);
}

.status-badge--danger {
  color: var(--color-danger);
  background: rgb(190 40 40 / 24%);
  border: 1px solid rgb(255 90 90 / 45%);
}

.status-badge--muted {
  color: #aeb9cd;
  background: rgb(120 135 160 / 20%);
  border: 1px solid rgb(150 165 190 / 35%);
}

.empty-tip {
  padding: 18px 0;
  font-size: 12px;
  color: var(--map-device-offline);
  text-align: center;
}
</style>
