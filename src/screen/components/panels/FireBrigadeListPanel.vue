<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import { fireBrigadeAreas } from '../../lib/data/fireBrigadeMock';
import {
  closeFireBrigadeView,
  fireBrigadeCurrentPage,
  fireBrigadeAreaFilter,
  fireBrigadeFilteredTeams,
  fireBrigadeKeyword,
  fireBrigadePagedTeams,
  fireBrigadeTotalPages,
  goToFireBrigadePage,
  resetFireBrigadeSearch,
  searchFireBrigade,
  selectFireBrigade,
  selectedFireBrigadeId,
} from '../../lib/composables/useFireBrigadeView';

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= fireBrigadeTotalPages.value; i += 1) pages.push(i);
  return pages;
});

function handleSelect(id: number) {
  selectFireBrigade(id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="brigade-list__title">
        <h3 class="brigade-list__heading">消防队伍列表</h3>
        <span class="brigade-list__count">共 {{ fireBrigadeFilteredTeams.length }} 个</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="brigade-list__back" @click="closeFireBrigadeView">返回</button>
    </template>

    <div class="brigade-list">
      <div class="brigade-list__toolbar">
        <input
          v-model="fireBrigadeKeyword"
          class="brigade-list__input"
          type="text"
          placeholder="队伍名称/负责人"
        />
        <select v-model="fireBrigadeAreaFilter" class="brigade-list__select">
          <option v-for="area in fireBrigadeAreas" :key="area" :value="area">
            {{ area === '全部区域' ? '值守区域' : area }}
          </option>
        </select>
        <button
          type="button"
          class="brigade-list__btn brigade-list__btn--primary"
          @click="searchFireBrigade"
        >
          检索
        </button>
        <button type="button" class="brigade-list__btn" @click="resetFireBrigadeSearch">
          重置
        </button>
      </div>

      <div class="brigade-table">
        <div class="brigade-table__head">
          <span>队伍名称</span>
          <span>队伍人数</span>
          <span>负责人</span>
        </div>
        <button
          v-for="team in fireBrigadePagedTeams"
          :key="team.id"
          type="button"
          class="brigade-table__row"
          :class="{ 'brigade-table__row--active': selectedFireBrigadeId === team.id }"
          @click="handleSelect(team.id)"
        >
          <span class="brigade-table__name">{{ team.name }}</span>
          <span class="brigade-table__count">{{ team.memberCount }}</span>
          <span class="brigade-table__leader">
            {{ team.leaderName }}
            <em>{{ team.leaderPhone }}</em>
          </span>
        </button>
      </div>

      <div class="brigade-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="fireBrigadeCurrentPage <= 1"
          @click="goToFireBrigadePage(fireBrigadeCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': fireBrigadeCurrentPage === page }"
          @click="goToFireBrigadePage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="fireBrigadeCurrentPage >= fireBrigadeTotalPages"
          @click="goToFireBrigadePage(fireBrigadeCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.brigade-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.brigade-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.brigade-list__count {
  font-size: 13px;
  color: #8aa4c4;
  white-space: nowrap;
}

.brigade-list__back {
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.brigade-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.brigade-list__toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 6px;
  flex-shrink: 0;
}

.brigade-list__input,
.brigade-list__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
  color: #fff;
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.brigade-list__select {
  appearance: none;
}

.brigade-list__btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.brigade-list__btn--primary {
  color: #fff;
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 90 160 / 45%);
}

.brigade-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.brigade-table__head,
.brigade-table__row {
  display: grid;
  grid-template-columns: 1.1fr 0.7fr 1.4fr;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.brigade-table__head {
  padding: 0 10px 4px;
  font-size: 12px;
  color: #8aa4c4;
}

.brigade-table__row {
  width: 100%;
  padding: 10px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: #fff;
  font-family: var(--font-body);
  cursor: pointer;
}

.brigade-table__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
}

.brigade-table__name {
  font-size: 14px;
  font-weight: 500;
}

.brigade-table__count {
  font-size: 14px;
  font-weight: 600;
}

.brigade-table__leader {
  font-size: 12px;
  color: #c8d8ec;
  line-height: 1.35;
}

.brigade-table__leader em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  color: #8aa4c4;
}

.brigade-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid rgb(0 120 200 / 28%);
  border-radius: 2px;
  background: rgb(0 22 48 / 65%);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-btn--active {
  color: #fff;
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}
</style>
