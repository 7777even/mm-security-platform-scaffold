<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  businessObjectCategoryOptions,
  businessObjectOptions,
  monitorNameOptions,
  presetPointOptions,
  videoLinkageConfigs,
  type VideoLinkageConfig,
} from '../../lib/data/videoLinkageMock';
import {
  cancelLinkageEdit,
  closeLinkageDialog,
  editingConfig,
  editingRules,
  linkageDialogOpen,
  linkageEditMode,
  saveLinkageEdit,
  startLinkageEdit,
} from '../../lib/composables/useVideoLinkageConfig';

const keyword = ref('');
const categoryFilter = ref('全部类别');
const currentPage = ref(1);
const PAGE_SIZE = 6;
const savedTip = ref(false);

const monitorName = ref(monitorNameOptions[0]);
const monitorCode = ref('HKJK-5124870');

const categoryByMonitor = reactive<Record<string, string>>({
  'XX强3-2棚伯': '枪机',
  'XX强3-5棚伯': '枪机',
  '1#厂区高空AR': '高空AR',
  '北2路33#枪机': '枪机',
  '储油罐区-2#球机': '球机',
  'A装置区-5#球机': '球机',
});

const categories = computed(() => [
  '全部类别',
  ...Array.from(new Set(videoLinkageConfigs.map((item) => item.category))),
]);

const filteredItems = computed(() =>
  videoLinkageConfigs.filter((item) => {
    if (categoryFilter.value !== '全部类别' && item.category !== categoryFilter.value) return false;
    if (keyword.value.trim()) {
      const q = keyword.value.trim();
      if (!item.name.includes(q) && !item.code.includes(q)) return false;
    }
    return true;
  }),
);

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / PAGE_SIZE)));
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredItems.value.slice(start, start + PAGE_SIZE);
});

watch(linkageDialogOpen, (open) => {
  if (!open) return;
  keyword.value = '';
  categoryFilter.value = '全部类别';
  currentPage.value = 1;
});

watch(linkageEditMode, (edit) => {
  if (!edit) return;
  if (editingConfig.value) {
    monitorName.value = editingConfig.value.name;
    monitorCode.value = editingConfig.value.code;
  } else {
    monitorName.value = monitorNameOptions[0];
    monitorCode.value = 'HKJK-5124870';
    editingRules.value = [
      {
        id: `r-${Date.now()}`,
        presetPoint: presetPointOptions[0],
        objectCategory: businessObjectCategoryOptions[0],
        objectName: businessObjectOptions[0],
      },
    ];
  }
});

watch(monitorName, (name) => {
  if (linkageEditMode.value && !editingConfig.value) {
    monitorCode.value = `HKJK-5124${String(860 + monitorNameOptions.indexOf(name))}`;
  }
});

function addRule() {
  editingRules.value.push({
    id: `r-${Date.now()}`,
    presetPoint: presetPointOptions[0],
    objectCategory: businessObjectCategoryOptions[0],
    objectName: businessObjectOptions[0],
  });
}

function removeRule(id: string) {
  editingRules.value = editingRules.value.filter((r) => r.id !== id);
}

function removeConfig(config: VideoLinkageConfig) {
  const index = videoLinkageConfigs.findIndex((item) => item.id === config.id);
  if (index >= 0) videoLinkageConfigs.splice(index, 1);
}

function submitEdit() {
  savedTip.value = true;
  window.setTimeout(() => {
    savedTip.value = false;
    saveLinkageEdit();
  }, 800);
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="linkage-dialog-fade">
      <div v-if="linkageDialogOpen" class="linkage-dialog" @click.self="closeLinkageDialog">
        <section
          class="linkage-dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-label="监控联动配置"
        >
          <header class="linkage-dialog__header">
            <h3 class="linkage-dialog__title">
              监控联动配置{{ linkageEditMode ? ' · 新增/编辑' : '' }}
            </h3>
            <button type="button" class="linkage-dialog__close" @click="closeLinkageDialog">
              ×
            </button>
          </header>

          <!-- 列表模式 -->
          <div v-if="!linkageEditMode" class="linkage-dialog__body">
            <div class="linkage-dialog__toolbar">
              <input
                v-model="keyword"
                class="linkage-dialog__input"
                type="text"
                placeholder="监控名称 / 编号"
              />
              <select v-model="categoryFilter" class="linkage-dialog__select">
                <option v-for="opt in categories" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <button type="button" class="linkage-dialog__btn" @click="currentPage = 1">
                查询
              </button>
              <button
                type="button"
                class="linkage-dialog__btn linkage-dialog__btn--primary"
                @click="startLinkageEdit()"
              >
                + 新增配置
              </button>
            </div>

            <div class="linkage-dialog__table-wrap">
              <table class="linkage-dialog__table">
                <thead>
                  <tr>
                    <th>监控名称</th>
                    <th>监控编号</th>
                    <th>监控类别</th>
                    <th>联动控制数</th>
                    <th>联动业务对象</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pagedItems" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td class="linkage-dialog__code">{{ item.code }}</td>
                    <td>{{ item.category }}</td>
                    <td>{{ item.linkageCount }}</td>
                    <td class="linkage-dialog__objects">{{ item.businessObjects }}</td>
                    <td>
                      <div class="linkage-dialog__row-actions">
                        <button
                          type="button"
                          class="linkage-dialog__row-btn"
                          @click="startLinkageEdit(item.id)"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          class="linkage-dialog__row-btn linkage-dialog__row-btn--danger"
                          @click="removeConfig(item)"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <footer class="linkage-dialog__pagination">
              <button
                type="button"
                class="linkage-dialog__page"
                :disabled="currentPage <= 1"
                @click="goToPage(currentPage - 1)"
              >
                ‹
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                class="linkage-dialog__page"
                :class="{ 'linkage-dialog__page--active': currentPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="linkage-dialog__page"
                :disabled="currentPage >= totalPages"
                @click="goToPage(currentPage + 1)"
              >
                ›
              </button>
            </footer>
          </div>

          <!-- 编辑模式 -->
          <div v-else class="linkage-dialog__body">
            <div class="linkage-dialog__section">
              <h4 class="linkage-dialog__section-title">基础信息</h4>
              <div class="linkage-dialog__fields">
                <label class="linkage-dialog__field">
                  <span>监控名称</span>
                  <select v-model="monitorName" class="linkage-dialog__input">
                    <option v-for="opt in monitorNameOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </label>
                <label class="linkage-dialog__field">
                  <span>监控类别</span>
                  <input
                    v-model="categoryByMonitor[monitorName]"
                    class="linkage-dialog__input"
                    type="text"
                    readonly
                  />
                </label>
                <label class="linkage-dialog__field">
                  <span>监控编号</span>
                  <input v-model="monitorCode" class="linkage-dialog__input" type="text" />
                </label>
              </div>
            </div>

            <div class="linkage-dialog__section linkage-dialog__section--grow">
              <h4 class="linkage-dialog__section-title">联动配置</h4>
              <div class="linkage-dialog__table-wrap">
                <table class="linkage-dialog__table">
                  <thead>
                    <tr>
                      <th>预设点名称</th>
                      <th>关联业务对象类别</th>
                      <th>关联业务对象</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rule in editingRules" :key="rule.id">
                      <td>
                        <select
                          v-model="rule.presetPoint"
                          class="linkage-dialog__input linkage-dialog__input--cell"
                        >
                          <option v-for="opt in presetPointOptions" :key="opt" :value="opt">
                            {{ opt }}
                          </option>
                        </select>
                      </td>
                      <td>
                        <select
                          v-model="rule.objectCategory"
                          class="linkage-dialog__input linkage-dialog__input--cell"
                        >
                          <option
                            v-for="opt in businessObjectCategoryOptions"
                            :key="opt"
                            :value="opt"
                          >
                            {{ opt }}
                          </option>
                        </select>
                      </td>
                      <td>
                        <select
                          v-model="rule.objectName"
                          class="linkage-dialog__input linkage-dialog__input--cell"
                        >
                          <option v-for="opt in businessObjectOptions" :key="opt" :value="opt">
                            {{ opt }}
                          </option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="linkage-dialog__row-btn linkage-dialog__row-btn--danger"
                          @click="removeRule(rule.id)"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" class="linkage-dialog__add" @click="addRule">
                + 添加联动行
              </button>
            </div>

            <footer class="linkage-dialog__edit-footer">
              <button type="button" class="linkage-dialog__btn" @click="cancelLinkageEdit">
                取消
              </button>
              <button
                type="button"
                class="linkage-dialog__btn linkage-dialog__btn--primary"
                @click="submitEdit"
              >
                提交
              </button>
            </footer>
          </div>

          <Transition name="linkage-dialog-tip">
            <div v-if="savedTip" class="linkage-dialog__tip">已保存</div>
          </Transition>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.linkage-dialog {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.linkage-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(1100px, 100%);
  height: min(720px, calc(100vh - 40px));
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.linkage-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.linkage-dialog__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.linkage-dialog__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.linkage-dialog__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 14px;
  gap: 10px;
}

.linkage-dialog__toolbar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.linkage-dialog__input,
.linkage-dialog__select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
  min-width: 0;
}

.linkage-dialog__input {
  width: 220px;
}

.linkage-dialog__input--cell {
  width: 100%;
  min-width: 170px;
  height: 30px;
}

.linkage-dialog__btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.linkage-dialog__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.linkage-dialog__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
}

.linkage-dialog__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--map-layer-divider);
}

.linkage-dialog__table th {
  position: sticky;
  top: 0;
  z-index: var(--z-chrome);
  padding: 10px 8px;
  text-align: left;
  font-weight: 500;
  color: var(--map-device-offline);
  background: rgb(0 28 58 / 95%);
  border-bottom: 1px solid rgb(0 110 190 / 28%);
  white-space: nowrap;
}

.linkage-dialog__table td {
  padding: 9px 8px;
  border-bottom: 1px solid var(--list-divider);
}

.linkage-dialog__table tbody tr:hover {
  background: rgb(0 40 78 / 35%);
}

.linkage-dialog__code {
  color: #6eb5ff;
  white-space: nowrap;
}

.linkage-dialog__objects {
  min-width: 220px;
}

.linkage-dialog__row-actions {
  display: flex;
  gap: 10px;
  white-space: nowrap;
}

.linkage-dialog__row-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.linkage-dialog__row-btn--danger {
  color: var(--color-danger);
}

.linkage-dialog__pagination,
.linkage-dialog__edit-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.linkage-dialog__edit-footer {
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid rgb(0 110 190 / 25%);
}

.linkage-dialog__page {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.linkage-dialog__page:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.linkage-dialog__page--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 55%);
  background: rgb(0 90 160 / 55%);
}

.linkage-dialog__section {
  flex-shrink: 0;
}

.linkage-dialog__section--grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.linkage-dialog__section-title {
  margin: 0 0 8px;
  padding-left: 8px;
  border-left: 3px solid var(--color-accent);
  color: var(--map-layer-divider);
  font-size: 14px;
  font-weight: 500;
}

.linkage-dialog__fields {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.linkage-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.linkage-dialog__field span {
  color: var(--map-device-offline);
  font-size: 12px;
}

.linkage-dialog__add {
  align-self: flex-start;
  margin-top: 8px;
  height: 30px;
  padding: 0 12px;
  border: 1px dashed rgb(0 150 230 / 50%);
  border-radius: 4px;
  background: rgb(0 60 120 / 25%);
  color: #6eb5ff;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.linkage-dialog__tip {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 10px 16px;
  border: 1px solid rgb(61 214 140 / 50%);
  border-radius: 4px;
  background: rgb(10 60 40 / 90%);
  color: var(--color-success);
  font-size: 13px;
}

.linkage-dialog-fade-enter-active,
.linkage-dialog-fade-leave-active {
  transition: opacity 0.22s ease;
}

.linkage-dialog-fade-enter-from,
.linkage-dialog-fade-leave-to {
  opacity: 0;
}

.linkage-dialog-tip-enter-active,
.linkage-dialog-tip-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.linkage-dialog-tip-enter-from,
.linkage-dialog-tip-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
