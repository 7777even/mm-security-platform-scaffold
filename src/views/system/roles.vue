<script setup lang="ts">
// 系统管理 · 角色管理（契约 docs/api/system.openapi.json）
// 角色 CRUD + 角色-菜单授权（授权树整表覆盖保存；后端保存后权限缓存即时失效）。
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchSystemRoles,
  createSystemRole,
  updateSystemRole,
  deleteSystemRole,
  updateSystemRoleStatus,
  fetchSystemMenus,
  fetchSystemRoleMenus,
  assignSystemRoleMenus,
  type SystemMenuNode,
  type SystemRoleItem,
} from '@/services/system';

interface TreeApi {
  setCheckedKeys: (keys: Array<number | string>) => void;
  getCheckedKeys: (leafOnly?: boolean) => Array<number | string>;
  getHalfCheckedKeys: () => Array<number | string>;
}

const loading = ref(false);
const rows = ref<SystemRoleItem[]>([]);
const menuTree = ref<SystemMenuNode[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const form = reactive({
  roleCode: '',
  roleName: '',
  description: '',
  dataScope: 'SELF',
  status: 1,
  sortOrder: 100,
});

const grantVisible = ref(false);
const grantRole = ref<SystemRoleItem | null>(null);
const treeRef = ref<TreeApi | null>(null);

const treeProps = { label: 'name', children: 'children' } as const;

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    rows.value = await fetchSystemRoles();
  } catch (e) {
    ElMessage.error(errMsg(e));
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadTree(): Promise<void> {
  try {
    menuTree.value = await fetchSystemMenus();
  } catch {
    menuTree.value = [];
  }
}

function openCreate(): void {
  dialogMode.value = 'create';
  editingId.value = null;
  form.roleCode = '';
  form.roleName = '';
  form.description = '';
  form.dataScope = 'SELF';
  form.status = 1;
  form.sortOrder = 100;
  dialogVisible.value = true;
}

function openEdit(row: SystemRoleItem): void {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.roleCode = row.roleCode;
  form.roleName = row.roleName;
  form.description = row.description ?? '';
  form.dataScope = row.dataScope ?? 'SELF';
  form.status = row.status;
  form.sortOrder = row.sortOrder ?? 100;
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.roleCode.trim() || !form.roleName.trim()) {
    ElMessage.warning('请填写角色标识与名称');
    return;
  }
  const payload = {
    roleCode: form.roleCode.trim(),
    roleName: form.roleName.trim(),
    description: form.description || undefined,
    dataScope: form.dataScope,
    status: form.status,
    sortOrder: form.sortOrder,
  };
  try {
    if (dialogMode.value === 'create') {
      await createSystemRole(payload);
      ElMessage.success('角色已创建');
    } else if (editingId.value != null) {
      await updateSystemRole(editingId.value, payload);
      ElMessage.success('角色已更新');
    }
    dialogVisible.value = false;
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function toggleStatus(row: SystemRoleItem): Promise<void> {
  try {
    await updateSystemRoleStatus(row.id, row.status === 1 ? 0 : 1);
    ElMessage.success(row.status === 1 ? '已停用' : '已启用');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function remove(row: SystemRoleItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.roleName}」？`, '删除确认', {
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await deleteSystemRole(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function openGrant(row: SystemRoleItem): Promise<void> {
  grantRole.value = row;
  if (menuTree.value.length === 0) {
    await loadTree();
  }
  try {
    const granted = await fetchSystemRoleMenus(row.id);
    grantVisible.value = true;
    // 等 el-tree 渲染后再回填勾选
    setTimeout(() => treeRef.value?.setCheckedKeys(granted), 0);
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function saveGrant(): Promise<void> {
  if (!grantRole.value || !treeRef.value) return;
  const checked = treeRef.value.getCheckedKeys() as number[];
  const half = treeRef.value.getHalfCheckedKeys() as number[];
  const menuIds = Array.from(new Set([...half, ...checked]));
  try {
    await assignSystemRoleMenus(grantRole.value.id, menuIds);
    ElMessage.success('授权已保存（立即生效）');
    grantVisible.value = false;
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

onMounted(async () => {
  await loadTree();
  await load();
});
</script>

<template>
  <PanelCard title="角色管理" icon="Lock">
    <div class="toolbar">
      <el-button type="primary" @click="load">刷新</el-button>
      <el-button v-permission="'system:role:create'" type="success" @click="openCreate"
        >新增角色</el-button
      >
    </div>

    <el-table v-loading="loading" :data="rows" class="table" size="small" border>
      <el-table-column prop="roleCode" label="角色标识" min-width="130" />
      <el-table-column prop="roleName" label="角色名称" min-width="110" />
      <el-table-column prop="description" label="说明" min-width="180" />
      <el-table-column prop="dataScope" label="数据范围" width="100" />
      <el-table-column label="内置" width="70">
        <template #default="{ row }">{{ row.builtIn ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="userCount" label="用户数" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'system:role:edit'" link type="primary" @click="openEdit(row)"
            >编辑</el-button
          >
          <el-button v-permission="'system:role:grant'" link type="warning" @click="openGrant(row)"
            >授权</el-button
          >
          <el-button
            v-permission="'system:role:edit'"
            link
            type="warning"
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button v-permission="'system:role:delete'" link type="danger" @click="remove(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增角色' : '编辑角色'"
      width="480px"
    >
      <el-form label-width="90px">
        <el-form-item label="角色标识" required>
          <el-input v-model="form.roleCode" placeholder="如 SCHEDULER（保存时统一大写）" />
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="如 值班调度" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="数据范围">
          <el-select v-model="form.dataScope">
            <el-option label="全部（ALL）" value="ALL" />
            <el-option label="本部门（DEPT）" value="DEPT" />
            <el-option label="仅本人（SELF）" value="SELF" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
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

    <el-dialog
      v-model="grantVisible"
      :title="`角色授权 · ${grantRole?.roleName ?? ''}`"
      width="520px"
    >
      <p class="grant-tip">勾选菜单与按钮权限，保存后立即生效（后端权限缓存写时失效）。</p>
      <el-tree
        ref="treeRef"
        :data="menuTree"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        class="grant-tree"
      >
        <template #default="{ data }">
          <span>
            {{ data.name }}
            <em v-if="data.permCode" class="perm">{{ data.permCode }}</em>
          </span>
        </template>
      </el-tree>
      <template #footer>
        <el-button @click="grantVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGrant">保存授权</el-button>
      </template>
    </el-dialog>
  </PanelCard>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.table {
  width: 100%;
}

.grant-tip {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-muted);
}

.grant-tree {
  max-height: 380px;
  overflow: auto;
}

.perm {
  margin-left: var(--space-sm);
  color: var(--color-text-muted);
  font-style: normal;
  font-size: var(--font-size-helper);
}
</style>
