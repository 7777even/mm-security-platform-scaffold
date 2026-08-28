<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import AlarmDetailView from '@/components/common/AlarmDetailView.vue';
import {
  createEmergencyEvent,
  fetchAlarmPage,
  type AlarmItem,
  type AlarmLevel,
  type AlarmStatus,
  type AlarmType,
  type EmergencyCategory,
} from '@/services/alarm';

type TabKey = 'event' | 'drill';
const activeTab = ref<TabKey>('event');

// ---- 应急事件：分页列表 + 搜索/筛选 ----
const events = ref<AlarmItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);
const keyword = ref('');
const statusFilter = ref<AlarmStatus | ''>('');
const warnedFilter = ref<'' | 'true' | 'false'>('');

async function loadEvents() {
  const page = await fetchAlarmPage(currentPage.value, pageSize.value);
  let list = page.list;
  if (keyword.value.trim()) {
    const kw = keyword.value.trim();
    list = list.filter(
      (a) =>
        (a.title ?? '').includes(kw) ||
        a.location.includes(kw) ||
        a.description.includes(kw) ||
        a.deviceCode.includes(kw),
    );
  }
  if (statusFilter.value) list = list.filter((a) => a.status === statusFilter.value);
  if (warnedFilter.value !== '') {
    const w = warnedFilter.value === 'true';
    list = list.filter((a) => a.warned === w);
  }
  events.value = list;
  total.value = page.total;
}

function onSearch() {
  currentPage.value = 1;
  loadEvents();
}

function onReset() {
  keyword.value = '';
  statusFilter.value = '';
  warnedFilter.value = '';
  currentPage.value = 1;
  loadEvents();
}

function onPageChange(p: number) {
  currentPage.value = p;
  loadEvents();
}

// ---- 按 category 分组（图示：极端天气 / 消防电话报警 / 储罐消防报警 / 其他）----
const CATEGORY_LABELS: Record<EmergencyCategory, string> = {
  WEATHER: '极端天气',
  FIRE_PHONE: '消防电话报警',
  STORAGE_FIRE: '储罐消防报警',
  OTHER: '其他',
};
const CATEGORY_ORDER: EmergencyCategory[] = ['WEATHER', 'FIRE_PHONE', 'STORAGE_FIRE', 'OTHER'];

const groupedEvents = computed<
  Array<{ key: EmergencyCategory; label: string; items: AlarmItem[] }>
>(() => {
  const map = new Map<EmergencyCategory, AlarmItem[]>();
  for (const cat of CATEGORY_ORDER) map.set(cat, []);
  for (const a of events.value) {
    const cat = (a.category ?? 'OTHER') as EmergencyCategory;
    map.get(cat)!.push(a);
  }
  return CATEGORY_ORDER.filter((c) => (map.get(c) ?? []).length > 0).map((c) => ({
    key: c,
    label: CATEGORY_LABELS[c],
    items: map.get(c) ?? [],
  }));
});

// 操作按钮文案与形态
function actionLabel(s: AlarmStatus): string {
  switch (s) {
    case 'ACTIVE':
      return '去处置';
    case 'ACKED':
    case 'DISPATCHED':
      return '进行中';
    case 'CLOSED':
      return '已结束';
  }
}
function isActionLink(s: AlarmStatus): boolean {
  return s === 'ACTIVE';
}

function typeLabel(t: AlarmType): string {
  const map: Record<AlarmType, string> = {
    FIRE: '火灾',
    GAS: '气体',
    TEMP: '温度',
    CCTV: '视频',
    SOS: '紧急',
  };
  return map[t] ?? t;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ---- 应急演练：本地演示数据 ----
interface DrillItem {
  id: string;
  title: string;
  scope: string;
  status: '计划' | '执行中' | '已完成';
  date: string;
}
const drills = ref<DrillItem[]>([
  {
    id: 'd1',
    title: '罐区泄漏综合应急演练',
    scope: '储运车间',
    status: '已完成',
    date: '2026-08-18',
  },
  { id: 'd2', title: '消防疏散专项演练', scope: '全厂', status: '执行中', date: '2026-08-26' },
  { id: 'd3', title: '防化洗消联合演练', scope: '化工装置区', status: '计划', date: '2026-09-02' },
  { id: 'd4', title: '极端天气停产撤人演练', scope: '全厂', status: '计划', date: '2026-09-10' },
]);

// ---- 弹窗 ----
const createDialogVisible = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive<Partial<AlarmItem>>({
  level: 2,
  type: 'FIRE',
  status: 'ACTIVE',
  deviceCode: '',
  location: '',
  description: '',
});
const createRules: FormRules = {
  level: [{ required: true, message: '请选择等级', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  deviceCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
};

const viewDialogVisible = ref(false);
const viewPayload = ref<AlarmItem | null>(null);

function openCreate() {
  Object.assign(createForm, {
    level: 2,
    type: 'FIRE',
    status: 'ACTIVE',
    deviceCode: '',
    location: '',
    description: '',
  });
  createDialogVisible.value = true;
}

async function submitCreate() {
  const ok = await createFormRef.value?.validate().catch(() => false);
  if (!ok) return;
  await createEmergencyEvent({
    level: createForm.level as AlarmLevel,
    type: createForm.type as AlarmType,
    status: createForm.status as AlarmStatus,
    deviceCode: createForm.deviceCode ?? '',
    location: createForm.location ?? '',
    description: createForm.description ?? '',
  });
  createDialogVisible.value = false;
  loadEvents();
}

function openView(a: AlarmItem) {
  viewPayload.value = a;
  viewDialogVisible.value = true;
}

function onViewAck(a: AlarmItem) {
  const item = events.value.find((e) => e.alarmId === a.alarmId);
  if (item) item.status = 'ACKED';
  if (viewPayload.value) viewPayload.value = { ...viewPayload.value, status: 'ACKED' };
}

function onHandle(a: AlarmItem) {
  onViewAck(a);
  openView(a);
}

onMounted(loadEvents);
</script>

<template>
  <!-- 自定义玻璃面板容器：保留项目 .glass-panel 背景规范，但用自定义标题栏（图示样式） -->
  <section class="event-crud glass-panel">
    <!-- 标题栏：深蓝 3D 倒角 + 凹陷 tab 槽 + 亮蓝高亮（图示效果） -->
    <header class="ec-header">
      <div class="ec-header__tabs">
        <button
          class="ec-tab"
          :class="{ active: activeTab === 'event' }"
          @click="activeTab = 'event'"
        >
          应急事件
        </button>
        <button
          class="ec-tab"
          :class="{ active: activeTab === 'drill' }"
          @click="activeTab = 'drill'"
        >
          应急演练
        </button>
      </div>
      <button class="ec-header__add" @click="openCreate">新增事件</button>
    </header>

    <div class="event-crud-body">
      <!-- ===== 应急事件视图 ===== -->
      <template v-if="activeTab === 'event'">
        <!-- 搜索行 -->
        <div class="ec-search">
          <input
            v-model="keyword"
            class="ec-search__input"
            placeholder="请输入关键词"
            @keyup.enter="onSearch"
          />
          <button class="ec-btn ec-btn--primary" @click="onSearch">搜索</button>
          <button class="ec-btn" @click="onReset">重置</button>
        </div>

        <!-- 筛选：事件状态 / 是否预警 -->
        <div class="ec-filter">
          <el-select
            v-model="statusFilter"
            size="small"
            placeholder="事件状态"
            clearable
            @change="onSearch"
          >
            <el-option label="未处理" value="ACTIVE" />
            <el-option label="已确认" value="ACKED" />
            <el-option label="已派发" value="DISPATCHED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
          <el-select
            v-model="warnedFilter"
            size="small"
            placeholder="是否预警"
            clearable
            @change="onSearch"
          >
            <el-option label="已预警" value="true" />
            <el-option label="未预警" value="false" />
          </el-select>
        </div>

        <!-- 按 category 分组的事件卡片列表 -->
        <div class="ec-list" data-test="crud-table">
          <template v-for="g in groupedEvents" :key="g.key">
            <section class="ec-group">
              <h4 class="ec-group__title">{{ g.label }}</h4>
              <div v-for="a in g.items" :key="a.alarmId" class="ec-card">
                <div class="ec-card__icon" :data-level="a.level">!</div>
                <div class="ec-card__body">
                  <!-- 标题 + 右侧三件套同行右对齐 -->
                  <div class="ec-card__top">
                    <span class="ec-card__title">{{
                      a.title || `${typeLabel(a.type)} · ${a.deviceCode}`
                    }}</span>
                    <div class="ec-card__meta">
                      <span
                        class="ec-badge"
                        :class="a.warned ? 'ec-badge--warn' : 'ec-badge--nowarn'"
                      >
                        {{ a.warned ? '已预警' : '未预警' }}
                      </span>
                      <button
                        v-if="isActionLink(a.status)"
                        class="ec-link ec-link--danger"
                        @click="onHandle(a)"
                      >
                        {{ actionLabel(a.status) }}
                      </button>
                      <button
                        v-else
                        class="ec-action"
                        :class="a.status === 'CLOSED' ? 'ec-action--end' : 'ec-action--active'"
                        :disabled="a.status === 'CLOSED'"
                        @click="openView(a)"
                      >
                        {{ actionLabel(a.status) }}
                      </button>
                      <button class="ec-link" @click="openView(a)">查看</button>
                    </div>
                  </div>
                  <div class="ec-card__row">地点：{{ a.location }}</div>
                  <div class="ec-card__row ec-card__row--addr">
                    地址：{{ a.description || '—' }}
                  </div>
                  <div class="ec-card__row">报告时间：{{ fmtTime(a.ts) }}</div>
                </div>
              </div>
            </section>
          </template>
          <el-empty v-if="!groupedEvents.length" description="暂无事件" :image-size="60" />
        </div>

        <!-- 分页 -->
        <div class="ec-pager">
          <el-pagination
            size="small"
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="onPageChange"
          />
        </div>
      </template>

      <!-- ===== 应急演练视图 ===== -->
      <template v-else>
        <ul class="drill-list">
          <li v-for="d in drills" :key="d.id" class="drill-item">
            <div class="drill-main">
              <span class="drill-title">{{ d.title }}</span>
              <span class="drill-scope">{{ d.scope }}</span>
            </div>
            <div class="drill-foot">
              <span class="drill-date">{{ d.date }}</span>
              <span class="drill-status" :class="d.status">{{ d.status }}</span>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新增应急事件" width="460px" append-to-body>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="84px">
        <el-form-item label="等级" prop="level">
          <el-select v-model="createForm.level" placeholder="请选择">
            <el-option v-for="n in 4" :key="n" :label="`${n} 级`" :value="n" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择">
            <el-option label="火灾" value="FIRE" />
            <el-option label="气体" value="GAS" />
            <el-option label="温度" value="TEMP" />
            <el-option label="视频" value="CCTV" />
            <el-option label="SOS" value="SOS" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createForm.status" placeholder="请选择">
            <el-option label="激活" value="ACTIVE" />
            <el-option label="已确认" value="ACKED" />
            <el-option label="已派发" value="DISPATCHED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编码" prop="deviceCode">
          <el-input v-model="createForm.deviceCode" placeholder="20 位 MDM 设备编码" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="createForm.location" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="事件详情" width="460px" append-to-body>
      <AlarmDetailView
        v-if="viewPayload"
        :alarm="viewPayload"
        @ack="onViewAck"
        @close="viewDialogVisible = false"
      />
    </el-dialog>
  </section>
</template>

<style scoped>
/* 根容器：项目标准 glass-panel（深蓝玻璃 + 边框 + 模糊）+ 弹性列布局 */
.event-crud {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 标题栏：图示效果（深蓝 3D 倒角 + 凹陷 tab 槽 + 亮蓝高亮） */
.ec-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 46px;
  padding: 0 12px;
  flex: 0 0 auto;
  background: linear-gradient(180deg, #0e2a4a 0%, #061528 100%);

  /* 让顶部两个角与玻璃面板的圆角对齐 */
  border-top-left-radius: var(--panel-radius, 8px);
  border-top-right-radius: var(--panel-radius, 8px);
  border-bottom: 1px solid rgb(46 230 168 / 18%);

  /* 3D 倒角：顶部高光 + 底部暗影 */
  box-shadow:
    inset 0 1px 0 rgb(46 230 168 / 28%),
    inset 0 -2px 4px rgb(0 0 0 / 45%);
  overflow: hidden;
}

/* 顶部贯通青色高光线 */
.ec-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgb(46 230 168 / 70%) 50%, transparent 100%);
}

/* 左侧 tab 容器：凹陷的"槽" */
.ec-header__tabs {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  background: rgb(0 0 0 / 32%);
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 55%);
}

/* tab 按钮（图示：未选中半透，选中亮蓝高亮 + 内顶高光） */
.ec-tab {
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgb(255 255 255 / 55%);
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.ec-tab:hover {
  color: rgb(255 255 255 / 85%);
}

.ec-tab.active {
  color: #fff;
  background: linear-gradient(180deg, #2a7fff 0%, #1a5fd9 100%);
  box-shadow:
    0 0 10px rgb(42 127 255 / 50%),
    inset 0 1px 0 rgb(255 255 255 / 22%);
  font-weight: 600;
}

/* 右侧 新增事件 按钮：亮蓝高亮 + 内顶高光（图示右侧按钮） */
.ec-header__add {
  padding: 6px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(180deg, #2a7fff 0%, #1a5fd9 100%);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow:
    0 0 10px rgb(42 127 255 / 40%),
    inset 0 1px 0 rgb(255 255 255 / 22%);
  transition: all 0.2s;
  white-space: nowrap;
}

.ec-header__add:hover {
  filter: brightness(1.1);
  box-shadow:
    0 0 14px rgb(42 127 255 / 55%),
    inset 0 1px 0 rgb(255 255 255 / 28%);
}

.ec-header__add:active {
  filter: brightness(0.95);
}

/* 面板内容容器：撑满剩余空间并提供内边距 */
.event-crud-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px;
}

/* ===== 搜索行 ===== */
.ec-search {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.ec-search__input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-panel-soft, rgb(255 255 255 / 6%));
  border: 1px solid var(--color-border);
  border-radius: 4px;
  outline: none;
}

.ec-search__input::placeholder {
  color: var(--color-text-muted);
}

.ec-search__input:focus {
  border-color: var(--color-accent);
}

.ec-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-panel-soft, rgb(255 255 255 / 6%));
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.ec-btn:hover {
  border-color: var(--color-accent);
}

.ec-btn--primary {
  color: #fff;
  background: var(--color-accent);
  border-color: var(--color-accent);
}

/* ===== 筛选 ===== */
.ec-filter {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.ec-filter :deep(.el-select) {
  flex: 1;
}

/* ===== 分组列表 ===== */
.ec-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.ec-list::-webkit-scrollbar {
  display: none;
}

.ec-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ec-group__title {
  margin: 0;
  padding: 2px 0 2px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-success, #2ee6a8);
  border-left: 3px solid var(--color-success, #2ee6a8);
}

/* ===== 事件卡片 ===== */
.ec-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--color-panel-soft, rgb(255 255 255 / 4%));
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: 6px;
}

.ec-card__icon {
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #1e6cff, #0a3a8c);
  border-radius: 6px;
}

.ec-card__icon[data-level='1'] {
  background: linear-gradient(135deg, #ff4d4f, #a8071a);
}

.ec-card__icon[data-level='2'] {
  background: linear-gradient(135deg, #1e6cff, #0a3a8c);
}

.ec-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ec-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ec-card__title {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ec-card__meta {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.ec-badge {
  flex: 0 0 auto;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.ec-badge--warn {
  color: var(--color-success, #2ee6a8);
  background: rgb(46 230 168 / 16%);
  border-color: rgb(46 230 168 / 40%);
}

.ec-badge--nowarn {
  color: var(--color-text-muted);
  background: rgb(255 255 255 / 8%);
  border-color: var(--color-border);
}

.ec-card__row {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ec-card__row--addr {
  color: var(--color-text);
}

.ec-link {
  padding: 0;
  font-size: 12px;
  color: var(--color-accent);
  background: transparent;
  border: none;
  cursor: pointer;
}

.ec-link:hover {
  text-decoration: underline;
}

.ec-link--danger {
  color: var(--color-warning, #fa8c16);
}

.ec-action {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.ec-action--active {
  color: var(--color-info, #2a7fff);
  background: rgb(42 127 255 / 14%);
  border: 1px solid rgb(42 127 255 / 45%);
}

.ec-action--end {
  color: var(--color-text-muted);
  background: rgb(255 255 255 / 6%);
  border: 1px solid var(--color-border);
  cursor: not-allowed;
  opacity: 0.6;
}

/* ===== 分页 ===== */
.ec-pager {
  display: flex;
  justify-content: center;
  flex: 0 0 auto;
}

/* ===== 应急演练 ===== */
.drill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-width: none;
}

.drill-list::-webkit-scrollbar {
  display: none;
}

.drill-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  background: var(--color-panel-soft, rgb(255 255 255 / 4%));
}

.drill-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.drill-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.drill-scope {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--color-text-muted);
}

.drill-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drill-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.drill-status {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
}

.drill-status.已完成 {
  color: var(--color-success, #2ee6a8);
  background: rgb(46 230 168 / 18%);
}

.drill-status.执行中 {
  color: var(--color-warning, #fa8c16);
  background: rgb(250 140 22 / 18%);
}

.drill-status.计划 {
  color: var(--color-info, #1e6cff);
  background: rgb(30 108 255 / 18%);
}
</style>
