<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import AlarmCard from '../common/AlarmCard.vue';
import FireAlarmListDialog from '../common/FireAlarmListDialog.vue';
import FireFacilityMonitoringDialog from '../common/FireFacilityMonitoringDialog.vue';
import SurveillanceVideoDialog from '../common/SurveillanceVideoDialog.vue';
import type { AlarmItem } from '../../lib/data/mock';
import { usePlantArea } from '../../lib/composables/usePlantArea';
import { fetchFireAlarmPage } from '@/services/alarm';
import { fetchFireMonitorAreas, type FireMonitorArea } from '@/services/fireSituation';
import { toScreenAlarmFromFire } from '../../lib/adapters/alarmAdapter';
import { useFireFacilityMonitoringDialog } from '../../lib/composables/useFireFacilityMonitoringDialog';
import { showToast } from '../../lib/composables/useToast';
import { fireAlarmChanged } from '../../lib/composables/useScreenAlarmFeed';
import fireAreaScene from '../../assets/semantic-scenes/fire-alarm-pipe-rack.png';
import type { ConcretePlantAreaCode } from '../../lib/data/plantAreas';

interface FireAreaSummary {
  id: string;
  scope: ConcretePlantAreaCode;
  name: string;
  status: 'normal' | 'attention';
  statusLabel: string;
  equipment: number;
  cameras: number;
  personnel: number;
}

// 各装置区消防保障汇总：直连真后端 /fire-situation/areas（services 层在缺 VITE_API_BASE 时回落 dev mock，
// 已配置但后端失败则空集合 + 显式告警，不造假数据）。取代前端硬编码 fireAreas 业务数据。
const fireAreas = ref<FireAreaSummary[]>([]);

function mapArea(a: FireMonitorArea): FireAreaSummary {
  return {
    id: a.id,
    scope: a.scope as ConcretePlantAreaCode,
    name: a.name,
    status: a.status,
    statusLabel: a.statusLabel,
    equipment: a.equipment,
    cameras: a.cameras,
    personnel: a.personnel,
  };
}

onMounted(async () => {
  try {
    const res = await fetchFireMonitorAreas();
    fireAreas.value = res.items.map(mapArea);
  } catch {
    // 服务层已告警并返回空集合；此处保持空，面板降级为无区域列表
  }
});

const listDialogOpen = ref(false);
const videoDialogOpen = ref(false);
const selectedVideoArea = ref<FireAreaSummary | null>(null);
const selectedAreaId = ref('');
const demoAlarmEnabled = ref(true);
const areaSearch = ref('');

const { selectedPlantArea, selectedPlantAreaDefinition, filterByPlantArea } = usePlantArea();
// 实时报警：与大屏消防模块/管理端消防报警同源，直连真后端 GET /fire-alarms（fac_fire_alarm）；
// 「进行中报警」只取 status=ACTIVE（进行中），已闭环不进本列表。services 层缺 VITE_API_BASE 时回落 dev mock。
const realAlarms = ref<AlarmItem[]>([]);
const visibleAlarms = computed(() => filterByPlantArea(realAlarms.value));

async function loadFireAlarms() {
  try {
    const res = await fetchFireAlarmPage(1, 1000);
    realAlarms.value = res.list
      .filter((a) => a.status === 'ACTIVE')
      .map((a, i) => toScreenAlarmFromFire(a, i));
  } catch {
    // 真实接口异常时保持空列表（面板降级为「消防态势平稳」），不阻断其它模块
  }
}

onMounted(loadFireAlarms);
// 写回（确认/处置/误报）成功后，进行中报警列表随之刷新，已确认/已派单/已闭环的报警退出「进行中」视图
watch(fireAlarmChanged, loadFireAlarms);
const hasActiveAlarm = computed(() => demoAlarmEnabled.value && visibleAlarms.value.length > 0);
const visibleFireAreas = computed(() => {
  if (selectedPlantArea.value === 'all') return fireAreas.value;
  return fireAreas.value.filter((area) => area.scope === selectedPlantArea.value);
});
const filteredFireAreas = computed(() => {
  const keyword = areaSearch.value.trim().toLocaleLowerCase();
  if (!keyword) return visibleFireAreas.value;
  return visibleFireAreas.value.filter((area) => area.name.toLocaleLowerCase().includes(keyword));
});

const { facilityMonitoringOpen, openFireFacilityMonitoring, closeFireFacilityMonitoring } =
  useFireFacilityMonitoringDialog();

function openAlarmList() {
  listDialogOpen.value = true;
}

function toggleDemoAlarm() {
  demoAlarmEnabled.value = !demoAlarmEnabled.value;
  showToast(demoAlarmEnabled.value ? '已显示实时报警' : '已隐藏实时报警');
}

function selectArea(area: FireAreaSummary) {
  selectedAreaId.value = area.id;
  showToast(`已定位到${area.name}，地图与保障信息已联动`);
}

function openEquipment(area: FireAreaSummary) {
  selectedAreaId.value = area.id;
  openFireFacilityMonitoring({ tab: 'monitor' });
}

function openVideo(area: FireAreaSummary) {
  selectedAreaId.value = area.id;
  selectedVideoArea.value = area;
  videoDialogOpen.value = true;
}

function dispatchPersonnel(area: FireAreaSummary) {
  selectedAreaId.value = area.id;
  showToast(`已进入${area.name}人员调度，当前可联系 ${area.personnel} 人`);
}

function callPersonnel(area: FireAreaSummary) {
  selectedAreaId.value = area.id;
  showToast(`正在呼叫${area.name}现场负责人，请等待接听`);
}
</script>

<template>
  <PanelCard
    title="厂区消防风险监测"
    variant="alarm"
    :show-more="hasActiveAlarm"
    @more="openAlarmList"
  >
    <div class="fire-risk">
      <section
        class="fire-status"
        :class="{ 'fire-status--alarm': hasActiveAlarm }"
        :aria-label="`${selectedPlantAreaDefinition.label}消防状态`"
      >
        <div class="fire-status__head">
          <span class="fire-status__icon" aria-hidden="true">{{ hasActiveAlarm ? '!' : '✓' }}</span>
          <div class="fire-status__heading">
            <strong>{{ selectedPlantAreaDefinition.label }}消防状态</strong>
            <span>{{ hasActiveAlarm ? '存在进行中的消防报警' : '消防态势平稳，未发现报警' }}</span>
          </div>
          <span class="fire-status__badge" :class="{ 'fire-status__badge--alarm': hasActiveAlarm }">
            {{ hasActiveAlarm ? `${visibleAlarms.length} 起报警` : '运行正常' }}
          </span>
        </div>

        <div class="fire-status__demo">
          <span>实时报警</span>
          <button type="button" class="demo-switch" @click="toggleDemoAlarm">
            {{ hasActiveAlarm ? '隐藏实时报警' : '显示实时报警' }}
          </button>
        </div>
      </section>

      <section v-if="hasActiveAlarm" class="fire-risk__section fire-risk__section--alarm">
        <div class="section-heading">
          <div><span class="section-heading__pulse" /><strong>进行中报警</strong></div>
          <button type="button" @click="openAlarmList">全部 {{ visibleAlarms.length }} 起 ›</button>
        </div>

        <div class="alarm-list">
          <AlarmCard v-for="alarm in visibleAlarms" :key="alarm.id" :alarm="alarm" />
        </div>
      </section>

      <section class="fire-risk__section fire-risk__section--areas">
        <div class="section-heading">
          <div><span class="section-heading__dot" /><strong>各装置区消防保障</strong></div>
          <span>{{
            areaSearch
              ? `找到 ${filteredFireAreas.length} 个`
              : `共 ${visibleFireAreas.length} 个区域`
          }}</span>
        </div>

        <label class="area-search">
          <span aria-hidden="true">⌕</span>
          <input
            v-model="areaSearch"
            type="search"
            placeholder="搜索装置区名称"
            aria-label="搜索装置区"
          />
          <button v-if="areaSearch" type="button" aria-label="清空搜索" @click="areaSearch = ''">
            ×
          </button>
        </label>

        <div class="area-list">
          <article
            v-for="area in filteredFireAreas"
            :key="area.id"
            class="area-card"
            :class="[
              `area-card--${area.status}`,
              { 'area-card--selected': selectedAreaId === area.id },
            ]"
            @click="selectArea(area)"
          >
            <header class="area-card__head">
              <div>
                <span class="area-card__dot" /><strong>{{ area.name }}</strong>
              </div>
              <span>{{ area.statusLabel }}</span>
            </header>

            <div class="area-card__stats">
              <button type="button" @click.stop="openEquipment(area)">
                <span>消防设备</span><b>{{ area.equipment }}</b
                ><em>台 ›</em>
              </button>
              <button type="button" @click.stop="openVideo(area)">
                <span>视频监控</span><b>{{ area.cameras }}</b
                ><em>路 ›</em>
              </button>
              <button type="button" @click.stop="dispatchPersonnel(area)">
                <span>现场人员</span><b>{{ area.personnel }}</b
                ><em>人 ›</em>
              </button>
            </div>

            <footer class="area-card__actions">
              <button
                type="button"
                class="area-action area-action--primary"
                @click.stop="dispatchPersonnel(area)"
              >
                人员调度
              </button>
              <button type="button" class="area-action" @click.stop="callPersonnel(area)">
                呼叫现场人员
              </button>
            </footer>
          </article>
          <div v-if="filteredFireAreas.length === 0" class="area-empty">
            未找到匹配的装置区，请更换关键词
          </div>
        </div>
      </section>
    </div>
  </PanelCard>

  <FireAlarmListDialog :open="listDialogOpen" @close="listDialogOpen = false" />
  <FireFacilityMonitoringDialog
    :open="facilityMonitoringOpen"
    @close="closeFireFacilityMonitoring"
  />
  <SurveillanceVideoDialog
    :open="videoDialogOpen"
    :title="`${selectedVideoArea?.name ?? ''}现场监控`"
    :image-url="fireAreaScene"
    :scene-index="1"
    @close="videoDialogOpen = false"
  />
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  min-height: 0;
}

.fire-risk {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
}

.fire-status {
  flex-shrink: 0;
  padding: 14px 14px 12px;
  border: 1px solid var(--c-63-221-183-50);
  border-radius: 5px;
  background:
    linear-gradient(115deg, var(--c-24-112-98-30), var(--c-0-53-78-25)), var(--c-0-25-48-70);
  box-shadow: inset 0 0 18px var(--c-39-214-172-8);
}

.fire-status--alarm {
  border-color: var(--c-255-91-91-58);
  background:
    linear-gradient(115deg, var(--c-122-30-38-32), var(--c-0-53-78-20)), var(--c-0-25-48-74);
  box-shadow: inset 0 0 18px var(--c-255-73-73-9);
}

.fire-status__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fire-status__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid var(--color-success);
  border-radius: 50%;
  background: var(--c-25-129-103-44);
  color: var(--color-success);
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 0 12px var(--c-55-231-183-22);
}

.fire-status--alarm .fire-status__icon {
  border-color: var(--color-danger);
  background: var(--c-180-43-53-50);
  color: var(--color-text-strong);
  box-shadow: 0 0 13px var(--c-255-78-88-36);
}

.fire-status__heading {
  min-width: 0;
  flex: 1;
}

.fire-status__heading strong {
  display: block;
  color: var(--color-text-strong);
  font-size: 17px;
  line-height: 1.3;
}

.fire-status__heading span {
  display: block;
  margin-top: 4px;
  color: var(--c-87a9c2);
  font-size: 12px;
}

.fire-status__badge {
  flex-shrink: 0;
  padding: 5px 9px;
  border: 1px solid var(--c-60-230-184-45);
  border-radius: 14px;
  background: var(--c-22-132-102-25);
  color: var(--color-success);
  font-size: 12px;
}

.fire-status__badge--alarm {
  border-color: var(--c-255-101-109-55);
  background: var(--c-181-42-53-30);
  color: var(--color-danger);
}

.fire-status__demo {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 11px;
  padding-top: 9px;
  border-top: 1px solid var(--c-111-194-226-16);
}

.fire-status__demo > span {
  color: var(--c-6f91aa);
  font-size: 10px;
}

.demo-switch {
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--c-36-174-230-35);
  border-radius: 3px;
  background: var(--c-0-64-99-34);
  color: var(--c-4dd2ff);
  font: 11px var(--font-body);
  cursor: pointer;
}

.demo-switch:hover {
  border-color: var(--c-55-207-255-72);
  background: var(--c-0-90-132-42);
}

.fire-risk__section {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.fire-risk__section--alarm {
  flex: 0 0 auto;
  max-height: 220px;
}

.fire-risk__section--alarm .alarm-list {
  max-height: 184px;
}

.fire-risk__section--areas {
  flex: 1 1 auto;
}

.section-heading {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 2px;
}

.section-heading > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-heading strong {
  color: var(--c-e8f4ff);
  font-size: 15px;
}

.section-heading > span,
.section-heading button {
  border: 0;
  background: transparent;
  color: var(--c-7da2bd);
  font: 12px var(--font-body);
}

.section-heading button {
  cursor: pointer;
}

.section-heading button:hover {
  color: var(--c-3dcaff);
}

.section-heading__pulse,
.section-heading__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 10px var(--c-255-71-82-80);
}

.section-heading__pulse {
  animation: alarm-pulse 1.8s ease-in-out infinite;
}

.section-heading__dot {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--c-75-229-181-55);
}

.alarm-list,
.area-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 3px;
}

.alarm-list,
.area-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.area-search {
  height: 32px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  margin-bottom: 8px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid var(--c-0-138-210-34);
  border-radius: 3px;
  background: var(--c-0-25-52-68);
  color: var(--c-38c8ff);
}

.area-search:focus-within {
  border-color: var(--c-37-198-255-75);
  box-shadow: inset 0 0 10px var(--c-0-148-220-8);
}

.area-search > span {
  font-size: 18px;
  line-height: 1;
  transform: translateY(-1px);
}

.area-search input {
  min-width: 0;
  flex: 1;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--c-e8f4ff);
  font: 12px var(--font-body);
}

.area-search input::placeholder {
  color: var(--c-6f91aa);
}

.area-search input::-webkit-search-cancel-button {
  display: none;
}

.area-search button {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--c-75-135-168-20);
  color: var(--c-9bc6dd);
  font-size: 16px;
  line-height: 20px;
  cursor: pointer;
}

.area-list {
  overscroll-behavior: contain;
  padding-bottom: 4px;
}

.area-empty {
  display: grid;
  min-height: 110px;
  place-items: center;
  border: 1px dashed var(--c-0-135-205-28);
  border-radius: 4px;
  color: var(--c-789ab2);
  font-size: 12px;
}

.area-card {
  flex-shrink: 0;
  padding: 11px 12px 10px;
  border: 1px solid var(--c-0-140-220-28);
  border-radius: 4px;
  background: linear-gradient(180deg, var(--c-0-42-78-66), var(--c-0-27-55-60));
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.area-card:hover,
.area-card--selected {
  border-color: var(--c-24-202-255-68);
  background: linear-gradient(180deg, var(--c-0-62-103-75), var(--c-0-35-67-68));
  transform: translateY(-1px);
}

.area-card--attention {
  border-color: var(--c-255-184-70-38);
}

.area-card__head,
.area-card__head > div {
  display: flex;
  align-items: center;
}

.area-card__head {
  justify-content: space-between;
  gap: 8px;
}

.area-card__head > div {
  min-width: 0;
  gap: 8px;
}

.area-card__head strong {
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.area-card__head > span {
  flex-shrink: 0;
  color: var(--color-success);
  font-size: 11px;
}

.area-card--attention .area-card__head > span {
  color: var(--color-warning);
}

.area-card__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 7px var(--c-75-228-180-55);
}

.area-card--attention .area-card__dot {
  background: var(--color-warning);
  box-shadow: 0 0 7px var(--c-255-192-82-55);
}

.area-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin-top: 10px;
}

.area-card__stats button {
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid var(--c-0-126-195-16);
  border-radius: 3px;
  background: var(--c-0-24-50-48);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.area-card__stats button:hover {
  border-color: var(--c-28-195-255-45);
  background: var(--c-0-70-111-38);
}

.area-card__stats span {
  display: block;
  color: var(--c-7f9fb9);
  font-size: 10px;
  white-space: nowrap;
}

.area-card__stats b {
  display: inline-block;
  margin-top: 3px;
  color: var(--c-31d2ff);
  font-size: 19px;
}

.area-card__stats em {
  margin-left: 4px;
  color: var(--c-8faec4);
  font-size: 10px;
  font-style: normal;
}

.area-card__actions {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 8px;
  margin-top: 9px;
}

.area-action {
  height: 29px;
  border: 1px solid var(--c-52-137-176-72);
  border-radius: 3px;
  background: var(--c-16-61-83-75);
  color: var(--c-dceeff);
  font: 12px var(--font-body);
  cursor: pointer;
}

.area-action:hover {
  border-color: var(--c-62-211-255-85);
  background: var(--c-16-87-118-85);
}

.area-action--primary {
  border-color: var(--c-20-207-255-88);
  background: var(--c-0-103-150-72);
}

@keyframes alarm-pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.88);
  }

  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .section-heading__pulse {
    animation: none;
  }

  .area-card {
    transition: none;
  }
}
</style>
