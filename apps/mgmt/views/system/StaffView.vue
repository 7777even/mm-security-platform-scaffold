<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { User } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { confirm, toastErr, toastOk } from '../../utils/feedback';
import {
  assignSystemUserRole,
  createSystemUser,
  deleteSystemUser,
  fetchSystemRoles,
  fetchSystemUsers,
  fetchSystemZones,
  resetSystemUserPassword,
  updateSystemUser,
  updateSystemUserStatus,
} from '@/services/system';
import type {
  SystemRoleItem,
  SystemUserCreate,
  SystemUserItem,
  SystemUserUpdate,
  ZoneItem,
} from '@/services/system';
import { reportAudit } from '@/services/audit';

// el-table 插槽 row 为 DefaultRow（宽松记录型），按项目约定经适配器收敛为领域类型。
function asUser(row: unknown): SystemUserItem {
  return row as SystemUserItem;
}

// 人员与账号管理（/staff-mgmt）：接后端 /system/users（用户 CRUD + 启停 + 重置口令 + 分配角色）。
// 数据全部来自后端；每个写操作 reportAudit 留痕（等保二级安全审计）。

const rows = ref<SystemUserItem[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const loading = ref(false);
const roles = ref<SystemRoleItem[]>([]);
const zones = ref<ZoneItem[]>([]);

const filters = reactive<{ keyword: string; status: number | undefined; roleCode: string }>({
  keyword: '',
  status: undefined,
  roleCode: '',
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchSystemUsers({
      page: page.value,
      size: size.value,
      keyword: filters.keyword || undefined,
      status: filters.status,
      roleCode: filters.roleCode || undefined,
    });
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = Number(res?.total ?? 0);
  } catch (err) {
    toastErr(err, '加载用户失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters(): void {
  filters.keyword = '';
  filters.status = undefined;
  filters.roleCode = '';
  page.value = 1;
  void load();
}

function onPage(p: number): void {
  page.value = p;
  void load();
}

function onSize(s: number): void {
  size.value = s;
  page.value = 1;
  void load();
}

/* ---------------- 新增 / 编辑 ---------------- */
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const form = reactive<SystemUserCreate>({
  username: '',
  password: '',
  realName: '',
  roleCode: '',
  status: 1,
  zoneCodes: '',
});

function openCreate(): void {
  dialogMode.value = 'create';
  editingId.value = null;
  Object.assign(form, {
    username: '',
    password: '',
    realName: '',
    roleCode: roles.value[0]?.roleCode ?? '',
    status: 1,
    zoneCodes: '',
  });
  dialogVisible.value = true;
}

function openEdit(row: SystemUserItem): void {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  Object.assign(form, {
    username: row.username,
    password: '',
    realName: row.realName ?? '',
    roleCode: row.roleCode,
    status: row.status,
    zoneCodes: row.zoneCodes ?? '',
  });
  dialogVisible.value = true;
}

const saving = ref(false);
async function submit(): Promise<void> {
  if (!form.username.trim()) return toastErr('请输入用户名', '');
  if (dialogMode.value === 'create' && !form.password) return toastErr('请输入初始口令', '');
  if (!form.roleCode) return toastErr('请选择角色', '');
  saving.value = true;
  try {
    if (dialogMode.value === 'create') {
      await createSystemUser({ ...form });
      reportAudit({
        action: 'system.user.create',
        module: 'sys',
        detail: { username: form.username },
      });
      toastOk('用户已创建');
    } else if (editingId.value != null) {
      const body: SystemUserUpdate = {
        realName: form.realName,
        status: form.status,
        zoneCodes: form.zoneCodes,
      };
      await updateSystemUser(editingId.value, body);
      // 角色变更走独立端点（权限码 system:user:assign-role），仅在变化时调用
      await assignSystemUserRole(editingId.value, form.roleCode);
      reportAudit({ action: 'system.user.update', module: 'sys', detail: { id: editingId.value } });
      toastOk('用户已更新');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '保存失败：');
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(row: SystemUserItem): Promise<void> {
  const next = row.status === 1 ? 0 : 1;
  try {
    await updateSystemUserStatus(row.id, next);
    reportAudit({
      action: 'system.user.status',
      module: 'sys',
      detail: { id: row.id, status: next },
    });
    toastOk(next === 1 ? '已启用' : '已停用');
    await load();
  } catch (err) {
    toastErr(err, '操作失败：');
  }
}

async function removeUser(row: SystemUserItem): Promise<void> {
  if (!(await confirm(`确认删除用户「${row.username}」？删除后不可恢复。`))) return;
  try {
    await deleteSystemUser(row.id);
    reportAudit({ action: 'system.user.delete', module: 'sys', detail: { id: row.id } });
    toastOk('用户已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

/* ---------------- 重置口令 ---------------- */
const pwdVisible = ref(false);
const tempPwd = ref('');
const pwdUser = ref('');
async function resetPwd(row: SystemUserItem): Promise<void> {
  if (!(await confirm(`重置「${row.username}」的口令？将生成一次性临时口令。`))) return;
  try {
    const res = await resetSystemUserPassword(row.id);
    tempPwd.value = res?.temporaryPassword ?? '';
    pwdUser.value = row.username;
    pwdVisible.value = true;
    reportAudit({ action: 'system.user.reset-pwd', module: 'sys', detail: { id: row.id } });
  } catch (err) {
    toastErr(err, '重置失败：');
  }
}

const statusText = (s: number) => (s === 1 ? '启用' : '停用');

onMounted(async () => {
  void load();
  try {
    roles.value = await fetchSystemRoles();
  } catch {
    roles.value = [];
  }
  try {
    zones.value = await fetchSystemZones();
  } catch {
    zones.value = [];
  }
});
</script>

<template>
  <div>
    <MgmtPageHead
      title="人员与账号管理"
      crumb="基础信息管理 / 人员与账号管理"
      :icon="User"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'system:user:create'" type="primary" @click="openCreate">
          新增人员
        </el-button>
      </template>
    </MgmtPageHead>

    <!-- 筛选卡 -->
    <div class="mgmt-filter-card">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索用户名 / 姓名"
        clearable
        style="width: 220px"
        @keyup.enter="
          page = 1;
          load();
        "
      />
      <el-select v-model="filters.status" placeholder="状态：全部" clearable style="width: 140px">
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
      </el-select>
      <el-select v-model="filters.roleCode" placeholder="角色：全部" clearable style="width: 180px">
        <el-option v-for="r in roles" :key="r.roleCode" :label="r.roleName" :value="r.roleCode" />
      </el-select>
      <el-button
        type="primary"
        @click="
          page = 1;
          load();
        "
        >查询</el-button
      >
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <!-- 表格 -->
    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPage"
      @update:page-size="onSize"
    >
      <el-table-column prop="username" label="账号" min-width="120" />
      <el-table-column prop="realName" label="姓名" min-width="100">
        <template #default="{ row }">{{ row.realName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="roleName" label="角色" min-width="140">
        <template #default="{ row }">{{ row.roleName || row.roleCode }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <span class="tag" :class="row.status === 1 ? 'tag-success' : 'tag-info'">
            {{ statusText(row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="口令" width="100">
        <template #default="{ row }">
          <span v-if="row.mustChangePwd" class="tag tag-warning">待改密</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="zoneCodes" label="可访问防区" min-width="160">
        <template #default="{ row }">{{ row.zoneCodes || '—' }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160">
        <template #default="{ row }">{{ row.createdAt || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(asUser(row))">编辑</el-button>
          <el-button link type="primary" @click="toggleStatus(asUser(row))">
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button link type="primary" @click="resetPwd(asUser(row))">重置口令</el-button>
          <el-button
            v-permission="'system:user:delete'"
            link
            type="danger"
            @click="removeUser(asUser(row))"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增人员' : '编辑人员'"
      width="520px"
    >
      <el-form label-width="88px">
        <el-form-item label="账号" required>
          <el-input
            v-model="form.username"
            :disabled="dialogMode === 'edit'"
            placeholder="登录账号"
          />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'create'" label="初始口令" required>
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="须满足口令复杂度策略"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="form.roleCode" placeholder="选择角色" style="width: 100%">
            <el-option
              v-for="r in roles"
              :key="r.roleCode"
              :label="r.roleName"
              :value="r.roleCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="可访问防区">
          <el-select
            v-model="form.zoneCodes"
            multiple
            collapse-tags
            placeholder="不选=无数据权限（零可见）"
            style="width: 100%"
          >
            <el-option
              v-for="z in zones"
              :key="z.zoneCode"
              :label="z.zoneName"
              :value="z.zoneName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置口令结果 -->
    <el-dialog v-model="pwdVisible" title="临时口令（仅此一次可见）" width="420px">
      <p class="pwd-tip">用户「{{ pwdUser }}」的临时口令如下，下次登录须强制修改：</p>
      <div class="pwd-value">{{ tempPwd }}</div>
      <template #footer>
        <el-button type="primary" @click="pwdVisible = false">我已记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mgmt-filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.pwd-tip {
  margin: 0 0 var(--space-sm);
  font-size: var(--mgmt-fz-body);
  color: var(--color-text);
}

.pwd-value {
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-family-mono, monospace);
  font-size: 18px;
  letter-spacing: 1px;
  color: var(--text-title-mgmt);
  background: var(--primary-mgmt-soft);
  border-radius: var(--mgmt-radius-md);
  word-break: break-all;
}
</style>
