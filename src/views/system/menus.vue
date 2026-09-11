<script setup lang="ts">
// 系统管理 · 菜单权限（契约 docs/api/system.openapi.json）
// 统一授权轴（ADR-2）：DIR 目录 / MENU 菜单 / BUTTON 按钮；BUTTON 不参与导航，仅贡献权限码。
// 删除为拒绝式保护：有子节点或已被角色授权时后端返回 409。
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchSystemMenus,
  createSystemMenu,
  updateSystemMenu,
  deleteSystemMenu,
  fetchPermissionCodes,
  type PermissionCodeItem,
  type SystemMenuNode,
} from '@/services/system';

const loading = ref(false);
const tree = ref<SystemMenuNode[]>([]);
const perms = ref<PermissionCodeItem[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const form = reactive({
  parentId: 0,
  name: '',
  code: '',
  path: '',
  icon: '',
  sortOrder: 0,
  menuType: 'MENU',
  permCode: '',
  visible: 1,
  status: 1,
});

const permCount = computed(() => perms.value.length);

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    tree.value = await fetchSystemMenus();
  } catch (e) {
    ElMessage.error(errMsg(e));
    tree.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadPerms(): Promise<void> {
  try {
    perms.value = await fetchPermissionCodes();
  } catch {
    perms.value = [];
  }
}

function openCreate(parent?: SystemMenuNode): void {
  dialogMode.value = 'create';
  editingId.value = null;
  form.parentId = parent?.id ?? 0;
  form.name = '';
  form.code = '';
  form.path = '';
  form.icon = '';
  form.sortOrder = 0;
  form.menuType = 'MENU';
  form.permCode = '';
  form.visible = 1;
  form.status = 1;
  dialogVisible.value = true;
}

/**
 * el-table 插槽解构出的 row 被推断为 element-plus 的 DefaultRow（索引签名对象），
 * 直接传给要求 SystemMenuNode 的方法会类型不匹配。这里统一收敛为领域类型，
 * 既保持各处理函数签名严格，也避免在模板里写 TS 断言。
 */
function asMenu(row: unknown): SystemMenuNode {
  return row as SystemMenuNode;
}

function openEdit(row: SystemMenuNode): void {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.parentId = row.parentId ?? 0;
  form.name = row.name;
  form.code = row.code ?? '';
  form.path = row.path ?? '';
  form.icon = row.icon ?? '';
  form.sortOrder = row.sortOrder ?? 0;
  form.menuType = row.menuType ?? 'MENU';
  form.permCode = row.permCode ?? '';
  form.visible = row.visible ?? 1;
  form.status = row.status ?? 1;
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.name.trim() || !form.code.trim()) {
    ElMessage.warning('请填写节点名称与编码');
    return;
  }
  const payload = {
    parentId: form.parentId,
    name: form.name.trim(),
    code: form.code.trim(),
    path: form.path || undefined,
    icon: form.icon || undefined,
    sortOrder: form.sortOrder,
    menuType: form.menuType,
    permCode: form.permCode || undefined,
    visible: form.visible,
    status: form.status,
  };
  try {
    if (dialogMode.value === 'create') {
      await createSystemMenu(payload);
      ElMessage.success('节点已创建');
    } else if (editingId.value != null) {
      await updateSystemMenu(editingId.value, payload);
      ElMessage.success('节点已更新');
    }
    dialogVisible.value = false;
    await load();
    await loadPerms();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function remove(row: SystemMenuNode): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除节点「${row.name}」？有子节点或已被授权时会被拒绝。`,
      '删除确认',
      {
        type: 'warning',
      },
    );
  } catch {
    return;
  }
  try {
    await deleteSystemMenu(row.id);
    ElMessage.success('已删除');
    await load();
    await loadPerms();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

onMounted(async () => {
  await load();
  await loadPerms();
});
</script>

<template>
  <PanelCard title="菜单权限" icon="Tools">
    <div class="toolbar">
      <el-button type="primary" @click="load">刷新</el-button>
      <el-button v-permission="'system:menu:create'" type="success" @click="openCreate()"
        >新增节点</el-button
      >
      <span class="count">权限码共 {{ permCount }} 项</span>
    </div>

    <el-table
      v-loading="loading"
      :data="tree"
      row-key="id"
      :tree-props="{ children: 'children' }"
      default-expand-all
      class="table"
      size="small"
      border
    >
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column prop="code" label="编码" min-width="170" />
      <el-table-column prop="menuType" label="类型" width="90" />
      <el-table-column prop="permCode" label="权限码" min-width="190" />
      <el-table-column prop="path" label="路由" min-width="150" />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'system:menu:create'"
            link
            type="primary"
            @click="openCreate(asMenu(row))"
            >加子节点</el-button
          >
          <el-button
            v-permission="'system:menu:edit'"
            link
            type="primary"
            @click="openEdit(asMenu(row))"
            >编辑</el-button
          >
          <el-button
            v-permission="'system:menu:delete'"
            link
            type="danger"
            @click="remove(asMenu(row))"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增节点' : '编辑节点'"
      width="500px"
    >
      <el-form label-width="90px">
        <el-form-item label="父节点 ID">
          <el-input-number v-model="form.parentId" :min="0" />
          <span class="hint">0 表示顶层</span>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编码" required>
          <el-input v-model="form.code" placeholder="唯一，如 system-user-export" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="form.menuType">
            <el-option label="目录 DIR" value="DIR" />
            <el-option label="菜单 MENU" value="MENU" />
            <el-option label="按钮 BUTTON" value="BUTTON" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限码">
          <el-input v-model="form.permCode" placeholder="如 system:user:export" />
        </el-form-item>
        <el-form-item label="路由">
          <el-input v-model="form.path" placeholder="如 /system/users" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="Element Plus 图标名" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="99999" />
        </el-form-item>
        <el-form-item label="可见">
          <el-radio-group v-model="form.visible">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </PanelCard>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.count {
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.table {
  width: 100%;
}

.hint {
  margin-left: var(--space-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}
</style>
