<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Collection } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { confirm, toastErr, toastOk } from '../../utils/feedback';
import {
  createDictItem,
  createDictType,
  deleteDictItem,
  deleteDictType,
  fetchDictItems,
  fetchDictTypes,
  updateDictItem,
  updateDictType,
} from '@/services/system';
import type {
  DictItemItem,
  DictItemSaveRequest,
  DictTypeItem,
  DictTypeSaveRequest,
} from '@/services/system';
import { reportAudit } from '@/services/audit';

// el-table 插槽 row 为 DefaultRow（宽松记录型），经适配器收敛为领域类型。
function asItem(row: unknown): DictItemItem {
  return row as DictItemItem;
}

// 字典管理（/dict-mgmt）：接后端 /system/dict-types 与 /system/dict-items。
// 左：字典类型；右：所选字典的字典项。写操作 reportAudit 留痕。

/* ---------------- 字典类型 ---------------- */
const types = ref<DictTypeItem[]>([]);
const typeKeyword = ref('');
const selectedType = ref<DictTypeItem | null>(null);

async function loadTypes(): Promise<void> {
  try {
    const res = await fetchDictTypes({
      page: 1,
      size: 200,
      keyword: typeKeyword.value || undefined,
    });
    types.value = Array.isArray(res?.list) ? res.list : [];
    if (types.value.length && !selectedType.value) selectType(types.value[0]);
  } catch (err) {
    toastErr(err, '加载字典类型失败：');
    types.value = [];
  }
}

function selectType(t: DictTypeItem): void {
  selectedType.value = t;
  void loadItems();
}

const typeDialogVisible = ref(false);
const typeDialogMode = ref<'create' | 'edit'>('create');
const typeForm = reactive<DictTypeSaveRequest>({
  dictCode: '',
  dictName: '',
  description: '',
  status: 1,
});
let editingTypeId: number | null = null;

function openTypeCreate(): void {
  typeDialogMode.value = 'create';
  editingTypeId = null;
  Object.assign(typeForm, { dictCode: '', dictName: '', description: '', status: 1 });
  typeDialogVisible.value = true;
}
function openTypeEdit(t: DictTypeItem): void {
  typeDialogMode.value = 'edit';
  editingTypeId = t.id;
  Object.assign(typeForm, {
    dictCode: t.dictCode,
    dictName: t.dictName,
    description: t.description ?? '',
    status: t.status,
  });
  typeDialogVisible.value = true;
}
async function submitType(): Promise<void> {
  if (!typeForm.dictCode.trim()) return toastErr('请输入字典编码', '');
  if (!typeForm.dictName.trim()) return toastErr('请输入字典名称', '');
  try {
    if (typeDialogMode.value === 'create') {
      await createDictType({ ...typeForm });
      reportAudit({
        action: 'system.dict.type.create',
        module: 'sys',
        detail: { code: typeForm.dictCode },
      });
      toastOk('字典类型已创建');
    } else if (editingTypeId != null) {
      await updateDictType(editingTypeId, { ...typeForm });
      reportAudit({
        action: 'system.dict.type.update',
        module: 'sys',
        detail: { id: editingTypeId },
      });
      toastOk('字典类型已更新');
    }
    typeDialogVisible.value = false;
    await loadTypes();
  } catch (err) {
    toastErr(err, '保存失败：');
  }
}
async function removeType(t: DictTypeItem): Promise<void> {
  if (t.builtIn) return toastErr('内置字典不可删除', '');
  if (!(await confirm(`确认删除字典「${t.dictName}」及其字典项？`))) return;
  try {
    await deleteDictType(t.id);
    reportAudit({ action: 'system.dict.type.delete', module: 'sys', detail: { id: t.id } });
    toastOk('字典类型已删除');
    if (selectedType.value?.id === t.id) selectedType.value = null;
    await loadTypes();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

/* ---------------- 字典项 ---------------- */
const items = ref<DictItemItem[]>([]);
async function loadItems(): Promise<void> {
  if (!selectedType.value) {
    items.value = [];
    return;
  }
  try {
    const res = await fetchDictItems(selectedType.value.dictCode, { page: 1, size: 200 });
    items.value = Array.isArray(res?.list) ? res.list : [];
  } catch (err) {
    toastErr(err, '加载字典项失败：');
    items.value = [];
  }
}

const itemDialogVisible = ref(false);
const itemDialogMode = ref<'create' | 'edit'>('create');
const itemForm = reactive<DictItemSaveRequest>({
  dictCode: '',
  itemValue: '',
  itemLabel: '',
  sortOrder: 0,
  status: 1,
  description: '',
});
let editingItemId: number | null = null;

function openItemCreate(): void {
  if (!selectedType.value) return toastErr('请先选择左侧字典类型', '');
  itemDialogMode.value = 'create';
  editingItemId = null;
  Object.assign(itemForm, {
    dictCode: selectedType.value.dictCode,
    itemValue: '',
    itemLabel: '',
    sortOrder: 0,
    status: 1,
    description: '',
  });
  itemDialogVisible.value = true;
}
function openItemEdit(it: DictItemItem): void {
  itemDialogMode.value = 'edit';
  editingItemId = it.id;
  Object.assign(itemForm, {
    dictCode: it.dictCode ?? selectedType.value?.dictCode ?? '',
    itemValue: it.itemValue ?? '',
    itemLabel: it.itemLabel ?? '',
    sortOrder: it.sortOrder ?? 0,
    status: it.status ?? 1,
    description: it.description ?? '',
  });
  itemDialogVisible.value = true;
}
async function submitItem(): Promise<void> {
  if (!itemForm.itemValue.trim()) return toastErr('请输入字典值', '');
  if (!itemForm.itemLabel.trim()) return toastErr('请输入显示文案', '');
  try {
    if (itemDialogMode.value === 'create') {
      await createDictItem({ ...itemForm });
      reportAudit({ action: 'system.dict.item.create', module: 'sys' });
      toastOk('字典项已创建');
    } else if (editingItemId != null) {
      await updateDictItem(editingItemId, { ...itemForm });
      reportAudit({
        action: 'system.dict.item.update',
        module: 'sys',
        detail: { id: editingItemId },
      });
      toastOk('字典项已更新');
    }
    itemDialogVisible.value = false;
    await loadItems();
  } catch (err) {
    toastErr(err, '保存失败：');
  }
}
async function removeItem(it: DictItemItem): Promise<void> {
  if (!(await confirm(`确认删除字典项「${it.itemLabel}」？`))) return;
  try {
    await deleteDictItem(it.id);
    reportAudit({ action: 'system.dict.item.delete', module: 'sys', detail: { id: it.id } });
    toastOk('字典项已删除');
    await loadItems();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(loadTypes);

// 三端实时刷新：字典类型/项任一端改写，本页自动重拉（realtime-channel spec）
useDomainAutoRefresh('system.dict-type', loadTypes, { immediate: false });
useDomainAutoRefresh('system.dict-item', loadItems, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="字典管理"
      crumb="基础信息管理 / 字典管理"
      :icon="Collection"
      icon-tone="indigo"
    >
      <template #actions>
        <el-button v-permission="'system:dict:create'" type="primary" @click="openTypeCreate"
          >新增字典类型</el-button
        >
      </template>
    </MgmtPageHead>

    <div class="dict-layout">
      <!-- 左：字典类型 -->
      <section class="dict-col dict-col--left">
        <div class="dict-col__hd">
          <span class="dict-col__title">字典类型</span>
          <el-input
            v-model="typeKeyword"
            placeholder="搜索编码/名称"
            size="small"
            style="width: 160px"
            @keyup.enter="loadTypes"
          />
        </div>
        <ul class="dict-type-list">
          <li
            v-for="t in types"
            :key="t.id"
            class="dict-type-item"
            :class="{ 'dict-type-item--on': selectedType?.id === t.id }"
            @click="selectType(t)"
          >
            <div class="dict-type-item__main">
              <span class="dict-type-item__name">{{ t.dictName }}</span>
              <span class="dict-type-item__code">{{ t.dictCode }}</span>
            </div>
            <div class="dict-type-item__ops" @click.stop>
              <el-button
                v-permission="'system:dict:edit'"
                link
                type="primary"
                size="small"
                @click="openTypeEdit(t)"
                >编辑</el-button
              >
              <el-button
                v-permission="'system:dict:delete'"
                link
                type="danger"
                size="small"
                :disabled="t.builtIn"
                @click="removeType(t)"
                >删除</el-button
              >
            </div>
          </li>
          <li v-if="!types.length" class="dict-empty">暂无字典类型</li>
        </ul>
      </section>

      <!-- 右：字典项 -->
      <section class="dict-col dict-col--right">
        <div class="dict-col__hd">
          <span class="dict-col__title">
            字典项
            <span v-if="selectedType" class="dict-col__sub"
              >{{ selectedType.dictName }}（{{ selectedType.dictCode }}）</span
            >
          </span>
          <el-button
            v-permission="'system:dict:create'"
            type="primary"
            size="small"
            :disabled="!selectedType"
            @click="openItemCreate"
            >新增字典项</el-button
          >
        </div>
        <el-table :data="items" stripe style="width: 100%">
          <el-table-column prop="itemLabel" label="显示文案" min-width="140" />
          <el-table-column prop="itemValue" label="字典值" min-width="120" />
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <span class="tag" :class="row.status === 1 ? 'tag-success' : 'tag-info'">
                {{ row.status === 1 ? '启用' : '停用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="160">
            <template #default="{ row }">{{ row.description || '—' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="'system:dict:edit'"
                link
                type="primary"
                @click="openItemEdit(asItem(row))"
                >编辑</el-button
              >
              <el-button
                v-permission="'system:dict:delete'"
                link
                type="danger"
                @click="removeItem(asItem(row))"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <!-- 字典类型弹窗 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogMode === 'create' ? '新增字典类型' : '编辑字典类型'"
      width="480px"
    >
      <el-form label-width="88px">
        <el-form-item label="字典编码" required>
          <el-input
            v-model="typeForm.dictCode"
            :disabled="typeDialogMode === 'edit'"
            placeholder="如 alarm_level"
          />
        </el-form-item>
        <el-form-item label="字典名称" required>
          <el-input v-model="typeForm.dictName" placeholder="如 报警等级" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="typeForm.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="typeForm.description" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitType">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典项弹窗 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogMode === 'create' ? '新增字典项' : '编辑字典项'"
      width="480px"
    >
      <el-form label-width="88px">
        <el-form-item label="显示文案" required>
          <el-input v-model="itemForm.itemLabel" placeholder="界面展示的中文文案" />
        </el-form-item>
        <el-form-item label="字典值" required>
          <el-input v-model="itemForm.itemValue" placeholder="存储值（枚举）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="itemForm.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="itemForm.description" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dict-layout {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.dict-col {
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
  padding: var(--space-md);
}

.dict-col--left {
  width: 320px;
  flex-shrink: 0;
}

.dict-col--right {
  flex: 1;
  min-width: 0;
}

.dict-col__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.dict-col__title {
  font-size: var(--mgmt-fz-body);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.dict-col__sub {
  font-weight: 400;
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

.dict-type-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 520px;
  overflow: auto;
}

.dict-type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm);
  border-radius: var(--mgmt-radius-md);
  cursor: pointer;
}

.dict-type-item:hover {
  background: var(--mgmt-nav-group-hover-bg);
}

.dict-type-item--on {
  background: var(--primary-mgmt-soft);
}

.dict-type-item__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dict-type-item__name {
  font-size: var(--mgmt-fz-body);
  color: var(--text-title-mgmt);
  font-weight: 600;
}

.dict-type-item__code {
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

.dict-empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--text-muted-mgmt);
  font-size: var(--mgmt-fz-caption);
}
</style>
