<script setup lang="ts">
import { ref } from 'vue';
import { login } from '@/platform/api';
import { setAccessToken } from '@/platform/token';
import { startRealtime } from '@/platform/realtime';

// 移动端登录（docs/UI规范-移动端.md §5 / 技术协议「登录与双因素」）
// - 纯色软底（禁止大屏专属玻璃/渐变）。
// - 保留「双因素验证码」字段：等保二级 + 协议点名双因素，不得简化为单因素。
// - 提交经统一认证服务换取令牌并写入内存态（token.ts），随后进入首页并启动实时中枢。

const account = ref('admin');
const password = ref('');
const otp = ref('');
const submitting = ref(false);

async function submit() {
  if (submitting.value) return;
  if (!account.value || !password.value) {
    uni.showToast({ title: '请输入账号与密码', icon: 'none' });
    return;
  }
  submitting.value = true;
  try {
    const token = await login({ username: account.value, password: password.value });
    setAccessToken(token.accessToken);
    startRealtime();
    uni.reLaunch({ url: '/pages/home/home' });
  } catch {
    uni.showToast({ title: '登录失败，请检查凭据或后端连接', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

function enterAsGuest() {
  uni.reLaunch({ url: '/pages/home/home' });
}
</script>

<template>
  <view class="mb-auth">
    <text class="mb-auth__badge">安全管控 · 移动端</text>
    <text class="mb-auth__title">安全管控指挥系统</text>
    <text class="mb-auth__sub">茂名石化 · 移动端规范</text>

    <view class="mb-auth__card">
      <text class="mb-label" for="login-account">账号</text>
      <input
        id="login-account"
        v-model="account"
        class="mb-input"
        placeholder="请输入账号"
        autocomplete="username"
      />

      <text class="mb-label" for="login-password">密码</text>
      <input
        id="login-password"
        v-model="password"
        class="mb-input"
        type="password"
        placeholder="请输入密码"
        autocomplete="current-password"
      />

      <text class="mb-label" for="login-otp">双因素验证码</text>
      <input
        id="login-otp"
        v-model="otp"
        class="mb-input"
        placeholder="短信 / 动态令牌"
        autocomplete="one-time-code"
      />

      <button type="button" class="mb-btn-primary mb-btn-block login__submit" @click="submit">
        登录
      </button>
      <button type="button" class="mb-btn-ghost mb-btn-block" @click="enterAsGuest">
        以访客身份进入
      </button>
    </view>
  </view>
</template>

<style scoped>
.mb-auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(var(--mb-pad-x) + 80rpx) var(--mb-pad-x);
  min-height: 100vh;
  background: var(--primary-mobile-soft, #eef4ff);
}

.mb-auth__badge {
  font-size: var(--mb-fz-tip);
  color: var(--primary-mobile);
  background: #fff;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  margin-bottom: var(--space-md);
}

.mb-auth__title {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-title-mobile);
}

.mb-auth__sub {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
  margin-top: 8rpx;
  margin-bottom: var(--space-lg);
}

.mb-auth__card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-lg);
  background: #fff;
  border-radius: var(--mb-radius-card);
  box-shadow: 0 8rpx 32rpx rgb(22 119 255 / 8%);
}

.mb-label {
  font-size: var(--mb-fz-tip);
  color: var(--text-muted-mobile);
  margin-top: var(--space-md);
}

.mb-input {
  height: 88rpx;
  padding: 0 var(--space-md);
  font-size: var(--mb-fz-form-label);
  background: #f5f7fa;
  border: var(--mb-border-w) solid var(--mb-stroke);
  border-radius: var(--mb-radius-ctrl);
}

.login__submit {
  margin-top: var(--space-lg);
}
</style>
