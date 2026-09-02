<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    objectName?: string;
    objectType?: string;
    baseFields?: { label: string; value: string }[];
  }>(),
  {
    objectName: '业务对象',
    objectType: '通用',
    baseFields: () => [
      { label: '对象编码', value: 'OBJ-2026-0810-001' },
      { label: '所属区域', value: 'A装置区' },
      { label: '对象类型', value: '通讯设备' },
      { label: '运行状态', value: '在线' },
      { label: '安装时间', value: '2024-03-12' },
      { label: '维护部门', value: '安环部' },
    ],
  },
);

const emit = defineEmits<{
  close: [];
}>();

type TabKey = 'basic' | 'monitor' | 'video' | 'alarm';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'basic', label: '基础信息' },
  { key: 'monitor', label: '监测点位' },
  { key: 'video', label: '监测视频' },
  { key: 'alarm', label: '历史报警' },
];

const activeTab = ref<TabKey>('basic');

watch(
  () => props.open,
  (visible) => {
    if (visible) activeTab.value = 'basic';
  },
);

const monitorPoints = computed(() => [
  { id: 'mp1', name: `${props.objectName}-压力测点`, value: '0.86 MPa', status: '正常' },
  { id: 'mp2', name: `${props.objectName}-温度测点`, value: '38.5 ℃', status: '正常' },
  { id: 'mp3', name: `${props.objectName}-液位测点`, value: '62%', status: '正常' },
]);

const alarmHistory = computed(() => [
  {
    id: 'a1',
    time: '2026-07-12 14:21:30',
    level: '黄色',
    content: '压力波动超过阈值',
    status: '已处置',
  },
  {
    id: 'a2',
    time: '2026-05-03 09:10:02',
    level: '橙色',
    content: '通讯中断恢复',
    status: '已处置',
  },
]);
</script>

<template>
  <Teleport to="body">
    <Transition name="object-dialog-fade">
      <div v-if="open" class="object-dialog" @click.self="emit('close')">
        <section
          class="object-dialog__panel"
          role="dialog"
          aria-modal="true"
          :aria-label="objectName"
        >
          <header class="object-dialog__header">
            <h3 class="object-dialog__title">{{ objectName }}</h3>
            <span class="object-dialog__type">{{ objectType }}</span>
            <button type="button" class="object-dialog__close" @click="emit('close')">×</button>
          </header>

          <div class="object-dialog__body">
            <nav class="object-dialog__tabs">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                class="object-dialog__tab"
                :class="{ 'object-dialog__tab--active': activeTab === tab.key }"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </nav>

            <div class="object-dialog__content">
              <template v-if="activeTab === 'basic'">
                <div class="object-dialog__rows">
                  <div v-for="field in baseFields" :key="field.label" class="object-dialog__row">
                    <span>{{ field.label }}</span>
                    <em>{{ field.value }}</em>
                  </div>
                </div>
              </template>

              <template v-else-if="activeTab === 'monitor'">
                <table class="object-dialog__table">
                  <thead>
                    <tr>
                      <th>监测点位</th>
                      <th>当前值</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="point in monitorPoints" :key="point.id">
                      <td>{{ point.name }}</td>
                      <td>{{ point.value }}</td>
                      <td class="object-dialog__ok">{{ point.status }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>

              <template v-else-if="activeTab === 'video'">
                <div class="object-dialog__video-grid">
                  <div v-for="n in 4" :key="n" class="object-dialog__video">
                    <span class="object-dialog__video-label">{{ objectName }} · 机位{{ n }}</span>
                  </div>
                </div>
              </template>

              <template v-else>
                <table class="object-dialog__table">
                  <thead>
                    <tr>
                      <th>报警时间</th>
                      <th>等级</th>
                      <th>内容</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="alarm in alarmHistory" :key="alarm.id">
                      <td>{{ alarm.time }}</td>
                      <td>{{ alarm.level }}</td>
                      <td>{{ alarm.content }}</td>
                      <td>{{ alarm.status }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.object-dialog {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.object-dialog__panel {
  display: flex;
  flex-direction: column;
  width: min(860px, 100%);
  height: min(620px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.object-dialog__header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.object-dialog__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.object-dialog__type {
  padding: 2px 8px;
  border: 1px solid rgb(0 180 255 / 40%);
  border-radius: 2px;
  color: #6eb5ff;
  font-size: 12px;
}

.object-dialog__close {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.object-dialog__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px;
  gap: 10px;
}

.object-dialog__tabs {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  border-bottom: 1px solid rgb(0 110 190 / 25%);
}

.object-dialog__tab {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--map-device-offline);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.object-dialog__tab--active {
  color: var(--color-text-strong);
  border-bottom-color: var(--color-accent);
}

.object-dialog__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.object-dialog__rows {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;
}

.object-dialog__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
}

.object-dialog__row span {
  flex-shrink: 0;
  color: var(--map-device-offline);
}

.object-dialog__row em {
  color: #eaf3ff;
  font-style: normal;
}

.object-dialog__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--map-layer-divider);
}

.object-dialog__table th {
  padding: 10px 8px;
  text-align: left;
  font-weight: 500;
  color: var(--map-device-offline);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
}

.object-dialog__table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--list-divider);
}

.object-dialog__ok {
  color: var(--color-success);
}

.object-dialog__video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.object-dialog__video {
  position: relative;
  display: flex;
  align-items: flex-end;
  height: 190px;
  border: 1px solid rgb(0 110 190 / 30%);
  border-radius: 4px;
  background:
    radial-gradient(circle at 50% 42%, rgb(0 80 140 / 35%), transparent 45%),
    linear-gradient(180deg, rgb(0 28 58 / 70%), rgb(0 12 30 / 85%));
}

.object-dialog__video-label {
  width: 100%;
  padding: 6px 8px;
  color: var(--map-device-offline);
  font-size: 11px;
  background: rgb(0 10 24 / 55%);
}

.object-dialog-fade-enter-active,
.object-dialog-fade-leave-active {
  transition: opacity 0.22s ease;
}

.object-dialog-fade-enter-from,
.object-dialog-fade-leave-to {
  opacity: 0;
}
</style>
