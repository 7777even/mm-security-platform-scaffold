<script setup lang="ts">
// 系统管理 · 用户管理（契约 docs/api/system.openapi.json）
// 数据源为后端真实端点（/system/users），权限码由 /auth/me 下发。
// 服务端硬防护：禁删/禁停用自己、保护最后一个启用 ADMIN、用户名唯一。
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchSystemUsers,
  fetchSystemRoles,
  fetchSystemZones,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  updateSystemUserStatus,
  resetSystemUserPassword,
  type SystemRoleItem,
  type SystemUserItem,
  type ZoneItem,
} from '@/services/system';

const loading = ref(false);
const rows = ref<SystemUserItem[]>([]);
const total = ref(0);
const roles = ref<SystemRoleItem[]>([]);
const zones = ref<ZoneItem[]>([]);

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: undefined as number | undefined,
  roleCode: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const form = reactive({
  username: '',
  password: '',
  realName: '',
  roleCode: '',
  status: 1,
});
const selectedZones = ref<string[]>([]);

const resetVisible = ref(false);
const tempPassword = ref('');
const resetTarget = ref('');

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchSystemUsers({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status,
      roleCode: query.roleCode || undefined,
    });
    rows.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch (e) {
    ElMessage.error(errMsg(e));
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function loadRoles(): Promise<void> {
  try {
    roles.value = await fetchSystemRoles();
  } catch {
    roles.value = [];
  }
}

async function loadZones(): Promise<void> {
  try {
    zones.value = await fetchSystemZones();
  } catch {
    zones.value = [];
  }
}

function onSearch(): void {
  query.page = 1;
  void load();
}

function openCreate(): void {
  dialogMode.value = 'create';
  editingId.value = null;
  form.username = '';
  form.password = '';
  form.realName = '';
  form.roleCode = roles.value[0]?.roleCode ?? '';
  form.status = 1;
  selectedZones.value = [];
  dialogVisible.value = true;
}

/**
 * el-table 插槽解构出的 row 被推断为 element-plus 的 DefaultRow（索引签名对象），
 * 直接传给要求 SystemUserItem 的方法会类型不匹配。这里统一收敛为领域类型，
 * 既保持各处理函数签名严格，也避免在模板里写 TS 断言。
 */
function asUser(row: unknown): SystemUserItem {
  return row as SystemUserItem;
}

function openEdit(row: SystemUserItem): void {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.username = row.username;
  form.password = '';
  form.realName = row.realName ?? '';
  form.roleCode = row.roleCode;
  form.status = row.status;
  selectedZones.value = (row.zoneCodes ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.username.trim()) {
    ElMessage.warning('请填写用户名');
    return;
  }
  if (dialogMode.value === 'create' && !form.password) {
    ElMessage.warning('请填写初始密码');
    return;
  }
  if (!form.roleCode) {
    ElMessage.warning('请选择角色');
    return;
  }
  try {
    if (dialogMode.value === 'create') {
      await createSystemUser({
        username: form.username.trim(),
        password: form.password,
        realName: form.realName || undefined,
        roleCode: form.roleCode,
        status: form.status,
        zoneCodes: selectedZones.value.length ? selectedZones.value.join(',') : undefined,
      });
      ElMessage.success('用户已创建（首次登录须改密）');
    } else if (editingId.value != null) {
      await updateSystemUser(editingId.value, {
        realName: form.realName || undefined,
        roleCode: form.roleCode,
        status: form.status,
        zoneCodes: selectedZones.value.length ? selectedZones.value.join(',') : undefined,
      });
      ElMessage.success('用户已更新');
    }
    dialogVisible.value = false;
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function toggleStatus(row: SystemUserItem): Promise<void> {
  const next = row.status === 1 ? 0 : 1;
  try {
    await updateSystemUserStatus(row.id, next);
    ElMessage.success(next === 1 ? '已启用' : '已停用');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function remove(row: SystemUserItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除用户「${row.username}」？`, '删除确认', {
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await deleteSystemUser(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function reset(row: SystemUserItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认重置「${row.username}」的口令？将生成一次性临时口令。`,
      '重置口令',
      {
        type: 'warning',
      },
    );
  } catch {
    return;
  }
  try {
    const res = await resetSystemUserPassword(row.id);
    tempPassword.value = res.temporaryPassword;
    resetTarget.value = row.username;
    resetVisible.value = true;
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function copyTemp(): Promise<void> {
  try {
    await navigator.clipboard.writeText(tempPassword.value);
    ElMessage.success('已复制');
  } catch {
    ElMessage.warning('复制失败，请手工记录');
  }
}

onMounted(async () => {
  await loadRoles();
  await loadZones();
  await load();
});
</script>

<template>
  <PanelCard title="用户管理" icon="UserFilled">
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        class="toolbar__item"
        placeholder="用户名 / 姓名"
        clearable
        @keyup.enter="onSearch"
      />
      <el-select v-model="query.roleCode" class="toolbar__item" placeholder="全部角色" clearable>
        <el-option v-for="r in roles" :key="r.id" :label="r.roleName" :value="r.roleCode" />
      </el-select>
      <el-select v-model="query.status" class="toolbar__item" placeholder="全部状态" clearable>
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
      </el-select>
      <el-button type="primary" @click="onSearch">查询</el-button>
      <el-button v-permission="'system:user:create'" type="success" @click="openCreate"
        >新增用户</el-button
      >
    </div>

    <el-table v-loading="loading" :data="rows" class="table" size="small" border>
      <el-table-column prop="username" label="用户名" min-width="130" />
      <el-table-column prop="realName" label="姓名" min-width="100" />
      <el-table-column prop="roleName" label="角色" min-width="110" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="强制改密" width="100">
        <template #default="{ row }">{{ row.mustChangePwd ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'system:user:edit'"
            link
            type="primary"
            @click="openEdit(asUser(row))"
            >编辑</el-button
          >
          <el-button
            v-permission="'system:user:edit'"
            link
            type="warning"
            @click="toggleStatus(asUser(row))"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button
            v-permission="'system:user:reset-pwd'"
            link
            type="warning"
            @click="reset(asUser(row))"
            >重置密码</el-button
          >
          <el-button
            v-permission="'system:user:delete'"
            link
            type="danger"
            @click="remove(asUser(row))"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="load"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
      width="460px"
    >
      <el-form label-width="90px">
        <el-form-item label="用户名" required>
          <el-input
            v-model="form.username"
            :disabled="dialogMode === 'edit'"
            placeholder="登录用户名（唯一）"
          />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'create'" label="初始密码" required>
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="须满足复杂度策略"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="form.roleCode" placeholder="选择角色">
            <el-option
              v-for="r in roles"
              :key="r.id"
              :label="`${r.roleName}（${r.roleCode}）`"
              :value="r.roleCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可访问防区">
          <el-select
            v-model="selectedZones"
            multiple
            collapse-tags
            clearable
            placeholder="留空=按角色 dataScope 默认（ALL 看全部；非空则仅这些防区）"
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

    <el-dialog v-model="resetVisible" title="临时口令（仅显示一次）" width="420px">
      <p class="reset-tip">用户「{{ resetTarget }}」的临时口令如下，下次登录须强制改密：</p>
      <div class="reset-pwd">
        <code>{{ tempPassword }}</code>
        <el-button link type="primary" @click="copyTemp">复制</el-button>
      </div>
      <template #footer>
        <el-button type="primary" @click="resetVisible = false">我已记录</el-button>
      </template>
    </el-dialog>
  </PanelCard>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-md);
}

.toolbar__item {
  width: 180px;
}

.table {
  width: 100%;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

.reset-tip {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-muted);
}

.reset-pwd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-accent-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.reset-pwd code {
  font-size: var(--font-size-stat-label);
  letter-spacing: 1px;
}
</style>
