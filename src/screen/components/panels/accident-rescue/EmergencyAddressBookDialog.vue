<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  emergencyAddressBookTree,
  getDefaultAddressBookOrgId,
  resolveAddressBookContacts,
  type EmergencyAddressBookTreeNode,
} from '../../../lib/data/emergencyAddressBookMock';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const searchQuery = ref('');
const selectedOrgId = ref(getDefaultAddressBookOrgId());
const expandedIds = ref(new Set(emergencyAddressBookTree.map((node) => node.id)));

const contacts = computed(() => resolveAddressBookContacts(selectedOrgId.value));

const selectedOrgLabel = computed(() => {
  for (const root of emergencyAddressBookTree) {
    const child = root.children?.find((item) => item.id === selectedOrgId.value);
    if (child) return child.label;
  }
  return '';
});

watch(
  () => props.open,
  (visible) => {
    if (!visible) return;
    searchQuery.value = '';
    selectedOrgId.value = getDefaultAddressBookOrgId();
    expandedIds.value = new Set(emergencyAddressBookTree.map((node) => node.id));
  },
);

function closeDialog() {
  emit('close');
}

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function selectOrg(id: string) {
  selectedOrgId.value = id;
}

function isRootVisible(node: EmergencyAddressBookTreeNode): boolean {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return true;
  if (node.label.toLowerCase().includes(q)) return true;
  return node.children?.some((child) => child.label.toLowerCase().includes(q)) ?? false;
}

function isChildVisible(label: string): boolean {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="address-book-fade">
      <div v-if="open" class="address-book-overlay" @click.self="closeDialog">
        <section
          class="address-book-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="应急通讯录"
          @click.stop
        >
          <header class="address-book__header">
            <h3 class="address-book__title">应急通讯录</h3>
            <button type="button" class="address-book__close" @click="closeDialog">×</button>
          </header>

          <div class="address-book__body">
            <aside class="address-book__tree-panel">
              <input
                v-model="searchQuery"
                class="address-book__search"
                type="search"
                placeholder="请输入组织名称"
              />

              <ul class="address-book__tree ar-scroll">
                <li
                  v-for="root in emergencyAddressBookTree"
                  v-show="isRootVisible(root)"
                  :key="root.id"
                  class="address-book__tree-root"
                >
                  <button
                    type="button"
                    class="address-book__tree-group"
                    @click="toggleExpand(root.id)"
                  >
                    <span
                      class="address-book__chevron"
                      :class="{ 'address-book__chevron--open': expandedIds.has(root.id) }"
                      aria-hidden="true"
                    />
                    <span class="address-book__folder" aria-hidden="true" />
                    <span class="address-book__tree-label">{{ root.label }}</span>
                  </button>

                  <ul v-show="expandedIds.has(root.id)" class="address-book__tree-children">
                    <li
                      v-for="child in root.children"
                      v-show="isChildVisible(child.label)"
                      :key="child.id"
                    >
                      <button
                        type="button"
                        class="address-book__tree-leaf"
                        :class="{ 'address-book__tree-leaf--active': selectedOrgId === child.id }"
                        @click="selectOrg(child.id)"
                      >
                        <span class="address-book__file" aria-hidden="true" />
                        <span class="address-book__tree-label">{{ child.label }}</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </aside>

            <div class="address-book__contacts ar-scroll">
              <p v-if="selectedOrgLabel" class="address-book__contacts-head">
                {{ selectedOrgLabel }}
                <span class="address-book__contacts-count">{{ contacts.length }} 人</span>
              </p>

              <div v-if="contacts.length" class="address-book__grid">
                <article v-for="person in contacts" :key="person.id" class="address-book__card">
                  <div class="address-book__avatar" aria-hidden="true" />
                  <div class="address-book__card-main">
                    <div class="address-book__card-head">
                      <span class="address-book__name">{{ person.name }}</span>
                      <span class="address-book__role">{{ person.role }}</span>
                    </div>
                    <div class="address-book__phone">{{ person.phone }}</div>
                    <div class="address-book__actions">
                      <button type="button" class="address-book__action">短信</button>
                      <button type="button" class="address-book__action">电话</button>
                      <button type="button" class="address-book__action">对讲</button>
                    </div>
                  </div>
                </article>
              </div>

              <div v-else class="address-book__empty">该组织暂无通讯录人员</div>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.address-book-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 68%);
}

.address-book-dialog {
  display: flex;
  flex-direction: column;
  width: min(1040px, 100%);
  height: min(640px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.address-book__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 14px;
  border-bottom: 1px solid var(--panel-head-line);
}

.address-book__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.address-book__close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.address-book__close:hover {
  color: var(--color-text-strong);
}

.address-book__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
}

.address-book__tree-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 12px;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 16 36 / 45%);
}

.address-book__search {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  box-sizing: border-box;
  border: 1px solid var(--panel-head-line);
  border-radius: 4px;
  background: rgb(0 20 45 / 82%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

.address-book__search::placeholder {
  color: #7a90a8;
}

.address-book__tree {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
}

.address-book__tree-root + .address-book__tree-root {
  margin-top: 4px;
}

.address-book__tree-group,
.address-book__tree-leaf {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 32px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #d8e8f8;
  font-size: 13px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.address-book__tree-group:hover,
.address-book__tree-leaf:hover {
  background: rgb(0 40 78 / 55%);
}

.address-book__tree-leaf {
  padding-left: 28px;
}

.address-book__tree-leaf--active {
  background: linear-gradient(90deg, rgb(0 90 170 / 55%), rgb(0 50 100 / 35%));
  color: var(--color-text-strong);
}

.address-book__chevron {
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 5px solid #7ec8ff;
  transition: transform 0.2s ease;
}

.address-book__chevron--open {
  transform: rotate(90deg);
}

.address-book__folder,
.address-book__file {
  width: 14px;
  height: 12px;
  flex-shrink: 0;
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 2px;
  background: rgb(0 40 78 / 65%);
}

.address-book__file {
  width: 12px;
  height: 12px;
  border-radius: 1px;
}

.address-book__tree-children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.address-book__tree-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-book__contacts {
  min-height: 0;
  padding: 12px 14px;
  overflow: auto;
}

.address-book__contacts-head {
  margin: 0 0 10px;
  font-size: 14px;
  color: #dce9f8;
}

.address-book__contacts-count {
  margin-left: 8px;
  font-size: 12px;
  color: #8aa4c0;
}

.address-book__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.address-book__card {
  display: flex;
  gap: 10px;
  min-height: 108px;
  padding: 10px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 6px;
  background: rgb(0 18 40 / 72%);
}

.address-book__avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgb(0 136 220 / 40%);
  background:
    radial-gradient(circle at 50% 38%, rgb(120 180 255 / 35%) 0 28%, transparent 29%),
    rgb(0 28 58 / 88%);
}

.address-book__card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-book__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.address-book__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.address-book__role {
  font-size: 11px;
  color: #8aa4c0;
  white-space: nowrap;
}

.address-book__phone {
  font-size: 12px;
  color: #7ec8ff;
  font-variant-numeric: tabular-nums;
}

.address-book__actions {
  display: flex;
  gap: 6px;
  margin-top: auto;
}

.address-book__action {
  min-width: 40px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid rgb(0 136 220 / 42%);
  border-radius: 2px;
  background: rgb(0 28 58 / 88%);
  color: #d8e8f8;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.address-book__action:hover {
  border-color: rgb(0 166 244 / 58%);
  color: var(--color-text-strong);
}

.address-book__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #7a90a8;
  font-size: 13px;
}

.address-book-fade-enter-active,
.address-book-fade-leave-active {
  transition: opacity 0.22s ease;
}

.address-book-fade-enter-active .address-book-dialog,
.address-book-fade-leave-active .address-book-dialog {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.address-book-fade-enter-from,
.address-book-fade-leave-to {
  opacity: 0;
}

.address-book-fade-enter-from .address-book-dialog,
.address-book-fade-leave-to .address-book-dialog {
  opacity: 0;
  transform: translateY(10px);
}
</style>
