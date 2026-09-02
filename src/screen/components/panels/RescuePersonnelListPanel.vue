<script setup lang="ts">
import { computed } from 'vue';
import PanelCard from '../common/PanelCard.vue';
import {
  rescuePersonnelRoles,
  rescuePersonnelSquadrons,
  rescuePersonnelTotalCount,
} from '../../lib/data/rescuePersonnelMock';
import {
  closeRescuePersonnelView,
  goToRescuePersonnelPage,
  rescuePersonnelCurrentPage,
  rescuePersonnelKeyword,
  rescuePersonnelPagedItems,
  rescuePersonnelRoleFilter,
  rescuePersonnelSquadronFilter,
  rescuePersonnelTotalPages,
  resetRescuePersonnelSearch,
  searchRescuePersonnel,
  selectRescuePersonnel,
  selectedRescuePersonnelId,
} from '../../lib/composables/useRescuePersonnelView';

const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let i = 1; i <= rescuePersonnelTotalPages.value; i += 1) pages.push(i);
  return pages;
});

function handleSelect(id: number) {
  selectRescuePersonnel(id);
}
</script>

<template>
  <PanelCard title="" variant="rescue" :show-more="false">
    <template #title>
      <div class="personnel-list__title">
        <h3 class="personnel-list__heading">救援人员列表</h3>
        <span class="personnel-list__count">共 {{ rescuePersonnelTotalCount }} 人</span>
      </div>
    </template>

    <template #header-extra>
      <button type="button" class="personnel-list__close" @click="closeRescuePersonnelView">
        ×
      </button>
    </template>

    <div class="personnel-list">
      <div class="personnel-list__toolbar">
        <input
          v-model="rescuePersonnelKeyword"
          class="personnel-list__input"
          type="text"
          placeholder="人员姓名"
        />
        <select v-model="rescuePersonnelRoleFilter" class="personnel-list__select">
          <option value="全部岗位">岗位/职务</option>
          <option
            v-for="role in rescuePersonnelRoles.filter((item) => item !== '全部岗位')"
            :key="role"
            :value="role"
          >
            {{ role }}
          </option>
        </select>
        <select v-model="rescuePersonnelSquadronFilter" class="personnel-list__select">
          <option value="全部中队">中队</option>
          <option
            v-for="s in rescuePersonnelSquadrons.filter((item) => item !== '全部中队')"
            :key="s"
            :value="s"
          >
            {{ s }}
          </option>
        </select>
        <button
          type="button"
          class="personnel-list__btn personnel-list__btn--primary"
          @click="searchRescuePersonnel"
        >
          检索
        </button>
        <button type="button" class="personnel-list__btn" @click="resetRescuePersonnelSearch">
          重置
        </button>
      </div>

      <div class="personnel-table">
        <div class="personnel-table__head">
          <span>人员姓名</span>
          <span>所属中队</span>
          <span>岗位/职务</span>
        </div>
        <button
          v-for="item in rescuePersonnelPagedItems"
          :key="item.id"
          type="button"
          class="personnel-table__row"
          :class="{ 'personnel-table__row--active': selectedRescuePersonnelId === item.id }"
          @click="handleSelect(item.id)"
        >
          <span class="personnel-table__name">{{ item.name }}</span>
          <span class="personnel-table__squad">{{ item.squadron }}</span>
          <span class="personnel-table__role">{{ item.role }}</span>
        </button>
      </div>

      <div class="personnel-list__pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="rescuePersonnelCurrentPage <= 1"
          @click="goToRescuePersonnelPage(rescuePersonnelCurrentPage - 1)"
        >
          ‹
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ 'page-btn--active': rescuePersonnelCurrentPage === page }"
          @click="goToRescuePersonnelPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="rescuePersonnelCurrentPage >= rescuePersonnelTotalPages"
          @click="goToRescuePersonnelPage(rescuePersonnelCurrentPage + 1)"
        >
          ›
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.personnel-list__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.personnel-list__heading {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.personnel-list__count {
  font-size: 13px;
  color: #8aa4c4;
  white-space: nowrap;
}

.personnel-list__close {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  background: rgb(0 28 58 / 65%);
  color: #c8d8ec;
  font-size: 18px;
  line-height: 1;
  font-family: var(--font-body);
  cursor: pointer;
}

.personnel-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 10px;
}

.personnel-list__toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto auto;
  gap: 6px;
  flex-shrink: 0;
}

.personnel-list__input,
.personnel-list__select {
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

.personnel-list__select {
  appearance: none;
}

.personnel-list__btn {
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

.personnel-list__btn--primary {
  color: #fff;
  border-color: rgb(0 180 255 / 45%);
  background: rgb(0 90 160 / 45%);
}

.personnel-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.personnel-table__head,
.personnel-table__row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.personnel-table__head {
  padding: 0 8px 4px;
  font-size: 12px;
  color: #8aa4c4;
  flex-shrink: 0;
}

.personnel-table__row {
  width: 100%;
  padding: 8px;
  border: 1px solid rgb(0 130 210 / 18%);
  border-radius: 2px;
  background: rgb(0 24 50 / 45%);
  color: #fff;
  flex-shrink: 0;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.personnel-table__row--active {
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 55 100 / 45%);
  box-shadow: inset 0 0 10px rgb(0 170 255 / 8%);
}

.personnel-table__name,
.personnel-table__squad,
.personnel-table__role {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.personnel-list__pagination {
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
