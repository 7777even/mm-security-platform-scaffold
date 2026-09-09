<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  type AlarmLevel,
  type FacilityAlarmItem,
  type FacilityFaultItem,
  type FacilityWorkOrderItem,
  type FaultStatus,
  type FaultTimelineItem,
  type WorkOrderStatus,
} from '../../lib/data/fireFacilityMonitoringMock';
import { facilityAlarmToDetail } from '../../lib/data/alarmDetailMock';
import {
  fetchFireFacilityMonitors,
  fetchFireFacilityLedger,
  fetchFireFacilityFaults,
  type FireFacilityMonitorSummary,
  type FireFacilityLedgerItem,
  type FireFacilityFaultItem,
} from '@/services/fireFacility';
import {
  useFireFacilityMonitoringDialog,
  type FireFacilityDialogTab,
} from '../../lib/composables/useFireFacilityMonitoringDialog';
import { useAlarmDetailPanel } from '../../lib/composables/useAlarmDetailPanel';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const {
  facilityMonitoringTab: activeTab,
  facilityMonitoringPresetType,
  facilityMonitoringPresetKeyword,
  facilityMonitoringPresetFaultCode,
  closeFireFacilityMonitoring,
} = useFireFacilityMonitoringDialog();
const { openAlarmDetail } = useAlarmDetailPanel();

const faults = ref<FacilityFaultItem[]>([]);
const monitorSummaries = ref<FireFacilityMonitorSummary[]>([]);
const ledgerItems = ref<FireFacilityLedgerItem[]>([]);
const typeOptions = ref<string[]>(['全部类型']);

/** 后端故障项（字段多为可空字符串）桥接为弹窗内部展示用的 mock 结构（faultLevel/status 为字面量枚举）。 */
function toFacilityFaultItem(f: FireFacilityFaultItem): FacilityFaultItem {
  return {
    id: f.id,
    faultCode: f.faultCode,
    facilityCode: f.facilityCode,
    facilityName: f.facilityName,
    facilityType: f.facilityType,
    faultType: f.faultType,
    faultLevel: f.faultLevel as AlarmLevel,
    discoverTime: f.discoverTime,
    discoverMethod: f.discoverMethod,
    phenomenon: f.phenomenon,
    cause: f.cause ?? '',
    status: f.status as FaultStatus,
    workOrderNo: f.workOrderNo ?? undefined,
    repairPerson: f.repairPerson ?? undefined,
    estimatedFinish: f.estimatedFinish ?? undefined,
    actualFinish: f.actualFinish ?? undefined,
    repairMeasures: f.repairMeasures ?? undefined,
    acceptancePerson: f.acceptancePerson ?? undefined,
    acceptanceResult: f.acceptanceResult ?? undefined,
    timeline: f.timeline.map((t) => ({
      time: t.time,
      operator: t.operator,
      action: t.action,
      detail: t.detail,
    })),
  };
}

async function loadFacilityData() {
  try {
    const [mon, led, flt] = await Promise.all([
      fetchFireFacilityMonitors(),
      fetchFireFacilityLedger(),
      fetchFireFacilityFaults(),
    ]);
    typeOptions.value = mon.typeOptions;
    monitorSummaries.value = mon.items;
    ledgerItems.value = led.items;
    faults.value = flt.items.map(toFacilityFaultItem);
  } catch (e) {
    console.error('[FireFacilityMonitoringDialog] 加载消防设施监测数据失败', e);
  }
}

type DetailView =
  | { kind: 'facility'; facilityType: string }
  | { kind: 'fault'; faultCode: string }
  | { kind: 'workorder'; workOrderNo: string }
  | null;

const detailView = ref<DetailView>(null);
const currentPage = ref(1);
const PAGE_SIZE_ALARM = 5;
const PAGE_SIZE_LIST = 8;

const levelOptions = ['全部级别', '紧急', '重要', '一般'] as const;
const alarmStatusOptions = [
  '全部状态',
  '待确认',
  '已确认',
  '已派单',
  '维修中',
  '待验收',
  '已闭环',
] as const;
const workOrderStatusOptions = ['全部状态', '已派发', '执行中', '待验收', '已完成'] as const;

const monitorKeyword = ref('');
const monitorTypeFilter = ref<string>('全部类型');
const monitorLevelFilter = ref<string>('全部级别');
const monitorStatusFilter = ref<string>('全部状态');

const problemKeyword = ref('');
const problemTypeFilter = ref<string>('全部类型');
const problemLevelFilter = ref<string>('全部级别');
const problemStatusFilter = ref<string>('全部状态');

const workorderKeyword = ref('');
const workorderTypeFilter = ref<string>('全部类型');
const workorderStatusFilter = ref<string>('全部状态');

function alarmFromFault(fault: FacilityFaultItem): FacilityAlarmItem {
  return {
    id: `AL-${fault.faultCode.replace(/[^0-9]/g, '')}`,
    source: fault.facilityType,
    facilityType: fault.facilityType,
    level: fault.faultLevel,
    category: fault.faultType === '硬件故障' || fault.faultType === '通信故障' ? '故障' : '动作',
    content: fault.phenomenon,
    time: fault.discoverTime,
    status: fault.status,
    faultCode: fault.faultCode,
  };
}

function workOrderFromFault(fault: FacilityFaultItem, index: number): FacilityWorkOrderItem {
  const statusMap: Record<FaultStatus, WorkOrderStatus> = {
    待确认: '已派发',
    已确认: '已派发',
    已派单: '已派发',
    维修中: '执行中',
    待验收: '待验收',
    已闭环: '已完成',
  };
  return {
    id: index,
    workOrderNo: fault.workOrderNo!,
    faultCode: fault.faultCode,
    facilityCode: fault.facilityCode,
    facilityName: fault.facilityName,
    facilityType: fault.facilityType,
    faultLevel: fault.faultLevel,
    description: fault.phenomenon,
    status: statusMap[fault.status],
    dispatchTime: fault.timeline.find((t) => t.action.includes('派发'))?.time ?? fault.discoverTime,
    repairPerson: fault.repairPerson ?? '',
    estimatedFinish: fault.estimatedFinish ?? '',
    actualFinish: fault.actualFinish,
    timeline: fault.timeline,
  };
}

const alarms = computed<FacilityAlarmItem[]>(() => faults.value.map(alarmFromFault));
const workOrders = computed<FacilityWorkOrderItem[]>(() =>
  faults.value.flatMap((fault) => (fault.workOrderNo ? [workOrderFromFault(fault, fault.id)] : [])),
);

const filteredAlarms = computed(() =>
  alarms.value.filter((alarm) => {
    if (monitorKeyword.value.trim()) {
      const q = monitorKeyword.value.trim().toLowerCase();
      if (
        !alarm.content.toLowerCase().includes(q) &&
        !alarm.source.toLowerCase().includes(q) &&
        !alarm.faultCode.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (monitorTypeFilter.value !== '全部类型' && alarm.facilityType !== monitorTypeFilter.value) {
      return false;
    }
    if (monitorLevelFilter.value !== '全部级别' && alarm.level !== monitorLevelFilter.value) {
      return false;
    }
    if (monitorStatusFilter.value !== '全部状态' && alarm.status !== monitorStatusFilter.value) {
      return false;
    }
    return true;
  }),
);

const filteredFaults = computed(() =>
  faults.value.filter((fault) => {
    if (problemKeyword.value.trim()) {
      const q = problemKeyword.value.trim().toLowerCase();
      if (
        !fault.faultCode.toLowerCase().includes(q) &&
        !fault.facilityName.toLowerCase().includes(q) &&
        !fault.phenomenon.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (problemTypeFilter.value !== '全部类型' && fault.facilityType !== problemTypeFilter.value) {
      return false;
    }
    if (problemLevelFilter.value !== '全部级别' && fault.faultLevel !== problemLevelFilter.value) {
      return false;
    }
    if (problemStatusFilter.value !== '全部状态' && fault.status !== problemStatusFilter.value) {
      return false;
    }
    return true;
  }),
);

const filteredWorkOrders = computed(() =>
  workOrders.value.filter((order) => {
    if (workorderKeyword.value.trim()) {
      const q = workorderKeyword.value.trim().toLowerCase();
      if (
        !order.workOrderNo.toLowerCase().includes(q) &&
        !order.facilityName.toLowerCase().includes(q) &&
        !order.faultCode.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (
      workorderTypeFilter.value !== '全部类型' &&
      order.facilityType !== workorderTypeFilter.value
    ) {
      return false;
    }
    if (
      workorderStatusFilter.value !== '全部状态' &&
      order.status !== workorderStatusFilter.value
    ) {
      return false;
    }
    return true;
  }),
);

const activeList = computed(() => {
  if (activeTab.value === 'monitor') return filteredAlarms.value;
  if (activeTab.value === 'problem') return filteredFaults.value;
  return filteredWorkOrders.value;
});

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      activeList.value.length / (activeTab.value === 'monitor' ? PAGE_SIZE_ALARM : PAGE_SIZE_LIST),
    ),
  ),
);

const pagedAlarms = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE_ALARM;
  return filteredAlarms.value.slice(start, start + PAGE_SIZE_ALARM);
});

const pagedFaults = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE_LIST;
  return filteredFaults.value.slice(start, start + PAGE_SIZE_LIST);
});

const pagedWorkOrders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE_LIST;
  return filteredWorkOrders.value.slice(start, start + PAGE_SIZE_LIST);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages.value; i += 1) pages.push(i);
  return pages;
});

const alarmCounts = computed(() => ({
  紧急: alarms.value.filter((a) => a.level === '紧急' && a.status !== '已闭环').length,
  重要: alarms.value.filter((a) => a.level === '重要' && a.status !== '已闭环').length,
  一般: alarms.value.filter((a) => a.level === '一般' && a.status !== '已闭环').length,
}));

/** 顶部汇总条改为由已拉取的 monitorSummaries 聚合派生，不再依赖 mock 常量。 */
const equipmentStatus = computed(() => {
  const summaries = monitorSummaries.value;
  const total = summaries.reduce((acc, s) => acc + s.total, 0);
  const offline = summaries.reduce((acc, s) => acc + s.offline, 0);
  const fault = summaries.reduce((acc, s) => acc + s.fault, 0);
  const online = total - offline;
  const integrityRate = total > 0 ? Math.round(((total - fault) / total) * 100) : 0;
  const onlineRate = total > 0 ? Math.round((online / total) * 100) : 0;
  return { total, offline, fault, integrityRate, onlineRate };
});

watch(
  () => props.open,
  (visible) => {
    if (!visible) return;
    void loadFacilityData();
    applyPresets();
  },
);

watch(activeTab, () => {
  detailView.value = null;
  currentPage.value = 1;
});

watch(activeList, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});

function applyPresets() {
  const type =
    facilityMonitoringPresetType.value === '维护保养记录'
      ? '全部类型'
      : facilityMonitoringPresetType.value;
  monitorTypeFilter.value = type;
  problemTypeFilter.value = type;
  workorderTypeFilter.value = type;
  const keyword = facilityMonitoringPresetKeyword.value;
  monitorKeyword.value = keyword;
  problemKeyword.value = keyword;
  workorderKeyword.value = keyword;
  monitorLevelFilter.value = '全部级别';
  monitorStatusFilter.value = '全部状态';
  problemLevelFilter.value = '全部级别';
  problemStatusFilter.value = '全部状态';
  workorderStatusFilter.value = '全部状态';
  currentPage.value = 1;
  const presetFaultCode = facilityMonitoringPresetFaultCode.value;
  detailView.value = presetFaultCode ? { kind: 'fault', faultCode: presetFaultCode } : null;
}

function closeDialog() {
  emit('close');
}

function switchTab(tab: FireFacilityDialogTab) {
  activeTab.value = tab;
}

function search() {
  currentPage.value = 1;
}

function resetMonitorFilters() {
  monitorKeyword.value = '';
  monitorTypeFilter.value = '全部类型';
  monitorLevelFilter.value = '全部级别';
  monitorStatusFilter.value = '全部状态';
  currentPage.value = 1;
}

function resetProblemFilters() {
  problemKeyword.value = '';
  problemTypeFilter.value = '全部类型';
  problemLevelFilter.value = '全部级别';
  problemStatusFilter.value = '全部状态';
  currentPage.value = 1;
}

function resetWorkorderFilters() {
  workorderKeyword.value = '';
  workorderTypeFilter.value = '全部类型';
  workorderStatusFilter.value = '全部状态';
  currentPage.value = 1;
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function findFault(faultCode: string): FacilityFaultItem | undefined {
  return faults.value.find((fault) => fault.faultCode === faultCode);
}

function findWorkOrder(workOrderNo: string): FacilityWorkOrderItem | undefined {
  return workOrders.value.find((order) => order.workOrderNo === workOrderNo);
}

function currentTime(): string {
  return '2026-08-20 10:30:00';
}

function pushTimeline(
  fault: FacilityFaultItem,
  action: string,
  detail: string,
  operator = '值班员',
) {
  const item: FaultTimelineItem = {
    time: currentTime(),
    operator,
    action,
    detail,
  };
  fault.timeline.push(item);
}

function nextWorkOrderNo(): string {
  const max = workOrders.value.reduce(
    (acc, order) => Math.max(acc, Number(order.workOrderNo.split('-').pop() ?? '0')),
    0,
  );
  return `WO-20260820-${String(max + 1).padStart(3, '0')}`;
}

function confirmFault(fault: FacilityFaultItem) {
  if (fault.status !== '待确认') return;
  fault.status = '已确认';
  pushTimeline(fault, '确认故障', '确认为故障，待派单');
}

function dispatchFault(fault: FacilityFaultItem) {
  if (fault.status !== '已确认') return;
  fault.status = '已派单';
  fault.workOrderNo = nextWorkOrderNo();
  fault.repairPerson = '李维修';
  fault.estimatedFinish = '2026-08-22 18:00:00';
  pushTimeline(
    fault,
    '生成工单并派发',
    `生成工单 ${fault.workOrderNo}，派发至 ${fault.repairPerson}`,
  );
}

function startRepair(fault: FacilityFaultItem) {
  if (fault.status !== '已派单') return;
  fault.status = '维修中';
  pushTimeline(fault, '开始维修', '开始现场维修');
}

function submitAcceptance(fault: FacilityFaultItem) {
  if (fault.status !== '维修中') return;
  fault.status = '待验收';
  fault.repairMeasures = '维修完成，提交验收';
  fault.actualFinish = currentTime();
  pushTimeline(fault, '提交验收', fault.repairMeasures);
}

function acceptFault(fault: FacilityFaultItem) {
  if (fault.status !== '待验收') return;
  fault.status = '已闭环';
  fault.acceptancePerson = '值班员';
  fault.acceptanceResult = '合格';
  pushTimeline(fault, '验收合格', '验收通过，故障闭环');
}

function rejectFault(fault: FacilityFaultItem) {
  if (fault.status !== '待验收') return;
  fault.status = '维修中';
  pushTimeline(fault, '验收不合格', '验收不合格，退回维修');
}

function openFaultDetail(fault: FacilityFaultItem) {
  detailView.value = { kind: 'fault', faultCode: fault.faultCode };
}

function confirmFaultByCode(faultCode: string) {
  const fault = findFault(faultCode);
  if (fault) confirmFault(fault);
}

function dispatchFaultByCode(faultCode: string) {
  const fault = findFault(faultCode);
  if (fault) dispatchFault(fault);
}

function startRepairByCode(faultCode: string) {
  const fault = findFault(faultCode);
  if (fault) startRepair(fault);
}

function submitAcceptanceByCode(faultCode: string) {
  const fault = findFault(faultCode);
  if (fault) submitAcceptance(fault);
}

function acceptFaultByCode(faultCode: string) {
  const fault = findFault(faultCode);
  if (fault) acceptFault(fault);
}

function rejectFaultByCode(faultCode: string) {
  const fault = findFault(faultCode);
  if (fault) rejectFault(fault);
}

function openUnifiedAlarmDetail(alarm: FacilityAlarmItem) {
  closeFireFacilityMonitoring();
  openAlarmDetail(facilityAlarmToDetail(alarm));
}

function openWorkOrderDetail(order: FacilityWorkOrderItem) {
  detailView.value = { kind: 'workorder', workOrderNo: order.workOrderNo };
}

function openFacilityDetail(facilityType: string) {
  detailView.value = { kind: 'facility', facilityType };
}

function backToList() {
  detailView.value = null;
}

function levelClass(level: string) {
  if (level === '紧急') return 'level-badge--danger';
  if (level === '重要') return 'level-badge--warning';
  return 'level-badge--info';
}

function faultStatusClass(status: FaultStatus) {
  if (status === '已闭环') return 'status-badge--done';
  if (status === '待验收') return 'status-badge--review';
  if (status === '维修中' || status === '已派单') return 'status-badge--doing';
  if (status === '已确认') return 'status-badge--confirmed';
  return 'status-badge--pending';
}

function workOrderStatusClass(status: WorkOrderStatus) {
  if (status === '已完成') return 'status-badge--done';
  if (status === '待验收') return 'status-badge--review';
  if (status === '执行中') return 'status-badge--doing';
  return 'status-badge--pending';
}

function summaryStatusClass(status: string) {
  if (status === '告警') return 'summary-card--alarm';
  if (status === '离线') return 'summary-card--offline';
  return 'summary-card--normal';
}

const currentFacilityDetail = computed(() => {
  const view = detailView.value;
  if (!view || view.kind !== 'facility') return null;
  const ledger = ledgerItems.value.find((item) => item.facilityType === view.facilityType) ?? null;
  const summary = monitorSummaries.value.find((item) => item.facilityType === view.facilityType);
  const relatedFaults = faults.value.filter((fault) => fault.facilityType === view.facilityType);
  return { ledger, summary, relatedFaults };
});

const currentFaultDetail = computed(() => {
  if (!detailView.value || detailView.value.kind !== 'fault') return null;
  return findFault(detailView.value.faultCode) ?? null;
});

const currentWorkOrderDetail = computed(() => {
  if (!detailView.value || detailView.value.kind !== 'workorder') return null;
  return findWorkOrder(detailView.value.workOrderNo) ?? null;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="ffm-fade">
      <div v-if="open" class="ffm" @click.self="closeDialog">
        <section
          class="ffm__dialog"
          role="dialog"
          aria-modal="true"
          aria-label="消防设施运行监测"
          @click.stop
        >
          <header class="ffm__header">
            <div class="ffm__header-main">
              <h3 class="ffm__title">消防设施运行监测</h3>
              <div class="ffm__tabs">
                <button
                  type="button"
                  class="ffm__tab"
                  :class="{ 'ffm__tab--active': activeTab === 'monitor' }"
                  @click="switchTab('monitor')"
                >
                  运行监控
                </button>
                <button
                  type="button"
                  class="ffm__tab"
                  :class="{ 'ffm__tab--active': activeTab === 'problem' }"
                  @click="switchTab('problem')"
                >
                  问题设备
                </button>
                <button
                  type="button"
                  class="ffm__tab"
                  :class="{ 'ffm__tab--active': activeTab === 'workorder' }"
                  @click="switchTab('workorder')"
                >
                  工单跟踪
                </button>
              </div>
            </div>
            <button type="button" class="ffm__close" @click="closeDialog">×</button>
          </header>

          <div class="ffm__body">
            <template
              v-if="
                detailView &&
                detailView.kind === 'facility' &&
                currentFacilityDetail &&
                currentFacilityDetail.ledger
              "
            >
              <div class="ffm__detail-head">
                <button type="button" class="ffm__back" @click="backToList">‹ 返回</button>
                <h4 class="ffm__detail-title">
                  设施详情 · {{ currentFacilityDetail.ledger.facilityName }}
                </h4>
              </div>
              <div class="ffm__detail-content">
                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">基础信息</h5>
                  <div class="ffm__info-grid">
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设施编号</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.facilityCode
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设施名称</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.facilityName
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设施类型</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.facilityType
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设置部位</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.location
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">所属装置</span>
                      <span class="ffm__info-value">{{ currentFacilityDetail.ledger.device }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">维保单位</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.maintainerName
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">维保电话</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.maintainerPhone
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">启用状态</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.ledger.enabled ? '启用' : '停用'
                      }}</span>
                    </div>
                  </div>
                </section>

                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">监控状态</h5>
                  <div v-if="currentFacilityDetail.summary" class="ffm__info-grid">
                    <div
                      v-for="param in currentFacilityDetail.summary.params"
                      :key="param.label"
                      class="ffm__info-item"
                    >
                      <span class="ffm__info-label">{{ param.label }}</span>
                      <span class="ffm__info-value" :class="`ffm__value--${param.tone}`">
                        {{ param.value }}
                      </span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">最近上报</span>
                      <span class="ffm__info-value">{{
                        currentFacilityDetail.summary.lastReportTime
                      }}</span>
                    </div>
                  </div>
                </section>

                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">最近维保记录</h5>
                  <table class="ffm__table">
                    <thead>
                      <tr>
                        <th>维保日期</th>
                        <th>维保内容</th>
                        <th>报告</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="record in currentFacilityDetail.ledger.maintenanceRecords"
                        :key="record.date"
                      >
                        <td>{{ record.date }}</td>
                        <td>{{ record.content }}</td>
                        <td>{{ record.reportFile ? '有附件' : '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">关联故障 / 工单</h5>
                  <table class="ffm__table">
                    <thead>
                      <tr>
                        <th>故障编号</th>
                        <th>故障现象</th>
                        <th>级别</th>
                        <th>状态</th>
                        <th>工单</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="fault in currentFacilityDetail.relatedFaults"
                        :key="fault.faultCode"
                      >
                        <td>{{ fault.faultCode }}</td>
                        <td>{{ fault.phenomenon }}</td>
                        <td>
                          <span class="ffm__badge" :class="levelClass(fault.faultLevel)">{{
                            fault.faultLevel
                          }}</span>
                        </td>
                        <td>
                          <span class="ffm__badge" :class="faultStatusClass(fault.status)">{{
                            fault.status
                          }}</span>
                        </td>
                        <td>{{ fault.workOrderNo ?? '—' }}</td>
                        <td>
                          <button type="button" class="ffm__link" @click="openFaultDetail(fault)">
                            查看
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </div>
            </template>

            <template v-else-if="detailView && detailView.kind === 'fault' && currentFaultDetail">
              <div class="ffm__detail-head">
                <button type="button" class="ffm__back" @click="backToList">‹ 返回</button>
                <h4 class="ffm__detail-title">故障详情 · {{ currentFaultDetail.faultCode }}</h4>
              </div>
              <div class="ffm__detail-content">
                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">基本信息</h5>
                  <div class="ffm__info-grid">
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">关联设备</span>
                      <span class="ffm__info-value"
                        >{{ currentFaultDetail.facilityName }}（{{
                          currentFaultDetail.facilityCode
                        }}）</span
                      >
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设备类型</span>
                      <span class="ffm__info-value">{{ currentFaultDetail.facilityType }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">故障类型</span>
                      <span class="ffm__info-value">{{ currentFaultDetail.faultType }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">故障级别</span>
                      <span class="ffm__info-value">
                        <span class="ffm__badge" :class="levelClass(currentFaultDetail.faultLevel)">
                          {{ currentFaultDetail.faultLevel }}
                        </span>
                      </span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">发现时间</span>
                      <span class="ffm__info-value">{{ currentFaultDetail.discoverTime }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">发现方式</span>
                      <span class="ffm__info-value">{{ currentFaultDetail.discoverMethod }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">故障现象</span>
                      <span class="ffm__info-value">{{ currentFaultDetail.phenomenon }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">当前状态</span>
                      <span class="ffm__info-value">
                        <span
                          class="ffm__badge"
                          :class="faultStatusClass(currentFaultDetail.status)"
                        >
                          {{ currentFaultDetail.status }}
                        </span>
                      </span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">关联工单</span>
                      <span class="ffm__info-value">{{
                        currentFaultDetail.workOrderNo ?? '—'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">维修责任人</span>
                      <span class="ffm__info-value">{{
                        currentFaultDetail.repairPerson ?? '—'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">预计完成</span>
                      <span class="ffm__info-value">{{
                        currentFaultDetail.estimatedFinish ?? '—'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">实际完成</span>
                      <span class="ffm__info-value">{{
                        currentFaultDetail.actualFinish ?? '—'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">故障原因</span>
                      <span class="ffm__info-value">{{
                        currentFaultDetail.cause || '排查中'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">维修措施</span>
                      <span class="ffm__info-value">{{
                        currentFaultDetail.repairMeasures ?? '—'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">验收人 / 结果</span>
                      <span class="ffm__info-value">
                        {{ currentFaultDetail.acceptancePerson ?? '—' }} /
                        {{ currentFaultDetail.acceptanceResult ?? '—' }}
                      </span>
                    </div>
                  </div>
                </section>

                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">处置时间轴</h5>
                  <ol class="ffm__timeline">
                    <li
                      v-for="(item, index) in currentFaultDetail.timeline"
                      :key="`${item.time}-${index}`"
                    >
                      <span class="ffm__timeline-dot" />
                      <div class="ffm__timeline-content">
                        <div class="ffm__timeline-head">
                          <span class="ffm__timeline-time">{{ item.time }}</span>
                          <span class="ffm__timeline-operator">{{ item.operator }}</span>
                          <span class="ffm__timeline-action">{{ item.action }}</span>
                        </div>
                        <div class="ffm__timeline-detail">{{ item.detail }}</div>
                      </div>
                    </li>
                  </ol>
                </section>

                <section class="ffm__action-bar">
                  <button
                    v-if="currentFaultDetail.status === '待确认'"
                    type="button"
                    class="ffm__btn ffm__btn--primary"
                    @click="confirmFault(currentFaultDetail)"
                  >
                    确认故障
                  </button>
                  <button
                    v-if="currentFaultDetail.status === '已确认'"
                    type="button"
                    class="ffm__btn ffm__btn--primary"
                    @click="dispatchFault(currentFaultDetail)"
                  >
                    生成工单并派发
                  </button>
                  <button
                    v-if="currentFaultDetail.status === '已派单'"
                    type="button"
                    class="ffm__btn ffm__btn--primary"
                    @click="startRepair(currentFaultDetail)"
                  >
                    开始维修
                  </button>
                  <button
                    v-if="currentFaultDetail.status === '维修中'"
                    type="button"
                    class="ffm__btn ffm__btn--primary"
                    @click="submitAcceptance(currentFaultDetail)"
                  >
                    提交验收
                  </button>
                  <button
                    v-if="currentFaultDetail.status === '待验收'"
                    type="button"
                    class="ffm__btn ffm__btn--primary"
                    @click="acceptFault(currentFaultDetail)"
                  >
                    验收合格
                  </button>
                  <button
                    v-if="currentFaultDetail.status === '待验收'"
                    type="button"
                    class="ffm__btn"
                    @click="rejectFault(currentFaultDetail)"
                  >
                    验收不合格（返修）
                  </button>
                  <button type="button" class="ffm__btn" @click="backToList">关闭</button>
                </section>
              </div>
            </template>

            <template
              v-else-if="detailView && detailView.kind === 'workorder' && currentWorkOrderDetail"
            >
              <div class="ffm__detail-head">
                <button type="button" class="ffm__back" @click="backToList">‹ 返回</button>
                <h4 class="ffm__detail-title">
                  工单详情 · {{ currentWorkOrderDetail.workOrderNo }}
                </h4>
              </div>
              <div class="ffm__detail-content">
                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">工单信息</h5>
                  <div class="ffm__info-grid">
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">关联故障</span>
                      <span class="ffm__info-value">{{ currentWorkOrderDetail.faultCode }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设备名称</span>
                      <span class="ffm__info-value">{{ currentWorkOrderDetail.facilityName }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">设备类型</span>
                      <span class="ffm__info-value">{{ currentWorkOrderDetail.facilityType }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">故障级别</span>
                      <span class="ffm__info-value">
                        <span
                          class="ffm__badge"
                          :class="levelClass(currentWorkOrderDetail.faultLevel)"
                        >
                          {{ currentWorkOrderDetail.faultLevel }}
                        </span>
                      </span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">工单状态</span>
                      <span class="ffm__info-value">
                        <span
                          class="ffm__badge"
                          :class="workOrderStatusClass(currentWorkOrderDetail.status)"
                        >
                          {{ currentWorkOrderDetail.status }}
                        </span>
                      </span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">派单时间</span>
                      <span class="ffm__info-value">{{ currentWorkOrderDetail.dispatchTime }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">处理人</span>
                      <span class="ffm__info-value">{{ currentWorkOrderDetail.repairPerson }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">预计完成</span>
                      <span class="ffm__info-value">{{
                        currentWorkOrderDetail.estimatedFinish
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">实际完成</span>
                      <span class="ffm__info-value">{{
                        currentWorkOrderDetail.actualFinish ?? '—'
                      }}</span>
                    </div>
                    <div class="ffm__info-item">
                      <span class="ffm__info-label">故障描述</span>
                      <span class="ffm__info-value">{{ currentWorkOrderDetail.description }}</span>
                    </div>
                  </div>
                </section>

                <section class="ffm__info-card">
                  <h5 class="ffm__section-title">处置时间轴</h5>
                  <ol class="ffm__timeline">
                    <li
                      v-for="(item, index) in currentWorkOrderDetail.timeline"
                      :key="`${item.time}-${index}`"
                    >
                      <span class="ffm__timeline-dot" />
                      <div class="ffm__timeline-content">
                        <div class="ffm__timeline-head">
                          <span class="ffm__timeline-time">{{ item.time }}</span>
                          <span class="ffm__timeline-operator">{{ item.operator }}</span>
                          <span class="ffm__timeline-action">{{ item.action }}</span>
                        </div>
                        <div class="ffm__timeline-detail">{{ item.detail }}</div>
                      </div>
                    </li>
                  </ol>
                </section>

                <div class="ffm__action-bar">
                  <button type="button" class="ffm__btn" @click="backToList">关闭</button>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="activeTab === 'monitor'" class="ffm__tab-body">
                <div class="ffm__stats">
                  <div class="ffm__stat">
                    <span class="ffm__stat-label">设备总数</span>
                    <span class="ffm__stat-value">{{ equipmentStatus.total }}</span>
                  </div>
                  <div class="ffm__stat">
                    <span class="ffm__stat-label">在线</span>
                    <span class="ffm__stat-value">{{
                      equipmentStatus.total - equipmentStatus.offline
                    }}</span>
                  </div>
                  <div class="ffm__stat">
                    <span class="ffm__stat-label">离线</span>
                    <span class="ffm__stat-value">{{ equipmentStatus.offline }}</span>
                  </div>
                  <div class="ffm__stat">
                    <span class="ffm__stat-label">故障</span>
                    <span class="ffm__stat-value ffm__stat-value--danger">{{
                      equipmentStatus.fault
                    }}</span>
                  </div>
                  <div class="ffm__stat">
                    <span class="ffm__stat-label">完好率</span>
                    <span class="ffm__stat-value">{{ equipmentStatus.integrityRate }}%</span>
                  </div>
                  <div class="ffm__stat">
                    <span class="ffm__stat-label">在线率</span>
                    <span class="ffm__stat-value">{{ equipmentStatus.onlineRate }}%</span>
                  </div>
                  <div class="ffm__stat ffm__stat--alarm">
                    <span class="ffm__stat-label">告警</span>
                    <span class="ffm__stat-value">
                      紧急 {{ alarmCounts.紧急 }} · 重要 {{ alarmCounts.重要 }} · 一般
                      {{ alarmCounts.一般 }}
                    </span>
                  </div>
                </div>

                <div class="ffm__toolbar">
                  <input
                    v-model="monitorKeyword"
                    class="ffm__input"
                    type="text"
                    placeholder="搜索告警内容 / 来源 / 编号"
                  />
                  <select v-model="monitorTypeFilter" class="ffm__select">
                    <option v-for="opt in typeOptions" :key="opt" :value="opt">
                      {{ opt === '全部类型' ? '设施类型' : opt }}
                    </option>
                  </select>
                  <select v-model="monitorLevelFilter" class="ffm__select">
                    <option v-for="opt in levelOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <select v-model="monitorStatusFilter" class="ffm__select">
                    <option v-for="opt in alarmStatusOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                  <button type="button" class="ffm__btn ffm__btn--primary" @click="search">
                    查询
                  </button>
                  <button type="button" class="ffm__btn" @click="resetMonitorFilters">重置</button>
                </div>

                <div class="ffm__cards">
                  <button
                    v-for="card in monitorSummaries"
                    :key="card.key"
                    type="button"
                    class="ffm__card"
                    :class="summaryStatusClass(card.status)"
                    @click="openFacilityDetail(card.facilityType)"
                  >
                    <div class="ffm__card-head">
                      <span class="ffm__card-status" />
                      <span class="ffm__card-name">{{ card.facilityType }}</span>
                      <span class="ffm__card-state">{{ card.status }}</span>
                    </div>
                    <div class="ffm__card-params">
                      <div v-for="param in card.params" :key="param.label" class="ffm__card-param">
                        <span>{{ param.label }}</span>
                        <b :class="`ffm__value--${param.tone}`">{{ param.value }}</b>
                      </div>
                    </div>
                    <div class="ffm__card-foot">
                      <span>上报 {{ card.lastReportTime }}</span>
                      <span class="ffm__card-link">查看详情 ›</span>
                    </div>
                  </button>
                </div>

                <section class="ffm__table-card">
                  <h5 class="ffm__section-title">
                    统一告警中心（共 {{ filteredAlarms.length }} 条）
                  </h5>
                  <div class="ffm__table-wrap">
                    <table class="ffm__table">
                      <thead>
                        <tr>
                          <th>时间</th>
                          <th>来源子系统</th>
                          <th>设施类型</th>
                          <th>级别</th>
                          <th>分类</th>
                          <th>内容</th>
                          <th>状态</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="alarm in pagedAlarms" :key="alarm.id">
                          <td class="ffm__cell-time">{{ alarm.time }}</td>
                          <td>{{ alarm.source }}</td>
                          <td>{{ alarm.facilityType }}</td>
                          <td>
                            <span class="ffm__badge" :class="levelClass(alarm.level)">{{
                              alarm.level
                            }}</span>
                          </td>
                          <td>{{ alarm.category }}</td>
                          <td class="ffm__cell-content">{{ alarm.content }}</td>
                          <td>
                            <span class="ffm__badge" :class="faultStatusClass(alarm.status)">{{
                              alarm.status
                            }}</span>
                          </td>
                          <td>
                            <button
                              v-if="alarm.status === '待确认'"
                              type="button"
                              class="ffm__link"
                              @click="confirmFaultByCode(alarm.faultCode)"
                            >
                              确认
                            </button>
                            <button
                              v-else-if="alarm.status === '已确认'"
                              type="button"
                              class="ffm__link"
                              @click="dispatchFaultByCode(alarm.faultCode)"
                            >
                              派单
                            </button>
                            <button
                              v-else-if="alarm.status === '已派单'"
                              type="button"
                              class="ffm__link"
                              @click="startRepairByCode(alarm.faultCode)"
                            >
                              开始维修
                            </button>
                            <button
                              v-else-if="alarm.status === '维修中'"
                              type="button"
                              class="ffm__link"
                              @click="submitAcceptanceByCode(alarm.faultCode)"
                            >
                              提交验收
                            </button>
                            <button
                              v-else-if="alarm.status === '待验收'"
                              type="button"
                              class="ffm__link"
                              @click="acceptFaultByCode(alarm.faultCode)"
                            >
                              验收合格
                            </button>
                            <button
                              v-if="alarm.status === '待验收'"
                              type="button"
                              class="ffm__link ffm__link--danger"
                              @click="rejectFaultByCode(alarm.faultCode)"
                            >
                              返修
                            </button>
                            <button
                              type="button"
                              class="ffm__link"
                              @click="openUnifiedAlarmDetail(alarm)"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div v-else-if="activeTab === 'problem'" class="ffm__tab-body">
                <div class="ffm__toolbar">
                  <input
                    v-model="problemKeyword"
                    class="ffm__input"
                    type="text"
                    placeholder="搜索故障编号 / 设备 / 现象"
                  />
                  <select v-model="problemTypeFilter" class="ffm__select">
                    <option v-for="opt in typeOptions" :key="opt" :value="opt">
                      {{ opt === '全部类型' ? '设施类型' : opt }}
                    </option>
                  </select>
                  <select v-model="problemLevelFilter" class="ffm__select">
                    <option v-for="opt in levelOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <select v-model="problemStatusFilter" class="ffm__select">
                    <option v-for="opt in alarmStatusOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                  <button type="button" class="ffm__btn ffm__btn--primary" @click="search">
                    查询
                  </button>
                  <button type="button" class="ffm__btn" @click="resetProblemFilters">重置</button>
                </div>

                <section class="ffm__table-card ffm__table-card--grow">
                  <div class="ffm__table-wrap">
                    <table class="ffm__table">
                      <thead>
                        <tr>
                          <th>故障编号</th>
                          <th>设备名称</th>
                          <th>设备类型</th>
                          <th>故障级别</th>
                          <th>发现时间</th>
                          <th>发现方式</th>
                          <th>当前状态</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="fault in pagedFaults" :key="fault.faultCode">
                          <td>{{ fault.faultCode }}</td>
                          <td>{{ fault.facilityName }}</td>
                          <td>{{ fault.facilityType }}</td>
                          <td>
                            <span class="ffm__badge" :class="levelClass(fault.faultLevel)">{{
                              fault.faultLevel
                            }}</span>
                          </td>
                          <td class="ffm__cell-time">{{ fault.discoverTime }}</td>
                          <td>{{ fault.discoverMethod }}</td>
                          <td>
                            <span class="ffm__badge" :class="faultStatusClass(fault.status)">{{
                              fault.status
                            }}</span>
                          </td>
                          <td>
                            <button
                              v-if="fault.status === '待确认'"
                              type="button"
                              class="ffm__link"
                              @click="confirmFault(fault)"
                            >
                              确认
                            </button>
                            <button
                              v-else-if="fault.status === '已确认'"
                              type="button"
                              class="ffm__link"
                              @click="dispatchFault(fault)"
                            >
                              派单
                            </button>
                            <button
                              v-else-if="fault.status === '已派单'"
                              type="button"
                              class="ffm__link"
                              @click="startRepair(fault)"
                            >
                              开始维修
                            </button>
                            <button
                              v-else-if="fault.status === '维修中'"
                              type="button"
                              class="ffm__link"
                              @click="submitAcceptance(fault)"
                            >
                              提交验收
                            </button>
                            <button
                              v-if="fault.status === '待验收'"
                              type="button"
                              class="ffm__link"
                              @click="acceptFault(fault)"
                            >
                              验收合格
                            </button>
                            <button
                              v-if="fault.status === '待验收'"
                              type="button"
                              class="ffm__link ffm__link--danger"
                              @click="rejectFault(fault)"
                            >
                              返修
                            </button>
                            <button type="button" class="ffm__link" @click="openFaultDetail(fault)">
                              详情
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div v-else class="ffm__tab-body">
                <div class="ffm__toolbar">
                  <input
                    v-model="workorderKeyword"
                    class="ffm__input"
                    type="text"
                    placeholder="搜索工单 / 故障 / 设备"
                  />
                  <select v-model="workorderTypeFilter" class="ffm__select">
                    <option v-for="opt in typeOptions" :key="opt" :value="opt">
                      {{ opt === '全部类型' ? '设施类型' : opt }}
                    </option>
                  </select>
                  <select v-model="workorderStatusFilter" class="ffm__select">
                    <option v-for="opt in workOrderStatusOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                  <button type="button" class="ffm__btn ffm__btn--primary" @click="search">
                    查询
                  </button>
                  <button type="button" class="ffm__btn" @click="resetWorkorderFilters">
                    重置
                  </button>
                </div>

                <section class="ffm__table-card ffm__table-card--grow">
                  <div class="ffm__table-wrap">
                    <table class="ffm__table">
                      <thead>
                        <tr>
                          <th>工单编号</th>
                          <th>关联故障</th>
                          <th>设备名称</th>
                          <th>设施类型</th>
                          <th>工单状态</th>
                          <th>派单时间</th>
                          <th>处理人</th>
                          <th>预计完成</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in pagedWorkOrders" :key="order.workOrderNo">
                          <td>{{ order.workOrderNo }}</td>
                          <td>{{ order.faultCode }}</td>
                          <td>{{ order.facilityName }}</td>
                          <td>{{ order.facilityType }}</td>
                          <td>
                            <span class="ffm__badge" :class="workOrderStatusClass(order.status)">{{
                              order.status
                            }}</span>
                          </td>
                          <td class="ffm__cell-time">{{ order.dispatchTime }}</td>
                          <td>{{ order.repairPerson }}</td>
                          <td class="ffm__cell-time">{{ order.estimatedFinish }}</td>
                          <td>
                            <button
                              type="button"
                              class="ffm__link"
                              @click="openWorkOrderDetail(order)"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div class="ffm__footer">
                <span class="ffm__total">共 {{ activeList.length }} 条数据</span>
                <div class="ffm__pagination">
                  <button
                    type="button"
                    class="ffm__page-btn"
                    :disabled="currentPage <= 1"
                    @click="goToPage(currentPage - 1)"
                  >
                    ‹
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    type="button"
                    class="ffm__page-btn"
                    :class="{ 'ffm__page-btn--active': currentPage === page }"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    type="button"
                    class="ffm__page-btn"
                    :disabled="currentPage >= totalPages"
                    @click="goToPage(currentPage + 1)"
                  >
                    ›
                  </button>
                </div>
              </div>
            </template>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ffm {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.ffm__dialog {
  display: flex;
  flex-direction: column;
  width: min(1240px, 100%);
  height: min(760px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.ffm__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.ffm__header-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.ffm__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.ffm__tabs {
  display: flex;
  gap: 8px;
}

.ffm__tab {
  height: 30px;
  padding: 0 14px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--map-device-offline);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.ffm__tab--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}

.ffm__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
  flex-shrink: 0;
}

.ffm__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 14px;
  gap: 10px;
  overflow: hidden;
}

.ffm__tab-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 10px;
  overflow-y: auto;
  padding-right: 2px;
}

.ffm__stats {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex-shrink: 0;
}

.ffm__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  border: 1px solid rgb(0 120 200 / 22%);
  border-radius: 4px;
  background: rgb(0 22 48 / 45%);
  min-width: 0;
}

.ffm__stat--alarm {
  grid-column: span 2;
}

.ffm__stat-label {
  font-size: 12px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.ffm__stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-strong);
  white-space: nowrap;
}

.ffm__stat-value--danger {
  color: var(--color-danger);
}

.ffm__toolbar {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr) auto auto;
  gap: 8px;
  flex-shrink: 0;
}

.ffm__input,
.ffm__select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.ffm__select {
  appearance: none;
}

.ffm__btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.ffm__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.ffm__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  flex-shrink: 0;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
}

.ffm__card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid rgb(0 120 200 / 22%);
  border-radius: 4px;
  background: rgb(0 22 48 / 50%);
  color: inherit;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  min-width: 0;
}

.ffm__card:hover {
  border-color: var(--border-glow);
  background: rgb(0 55 100 / 42%);
}

.ffm__card--alarm {
  border-left: 3px solid var(--color-danger);
}

.ffm__card--offline {
  border-left: 3px solid #8a9bb0;
}

.ffm__card--normal {
  border-left: 3px solid var(--map-marker-cyan);
}

.ffm__card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ffm__card-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--map-marker-cyan);
}

.ffm__card--alarm .ffm__card-status {
  background: var(--color-danger);
  box-shadow: 0 0 6px rgb(255 90 74 / 60%);
}

.ffm__card--offline .ffm__card-status {
  background: #8a9bb0;
}

.ffm__card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.ffm__card-state {
  font-size: 11px;
  color: var(--map-device-offline);
  flex-shrink: 0;
}

.ffm__card-params {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ffm__card-param {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
  color: var(--map-device-offline);
}

.ffm__card-param b {
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.ffm__value--normal {
  color: #6eb5ff !important;
}

.ffm__value--warning {
  color: var(--color-warning) !important;
}

.ffm__value--danger {
  color: var(--color-danger) !important;
}

.ffm__card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 10px;
  color: #7d95b3;
}

.ffm__card-link {
  color: var(--color-accent-2);
  flex-shrink: 0;
}

.ffm__table-card {
  flex: none;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
  padding: 8px 10px;
  overflow: hidden;
}

.ffm__table-card--grow {
  flex: 1 1 auto;
  min-height: 360px;
}

.ffm__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #dce9f8;
  flex-shrink: 0;
}

.ffm__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.ffm__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--color-text-muted);
}

.ffm__table th {
  position: sticky;
  top: 0;
  z-index: var(--z-chrome);
  padding: 8px;
  text-align: left;
  font-weight: 500;
  color: var(--map-device-offline);
  background: rgb(0 28 58 / 95%);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
  white-space: nowrap;
}

.ffm__table td {
  padding: 8px;
  border-bottom: 1px solid var(--list-divider);
  vertical-align: middle;
  line-height: 1.45;
}

.ffm__table tbody tr:hover {
  background: rgb(0 40 78 / 35%);
}

.ffm__cell-time {
  white-space: nowrap;
}

.ffm__cell-content {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ffm__badge {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  font-size: 11px;
  white-space: nowrap;
}

.level-badge--danger {
  color: var(--color-danger);
  border-color: rgb(255 90 74 / 55%);
}

.level-badge--warning {
  color: var(--color-warning);
  border-color: rgb(240 180 41 / 50%);
}

.level-badge--info {
  color: #6eb5ff;
  border-color: rgb(110 181 255 / 50%);
}

.status-badge--pending {
  color: var(--color-warning);
  border-color: rgb(255 159 67 / 50%);
}

.status-badge--confirmed {
  color: #6eb5ff;
  border-color: rgb(110 181 255 / 50%);
}

.status-badge--doing {
  color: var(--map-marker-cyan);
  border-color: rgb(55 207 255 / 50%);
}

.status-badge--review {
  color: #c58bff;
  border-color: rgb(197 139 255 / 50%);
}

.status-badge--done {
  color: var(--color-success);
  border-color: rgb(109 213 140 / 50%);
}

.ffm__link {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  margin-right: 6px;
}

.ffm__link:hover {
  color: #6cf;
}

.ffm__link--danger {
  color: var(--color-danger);
}

.ffm__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 12px;
}

.ffm__total {
  font-size: 12px;
  color: var(--map-device-offline);
}

.ffm__pagination {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ffm__page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.ffm__page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ffm__page-btn--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}

.ffm__detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.ffm__back {
  padding: 4px 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.ffm__detail-title {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-strong);
}

.ffm__detail-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
}

.ffm__info-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
  flex-shrink: 0;
}

.ffm__info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 12px;
}

.ffm__info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ffm__info-label {
  font-size: 11px;
  color: #7d95b3;
}

.ffm__info-value {
  font-size: 13px;
  color: var(--color-text-muted);
  word-break: break-all;
}

.ffm__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.ffm__timeline li {
  display: flex;
  gap: 10px;
  padding-bottom: 10px;
  position: relative;
}

.ffm__timeline li:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 14px;
  bottom: 0;
  width: 2px;
  background: var(--btn-border);
}

.ffm__timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent-2);
  box-shadow: 0 0 6px rgb(0 170 255 / 55%);
  flex-shrink: 0;
  margin-top: 3px;
  z-index: var(--z-marker);
}

.ffm__timeline-content {
  flex: 1;
  min-width: 0;
}

.ffm__timeline-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ffm__timeline-time {
  font-size: 12px;
  color: var(--map-device-offline);
  white-space: nowrap;
}

.ffm__timeline-operator {
  font-size: 12px;
  color: var(--color-text-strong);
}

.ffm__timeline-action {
  font-size: 12px;
  color: var(--color-accent-2);
}

.ffm__timeline-detail {
  font-size: 12px;
  color: #b8c8dc;
  margin-top: 2px;
}

.ffm__action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 8px 0;
}

.ffm-fade-enter-active,
.ffm-fade-leave-active {
  transition: opacity 0.22s ease;
}

.ffm-fade-enter-from,
.ffm-fade-leave-to {
  opacity: 0;
}
</style>
