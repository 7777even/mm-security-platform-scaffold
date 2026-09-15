<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Key } from '@element-plus/icons-vue';
import type { ElTree } from 'element-plus';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { confirm, toastErr, toastOk } from '../../utils/feedback';
import {
  assignSystemRoleMenus,
  createSystemRole,
  deleteSystemRole,
  fetchSystemMenus,
  fetchSystemRoleMenus,
  fetchSystemRoles,
  updateSystemRole,
  updateSystemRoleStatus,
} from '@/services/system';
import type { SystemMenuNode, SystemRoleItem, SystemRoleSaveRequest } from '@/services/system';
import { reportAudit } from '@/services/audit';

// el-table 插槽 row 为 DefaultRow（宽松记录型），经适配器收敛为领域类型。
function asRole(row: unknown): SystemRoleItem {
  return row as SystemRoleItem;
}

// 角色与权限管理（/role-mgmt）：接后端 /system/roles（角色 CRUD + 启停 + 菜单权限整表授权）。
// 授权树来自 /system/menus（sys_menu 树 + perm_code），保存走 PUT /system/roles/{id}/menus。

const rows = ref<SystemRoleItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const list = await fetchSystemRoles();
    rows.value = Array.isArray(list) ? list : [];
  } catch (err) {
    toastErr(err, '加载角色失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

/* ---------------- 新增 / 编辑 ---------------- */
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const form = reactive<SystemRoleSaveRequest>({
  roleCode: '',
  roleName: '',
  description: '',
  dataScope: 'ALL',
  status: 1,
  sortOrder: 0,
});

function openCreate(): void {
  dialogMode.value = 'create';
  editingId.value = null;
  Object.assign(form, {
    roleCode: '',
    roleName: '',
    description: '',
    dataScope: 'ALL',
    status: 1,
    sortOrder: 0,
  });
  dialogVisible.value = true;
}

function openEdit(row: SystemRoleItem): void {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  Object.assign(form, {
    roleCode: row.roleCode,
    roleName: row.roleName,
    description: row.description ?? '',
    dataScope: row.dataScope ?? 'ALL',
    status: row.status,
    sortOrder: row.sortOrder ?? 0,
  });
  dialogVisible.value = true;
}

const saving = ref(false);
async function submit(): Promise<void> {
  if (!form.roleCode.trim()) return toastErr('请输入角色编码', '');
  if (!form.roleName.trim()) return toastErr('请输入角色名称', '');
  saving.value = true;
  try {
    if (dialogMode.value === 'create') {
      await createSystemRole({ ...form });
      reportAudit({
        action: 'system.role.create',
        module: 'sys',
        detail: { roleCode: form.roleCode },
      });
      toastOk('角色已创建');
    } else if (editingId.value != null) {
      await updateSystemRole(editingId.value, { ...form });
      reportAudit({ action: 'system.role.update', module: 'sys', detail: { id: editingId.value } });
      toastOk('角色已更新');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '保存失败：');
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(row: SystemRoleItem): Promise<void> {
  const next = row.status === 1 ? 0 : 1;
  try {
    await updateSystemRoleStatus(row.id, next);
    reportAudit({
      action: 'system.role.status',
      module: 'sys',
      detail: { id: row.id, status: next },
    });
    toastOk(next === 1 ? '已启用' : '已停用');
    await load();
  } catch (err) {
    toastErr(err, '操作失败：');
  }
}

async function removeRole(row: SystemRoleItem): Promise<void> {
  if (row.builtIn) return toastErr('内置角色不可删除', '');
  if (!(await confirm(`确认删除角色「${row.roleName}」？`))) return;
  try {
    await deleteSystemRole(row.id);
    reportAudit({ action: 'system.role.delete', module: 'sys', detail: { id: row.id } });
    toastOk('角色已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

/* ---------------- 菜单权限授权 ---------------- */
const grantVisible = ref(false);
const grantRole = ref<SystemRoleItem | null>(null);
const menuTree = ref<SystemMenuNode[]>([]);
const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const grantLoading = ref(false);

async function openGrant(row: SystemRoleItem): Promise<void> {
  grantRole.value = row;
  grantVisible.value = true;
  grantLoading.value = true;
  try {
    const [tree, checked] = await Promise.all([fetchSystemMenus(), fetchSystemRoleMenus(row.id)]);
    menuTree.value = Array.isArray(tree) ? tree : [];
    await Promise.resolve();
    treeRef.value?.setCheckedKeys(Array.isArray(checked) ? checked : []);
  } catch (err) {
    toastErr(err, '加载授权失败：');
    menuTree.value = [];
  } finally {
    grantLoading.value = false;
  }
}

async function saveGrant(): Promise<void> {
  if (!grantRole.value) return;
  const checked = (treeRef.value?.getCheckedKeys(false) ?? []).map((k) => Number(k));
  const half = (treeRef.value?.getHalfCheckedKeys() ?? []).map((k) => Number(k));
  const ids = Array.from(new Set([...checked, ...half]));
  try {
    await assignSystemRoleMenus(grantRole.value.id, ids);
    reportAudit({
      action: 'system.role.grant',
      module: 'sys',
      detail: { id: grantRole.value.id, count: ids.length },
    });
    toastOk('授权已保存');
    grantVisible.value = false;
  } catch (err) {
    toastErr(err, '授权保存失败：');
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="角色与权限管理"
      crumb="基础信息管理 / 角色与权限管理"
      :icon="Key"
      icon-tone="amber"
    >
      <template #actions>
        <el-button v-permission="'system:role:create'" type="primary" @click="openCreate"
          >新增角色</el-button
        >
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="roleName" label="角色名称" min-width="160" />
      <el-table-column prop="roleCode" label="角色编码" min-width="140" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <span class="tag" :class="row.builtIn ? 'tag-info' : 'tag-success'">
            {{ row.builtIn ? '内置' : '自定义' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="dataScope" label="数据范围" width="120">
        <template #default="{ row }">{{ row.dataScope || 'ALL' }}</template>
      </el-table-column>
      <el-table-column prop="userCount" label="用户数" width="90">
        <template #default="{ row }">{{ row.userCount ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="180">
        <template #default="{ row }">{{ row.description || '—' }}</template>
      </el-table-column>
      <el-table-column label="启用" width="90">
        <template #default="{ row }">
          <span class="tag" :class="row.status === 1 ? 'tag-success' : 'tag-info'">
            {{ row.status === 1 ? '是' : '否' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'system:role:grant'"
            link
            type="primary"
            @click="openGrant(asRole(row))"
            >授权</el-button
          >
          <el-button
            v-permission="'system:role:edit'"
            link
            type="primary"
            @click="openEdit(asRole(row))"
            >编辑</el-button
          >
          <el-button
            v-permission="'system:role:edit'"
            link
            type="primary"
            @click="toggleStatus(asRole(row))"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button
            v-permission="'system:role:delete'"
            link
            type="danger"
            :disabled="row.builtIn"
            @click="removeRole(asRole(row))"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </MgmtProTable>

    <!-- 新增 / 编辑角色 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增角色' : '编辑角色'"
      width="520px"
    >
      <el-form label-width="88px">
        <el-form-item label="角色编码" required>
          <el-input
            v-model="form.roleCode"
            :disabled="dialogMode === 'edit'"
            placeholder="如 FIRE_ADMIN"
          />
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="如 消防业务管理员" />
        </el-form-item>
        <el-form-item label="数据范围">
          <el-select v-model="form.dataScope" style="width: 100%">
            <el-option label="全部数据（ALL）" value="ALL" />
            <el-option label="本防区（ZONE）" value="ZONE" />
            <el-option label="仅本人（SELF）" value="SELF" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 菜单权限授权 -->
    <el-dialog
      v-model="grantVisible"
      :title="`菜单权限授权 · ${grantRole?.roleName ?? ''}`"
      width="560px"
    >
      <div v-loading="grantLoading" class="grant-tree">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          node-key="id"
          show-checkbox
          default-expand-all
          :props="{ label: 'name', children: 'children' }"
        >
          <template #default="{ data }">
            <span class="grant-node">
              <span>{{ data.name }}</span>
              <span v-if="data.permCode" class="grant-perm">{{ data.permCode }}</span>
            </span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <el-button @click="grantVisible = false">取消</el-button>
        <el-button v-permission="'system:role:grant'" type="primary" @click="saveGrant"
          >保存授权</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.grant-tree {
  max-height: 420px;
  overflow: auto;
}

.grant-node {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.grant-perm {
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}
</style>
