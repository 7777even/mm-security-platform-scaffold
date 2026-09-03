# 生产上线检查清单（engineering/ship/）

L3 / L4 变更合入主干 / 发布前的强制门禁。逐项勾选，缺项不得上线。

## 1. 构建与质量门禁

- [ ] `npm run type-check` 0 error
- [ ] `npx eslint <受影响范围>` 0 error（提交前 husky + lint-staged 兜底）
- [ ] 受影响目标 `npm test` 必绿（关键 composable / http 拦截器 / 移动 bridges）
- [ ] `npm run build` / `npm run build:subapps` 通过（受本机 dist 清空守卫限制时用 `npx vite build --emptyOutDir=false` 或新 `--outDir`）

## 2. 契约与规范

- [ ] API 调用符合 AGENTS.md §3（零下行控制 / B3 包络 / 20 位 MDM / 防重放 / 令牌内存态）
- [ ] 若新增 / 变更 API，已同步 `docs/api/<domain>.openapi.json`
- [ ] 配色 / 字号 / 间距 / 圆角 / 尺寸全部引用 `src/styles/tokens.css`，无硬编码（§6.3 红线 #1）
- [ ] 状态 / 报警 / 设备状态着色只用规范映射表；z-index 只用五层 token
- [ ] 三端视觉语言未混用：大屏无白底卡片 / 后台移动无玻璃发光

## 3. 变更闭环

- [ ] OpenSpec 四件套（proposal / design / tasks / spec-delta）已闭环并归档
- [ ] `engineering/qa/` 与 `engineering/retro/` 已即刻填写，含截图证据
- [ ] 提交按 scope 拆分：`type(scope): 描述`，单行成句、禁止分点列表
- [ ] 临时输出文件（tsc-out.txt / vitest-out.txt / 日志）未入库
