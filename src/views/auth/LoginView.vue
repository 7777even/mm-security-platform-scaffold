<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { getAccessToken } from '@/services/token';
import { logger } from '@/utils/logger';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const status = ref<'idle' | 'loading' | 'error'>('idle');
const errorMsg = ref('');

const isDevMock = import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCK === 'true';
const devUser = import.meta.env.VITE_DEV_USERNAME as string | undefined;
const devPassword = import.meta.env.VITE_DEV_PASSWORD as string | undefined;
const ssoUrl = import.meta.env.VITE_SSO_URL as string | undefined;
const isProduction = computed(() => !import.meta.env.DEV);

function resolveRedirect(redirect: unknown): string {
  if (Array.isArray(redirect)) return (redirect[0] as string) || '/';
  if (typeof redirect === 'string') return redirect || '/';
  return '/';
}

function goHome(redirect?: unknown): void {
  router.replace(resolveRedirect(redirect));
}

async function doDevLogin(): Promise<void> {
  if (!devUser || !devPassword) {
    errorMsg.value = '缺少 dev 登录凭据（VITE_DEV_USERNAME / VITE_DEV_PASSWORD）';
    status.value = 'error';
    return;
  }
  status.value = 'loading';
  try {
    const token = await login({ username: devUser, password: devPassword });
    auth.login(token.accessToken);
    goHome(route.query.redirect);
  } catch (e) {
    status.value = 'error';
    errorMsg.value = '登录失败，请确认后端 :8787 已启动且账号正确';
    logger.error('[login] dev 登录失败', e);
  }
}

onMounted(() => {
  // 已持有令牌直接回家，避免重复登录
  if (getAccessToken()) {
    goHome(route.query.redirect);
    return;
  }
  // 开发 Mock 模式：无真实后端，直接写入内存态演示令牌
  if (isDevMock) {
    auth.login();
    goHome(route.query.redirect);
    return;
  }
  // dev 真实后端：用 dev 凭据自动登录（401 收口落点亦走此路径）
  if (devUser && devPassword) {
    void doDevLogin();
    return;
  }
  // 生产：前端不持有口令，由 IDP / SSO 下发令牌
  status.value = 'error';
});
</script>

<template>
  <div class="login-wrap">
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="login-title">统一身份认证</div>
      </template>

      <div v-if="isProduction && !devUser" class="login-body">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>请通过统一身份认证登录</template>
          本系统由企业 IDP / SSO 下发访问令牌，前端不持有任何口令。
        </el-alert>
        <el-button v-if="ssoUrl" type="primary" tag="a" :href="ssoUrl" class="login-btn">
          前往 SSO 登录
        </el-button>
        <div v-else class="login-hint">未配置 VITE_SSO_URL，请联系管理员。</div>
      </div>

      <div v-else class="login-body">
        <div class="login-hint">
          {{
            isDevMock
              ? '开发 Mock 模式：已自动登录演示态。'
              : '开发联调：正在使用 dev 凭据自动登录…'
          }}
        </div>
        <el-button
          :loading="status === 'loading'"
          type="primary"
          class="login-btn"
          @click="doDevLogin"
        >
          重新登录
        </el-button>
        <el-alert
          v-if="status === 'error'"
          type="error"
          :closable="false"
          show-icon
          :title="errorMsg"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b1220;
}

.login-card {
  width: 420px;
  border-radius: 12px;
}

.login-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.login-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 4px 4px;
}

.login-hint {
  font-size: 13px;
  color: #8a94a6;
  line-height: 1.6;
}

.login-btn {
  width: 100%;
}
</style>
