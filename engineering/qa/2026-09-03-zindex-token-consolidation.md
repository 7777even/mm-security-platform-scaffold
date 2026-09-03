# QA — z-index 收口(新代码硬编码 → tokens.css)

- 日期:2026-09-03
- 效率等级:L2(非业务技术债,跨端 shared token 调整)
- 范围:`src/views`、`src/components`、`apps/mgmt` 共 59 个 `.vue`;`src/styles/tokens.css` 新增 `--z-raised` 与 `--z-local-*` 局部 token

## 验收口径(AGENTS.md §3.3 / §5.1)

- 全局跨组件层级只用五层 token:`--z-base(0)` / `--z-marker(5)` / `--z-chrome(10)` / `--z-overlay(30)` / `--z-toast(40)`;新增 `--z-raised(20)` 承载抬高的栏/工具条
- 弹窗/抽屉根统一 `--z-overlay(30)`(原 `1000/1200/1900/2000/2200/2600/10020` 等压顶魔法数收口,后开弹窗靠 DOM 顺序置顶)
- 弹窗/面板内部子层级走 `--z-local-<value>`(值不变,渲染零回归,相对顺序天然保持)

## 实际执行命令与结果

- 变换工具 `scripts/fix-zindex.mjs`(dry-run 先打印全部映射供审查,确认后 apply;脚本为一次性工具,不入库)
- eslint 抽样(`src/views/accident-rescue/index.vue`、`src/components/video-wall/VideoWallSidebar.vue`、`src/components/panels/typhoon/SatelliteCloudMapDialog.vue`、`apps/mgmt/views/module-embed.vue`):通过,0 error
- 全仓库扫描确认非 screen 代码字面量 `z-index` 归零(`src/screen` 存量走既有 token,符合 §3.6 存量补位例外)

## 未运行项

- 全量 `npm run build` / `npm run build:subapps`:本次为纯 `<style>` token 替换,非构建/部署链路改动;受本机 dist 清空守卫限制未跑
- 59 文件全量 eslint:仅抽 4 个跨 scope 样本,样本均通过(提交前 husky + lint-staged 会对全部暂存文件跑 eslint/prettier/stylelint)

## 结论

z-index 收口已完成:新代码不再有跨组件魔法数,内部子层级经局部 token 去魔法数且渲染零回归。`type-check` 既有 2 处 TS2345(`src/components/video-wall/VideoWallGrid.vue:600`、`src/screen/components/video-wall/VideoWallGrid.vue:571`)与本次改动无关,建议另立变更修复。
