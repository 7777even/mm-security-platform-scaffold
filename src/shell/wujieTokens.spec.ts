import { describe, it, expect } from 'vitest';
import { injectDesignTokens, TOKEN_STYLE_ID } from './wujieTokens';

/**
 * wujie 子应用运行在独立的 iframe 沙箱 document 中，与主壳样式隔离。
 * 主壳在子应用挂载前把设计 token（CSS 变量）注入到沙箱内，
 * 使子应用无需各自打包一份 tokens.css。
 *
 * 这里用最小化的类型化 mock 模拟沙箱 document，避免依赖 jsdom 与 any。
 */
interface MockStyleElement {
  id: string;
  textContent: string;
}

interface MockDocument {
  head: {
    children: MockStyleElement[];
    appendChild(el: MockStyleElement): void;
  };
  documentElement: {
    attrs: Record<string, string>;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
  };
  createElement(): MockStyleElement;
  getElementById(id: string): MockStyleElement | null;
}

interface MockAppWindow {
  document: MockDocument;
}

function createMockAppWindow(): MockAppWindow {
  const byId: Record<string, MockStyleElement> = {};
  return {
    document: {
      head: {
        children: [],
        appendChild(el: MockStyleElement) {
          if (el.id) byId[el.id] = el;
          this.children.push(el);
        },
      },
      documentElement: {
        attrs: {},
        setAttribute(name: string, value: string) {
          this.attrs[name] = value;
        },
        removeAttribute(name: string) {
          delete this.attrs[name];
        },
      },
      createElement() {
        return { id: '', textContent: '' };
      },
      getElementById(id: string) {
        return byId[id] ?? null;
      },
    },
  };
}

function getStyle(appWindow: MockAppWindow): MockStyleElement | null {
  return appWindow.document.getElementById(TOKEN_STYLE_ID);
}

describe('injectDesignTokens', () => {
  it('注入一个带固定 id 的 <style> 到子应用沙箱 document.head', () => {
    const appWindow = createMockAppWindow() as unknown as Window;
    injectDesignTokens(appWindow);

    const mock = appWindow as unknown as MockAppWindow;
    const style = getStyle(mock);
    expect(style).toBeTruthy();
    expect(mock.document.head.children).toContain(style);
  });

  it('注入的内容包含设计 token CSS 变量（单一真源 tokens.css）', () => {
    const appWindow = createMockAppWindow() as unknown as Window;
    // 传入样例 token 串验证注入逻辑；生产路径默认取 tokens.css?raw 的真实内容。
    const sampleTokens = ':root{--brand-500:#123456;--color-bg-base:#000;}';
    injectDesignTokens(appWindow, 'dark', sampleTokens);

    const style = getStyle(appWindow as unknown as MockAppWindow);
    expect(style?.textContent).toContain('--brand-500');
    expect(style?.textContent).toContain('--color-bg-base');
  });

  it('重复挂载是幂等的：只会存在一个 token <style>', () => {
    const appWindow = createMockAppWindow() as unknown as Window;
    injectDesignTokens(appWindow);
    injectDesignTokens(appWindow);

    const mock = appWindow as unknown as MockAppWindow;
    const styles = mock.document.head.children.filter((el) => el.id === TOKEN_STYLE_ID);
    expect(styles.length).toBe(1);
  });

  it('默认 dark 主题不设置 data-theme（:root 默认值即大屏暗色）', () => {
    const appWindow = createMockAppWindow() as unknown as Window;
    injectDesignTokens(appWindow, 'dark');

    const mock = appWindow as unknown as MockAppWindow;
    expect(mock.document.documentElement.attrs['data-theme']).toBeUndefined();
  });

  it('非 dark 主题在沙箱 documentElement 上设置 data-theme', () => {
    const appWindow = createMockAppWindow() as unknown as Window;
    injectDesignTokens(appWindow, 'mgmt');

    const mock = appWindow as unknown as MockAppWindow;
    expect(mock.document.documentElement.attrs['data-theme']).toBe('mgmt');
  });

  it('子应用 document 缺失时安全跳过', () => {
    const appWindow = {} as unknown as Window;
    expect(() => injectDesignTokens(appWindow)).not.toThrow();
  });
});
