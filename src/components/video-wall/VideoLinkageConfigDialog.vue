<!--
  VideoLinkageConfigDialog — 监控联动配置（视频墙二级界面 linkageConfig）
  组件与内部「列表 / 新增编辑」两态逻辑沿用原实现，仅把承载壳换成深蓝 Dialog 规范：
    - 外壳复用 @/components/fire/ScreenDialog.vue（z-index 走 --z-overlay，不再自持 z-index）
    - 显隐由 VideoWallInteractionLayer 的 v-if 控制，关闭 emit('close') 交还调度层卸载
  编辑态状态仍复用既有 @/composables/useVideoLinkageConfig（linkageEditMode / editingRules / startLinkageEdit …）。
  数据消费 @/services/map-data/videoLinkageMock。保存反馈走统一 showToast，零硬编码色。
-->
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import {
  businessObjectCategoryOptions,
  businessObjectOptions,
  monitorNameOptions,
  presetPointOptions,
  videoLinkageConfigs,
  type VideoLinkageConfig,
} from '@/services/map-data/videoLinkageMock';
import {
  cancelLinkageEdit,
  closeLinkageDialog,
  editingConfig,
  editingRules,
  linkageEditMode,
  saveLinkageEdit,
  startLinkageEdit,
} from '@/composables/useVideoLinkageConfig';

const emit = defineEmits<{ close: [] }>();

const keyword = ref('');
const categoryFilter = ref('全部类别');
const currentPage = ref(1);
const PAGE_SIZE = 6;

const monitorName = ref(monitorNameOptions[0]);
const monitorCode = ref('HKJK-5124870');

// 本层由调度层 v-if 挂载，每次打开都会重新 setup：进入即回到列表态。
cancelLinkageEdit();

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
  showToast('已删除该联动行');
}

function removeConfig(config: VideoLinkageConfig) {
  const index = videoLinkageConfigs.findIndex((item) => item.id === config.id);
  if (index >= 0) videoLinkageConfigs.splice(index, 1);
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  showToast(`已删除联动配置：${config.name}`);
}

function submitEdit() {
  showToast('监控联动配置已保存');
  saveLinkageEdit();
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function runQuery() {
  currentPage.value = 1;
  showToast(`已筛选出 ${filteredItems.value.length} 条联动配置`);
}

function handleClose() {
  closeLinkageDialog();
  emit('close');
}
</script>

<template>
  <ScreenDialog
    :open="true"
    :title="`监控联动配置${linkageEditMode ? ' · 新增/编辑' : ''}`"
    icon="crane"
    width="min(1100px, calc(100vw - 80px))"
    @close="handleClose"
  >
    <!-- 列表模式 -->
    <div v-if="!linkageEditMode" class="linkage">
      <div class="linkage__toolbar">
        <input v-model="keyword" class="linkage__input" type="text" placeholder="监控名称 / 编号" />
        <select v-model="categoryFilter" class="linkage__input linkage__input--select">
          <option v-for="opt in categories" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <button type="button" class="linkage__btn" @click="runQuery">查询</button>
        <button
          type="button"
          class="linkage__btn linkage__btn--primary"
          @click="startLinkageEdit()"
        >
          新增配置
        </button>
      </div>

      <div class="linkage__table-wrap">
        <table class="linkage__table">
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
              <td class="linkage__code">{{ item.code }}</td>
              <td>{{ item.category }}</td>
              <td class="linkage__num">{{ item.linkageCount }}</td>
              <td class="linkage__objects">{{ item.businessObjects }}</td>
              <td>
                <div class="linkage__row-actions">
                  <button type="button" class="linkage__row-btn" @click="startLinkageEdit(item.id)">
                    编辑
                  </button>
                  <button
                    type="button"
                    class="linkage__row-btn linkage__row-btn--danger"
                    @click="removeConfig(item)"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="pagedItems.length === 0">
              <td class="linkage__empty" colspan="6">无匹配的联动配置</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="linkage__pagination">
        <button
          type="button"
          class="linkage__page"
          :disabled="currentPage <= 1"
          aria-label="上一页"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="linkage__page"
          :class="{ 'linkage__page--active': currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          type="button"
          class="linkage__page"
          :disabled="currentPage >= totalPages"
          aria-label="下一页"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </footer>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="linkage">
      <div class="linkage__section">
        <h4 class="linkage__section-title">基础信息</h4>
        <div class="linkage__fields">
          <label class="linkage__field">
            <span>监控名称</span>
            <select v-model="monitorName" class="linkage__input linkage__input--block">
              <option v-for="opt in monitorNameOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </label>
          <label class="linkage__field">
            <span>监控类别</span>
            <input
              v-model="categoryByMonitor[monitorName]"
              class="linkage__input linkage__input--block"
              type="text"
              readonly
            />
          </label>
          <label class="linkage__field">
            <span>监控编号</span>
            <input v-model="monitorCode" class="linkage__input linkage__input--block" type="text" />
          </label>
        </div>
      </div>

      <div class="linkage__section linkage__section--grow">
        <h4 class="linkage__section-title">联动配置</h4>
        <div class="linkage__table-wrap">
          <table class="linkage__table">
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
                  <select v-model="rule.presetPoint" class="linkage__input linkage__input--cell">
                    <option v-for="opt in presetPointOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="rule.objectCategory" class="linkage__input linkage__input--cell">
                    <option v-for="opt in businessObjectCategoryOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="rule.objectName" class="linkage__input linkage__input--cell">
                    <option v-for="opt in businessObjectOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    class="linkage__row-btn linkage__row-btn--danger"
                    @click="removeRule(rule.id)"
                  >
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="editingRules.length === 0">
                <td class="linkage__empty" colspan="4">暂无联动行，请添加</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button type="button" class="linkage__add" @click="addRule">添加联动行</button>
      </div>

      <footer class="linkage__edit-footer">
        <button type="button" class="linkage__btn" @click="cancelLinkageEdit">取消</button>
        <button type="button" class="linkage__btn linkage__btn--primary" @click="submitEdit">
          提交
        </button>
      </footer>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.linkage {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  height: 100%;
  min-height: 0;
}

.linkage__toolbar {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-sm);
}

.linkage__input {
  min-width: 0;
  width: 220px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  color: var(--color-text-strong);
  font-family: inherit;
  font-size: var(--font-size-helper);
  outline: none;
}

.linkage__input--select {
  width: 160px;
}

.linkage__input--block {
  width: 100%;
}

.linkage__input--cell {
  width: 100%;
  min-width: 170px;
}

.linkage__btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-helper);
  white-space: nowrap;
  cursor: pointer;
}

.linkage__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text-strong);
}

.linkage__btn--primary {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  color: var(--color-text-strong);
}

.linkage__table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
}

.linkage__table {
  width: 100%;
  border-collapse: collapse;
  color: var(--color-text);
  font-size: var(--font-size-helper);
}

.linkage__table th {
  position: sticky;
  top: 0;
  z-index: var(--z-base);
  padding: 9px 8px;
  border-bottom: 1px solid var(--panel-border);
  background: var(--color-panel);
  color: var(--color-text-muted);
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
}

.linkage__table td {
  padding: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--panel-border) 42%, transparent);
}

.linkage__table tbody tr:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.linkage__code {
  color: var(--color-accent);
  font-family: var(--font-number);
  white-space: nowrap;
}

.linkage__num {
  font-family: var(--font-number);
}

.linkage__objects {
  min-width: 220px;
}

.linkage__empty {
  padding: var(--space-lg) 8px;
  color: var(--color-text-muted);
  text-align: center;
}

.linkage__row-actions {
  display: flex;
  gap: var(--space-sm);
  white-space: nowrap;
}

.linkage__row-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-accent);
  font-family: inherit;
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.linkage__row-btn--danger {
  color: var(--color-danger);
}

.linkage__pagination,
.linkage__edit-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.linkage__edit-footer {
  justify-content: flex-end;
  padding-top: var(--space-sm);
  border-top: 1px solid color-mix(in srgb, var(--panel-border) 55%, transparent);
}

.linkage__page {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.linkage__page:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.linkage__page--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  color: var(--color-text-strong);
}

.linkage__section {
  flex-shrink: 0;
}

.linkage__section--grow {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.linkage__section-title {
  margin: 0 0 var(--space-sm);
  padding-left: var(--space-sm);
  border-left: 3px solid var(--color-accent);
  color: var(--color-text-strong);
  font-size: var(--font-size-stat-label);
  font-weight: 500;
}

.linkage__fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-sm);
}

.linkage__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}

.linkage__field span {
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.linkage__add {
  align-self: flex-start;
  height: 28px;
  margin-top: var(--space-sm);
  padding: 0 12px;
  border: 1px dashed var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-accent);
  font-family: inherit;
  font-size: var(--font-size-helper);
  cursor: pointer;
}
</style>
