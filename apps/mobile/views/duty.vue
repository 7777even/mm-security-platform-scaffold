<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchDutyRoster, type DutyMember } from '@/services/duty';
import { fetchDutySignIns, type DutySignInView } from '@/services/businessWrite';

/**
 * 今日值班（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/emergency/duty（应急值班值守），经 fetchDutyRoster 拉取。
 * 取消原 data/mock.ts 静态数据；未连后端由 service 内部走空态 + 全局离线告警（不回灌假数据）。
 * 月历为纯前端几何（保留），值班名单改为真实成员。
 *
 * 「签到记录」区块读 /api/v1/emergency/duty-sign-ins（fac_duty_sign_in）——
 * 与管理端「值班签到」写侧同一张表；值班花名册（/emergency/duty）与签到留痕是两张表，
 * 此前他端看不到签到动作，本区块用于打通该写侧联动。
 */
const YEAR = 2026;
const MONTH = 8;
const DAYS_IN_MONTH = 31;
const TODAY = 21;
const DUTY_DAYS = [18, 22];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/** 签到动作枚举 → 中文（后端 /emergency/duty-sign-ins 只接受 SIGN_IN / SIGN_OUT 英文码）。 */
const SIGN_ACTION_LABEL: Record<string, string> = { SIGN_IN: '签到', SIGN_OUT: '签退' };

const days = computed(() => Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1));

/** 1 号落在星期几 → 前置空格数，保证日期与星期列对齐 */
const leadingBlanks = computed(() => new Date(YEAR, MONTH - 1, 1).getDay());

interface DutyRow {
  id: string;
  shift: string;
  name: string;
  room: string;
  tel: string;
}

const loading = ref(false);
const list = ref<DutyRow[]>([]);
/** 最近签到记录（他端写、本端读）。 */
const signIns = ref<DutySignInView[]>([]);

function toRow(m: DutyMember): DutyRow {
  return {
    id: m.id,
    shift: m.shift,
    name: m.name,
    room: m.department,
    tel: m.phone,
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    // 签到记录失败时内部已告警并返回空数组（不抛错），与花名册并列拉取不影响本页主数据。
    const [roster, signInRows] = await Promise.all([fetchDutyRoster(), fetchDutySignIns()]);
    list.value = (roster.members ?? []).map(toRow);
    signIns.value = signInRows.slice(0, 5);
  } catch {
    list.value = [];
    signIns.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="今日值班" back-to="/home" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-calendar__head">{{ YEAR }}年{{ MONTH }}月</div>
        <div class="mb-calendar__grid duty__week">
          <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
        </div>
        <div class="mb-calendar__grid">
          <span v-for="b in leadingBlanks" :key="`blank-${b}`" class="mb-cell" />
          <span
            v-for="d in days"
            :key="d"
            class="mb-cell"
            :class="{ 'mb-cell--today': d === TODAY, 'mb-cell--duty': DUTY_DAYS.includes(d) }"
          >
            {{ d }}
          </span>
        </div>
      </div>

      <h2 class="mb-section__title duty__sec">今日值班（{{ MONTH }}月{{ TODAY }}日）</h2>

      <p v-if="loading" class="mb-loading">加载中…</p>

      <template v-else-if="list.length">
        <div v-for="d in list" :key="d.id" class="mb-row">
          <span class="mb-avatar mb-avatar--sm">{{ d.name.slice(0, 1) }}</span>
          <div class="mb-row__main">
            <p class="mb-row__title">{{ d.name }}</p>
            <p class="mb-row__desc">{{ d.shift }} · {{ d.room }}</p>
          </div>
          <button type="button" class="mb-btn-primary mb-btn-sm">
            <Icon name="phone" size="var(--mb-ico-xs)" />
            拨号
          </button>
        </div>
      </template>

      <div v-else class="mb-empty">
        <div class="mb-empty__art" />
        <p class="mb-empty__text">暂无值班信息</p>
      </div>

      <template v-if="signIns.length">
        <h2 class="mb-section__title duty__sec">签到记录</h2>
        <div v-for="(s, i) in signIns" :key="s.id ?? `${s.dutyDate}-${i}`" class="mb-card">
          <div class="mb-card__title">
            <span>{{ s.personName || '—' }}</span>
            <span class="tag" :class="s.signAction === 'SIGN_OUT' ? 'tag--info' : 'tag--success'">
              {{ SIGN_ACTION_LABEL[s.signAction ?? ''] || s.signAction || '签到' }}
            </span>
          </div>
          <p class="mb-card__desc">
            {{ s.dutyDate }} {{ s.shiftName }} · {{ s.department || '—' }}
          </p>
          <p class="mb-card__desc">
            签到时间 {{ s.signTime || '—' }}{{ s.remark ? ` · ${s.remark}` : '' }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.duty__week {
  margin-bottom: var(--space-xs);
  font-weight: 600;
  color: var(--mb-muted);
}

.duty__sec {
  margin: var(--space-md) 0 0;
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
