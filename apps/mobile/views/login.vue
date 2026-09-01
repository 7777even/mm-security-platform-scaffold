<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * 移动端登录（docs/UI规范-移动端.md §5 / 技术协议「登录与双因素」）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Login.vue）：
 * - 参考实现用 `linear-gradient(180deg, #e8f2ff, #f4f7fa 40%)` 作整屏背景；
 *   按 AGENTS.md §4「玻璃 / 发光 / 渐变仅限大屏」，改为纯色软底 `--primary-mobile-soft`，
 *   outdoor 皮肤下自动转为纯白。
 * - 表单控件复用 `.mb-label` / `.mb-input` / `.mb-btn-primary`，热区统一 48。
 * - 保留「双因素验证码」字段：等保二级 + 协议点名双因素，不得简化为单因素。
 * - 演示态不做真实鉴权，提交后直接进首页；接入后改由统一认证服务换取令牌，
 *   并经 bridges/index.ts 注入原生壳（Hybrid 场景）。
 */
const router = useRouter();

const account = ref('zhang.gong');
const password = ref('');
const otp = ref('');

function submit() {
  void router.push('/home');
}
</script>

<template>
  <div class="mb-auth">
    <span class="mb-auth__badge">安全管控 · 移动端</span>
    <h1 class="mb-auth__title">安全管控指挥系统</h1>
    <p class="mb-auth__sub">茂名石化 · 移动端规范</p>

    <form class="mb-auth__card" @submit.prevent="submit">
      <label class="mb-label" for="login-account">账号</label>
      <input id="login-account" v-model="account" class="mb-input" autocomplete="username" />

      <label class="mb-label" for="login-password">密码</label>
      <input
        id="login-password"
        v-model="password"
        class="mb-input"
        type="password"
        autocomplete="current-password"
      />

      <label class="mb-label" for="login-otp">双因素验证码</label>
      <input
        id="login-otp"
        v-model="otp"
        class="mb-input"
        placeholder="短信 / 动态令牌"
        autocomplete="one-time-code"
      />

      <button type="submit" class="mb-btn-primary mb-btn-block login__submit">登录</button>
    </form>

    <RouterLink class="mb-auth__back" to="/home">← 返回导航</RouterLink>
  </div>
</template>

<style scoped>
.login__submit {
  margin-top: var(--space-lg);
}
</style>
