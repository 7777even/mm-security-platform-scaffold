<script setup lang="ts">
// 系统管理 · 个人中心（契约 docs/api/auth.openapi.json）
// 展示当前登录用户、修改姓名（updateProfile）、修改口令（changePassword）、登出。
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import { useAuthStore } from '@/stores/auth';
import { changePassword, fetchCurrentUser, updateProfile } from '@/services/auth';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);

const profileForm = reactive({ realName: '' });
const pwForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function loadMe(): Promise<void> {
  loading.value = true;
  try {
    const me = await fetchCurrentUser();
    auth.setMe(me);
    profileForm.realName = me.realName ?? '';
  } catch (e) {
    ElMessage.error(errMsg(e));
  } finally {
    loading.value = false;
  }
}

async function saveProfile(): Promise<void> {
  const name = profileForm.realName.trim();
  if (!name) {
    ElMessage.warning('姓名不能为空');
    return;
  }
  try {
    const me = await updateProfile({ realName: name });
    auth.setMe(me);
    ElMessage.success('资料已更新');
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function changePwd(): Promise<void> {
  if (!pwForm.oldPassword || !pwForm.newPassword) {
    ElMessage.warning('请填写原口令与新口令');
    return;
  }
  if (pwForm.newPassword.length < 8) {
    ElMessage.warning('新口令至少 8 位');
    return;
  }
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    ElMessage.warning('两次输入的新口令不一致');
    return;
  }
  try {
    await changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
    ElMessage.success('口令已修改，请重新登录');
    pwForm.oldPassword = '';
    pwForm.newPassword = '';
    pwForm.confirmPassword = '';
    // 改密后强制重新登录（后端亦会在变更类请求上兜底）
    auth.logout();
    await router.push('/login');
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

function handleLogout(): void {
  auth.logout();
  void router.push('/login');
}

onMounted(loadMe);
</script>

<template>
  <PanelCard title="个人中心" icon="User">
    <div v-loading="loading" class="pc">
      <section class="pc__card">
        <h3 class="pc__title">账号信息</h3>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="用户名">{{ auth.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ auth.role }}</el-descriptions-item>
          <el-descriptions-item label="权限码数">{{ auth.perms.length }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="pc__card">
        <h3 class="pc__title">修改资料</h3>
        <el-form label-width="80px" @submit.prevent>
          <el-form-item label="姓名">
            <el-input v-model="profileForm.realName" placeholder="真实姓名" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile">保存资料</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="pc__card">
        <h3 class="pc__title">修改口令</h3>
        <el-form label-width="80px" @submit.prevent>
          <el-form-item label="原口令" required>
            <el-input v-model="pwForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新口令" required>
            <el-input
              v-model="pwForm.newPassword"
              type="password"
              show-password
              placeholder="至少 8 位，含大小写/数字/符号中三类"
            />
          </el-form-item>
          <el-form-item label="确认新口令" required>
            <el-input v-model="pwForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changePwd">修改口令</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="pc__card">
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </section>
    </div>
  </PanelCard>
</template>

<style scoped>
.pc {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  align-items: start;
}

.pc__card {
  min-width: 0;
}

.pc__title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-stat-label);
  color: var(--color-text-muted);
}
</style>
