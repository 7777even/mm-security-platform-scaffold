<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  emergencyDispatchResources,
  type EmergencyDispatchResource,
} from '@/services/map-data/accidentRescueMock';

const props = withDefaults(
  defineProps<{
    resources?: EmergencyDispatchResource[];
    scenario?: 'accident' | 'weather';
  }>(),
  { resources: () => emergencyDispatchResources, scenario: 'accident' },
);

const emit = defineEmits<{
  focus: [resource: EmergencyDispatchResource];
}>();

const keyword = ref('');
const type = ref('全部类型');
const scope = ref<'1km' | '本区域' | '全厂区'>('本区域');
const status = ref('可调度');
const selectedIds = ref<string[]>([]);
const dispatchOpen = ref(false);
const dispatchChannel = ref<'app' | 'phone'>('app');
const instruction = ref(
  props.scenario === 'weather'
    ? '请立即携带防汛排涝装备赶赴指定易涝点，完成设备布设后通过APP反馈现场水位、设备状态及影像。'
    : '请立即携带相应装备赶赴事故点，服从现场指挥并持续反馈行进状态。',
);
const lastResult = ref('');

const filteredResources = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return props.resources.filter((item) => {
    const matchKeyword =
      !q || `${item.name}${item.code}${item.organization}${item.contact}`.toLowerCase().includes(q);
    return (
      matchKeyword &&
      (type.value === '全部类型' || item.type === type.value) &&
      (scope.value === '全厂区' ||
        (scope.value === '1km' ? item.distanceKm <= 1 : item.area === '炼油区')) &&
      (status.value === '全部状态' || item.status === status.value)
    );
  });
});

const selectedResources = computed(() =>
  props.resources.filter((item) => selectedIds.value.includes(item.id)),
);

function toggleResource(item: EmergencyDispatchResource) {
  if (item.status === '离线') return;
  selectedIds.value = selectedIds.value.includes(item.id)
    ? selectedIds.value.filter((id) => id !== item.id)
    : [...selectedIds.value, item.id];
}

function openDispatch(channel: 'app' | 'phone' = 'app', item?: EmergencyDispatchResource) {
  if (item && !selectedIds.value.includes(item.id)) selectedIds.value = [item.id];
  if (!selectedIds.value.length) return;
  dispatchChannel.value = channel;
  dispatchOpen.value = true;
}

function openItemDispatch(item: EmergencyDispatchResource) {
  emit('focus', item);
  openDispatch('app', item);
}

function confirmDispatch() {
  const names = selectedResources.value.map((item) => item.name).join('、');
  lastResult.value =
    dispatchChannel.value === 'app'
      ? `APP 指令已发送：${names}，等待接收确认。`
      : `已发起电话调度：${names}，通话过程自动留痕。`;
  dispatchOpen.value = false;
}
</script>

<template>
  <section class="resource-dispatch">
    <div class="resource-dispatch__filters">
      <input v-model="keyword" placeholder="资源名称/编号/负责人" />
      <select v-model="type">
        <option>全部类型</option>
        <option>救援队伍</option>
        <option>应急车辆</option>
        <option>应急物资</option>
        <option>应急专家</option>
      </select>
      <select v-model="scope" aria-label="资源范围">
        <option>1km</option>
        <option>本区域</option>
        <option>全厂区</option>
      </select>
      <select v-model="status">
        <option>全部状态</option>
        <option>可调度</option>
        <option>任务中</option>
        <option>离线</option>
      </select>
    </div>

    <div class="resource-dispatch__list ar-scroll">
      <article
        v-for="item in filteredResources"
        :key="item.id"
        class="resource-card"
        :class="{
          'is-selected': selectedIds.includes(item.id),
          'is-offline': item.status === '离线',
        }"
        @click="emit('focus', item)"
      >
        <label class="resource-card__check">
          <input
            type="checkbox"
            :checked="selectedIds.includes(item.id)"
            :disabled="item.status === '离线'"
            @click.stop
            @change="toggleResource(item)"
          />
        </label>
        <div class="resource-card__main">
          <div class="resource-card__head">
            <strong>{{ item.name }}</strong>
            <span class="resource-card__type">{{ item.type }}</span>
            <span class="resource-card__status" :class="`is-${item.status}`">{{
              item.status
            }}</span>
          </div>
          <p>{{ item.code }} · {{ item.organization }}</p>
          <p>{{ item.capacity }}</p>
          <div class="resource-card__meta">
            <span>📍 直线 {{ item.distanceKm }}km</span
            ><span>{{ item.contact }} {{ item.phone }}</span>
          </div>
        </div>
        <div class="resource-card__actions">
          <button
            type="button"
            :disabled="item.status === '离线'"
            @click.stop="openItemDispatch(item)"
          >
            调度
          </button>
        </div>
      </article>
      <div v-if="!filteredResources.length" class="resource-dispatch__empty">
        暂无符合条件的资源
      </div>
    </div>

    <div v-if="lastResult" class="resource-dispatch__result">✓ {{ lastResult }}</div>
    <footer class="resource-dispatch__footer">
      <span>调度过程记录发起人、时间、接收及现场反馈状态</span>
      <button
        type="button"
        class="is-primary"
        :disabled="!selectedIds.length"
        @click="openDispatch()"
      >
        批量调度
      </button>
    </footer>

    <Teleport to="body">
      <div v-if="dispatchOpen" class="dispatch-dialog-mask" @click.self="dispatchOpen = false">
        <section class="dispatch-dialog" role="dialog" aria-modal="true">
          <header>
            <h3>资源调度</h3>
            <button @click="dispatchOpen = false">×</button>
          </header>
          <div class="dispatch-dialog__body">
            <div class="dispatch-dialog__row">
              <span>调度对象</span
              ><strong>{{ selectedResources.map((item) => item.name).join('、') }}</strong>
            </div>
            <div class="dispatch-dialog__row">
              <span>调度方式</span>
              <div class="dispatch-dialog__channels">
                <label><input v-model="dispatchChannel" type="radio" value="app" /> APP消息</label
                ><label><input v-model="dispatchChannel" type="radio" value="phone" /> 电话</label>
              </div>
            </div>
            <label>调度指令<textarea v-model="instruction" rows="4" /></label>
            <p>指令发送后自动生成调度记录；未在 3 分钟内确认的对象将标记催办。</p>
          </div>
          <footer>
            <button @click="dispatchOpen = false">取消</button
            ><button class="is-primary" @click="confirmDispatch">确认调度</button>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.resource-dispatch {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: #dbeafe;
}

.resource-dispatch__filters {
  display: grid;
  grid-template-columns: 1.55fr 1fr 1fr 1fr;
  gap: 6px;
  margin-bottom: 9px;
}

.resource-dispatch input,
.resource-dispatch select,
.dispatch-dialog textarea {
  min-width: 0;
  border: 1px solid rgb(14 165 233 / 34%);
  border-radius: 3px;
  background: #041b36;
  color: #dbeafe;
  font: 12px var(--font-body);
  box-sizing: border-box;
}

.resource-dispatch__filters input,
.resource-dispatch__filters select {
  height: 30px;
  padding: 0 7px;
}

.resource-dispatch__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-right: 3px;
}

.resource-card {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 54px;
  gap: 7px;
  padding: 8px;
  border: 1px solid rgb(16 126 193 / 30%);
  background: rgb(2 25 51 / 82%);
  transition: 0.18s;
}

.resource-card.is-selected {
  border-color: #18c8ff;
  box-shadow: inset 3px 0 #18c8ff;
}

.resource-card.is-offline {
  opacity: 0.55;
}

.resource-card__check {
  padding-top: 2px;
}

.resource-card__check input {
  accent-color: #19c5ff;
}

.resource-card__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.resource-card__head strong {
  font-size: 13px;
  color: #fff;
}

.resource-card__type {
  padding: 1px 5px;
  background: rgb(14 165 233 / 14%);
  color: #62cfff;
  font-size: 10px;
}

.resource-card__status {
  margin-left: auto;
  font-size: 10px;
}

.resource-card__status.is-可调度 {
  color: #42e3a2;
}

.resource-card__status.is-任务中 {
  color: #facc15;
}

.resource-card__status.is-离线 {
  color: #94a3b8;
}

.resource-card p {
  margin: 4px 0 0;
  color: #8eabc7;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-card__meta {
  display: flex;
  gap: 12px;
  margin-top: 5px;
  color: #b8d4ed;
  font-size: 10px;
}

.resource-card__actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resource-card button,
.resource-dispatch__footer button,
.dispatch-dialog button {
  border: 1px solid rgb(14 165 233 / 44%);
  border-radius: 3px;
  background: rgb(3 40 75 / 90%);
  color: #8bdcff;
  font: 11px var(--font-body);
  cursor: pointer;
}

.resource-card button {
  height: 22px;
}

.resource-card button:disabled,
.resource-dispatch__footer button:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.resource-dispatch__result {
  margin-top: 7px;
  padding: 7px 9px;
  border: 1px solid rgb(34 197 94 / 32%);
  background: rgb(22 101 52 / 17%);
  color: #70e8a1;
  font-size: 11px;
}

.resource-dispatch__footer {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-top: 9px;
}

.resource-dispatch__footer span {
  flex: 1;
  color: #6988a8;
  font-size: 10px;
}

.resource-dispatch__footer button {
  height: 30px;
  padding: 0 11px;
}

.resource-dispatch__footer .is-primary,
.dispatch-dialog .is-primary {
  background: linear-gradient(180deg, #087bd4, #075aa7);
  color: #fff;
}

.resource-dispatch__empty {
  padding: 40px 0;
  text-align: center;
  color: #6f8da8;
}

.dispatch-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 10 24 / 70%);
}

.dispatch-dialog {
  width: 620px;
  border: 1px solid rgb(14 165 233 / 55%);
  border-radius: 8px;
  background: linear-gradient(180deg, #08254a, #04182f);
  box-shadow: 0 20px 60px #0009;
  color: #dbeafe;
}

.dispatch-dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid rgb(14 165 233 / 30%);
}

.dispatch-dialog h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.dispatch-dialog header button {
  border: 0;
  background: none;
  font-size: 22px;
}

.dispatch-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.dispatch-dialog__row {
  display: grid;
  grid-template-columns: 90px 1fr;
  font-size: 13px;
}

.dispatch-dialog__row span,
.dispatch-dialog label {
  color: #8fb2d1;
}

.dispatch-dialog textarea {
  display: block;
  width: 100%;
  margin-top: 7px;
  padding: 8px;
  resize: none;
}

.dispatch-dialog p {
  margin: 0;
  color: #6f8da8;
  font-size: 12px;
}

.dispatch-dialog footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 16px 16px;
}

.dispatch-dialog footer button {
  min-width: 88px;
  height: 32px;
}

.resource-card {
  cursor: pointer;
}

.resource-card:hover {
  border-color: rgb(24 200 255 / 62%);
}

.resource-card__actions {
  justify-content: center;
}

.resource-card__actions button {
  height: 30px;
}

.dispatch-dialog__channels {
  display: flex;
  gap: 22px;
}

.dispatch-dialog__channels input {
  accent-color: #1abfff;
}
</style>
