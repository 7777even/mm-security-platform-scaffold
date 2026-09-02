<script setup lang="ts">
import { computed, ref } from 'vue';
import type { EvacuationPerson } from '../../../lib/data/evacuationPeopleMock';

const props = defineProps<{
  open: boolean;
  people: EvacuationPerson[];
}>();

const emit = defineEmits<{
  close: [];
  focus: [person: EvacuationPerson];
}>();

const radiusOptions = ['500米', '1公里', '2公里'] as const;
const radius = ref<(typeof radiusOptions)[number]>(radiusOptions[0]);

const titleText = computed(() => `现场人员  共${props.people.length}人`);

function handleRowClick(p: EvacuationPerson) {
  emit('focus', p);
}
</script>

<template>
  <Transition name="evac-people">
    <section v-if="open" class="evac-people" role="region" aria-label="疏散人员列表">
      <header class="evac-people__header">
        <div class="evac-people__title">{{ titleText }}</div>
        <button type="button" class="evac-people__close" @click="emit('close')">关闭</button>
      </header>

      <div class="evac-people__toolbar">
        <select v-model="radius" class="evac-people__select" aria-label="筛选范围">
          <option v-for="opt in radiusOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <div class="evac-people__hint">点击人员可定位到地图标记</div>
      </div>

      <div class="evac-people__table-wrap ar-scroll">
        <table class="evac-people__table">
          <thead>
            <tr>
              <th>人员姓名</th>
              <th>所属组织</th>
              <th>岗位/职务</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in props.people"
              :key="p.id"
              class="evac-people__row"
              @click="handleRowClick(p)"
            >
              <td>{{ p.name }}</td>
              <td>{{ p.org }}</td>
              <td>{{ p.job }}</td>
            </tr>
            <tr v-if="!props.people.length">
              <td colspan="3" class="evac-people__empty">暂无人员</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.evac-people {
  position: absolute;
  right: 18px;
  top: calc(var(--header-height, 105px) + 18px);
  width: 420px;
  height: min(760px, calc(100vh - var(--header-height, 105px) - 48px));
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid rgb(0 150 236 / 35%);
  background: linear-gradient(180deg, rgb(9 28 58 / 94%), rgb(4 16 34 / 92%));
  box-shadow: 0 18px 44px rgb(0 0 0 / 46%);
  overflow: hidden;
  pointer-events: auto;
}

.evac-people__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 18 40 / 65%);
}

.evac-people__title {
  font-size: 14px;
  color: rgb(255 255 255 / 95%);
  letter-spacing: 0.3px;
}

.evac-people__close {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgb(0 150 236 / 30%);
  background: rgb(0 0 0 / 15%);
  color: rgb(255 255 255 / 90%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.evac-people__close:hover {
  border-color: rgb(0 150 236 / 50%);
  background: rgb(0 150 236 / 8%);
}

.evac-people__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  gap: 12px;
}

.evac-people__select {
  height: 30px;
  width: 120px;
  border-radius: 6px;
  border: 1px solid rgb(0 110 190 / 32%);
  background: rgb(0 20 45 / 80%);
  color: rgb(255 255 255 / 92%);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

.evac-people__hint {
  font-size: 12px;
  color: rgb(168 184 204 / 95%);
}

.evac-people__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-top: 1px solid rgb(0 110 190 / 18%);
}

.evac-people__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.evac-people__table th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 12px;
  text-align: left;
  color: rgb(138 164 192 / 95%);
  font-weight: 500;
  background: rgb(0 26 56 / 92%);
  border-bottom: 1px solid rgb(0 110 190 / 22%);
}

.evac-people__table td {
  padding: 10px 12px;
  color: rgb(232 242 252 / 95%);
  border-bottom: 1px solid rgb(0 80 140 / 16%);
}

.evac-people__row {
  cursor: pointer;
}

.evac-people__row:hover td {
  background: rgb(0 60 110 / 18%);
}

.evac-people__empty {
  text-align: center;
  color: rgb(168 184 204 / 90%);
  padding: 22px 12px !important;
}

.evac-people-enter-active,
.evac-people-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.evac-people-enter-from,
.evac-people-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
