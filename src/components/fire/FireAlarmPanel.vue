<!--
  FireAlarmPanel — §消防报警「消防告警」
  告警卡：左图 + 主信息（标题 + 类型chip + 未处置badge + 位置 + 时间 + 描述
         + 操作链接：视频监控/告警图片/现场监控/处置调度 + 一键应急）。
  交互：整卡点击 → 告警详情抽屉；操作链接/一键应急 → 对应二级界面（经 useFireAlarmInteraction，替代原 console.warn 空壳）。
  数据：消费 fireAlarmListMock（取前 3 条），与二级界面详情源一致。
  告警缩略图：压缩包语义场景图（按 typeTone 取图，见 fireImages），不用脚手架图标库。
  色调：fire 暖色（橙），dcs 冷色（青）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';
import { useFireAlarmInteraction } from '@/composables/useFireAlarmInteraction';
import { fireAlarmListItems } from '@/services/map-data/fireAlarmListMock';
import { sceneImageByTone } from '@/services/map-data/fireImages';
import type { FireAlarmListItem } from '@/services/map-data/fireAlarmListMock';

const ia = useFireAlarmInteraction();

const actions = ['视频监控', '告警图片', '现场监控', '处置调度'];

// 取前 3 条作为面板告警卡（与详情二级界面同源）
const alarms: FireAlarmListItem[] = fireAlarmListItems.slice(0, 3);

function toneOf(t: FireAlarmListItem['typeTone']): 'fire' | 'dcs' {
  return t === 'gds' || t === 'muted' ? 'dcs' : 'fire';
}

function onAction(act: string, a: FireAlarmListItem): void {
  if (act === '视频监控' || act === '告警图片' || act === '现场监控') ia.openVideo(a);
  else ia.openOneKeyBroadcast(a); // 处置调度 → 一键应急调度
}

function onEmergency(a: FireAlarmListItem): void {
  ia.openOneKeyBroadcast(a);
}
</script>

<template>
  <PanelCard title="消防告警" icon="bell-ringing" more="全部" @more="ia.openAlarmList()">
    <ul class="list">
      <li
        v-for="a in alarms"
        :key="a.id"
        class="alarm"
        role="button"
        tabindex="0"
        @click="ia.openAlarmDetail(a)"
        @keyup.enter="ia.openAlarmDetail(a)"
      >
        <div
          :class="['alarm__img', `alarm__img--${toneOf(a.typeTone)}`]"
          :style="{ backgroundImage: `url(${sceneImageByTone(a.typeTone)})` }"
          aria-hidden="true"
        />
        <div class="alarm__main">
          <div class="alarm__head">
            <span :class="['alarm__title', `alarm__title--${toneOf(a.typeTone)}`]">{{
              a.title || a.typeLabel
            }}</span>
            <span :class="['alarm__type', `alarm__type--${toneOf(a.typeTone)}`]">{{
              a.typeLabel
            }}</span>
            <span v-if="a.listStatus !== '已关闭'" class="alarm__badge">未处置</span>
          </div>
          <div class="alarm__loc">{{ a.location }}</div>
          <div class="alarm__time">{{ a.time }}</div>
          <div class="alarm__desc">{{ a.description }}</div>
          <div class="alarm__actions">
            <button
              v-for="act in actions"
              :key="act"
              type="button"
              class="alarm__action"
              @click.stop="onAction(act, a)"
            >
              {{ act }}
            </button>
          </div>
          <button type="button" class="alarm__start" @click.stop="onEmergency(a)">一键应急</button>
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
  cursor: pointer;
}

.alarm:hover {
  border-color: var(--color-accent);
}

/* 左侧告警图片占位：压缩包语义场景图（cover 底图 + 色调描边） */
.alarm__img {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  background-color: var(--panel-inner-bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.alarm__img--fire {
  border-color: color-mix(in srgb, var(--tone-fire) 55%, transparent);
}

.alarm__img--dcs {
  border-color: color-mix(in srgb, var(--tone-dcs) 55%, transparent);
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
