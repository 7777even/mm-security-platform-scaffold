<!--
  FireAlarmPanel — §消防报警「消防告警」
  告警卡：左图 + 主信息（标题 + 类型chip + 未处置badge + 位置 + 时间 + 描述
         + 操作链接：视频监控/告警图片/现场监控/处置调度 + 一键应急）。
  色调：fire 暖色（橙），dcs 冷色（青）。
-->
<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue';
import PanelCard from '@/components/common/PanelCard.vue';

type Tone = 'fire' | 'dcs';

interface FireAlarm {
  id: string;
  title: string;
  typeLabel: string;
  tone: Tone;
  location: string;
  time: string;
  desc: string;
  unhandled: boolean;
}

const actions = ['视频监控', '告警图片', '现场监控', '处置调度'];

const alarms: FireAlarm[] = [
  {
    id: '1',
    title: 'A装置区火灾',
    typeLabel: '火灾报警',
    tone: 'fire',
    location: '炼油厂区西侧',
    time: '2026/03/17 14:21:30',
    desc: 'A装置区发现明火，请立即核实并启动处置。',
    unhandled: true,
  },
  {
    id: '2',
    title: 'GDS报警',
    typeLabel: 'DCS/GDS',
    tone: 'dcs',
    location: '炼油厂区西侧',
    time: '2026/03/17 14:18:12',
    desc: 'GDS检测到可燃气体浓度短时升高，请现场复核。',
    unhandled: true,
  },
  {
    id: '3',
    title: 'A仓库失火',
    typeLabel: '火灾报警',
    tone: 'fire',
    location: '仓储区A库',
    time: '2026/03/17 13:56:08',
    desc: '视频监控识别到烟雾异常，疑似火点。',
    unhandled: true,
  },
];

function onAction(act: string, a: FireAlarm): void {
  console.warn('[fire-alarm]', act, a.id);
}
</script>

<template>
  <PanelCard title="消防告警" icon="Bell" more="全部">
    <ul class="list">
      <li v-for="a in alarms" :key="a.id" class="alarm">
        <div :class="['alarm__img', `alarm__img--${a.tone}`]" aria-hidden="true">
          <WarningFilled class="alarm__img-icon" />
        </div>
        <div class="alarm__main">
          <div class="alarm__head">
            <span :class="['alarm__title', `alarm__title--${a.tone}`]">{{ a.title }}</span>
            <span :class="['alarm__type', `alarm__type--${a.tone}`]">{{ a.typeLabel }}</span>
            <span v-if="a.unhandled" class="alarm__badge">未处置</span>
          </div>
          <div class="alarm__loc">{{ a.location }}</div>
          <div class="alarm__time">{{ a.time }}</div>
          <div class="alarm__desc">{{ a.desc }}</div>
          <div class="alarm__actions">
            <button
              v-for="act in actions"
              :key="act"
              type="button"
              class="alarm__action"
              @click="onAction(act, a)"
            >
              {{ act }}
            </button>
          </div>
          <button type="button" class="alarm__start" @click="onAction('一键应急', a)">
            一键应急
          </button>
        </div>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alarm {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

/* 左侧告警图片占位（按告警色调区分） */
.alarm__img {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alarm__img--fire {
  background: linear-gradient(135deg, #2a1810, #6a2a14);
  color: var(--tone-fire);
}

.alarm__img--dcs {
  background: linear-gradient(135deg, #0a1a2a, #1a3a5a);
  color: var(--tone-dcs);
}

.alarm__img-icon {
  width: 26px;
  height: 26px;
}

.alarm__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 标题行：标题 + 类型 chip + 未处置（行右） */
.alarm__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alarm__title {
  font-size: var(--font-size-biz);
  font-weight: 700;
}

.alarm__title--fire {
  color: var(--tone-fire);
}

.alarm__title--dcs {
  color: var(--tone-dcs);
}

.alarm__type {
  font-size: var(--font-size-date);
  padding: 1px 8px;
  border-radius: 4px;
}

.alarm__type--fire {
  color: var(--tone-fire);
  border: 1px solid color-mix(in srgb, var(--tone-fire) 60%, transparent);
  background: color-mix(in srgb, var(--tone-fire) 12%, transparent);
}

.alarm__type--dcs {
  color: var(--tone-dcs);
  border: 1px solid color-mix(in srgb, var(--tone-dcs) 60%, transparent);
  background: color-mix(in srgb, var(--tone-dcs) 12%, transparent);
}

.alarm__badge {
  margin-left: auto;
  font-size: var(--font-size-caption);
  padding: 1px 8px;
  border-radius: 4px;
  color: var(--color-alarm-1);
  background: color-mix(in srgb, var(--color-alarm-1) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
  white-space: nowrap;
}

.alarm__loc {
  font-size: var(--font-size-helper);
  color: var(--color-text);
}

.alarm__time {
  font-family: var(--font-number);
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
}

.alarm__desc {
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* 操作链接（青色文本） */
.alarm__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 4px;
}

.alarm__action {
  font-size: var(--font-size-helper);
  color: var(--color-accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.alarm__action:hover {
  text-decoration: underline;
}

/* 一键应急：单独行，突出红色 */
.alarm__start {
  align-self: flex-start;
  font-size: var(--font-size-helper);
  font-weight: 600;
  color: var(--color-alarm-1);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.alarm__start:hover {
  text-decoration: underline;
}
</style>
