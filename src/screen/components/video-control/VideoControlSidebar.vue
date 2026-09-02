<script setup lang="ts">
import { ref } from 'vue';
import {
  videoControlCategories,
  videoControlTree,
  type VideoControlTreeNode,
} from '../../lib/data/videoControlMock';

const activeCategoryId = ref(videoControlCategories[0]?.id ?? '');
const activeNodeId = ref('drill-1');
const expandedIds = ref(new Set(videoControlTree.map((node) => node.id)));
const searchQuery = ref('');
const pinHoverId = ref<string | null>(null);

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function selectNode(id: string) {
  activeNodeId.value = id;
}

function isNodeVisible(node: VideoControlTreeNode): boolean {
  if (!searchQuery.value.trim()) return true;
  const q = searchQuery.value.trim().toLowerCase();
  if (node.label.toLowerCase().includes(q)) return true;
  return node.children?.some((child) => child.label.toLowerCase().includes(q)) ?? false;
}
</script>

<template>
  <aside class="vc-sidebar">
    <section class="vc-sidebar__categories">
      <button
        v-for="cat in videoControlCategories"
        :key="cat.id"
        type="button"
        class="vc-category"
        :class="{ 'vc-category--active': activeCategoryId === cat.id }"
        @click="activeCategoryId = cat.id"
      >
        <span class="vc-category__icon-wrap">
          <i
            class="vc-category__icon"
            :class="`vc-category__icon--${cat.iconType}`"
            aria-hidden="true"
          />
        </span>
        <span class="vc-category__label">{{ cat.label }}</span>
      </button>
    </section>

    <section class="vc-sidebar__tree-panel">
      <header class="vc-tree__header">
        <h3 class="vc-tree__title">监控点列表</h3>
        <button type="button" class="vc-tree__search-btn" aria-label="搜索">
          <i class="vc-tree__search-icon" aria-hidden="true" />
        </button>
      </header>

      <div class="vc-tree__search">
        <input
          v-model="searchQuery"
          class="vc-tree__search-input"
          type="search"
          placeholder="搜索监控点"
        />
      </div>

      <ul class="vc-tree">
        <li v-for="group in videoControlTree" v-show="isNodeVisible(group)" :key="group.id">
          <button type="button" class="vc-tree__group" @click="toggleExpand(group.id)">
            <i
              class="vc-tree__chevron"
              :class="{ 'vc-tree__chevron--open': expandedIds.has(group.id) }"
              aria-hidden="true"
            />
            <i class="vc-tree__folder" aria-hidden="true" />
            <span>{{ group.label }}</span>
          </button>

          <ul v-show="expandedIds.has(group.id)" class="vc-tree__children">
            <li
              v-for="child in group.children"
              v-show="
                !searchQuery.trim() ||
                child.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
              "
              :key="child.id"
            >
              <button
                type="button"
                class="vc-tree__leaf"
                :class="{ 'vc-tree__leaf--active': activeNodeId === child.id }"
                @click="selectNode(child.id)"
                @mouseenter="pinHoverId = child.id"
                @mouseleave="pinHoverId = null"
              >
                <i class="vc-tree__file" aria-hidden="true" />
                <span class="vc-tree__leaf-label">{{ child.label }}</span>
                <span
                  v-if="pinHoverId === child.id || activeNodeId === child.id"
                  class="vc-tree__pin"
                >
                  固定至首页
                </span>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.vc-sidebar {
  display: flex;
  flex-direction: column;
  gap: 9px;
  width: 435px;
  flex-shrink: 0;
  min-height: 0;
}

.vc-sidebar__categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
  height: 161px;
  padding: 10px 12px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgb(0 32 68 / 88%) 0%, rgb(0 16 36 / 75%) 100%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
}

.vc-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 2px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.vc-category:hover,
.vc-category--active {
  background: rgb(0 70 140 / 35%);
  border-color: var(--panel-border);
}

.vc-category__icon-wrap {
  width: 42px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 55 110 / 40%);
  border: 1px solid rgb(0 150 255 / 25%);
  border-radius: 2px;
}

.vc-category__icon {
  position: relative;
  display: block;
  width: 22px;
  height: 22px;
  color: var(--color-accent);
}

.vc-category__icon::before,
.vc-category__icon::after {
  position: absolute;
  box-sizing: border-box;
  content: '';
}

.vc-category__icon--0::before {
  left: 50%;
  bottom: 2px;
  width: 14px;
  height: 10px;
  border: 2px solid currentcolor;
  transform: translateX(-50%);
}

.vc-category__icon--0::after {
  left: 50%;
  top: 2px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 8px solid currentcolor;
  transform: translateX(-50%);
}

.vc-category__icon--1::before {
  left: 50%;
  bottom: 3px;
  width: 14px;
  height: 12px;
  border: 2px solid currentcolor;
  border-radius: 50% 50% 2px 2px;
  transform: translateX(-50%);
}

.vc-category__icon--1::after {
  left: 50%;
  top: 4px;
  width: 4px;
  height: 6px;
  background: currentcolor;
  transform: translateX(-50%);
}

.vc-category__icon--2::before {
  left: 50%;
  top: 2px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 16px solid currentcolor;
  transform: translateX(-50%);
}

.vc-category__icon--3::before {
  left: 4px;
  bottom: 2px;
  width: 14px;
  height: 10px;
  border: 2px solid currentcolor;
  border-top: none;
}

.vc-category__icon--3::after {
  left: 50%;
  top: 2px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 7px solid currentcolor;
  transform: translateX(-50%);
}

.vc-category__icon--4::before {
  inset: 4px;
  border: 2px solid currentcolor;
  border-radius: 1px;
}

.vc-category__icon--4::after {
  left: 50%;
  top: 50%;
  width: 2px;
  height: 10px;
  background: currentcolor;
  box-shadow: 4px 0 0 currentcolor;
  transform: translate(-50%, -50%);
}

.vc-category__icon--5::before {
  left: 4px;
  top: 6px;
  width: 14px;
  height: 10px;
  border: 2px solid currentcolor;
}

.vc-category__icon--5::after {
  left: 4px;
  top: 2px;
  width: 14px;
  height: 4px;
  border: 2px solid currentcolor;
  border-bottom: none;
}

.vc-category__icon--6::before {
  left: 6px;
  top: 4px;
  width: 10px;
  height: 10px;
  border: 2px solid currentcolor;
  border-radius: 50%;
}

.vc-category__icon--6::after {
  right: 4px;
  bottom: 4px;
  width: 6px;
  height: 2px;
  background: currentcolor;
  box-shadow:
    0 -4px 0 currentcolor,
    0 -8px 0 currentcolor;
}

.vc-category__icon--7::before {
  inset: 4px;
  border: 2px dashed currentcolor;
  opacity: 0.85;
}

.vc-category__icon--7::after {
  left: 50%;
  top: 50%;
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.vc-category__label {
  font-size: 12px;
  color: #9ed8ff;
  white-space: nowrap;
  line-height: 1.2;
}

.vc-sidebar__tree-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 12px 12px;
  background: linear-gradient(180deg, rgb(0 28 58 / 90%) 0%, rgb(0 12 28 / 82%) 100%);
  border: 1px solid rgb(0 130 210 / 32%);
  border-radius: 2px;
  overflow: hidden;
}

.vc-tree__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 8px;
}

.vc-tree__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.vc-tree__search-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgb(0 140 220 / 30%);
  border-radius: 2px;
  background: rgb(0 40 80 / 50%);
  cursor: pointer;
}

.vc-tree__search-icon {
  display: block;
  width: 14px;
  height: 14px;
  margin: 0 auto;
  border: 2px solid #6ec8ff;
  border-radius: 50%;
  position: relative;
}

.vc-tree__search-icon::after {
  content: '';
  position: absolute;
  right: -5px;
  bottom: -3px;
  width: 6px;
  height: 2px;
  background: #6ec8ff;
  transform: rotate(45deg);
}

.vc-tree__search {
  flex-shrink: 0;
  margin-bottom: 8px;
}

.vc-tree__search-input {
  width: 100%;
  height: 30px;
  padding: 0 10px;
  box-sizing: border-box;
  border: 1px solid rgb(0 120 200 / 35%);
  border-radius: 2px;
  background: rgb(0 18 40 / 75%);
  color: var(--map-popup-text-blue);
  font-size: 13px;
  outline: none;
}

.vc-tree__search-input::placeholder {
  color: #536784;
}

.vc-tree {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
}

.vc-tree::-webkit-scrollbar {
  width: 4px;
}

.vc-tree::-webkit-scrollbar-thumb {
  background: rgb(0 140 220 / 30%);
  border-radius: 2px;
}

.vc-tree__group,
.vc-tree__leaf {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: #b8d4f5;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.vc-tree__group {
  height: 32px;
  padding: 0 4px;
}

.vc-tree__chevron {
  width: 8px;
  height: 8px;
  border-right: 2px solid #6ec8ff;
  border-bottom: 2px solid #6ec8ff;
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.vc-tree__chevron--open {
  transform: rotate(45deg);
}

.vc-tree__folder {
  width: 14px;
  height: 11px;
  background: rgb(0 160 255 / 35%);
  border: 1px solid rgb(0 180 255 / 50%);
  border-radius: 1px;
  position: relative;
  flex-shrink: 0;
}

.vc-tree__folder::before {
  content: '';
  position: absolute;
  left: -1px;
  top: -4px;
  width: 8px;
  height: 4px;
  background: rgb(0 160 255 / 45%);
  border: 1px solid rgb(0 180 255 / 50%);
  border-radius: 1px 1px 0 0;
}

.vc-tree__children {
  margin: 0;
  padding: 0 0 0 22px;
  list-style: none;
}

.vc-tree__leaf {
  position: relative;
  height: 34px;
  padding: 0 8px 0 4px;
  border-radius: 2px;
}

.vc-tree__leaf:hover,
.vc-tree__leaf--active {
  background: rgb(0 90 180 / 35%);
  color: var(--color-text-strong);
}

.vc-tree__file {
  width: 10px;
  height: 12px;
  border: 1px solid #6ec8ff;
  border-radius: 1px;
  flex-shrink: 0;
  position: relative;
}

.vc-tree__file::before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 4px;
  border-left: 1px solid #6ec8ff;
  border-bottom: 1px solid #6ec8ff;
}

.vc-tree__leaf-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vc-tree__pin {
  flex-shrink: 0;
  padding: 2px 6px;
  border: 1px solid var(--border-glow);
  border-radius: 2px;
  background: rgb(0 60 120 / 55%);
  font-size: 11px;
  color: #7cdbff;
  white-space: nowrap;
}
</style>
