<!--
  FireFacilityMonitoringDialog — 消防设施运行监测（二级界面 facility）
  对标参考 FireFacilityMonitoringDialog：设施监控总览 + 故障 / 告警 / 工单 / 台账 多视图。
  数据消费 fireFacilityMonitoringMock（fireFacilityMonitorSummaries / faults / alarms / workOrders / ledger）。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import {
  fireFacilityMonitorSummaries,
  fireFacilityFaults,
  fireFacilityAlarms,
  fireFacilityWorkOrders,
  resolveFacilityLedgerByType,
  loadFireFacilityMonitors,
  loadFireFacilityFaults,
  loadFireFacilityAlarms,
  loadFireFacilityWorkOrders,
  loadFireFacilityLedger,
} from '@/services/map-data/fireFacilityMonitoringMock';

const emit = defineEmits<{ close: [] }>();

type Tab = 'overview' | 'fault' | 'alarm' | 'order' | 'ledger';
const tab = ref<Tab>('overview');
const ledgerType = ref<string>(fireFacilityMonitorSummaries[0]?.facilityType ?? '');

// 业务数据：预填本地 fixture，配置后端后首次挂载拉取真实端点（失败/契约不符回落 fixture）。
const monitorSummaries = ref<typeof fireFacilityMonitorSummaries>(fireFacilityMonitorSummaries);
const faultList = ref<typeof fireFacilityFaults>(fireFacilityFaults);
const alarmList = ref<typeof fireFacilityAlarms>(fireFacilityAlarms);
const workOrderList = ref<typeof fireFacilityWorkOrders>(fireFacilityWorkOrders);

const ledgerRows = computed(() => resolveFacilityLedgerByType(ledgerType.value));

onMounted(() => {
  void loadFireFacilityMonitors().then((items) => {
    monitorSummaries.value = items;
    if (!ledgerType.value && items[0]) ledgerType.value = items[0].facilityType;
  });
  void loadFireFacilityFaults().then((items) => (faultList.value = items));
  void loadFireFacilityAlarms().then((items) => (alarmList.value = items));
  void loadFireFacilityWorkOrders().then((items) => (workOrderList.value = items));
  void loadFireFacilityLedger();
});

function overviewTone(s: string): 'ok' | 'warn' | 'danger' {
  if (s === '正常') return 'ok';
  if (s === '离线') return 'warn';
  return 'danger';
}
function levelTone(l: string): 'danger' | 'warn' | 'muted' {
  if (l === '紧急') return 'danger';
  if (l === '重要') return 'warn';
  return 'muted';
}
function faultTone(s: string): 'ok' | 'danger' {
  return s === '已闭环' ? 'ok' : 'danger';
}
</script>

<template>
  <ScreenDialog :open="true" title="消防设施运行监测" icon="crane" @close="emit('close')">
    <div class="fac">
      <div class="fac__tabs">
        <button
          v-for="t in ['overview', 'fault', 'alarm', 'order', 'ledger'] as Tab[]"
          :key="t"
          type="button"
          :class="['fac__tab', { 'fac__tab--active': tab === t }]"
          @click="tab = t"
        >
          {{
            t === 'overview'
              ? '监控总览'
              : t === 'fault'
                ? '故障记录'
                : t === 'alarm'
                  ? '告警记录'
                  : t === 'order'
                    ? '维修工单'
                    : '设施台账'
          }}
        </button>
      </div>

      <!-- 监控总览 -->
      <div v-if="tab === 'overview'" class="fac__grid">
        <div v-for="s in monitorSummaries" :key="s.key" class="fcard">
          <div class="fcard__head">
            <span class="fcard__name">{{ s.facilityType }}</span>
            <span :class="['fcard__status', `is-${overviewTone(s.status)}`]">{{ s.status }}</span>
          </div>
          <div class="fcard__nums">
            <div>
              <b class="num">{{ s.total }}</b
              ><i>总数</i>
            </div>
            <div>
              <b class="num ok">{{ s.online }}</b
              ><i>在线</i>
            </div>
            <div>
              <b class="num warn">{{ s.offline }}</b
              ><i>离线</i>
            </div>
            <div>
              <b class="num danger">{{ s.fault }}</b
              ><i>故障</i>
            </div>
          </div>
          <ul class="fcard__params">
            <li v-for="p in s.params" :key="p.label">
              <span>{{ p.label }}</span
              ><b :class="`is-${p.tone}`">{{ p.value }}</b>
            </li>
          </ul>
          <div class="fcard__time num">上报 {{ s.lastReportTime }}</div>
        </div>
      </div>

      <!-- 故障记录 -->
      <div v-else-if="tab === 'fault'" class="tbl">
        <div v-for="f in faultList" :key="f.id" class="trow">
          <span class="num">{{ f.faultCode }}</span>
          <span>{{ f.facilityName }}</span>
          <span>{{ f.faultType }}</span>
          <span :class="['tag', `is-${levelTone(f.faultLevel)}`]">{{ f.faultLevel }}</span>
          <span>{{ f.discoverTime }}</span>
          <span :class="['tag', `is-${faultTone(f.status)}`]">{{ f.status }}</span>
        </div>
      </div>

      <!-- 告警记录 -->
      <div v-else-if="tab === 'alarm'" class="tbl">
        <div v-for="a in alarmList" :key="a.id" class="trow">
          <span>{{ a.source }}</span>
          <span>{{ a.facilityType }}</span>
          <span :class="['tag', `is-${levelTone(a.level)}`]">{{ a.level }}</span>
          <span>{{ a.category }}</span>
          <span class="desc">{{ a.content }}</span>
          <span :class="['tag', `is-${faultTone(a.status)}`]">{{ a.status }}</span>
        </div>
      </div>

      <!-- 维修工单 -->
      <div v-else-if="tab === 'order'" class="tbl">
        <div v-for="o in workOrderList" :key="o.id" class="trow">
          <span class="num">{{ o.workOrderNo }}</span>
          <span>{{ o.facilityName }}</span>
          <span :class="['tag', `is-${levelTone(o.faultLevel)}`]">{{ o.faultLevel }}</span>
          <span class="desc">{{ o.description }}</span>
          <span>{{ o.repairPerson }}</span>
          <span :class="['tag', o.status === '已完成' ? 'is-ok' : 'is-warn']">{{ o.status }}</span>
        </div>
      </div>

      <!-- 设施台账 -->
      <div v-else class="ledger">
        <select v-model="ledgerType" class="ledger__select">
          <option v-for="s in monitorSummaries" :key="s.key" :value="s.facilityType">
            {{ s.facilityType }}
          </option>
        </select>
        <div class="tbl">
          <div v-for="l in ledgerRows" :key="l.facilityCode" class="trow">
            <span class="num">{{ l.facilityCode }}</span>
            <span>{{ l.facilityName }}</span>
            <span>{{ l.facilityType }}</span>
            <span class="desc">{{ l.location }}</span>
            <span>{{ l.maintainerName }}</span>
            <span class="num">{{ l.maintainerPhone }}</span>
          </div>
          <p v-if="ledgerRows.length === 0" class="tbl__empty">
            <PkgIcon name="crane" size="36px" class="empty__icon" />
            该类型暂无台账
          </p>
        </div>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.fac {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.fac__tabs {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.fac__tab {
  padding: 5px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  color: var(--color-text-muted);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.fac__tab--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.fac__grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-md);
  align-content: start;
}

.fcard {
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fcard__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fcard__name {
  font-size: var(--font-size-biz);
  font-weight: 600;
  color: var(--color-text-strong);
}

.fcard__status {
  font-size: var(--font-size-helper);
  font-weight: 600;
}

.fcard__status.is-ok {
  color: var(--color-success);
}

.fcard__status.is-warn {
  color: var(--color-warning);
}

.fcard__status.is-danger {
  color: var(--color-alarm-1);
}

.fcard__nums {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  text-align: center;
}

.fcard__nums div {
  display: flex;
  flex-direction: column;
}

.fcard__nums b {
  font-family: var(--font-number);
  font-size: var(--font-size-h2);
  color: var(--color-text-strong);
}

.fcard__nums .ok {
  color: var(--color-success);
}

.fcard__nums .warn {
  color: var(--color-warning);
}

.fcard__nums .danger {
  color: var(--color-alarm-1);
}

.fcard__nums i {
  font-style: normal;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.fcard__params {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fcard__params li {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.fcard__params b {
  color: var(--color-text-strong);
}

.fcard__params .is-warning {
  color: var(--color-warning);
}

.fcard__params .is-danger {
  color: var(--color-alarm-1);
}

.fcard__time {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

/* 通用表格行（故障/告警/工单/台账） */
.tbl {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trow {
  display: grid;
  grid-template-columns: 110px 1fr 72px 1fr 130px 96px;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.trow .num {
  font-family: var(--font-number);
}

.trow .desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}

.tag {
  justify-self: start;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: var(--font-size-helper);
  font-weight: 600;
}

.tag.is-ok {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 50%, transparent);
}

.tag.is-warn {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 50%, transparent);
}

.tag.is-danger {
  color: var(--color-alarm-1);
  background: color-mix(in srgb, var(--color-alarm-1) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
}

.tag.is-muted {
  color: var(--color-text-muted);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.tbl__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-lg);
}

.empty__icon {
  color: var(--color-text-muted);
}

.ledger {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ledger__select {
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
}
</style>
