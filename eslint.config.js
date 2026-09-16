import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist*',
      '**/dist*/**',
      'public/**',
      'node_modules',
      // vitest 产物（含 lcov-report 里的 JS），非源码。
      // 不忽略会导致「本地先跑 test:coverage 再 lint」比 CI 多出一批告警，干扰对拍。
      'coverage/**',
      '**/coverage/**',
      '.verify-out/**',
      '**/.verify-out/**',
      '.verify-tmp/**',
      '**/.verify-tmp/**',
      '.migration-tmp/**',
      '**/.migration-tmp/**',
      '.tmp-migrate/**',
      '.tmp-ui-redesign/**',
      'src/types/generated/**',
      '.workbuddy/**',
      '.superpowers/**',
      '*.config.ts',
      '*.config.js',
      // Vite 加载配置时生成的临时副本（vite.config.ts.timestamp-*.mjs），非源码，
      // 真实 vite.config.ts 已被 *.config.ts 忽略；此临时 .mjs 不参与 lint。
      '*.timestamp-*.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'error',
      // 允许 `_` 前缀参数/变量表达"有意未使用"（如回传适配器的占位入参）
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: {
      // scripts/ 下的 .mjs 是纯 Node 脚本，不参与 vue-tsc / tsconfig.app（只覆盖 src）。
      // 顶部 @ts-nocheck 用于避免编辑器对无类型声明的 Node 代码误报，属有意为之，不是偷懒。
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    // 测试文件中常定义多个桩组件，组件-per-文件规则在此属误报，关闭
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },
);
