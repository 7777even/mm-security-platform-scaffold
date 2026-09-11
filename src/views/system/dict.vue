<script setup lang="ts">
// 系统管理 · 数据字典（契约 docs/api/system.openapi.json）
// 两级维护：字典类型（左）+ 字典项（右）。业务只读端点 GET /system/dicts/{dictCode} 登录即可用。
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchDictTypes,
  createDictType,
  updateDictType,
  deleteDictType,
  fetchDictItems,
  createDictItem,
  updateDictItem,
  deleteDictItem,
  type DictItemItem,
  type DictTypeItem,
} from '@/services/system';

const typeLoading = ref(false);
const types = ref<DictTypeItem[]>([]);
const activeType = ref<DictTypeItem | null>(null);

const itemLoading = ref(false);
const items = ref<DictItemItem[]>([]);

const typeDialog = ref(false);
const typeMode = ref<'create' | 'edit'>('create');
const typeEditId = ref<number | null>(null);
const typeForm = reactive({ dictCode: '', dictName: '', description: '', status: 1 });

const itemDialog = ref(false);
const itemMode = ref<'create' | 'edit'>('create');
const itemEditId = ref<number | null>(null);
const itemForm = reactive({
  itemValue: '',
  itemLabel: '',
  sortOrder: 0,
  status: 1,
  description: '',
});

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function loadTypes(): Promise<void> {
  typeLoading.value = true;
  try {
    const res = await fetchDictTypes({ page: 1, size: 100 });
    types.value = res.list ?? [];
    if (!activeType.value && types.value.length > 0) {
      activeType.value = types.value[0];
    }
  } catch (e) {
    ElMessage.error(errMsg(e));
    types.value = [];
  } finally {
    typeLoading.value = false;
  }
}

async function loadItems(): Promise<void> {
  if (!activeType.value) {
    items.value = [];
    return;
  }
  itemLoading.value = true;
  try {
    const res = await fetchDictItems(activeType.value.dictCode, { page: 1, size: 200 });
    items.value = res.list ?? [];
  } catch (e) {
    ElMessage.error(errMsg(e));
    items.value = [];
  } finally {
    itemLoading.value = false;
  }
}

/**
 * el-table 插槽/事件给出的行是 element-plus 的 DefaultRow（索引签名对象），
 * 直接传给要求 DictTypeItem / DictItemItem 的方法会类型不匹配。
 * 这里统一收敛为领域类型，保持各处理函数签名严格，也避免在模板里写 TS 断言。
 */
function asDictType(row: unknown): DictTypeItem {
  return row as DictTypeItem;
}

function asDictItem(row: unknown): DictItemItem {
  return row as DictItemItem;
}

/** current-change 的回调签名与 selectType 不一致，包一层做类型收敛。 */
function onTypeCurrentChange(row: unknown): void {
  void selectType(asDictType(row));
}

async function selectType(row: DictTypeItem): Promise<void> {
  activeType.value = row;
  await loadItems();
}

function openTypeCreate(): void {
  typeMode.value = 'create';
  typeEditId.value = null;
  typeForm.dictCode = '';
  typeForm.dictName = '';
  typeForm.description = '';
  typeForm.status = 1;
  typeDialog.value = true;
}

function openTypeEdit(row: DictTypeItem): void {
  typeMode.value = 'edit';
  typeEditId.value = row.id;
  typeForm.dictCode = row.dictCode;
  typeForm.dictName = row.dictName;
  typeForm.description = row.description ?? '';
  typeForm.status = row.status;
  typeDialog.value = true;
}

async function submitType(): Promise<void> {
  if (!typeForm.dictCode.trim() || !typeForm.dictName.trim()) {
    ElMessage.warning('请填写字典标识与名称');
    return;
  }
  const payload = {
    dictCode: typeForm.dictCode.trim(),
    dictName: typeForm.dictName.trim(),
    description: typeForm.description || undefined,
    status: typeForm.status,
  };
  try {
    if (typeMode.value === 'create') {
      await createDictType(payload);
      ElMessage.success('字典类型已创建');
    } else if (typeEditId.value != null) {
      await updateDictType(typeEditId.value, payload);
      ElMessage.success('字典类型已更新');
    }
    typeDialog.value = false;
    activeType.value = null;
    await loadTypes();
    await loadItems();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function removeType(row: DictTypeItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除字典「${row.dictName}」？有字典项时会被拒绝。`,
      '删除确认',
      {
        type: 'warning',
      },
    );
  } catch {
    return;
  }
  try {
    await deleteDictType(row.id);
    ElMessage.success('已删除');
    activeType.value = null;
    await loadTypes();
    await loadItems();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

function openItemCreate(): void {
  if (!activeType.value) {
    ElMessage.warning('请先选择左侧字典类型');
    return;
  }
  itemMode.value = 'create';
  itemEditId.value = null;
  itemForm.itemValue = '';
  itemForm.itemLabel = '';
  itemForm.sortOrder = 0;
  itemForm.status = 1;
  itemForm.description = '';
  itemDialog.value = true;
}

function openItemEdit(row: DictItemItem): void {
  itemMode.value = 'edit';
  itemEditId.value = row.id;
  itemForm.itemValue = row.itemValue ?? '';
  itemForm.itemLabel = row.itemLabel ?? '';
  itemForm.sortOrder = row.sortOrder ?? 0;
  itemForm.status = row.status ?? 1;
  itemForm.description = row.description ?? '';
  itemDialog.value = true;
}

async function submitItem(): Promise<void> {
  if (!activeType.value) return;
  if (!itemForm.itemValue.trim() || !itemForm.itemLabel.trim()) {
    ElMessage.warning('请填写字典值与显示名');
    return;
  }
  const payload = {
    dictCode: activeType.value.dictCode,
    itemValue: itemForm.itemValue.trim(),
    itemLabel: itemForm.itemLabel.trim(),
    sortOrder: itemForm.sortOrder,
    status: itemForm.status,
    description: itemForm.description || undefined,
  };
  try {
    if (itemMode.value === 'create') {
      await createDictItem(payload);
      ElMessage.success('字典项已创建');
    } else if (itemEditId.value != null) {
      await updateDictItem(itemEditId.value, payload);
      ElMessage.success('字典项已更新');
    }
    itemDialog.value = false;
    await loadItems();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function removeItem(row: DictItemItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除字典项「${row.itemLabel}」？`, '删除确认', {
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await deleteDictItem(row.id);
    ElMessage.success('已删除');
    await loadItems();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

onMounted(async () => {
  await loadTypes();
  await loadItems();
});
</script>

<template>
  <PanelCard title="数据字典" icon="Notebook">
    <div class="dict">
      <section class="dict__pane">
        <header class="dict__head">
          <span>字典类型</span>
          <el-button
            v-permission="'system:dict:create'"
            size="small"
            type="success"
            @click="openTypeCreate"
          >
            新增
          </el-button>
        </header>
        <el-table
          v-loading="typeLoading"
          :data="types"
          size="small"
          highlight-current-row
          :current-row-key="activeType?.id"
          row-key="id"
          @current-change="onTypeCurrentChange"
        >
          <el-table-column prop="dictName" label="名称" min-width="110" />
          <el-table-column prop="dictCode" label="标识" min-width="120" />
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button
                v-permission="'system:dict:edit'"
                link
                type="primary"
                @click.stop="openTypeEdit(asDictType(row))"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'system:dict:delete'"
                link
                type="danger"
                @click.stop="removeType(asDictType(row))"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="dict__pane dict__pane--wide">
        <header class="dict__head">
          <span>字典项{{ activeType ? ` · ${activeType.dictName}` : '' }}</span>
          <el-button
            v-permission="'system:dict:create'"
            size="small"
            type="success"
            :disabled="!activeType"
            @click="openItemCreate"
          >
            新增
          </el-button>
        </header>
        <el-table v-loading="itemLoading" :data="items" size="small" border>
          <el-table-column prop="itemValue" label="字典值" min-width="110" />
          <el-table-column prop="itemLabel" label="显示名" min-width="120" />
          <el-table-column prop="sortOrder" label="排序" width="80" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="140" />
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="'system:dict:edit'"
                link
                type="primary"
                @click="openItemEdit(asDictItem(row))"
                >编辑</el-button
              >
              <el-button
                v-permission="'system:dict:delete'"
                link
                type="danger"
                @click="removeItem(asDictItem(row))"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <el-dialog
      v-model="typeDialog"
      :title="typeMode === 'create' ? '新增字典类型' : '编辑字典类型'"
      width="440px"
    >
      <el-form label-width="80px">
        <el-form-item label="标识" required>
          <el-input v-model="typeForm.dictCode" placeholder="如 alarm_level（保存时归一为小写）" />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="typeForm.dictName" placeholder="如 报警等级" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="typeForm.description" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitType">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="itemDialog"
      :title="itemMode === 'create' ? '新增字典项' : '编辑字典项'"
      width="440px"
    >
      <el-form label-width="80px">
        <el-form-item label="字典值" required>
          <el-input v-model="itemForm.itemValue" placeholder="如 1" />
        </el-form-item>
        <el-form-item label="显示名" required>
          <el-input v-model="itemForm.itemLabel" placeholder="如 一级" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="itemForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="itemForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialog = false">取消</el-button>
        <el-button type="primary" @click="submitItem">保存</el-button>
      </template>
    </el-dialog>
  </PanelCard>
</template>

<style scoped>
.dict {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 2fr);
  gap: var(--space-md);
}

.dict__pane {
  min-width: 0;
}

.dict__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-stat-label);
}
</style>
