// wujie 沙箱内 `document` 为 Proxy，element-plus 的 focus-trap
// （el-dialog / el-drawer / el-select 等）会在某些时机读取 `document.activeElement`，
// 沙箱代理在该属性上偶发抛 "Cannot read properties of null (reading 'activeElement')"，
// 导致打开弹层/下拉时 Uncaught 报错（其余功能正常）。
//
// 兜底方案：将子应用全局 `document` 重定义为同一份真实 iframe document 的 Proxy 包装，
// 仅对 `activeElement` 做安全访问（失败或为空时回退到 body），其余属性原样透传。
// 该操作包裹在 try/catch 中：若 wujie 代理禁止重定义 window.document，则静默跳过，
// 不影响其余功能。
export function installWujieDocumentShim(): void {
  try {
    const rawDocument = window.document;
    if (!rawDocument) return;

    let cached: Document | null = null;

    Object.defineProperty(window, 'document', {
      configurable: true,
      enumerable: true,
      get() {
        if (!cached) {
          cached = new Proxy(rawDocument, {
            get(target, prop, receiver) {
              if (prop === 'activeElement') {
                try {
                  return target.activeElement ?? target.body;
                } catch {
                  return target.body ?? null;
                }
              }
              const value = Reflect.get(target, prop, receiver);
              // 原生方法需绑定到真实 document，否则以 Proxy 为 this 调用会抛 Illegal invocation
              return typeof value === 'function' ? value.bind(target) : value;
            },
          });
        }
        return cached;
      },
    });
  } catch {
    /* wujie 代理禁止重定义 window.document：跳过，不阻断子应用启动 */
  }
}
