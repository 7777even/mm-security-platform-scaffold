<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type {
  EmergencyEventCreateKind,
  EmergencyEventCreatePayload,
} from '../../../lib/composables/useFireEmergencyEventList';

const props = defineProps<{
  open: boolean;
  kind: EmergencyEventCreateKind;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: EmergencyEventCreatePayload];
}>();

function formatDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createDefaultForm(kind: EmergencyEventCreateKind): EmergencyEventCreatePayload {
  const isDrill = kind === 'drill';
  return {
    kind,
    eventCategory: 'default',
    name: isDrill ? '储罐区消防演练' : '东厂区突发应急事件',
    level: '一级',
    occurTime: formatDatetimeLocal(new Date()),
    eventType: isDrill ? '演练事件' : '突发应急事件',
    description: isDrill
      ? '按计划开展联合应急演练，检验响应流程与协同处置能力。'
      : '现场发现异常情况，需立即核实并启动应急处置流程。',
    device: 'A装置',
    chemical: '原油',
    source: '手动新增',
    reporter: '张三',
    receiver: '李四',
    phone: '13800138000',
    deathCount: '0',
    seriousInjuryCount: '0',
    minorInjuryCount: '0',
    measures: '已通知现场值班人员核实情况，并做好初期隔离准备。',
    weatherType: '台风暴雨',
    warningLevel: '橙色预警',
    affectedArea: '炼油区',
    monitoringPeriod: '未来24小时',
  };
}

const form = reactive<EmergencyEventCreatePayload>(createDefaultForm('event'));

const dialogTitle = computed(() =>
  form.kind === 'drill'
    ? '新增演练'
    : form.eventCategory === 'extremeWeather'
      ? '新增极端天气事件'
      : '新增应急事件',
);

const isWeather = computed(() => form.kind === 'event' && form.eventCategory === 'extremeWeather');

function selectBusinessType(type: 'event' | 'weather' | 'drill') {
  if (type === 'drill') {
    resetForm('drill');
  } else {
    resetForm('event');
    form.eventCategory = type === 'weather' ? 'extremeWeather' : 'default';
    if (type === 'weather') {
      form.name = '台风暴雨防台防汛应急事件';
      form.eventType = '极端天气事件';
      form.description =
        '受台风外围云系影响，厂区预计出现暴雨及阵风，启动重点易涝点巡查与排涝准备。';
      form.measures = '已通知各单位落实防台防汛措施，重点易涝点加强巡查，排涝设备进入热备状态。';
    }
  }
}

function resetForm(kind: EmergencyEventCreateKind) {
  Object.assign(form, createDefaultForm(kind));
}

watch(
  () => props.open,
  (visible) => {
    if (!visible) return;
    resetForm(props.kind);
  },
);

watch(
  () => props.kind,
  (kind) => {
    if (props.open) resetForm(kind);
  },
);

function close() {
  emit('close');
}

function handleSubmit() {
  emit('submit', { ...form });
  close();
}

function onFilePick() {
  // 演示：实际上传逻辑待接入
}
</script>

<template>
  <Teleport to="body">
    <Transition name="eem-fade">
      <div v-if="open" class="eem-overlay" @click.self="close">
        <div class="eem-dialog" role="dialog" aria-modal="true">
          <header class="eem-dialog__header">
            <h2 class="eem-dialog__title">{{ dialogTitle }}</h2>
            <button type="button" class="eem-dialog__close" aria-label="关闭" @click="close">
              ×
            </button>
          </header>

          <div class="eem-dialog__body">
            <div class="eem-kind-row" aria-label="业务事件类型">
              <label class="eem-radio">
                <input
                  :checked="form.kind === 'event' && form.eventCategory === 'default'"
                  type="radio"
                  @change="selectBusinessType('event')"
                />
                <span>应急事件</span>
              </label>
              <label class="eem-radio">
                <input :checked="isWeather" type="radio" @change="selectBusinessType('weather')" />
                <span>极端天气事件</span>
              </label>
              <label class="eem-radio">
                <input
                  :checked="form.kind === 'drill'"
                  type="radio"
                  @change="selectBusinessType('drill')"
                />
                <span>应急演练</span>
              </label>
            </div>

            <div v-if="isWeather" class="eem-scenario-hint">
              极端天气事件将进入防台防汛专用处置页，并关联气象、易涝点、水位及现场视频数据。
            </div>

            <div v-if="isWeather" class="eem-grid eem-grid--2">
              <label class="eem-field"
                ><span class="eem-label eem-label--required">天气类型</span
                ><select v-model="form.weatherType" class="eem-select">
                  <option>台风暴雨</option>
                  <option>短时强降雨</option>
                  <option>雷暴大风</option>
                  <option>高温</option>
                  <option>寒潮</option>
                </select></label
              >
              <label class="eem-field"
                ><span class="eem-label eem-label--required">预警等级</span
                ><select v-model="form.warningLevel" class="eem-select">
                  <option>红色预警</option>
                  <option>橙色预警</option>
                  <option>黄色预警</option>
                  <option>蓝色预警</option>
                </select></label
              >
              <label class="eem-field"
                ><span class="eem-label">影响范围</span
                ><select v-model="form.affectedArea" class="eem-select">
                  <option>炼油区</option>
                  <option>化工区</option>
                  <option>港区</option>
                  <option>全厂区</option>
                </select></label
              >
              <label class="eem-field"
                ><span class="eem-label">监测时段</span
                ><select v-model="form.monitoringPeriod" class="eem-select">
                  <option>未来6小时</option>
                  <option>未来12小时</option>
                  <option>未来24小时</option>
                  <option>未来48小时</option>
                </select></label
              >
            </div>

            <div class="eem-grid eem-grid--2">
              <label class="eem-field">
                <span class="eem-label eem-label--required">事件名称</span>
                <input v-model="form.name" class="eem-input" type="text" placeholder="请输入" />
              </label>
              <label class="eem-field">
                <span class="eem-label">事件级别</span>
                <select v-model="form.level" class="eem-select">
                  <option>一级</option>
                  <option>二级</option>
                  <option>三级</option>
                  <option>四级</option>
                </select>
              </label>
            </div>

            <div class="eem-grid eem-grid--2">
              <label class="eem-field">
                <span class="eem-label">事发时间</span>
                <input
                  v-model="form.occurTime"
                  class="eem-input"
                  type="datetime-local"
                  placeholder="请选择时间"
                />
              </label>
              <label class="eem-field">
                <span class="eem-label">事件类型</span>
                <select v-model="form.eventType" class="eem-select">
                  <option>突发应急事件</option>
                  <option>演练事件</option>
                  <option>预警事件</option>
                  <option>极端天气事件</option>
                </select>
              </label>
            </div>

            <label class="eem-field eem-field--full">
              <span class="eem-label">事件描述</span>
              <textarea
                v-model="form.description"
                class="eem-textarea"
                rows="3"
                placeholder="请输入"
              />
            </label>

            <div v-if="!isWeather" class="eem-grid eem-grid--2">
              <label class="eem-field">
                <span class="eem-label eem-label--required">涉及装置</span>
                <select v-model="form.device" class="eem-select">
                  <option value="">请选择装置</option>
                  <option>A装置</option>
                  <option>B装置</option>
                  <option>储罐区</option>
                </select>
              </label>
              <label class="eem-field">
                <span class="eem-label">涉及化学品</span>
                <select v-model="form.chemical" class="eem-select">
                  <option value="">请选择化学品</option>
                  <option>原油</option>
                  <option>乙烯</option>
                  <option>丙烯</option>
                </select>
              </label>
            </div>

            <div class="eem-grid eem-grid--2">
              <label class="eem-field">
                <span class="eem-label eem-label--required">事件来源</span>
                <select v-model="form.source" class="eem-select">
                  <option>手动新增</option>
                  <option>系统接入</option>
                  <option>电话报警</option>
                </select>
              </label>
              <label class="eem-field">
                <span class="eem-label">报警人</span>
                <input v-model="form.reporter" class="eem-input" type="text" placeholder="请输入" />
              </label>
            </div>

            <div class="eem-grid eem-grid--2">
              <label class="eem-field">
                <span class="eem-label">接警人</span>
                <input v-model="form.receiver" class="eem-input" type="text" placeholder="请输入" />
              </label>
              <label class="eem-field">
                <span class="eem-label">报警电话</span>
                <input v-model="form.phone" class="eem-input" type="text" placeholder="请输入" />
              </label>
            </div>

            <div v-if="!isWeather" class="eem-field eem-field--full">
              <span class="eem-label">现场伤亡情况</span>
              <div class="eem-casualty-row">
                <label class="eem-casualty">
                  <span>死亡人数</span>
                  <input
                    v-model="form.deathCount"
                    class="eem-input eem-input--short"
                    type="text"
                    placeholder="请输入"
                  />
                </label>
                <label class="eem-casualty">
                  <span>重伤人数</span>
                  <input
                    v-model="form.seriousInjuryCount"
                    class="eem-input eem-input--short"
                    type="text"
                    placeholder="请输入"
                  />
                </label>
                <label class="eem-casualty">
                  <span>轻伤人数</span>
                  <input
                    v-model="form.minorInjuryCount"
                    class="eem-input eem-input--short"
                    type="text"
                    placeholder="请输入"
                  />
                </label>
              </div>
            </div>

            <label class="eem-field eem-field--full">
              <span class="eem-label">已采取的措施</span>
              <textarea
                v-model="form.measures"
                class="eem-textarea"
                rows="3"
                placeholder="请输入"
              />
            </label>

            <div class="eem-field eem-field--full">
              <span class="eem-label">具体点位标注</span>
              <div class="eem-map-placeholder">
                <span class="eem-map-placeholder__text">地图控件</span>
              </div>
            </div>

            <div class="eem-upload-row">
              <div class="eem-upload-item">
                <span class="eem-label">{{
                  form.kind === 'drill' ? '演练脚本' : isWeather ? '气象预警材料' : '现场附件'
                }}</span>
                <button type="button" class="eem-upload-btn" @click="onFilePick">+ 上传文件</button>
              </div>
              <div class="eem-upload-item">
                <span class="eem-label">其它附件</span>
                <button type="button" class="eem-upload-btn" @click="onFilePick">+ 上传文件</button>
              </div>
            </div>
          </div>

          <footer class="eem-dialog__footer">
            <button type="button" class="eem-btn eem-btn--primary" @click="handleSubmit">
              提交
            </button>
            <button type="button" class="eem-btn eem-btn--ghost" @click="close">取消</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.eem-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 8 20 / 72%);
  backdrop-filter: blur(2px);
}

.eem-dialog {
  width: min(920px, 100%);
  max-height: min(90vh, 880px);
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(0 140 220 / 45%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%) 0%, rgb(4 18 40 / 98%) 100%);
  box-shadow: 0 18px 48px rgb(0 0 0 / 45%);

  --eem-accent: #7cdbff;
  --eem-accent-rgb: 124, 219, 255;
  --eem-border: rgb(0 100 180 / 38%);
  --eem-border-strong: rgb(0 140 220 / 50%);
  --eem-btn-primary: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  --eem-btn-primary-border: rgb(0 160 240 / 55%);
}

.eem-dialog__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 12px;
  border-bottom: 1px solid var(--eem-border);
}

.eem-dialog__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.eem-dialog__close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.eem-dialog__close:hover {
  color: #fff;
  background: rgb(255 255 255 / 6%);
}

.eem-dialog__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 20px 8px;
}

.eem-dialog__body::-webkit-scrollbar {
  width: 5px;
}

.eem-dialog__body::-webkit-scrollbar-thumb {
  background: rgba(var(--eem-accent-rgb), 0.35);
  border-radius: 3px;
}

.eem-kind-row {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 16px;
}

.eem-scenario-hint {
  margin: -6px 0 14px;
  padding: 9px 11px;
  border-left: 3px solid #22c3ff;
  background: rgb(0 150 236 / 10%);
  color: #9ddcff;
  font-size: 12px;
  line-height: 1.5;
}

.eem-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #d8e8f8;
  cursor: pointer;
}

.eem-radio input {
  accent-color: var(--eem-accent);
}

.eem-grid {
  display: grid;
  gap: 12px 16px;
  margin-bottom: 12px;
}

.eem-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.eem-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.eem-field--full {
  margin-bottom: 12px;
}

.eem-label {
  font-size: 13px;
  color: #b8c8dc;
  line-height: 1.3;
}

.eem-label--required::before {
  content: '*';
  color: #ff7070;
  margin-right: 2px;
}

.eem-input,
.eem-select,
.eem-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--eem-border);
  border-radius: 2px;
  background: rgb(0 20 45 / 82%);
  color: #e8f2ff;
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.eem-input,
.eem-select {
  height: 34px;
  padding: 0 10px;
}

.eem-input--short {
  width: 100%;
}

.eem-textarea {
  padding: 8px 10px;
  resize: vertical;
  min-height: 72px;
}

.eem-input:focus,
.eem-select:focus,
.eem-textarea:focus {
  border-color: var(--eem-border-strong);
  box-shadow: 0 0 0 1px rgba(var(--eem-accent-rgb), 0.25);
}

.eem-input::placeholder,
.eem-textarea::placeholder {
  color: #6a8098;
}

.eem-casualty-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.eem-casualty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #9aadc4;
}

.eem-map-placeholder {
  height: 200px;
  border: 1px dashed var(--eem-border-strong);
  border-radius: 2px;
  background:
    linear-gradient(135deg, rgb(0 30 60 / 35%) 25%, transparent 25%) 0 0 / 24px 24px,
    linear-gradient(225deg, rgb(0 30 60 / 35%) 25%, transparent 25%) 0 0 / 24px 24px,
    rgb(0 16 36 / 65%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.eem-map-placeholder__text {
  font-size: 15px;
  color: rgba(var(--eem-accent-rgb), 0.75);
}

.eem-upload-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 4px;
}

.eem-upload-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.eem-upload-btn {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--eem-border-strong);
  border-radius: 2px;
  background: rgb(0 35 70 / 55%);
  color: var(--eem-accent);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.eem-upload-btn:hover {
  background: rgba(var(--eem-accent-rgb), 0.12);
}

.eem-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--eem-border);
}

.eem-btn {
  min-width: 96px;
  height: 34px;
  padding: 0 20px;
  border-radius: 2px;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
}

.eem-btn--primary {
  border: 1px solid var(--eem-btn-primary-border);
  background: var(--eem-btn-primary);
  color: #fff;
}

.eem-btn--ghost {
  border: 1px solid var(--eem-border-strong);
  background: rgb(0 25 55 / 65%);
  color: #c8dcec;
}

.eem-fade-enter-active,
.eem-fade-leave-active {
  transition: opacity 0.22s ease;
}

.eem-fade-enter-from,
.eem-fade-leave-to {
  opacity: 0;
}

@media (width <= 720px) {
  .eem-grid--2,
  .eem-casualty-row,
  .eem-upload-row {
    grid-template-columns: 1fr;
  }
}
</style>
