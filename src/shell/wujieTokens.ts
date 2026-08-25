import tokenCss from '@/styles/tokens.css?raw';

/**
 * 设计 token 经 wujie 沙箱注入子应用。
 *
 * wujie 子应用运行在独立的 iframe 沙箱 document 中，与主壳 style 隔离，
 * 因此子应用无法读取主壳 document 上的 :root CSS 变量，只能各自打包一份
 * tokens.css。为避免重复打包、保证 token 单一真源，主壳在子应用挂载前
 * 把 tokens.css（通过 ?raw 在构建期读为字符串）注入到沙箱 document.head，
 * 子应用不再需要 import tokens.css。
 *
 * 在 WujieHost.vue 的 beforeMount 生命周期中调用本函数；
 * tokenSource 默认取构建期注入的 tokens.css 内容，便于在测试中传入样例串验证注入逻辑。
 */
export const TOKEN_STYLE_ID = 'wujie-design-tokens';

export function injectDesignTokens(
  appWindow: Window,
  theme: string = 'dark',
  tokenSource: string = tokenCss,
): void {
  const doc = appWindow.document;
  if (!doc || !doc.head) return;

  let style = doc.getElementById(TOKEN_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement('style');
    style.id = TOKEN_STYLE_ID;
    doc.head.appendChild(style);
  }
  // 单一真源：直接注入 tokens.css 原文，子应用零 token 体积。
  style.textContent = tokenSource;

  // 默认 dark 大屏主题由 :root 提供，无需 data-theme；其余主题置属性以激活覆盖块。
  const root = doc.documentElement;
  if (theme && theme !== 'dark') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
}
