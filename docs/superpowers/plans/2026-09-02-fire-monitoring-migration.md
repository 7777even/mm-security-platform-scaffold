# fire-monitoring 大屏端整体迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `D:\feishu\mm-UIproject.zip` 中 fire-monitoring 单体原型的全部内容迁入脚手架大屏端：源码进 `src/screen/`、12 个 `subapps/fm-*` wujie 薄子应用、菜单接管，UI 规范优先、源体系补位。

**Architecture:** 保留 wujie 壳（动态菜单/RBAC/实时中枢）不动；fire-monitoring `src/` 原样迁入 `src/screen/`（零路径改写）；每个视图一个薄子应用入口（地图页包 `MapDashboardLayout`，TV 两页直挂）；主壳 `MENU_ROUTE_SPECS` 切 fm-*、二级页镜像源项目路由路径；旧 6 子应用与旧视图保留共存。

**Tech Stack:** Vue 3 + Vite 多入口 + wujie-vue3 + Cesium（viteStaticCopy 静态托管）+ ECharts/vue-echarts + Leaflet。迁移源已解压在 `.tmp-migrate/fire-monitoring/`（排除 .git/node_modules/dist/.playwright-cli/output）。

## Global Constraints

- 提交信息 `type(scope): 一句总结`，本计划全部用 `screen` scope；禁止长描述/分点。
- **lint-staged OOM 陷阱**：单次提交的 ts/vue 文件数控制在 ~70 以内，分批 `git add` 子目录；每批提交前用 Python 把待提交目录备份到 `%TEMP%\fm-migration-backup\`。
- **CJK 文件名**：一切资产复制用 Python `shutil.copy2/copytree`，复制后用 `'\ufffd' in p.name` 校验，禁止 `cp`/`Copy-Item`。
- **构建验证**：`npx vite build --emptyOutDir=false`（禁止 emptyOutDir，safe-delete 守卫会拦）；类型检查 `npm run type-check`；lint `npm run lint` 必须回到 0 error。
- **样式真源层级**：`src/styles/tokens.css` `:root` 数值不动；`src/screen/styles/variables.css` 向 token 对齐；规范未覆盖值保留源样。
- **依赖版本**：不升级 echarts(5)/vue-echarts(7)/cesium/leaflet，先按现状跑，API 差异在冒烟阶段修。
- 旧代码（`src/views`、`src/components`、`subapps/{dashboard,extreme-weather,fire-alarm,industrial-video,ops-monitor,security-anti-terror}`）一律不删不改（除 `vite.config.ts`/`menu.ts`/`router/index.ts`/`WujieHost.vue` 的增量接线）。
- `apps/mgmt`、`apps/mobile`、`src/` 共享服务（services/stores/directives/composables/styles）不动。

---

### Task 1: 源码与资产复制（Python 脚本）+ 资产提交

**Files:**

- Create: `src/screen/**`（来自 `.tmp-migrate/fire-monitoring/src/{views,components,layouts,lib,styles,config,utils,assets}` + `src/style.css`）
- Create: `docs/fire-monitoring/*.md`（源项目 docs 归档）
- Modify: `public/design/`（并入 zip 根 `Images/` 981 张超集）、`public/{audio,images,icons}/`、`mapdata/`
- Create: `.tmp-migrate/migrate_copy.py`（一次性脚本，不提交）

**Interfaces:**

- Produces: `src/screen/views/<View>.vue`（15 视图，含 V2/V3）、`src/screen/layouts/MapDashboardLayout.vue`、`src/screen/components/**`、`src/screen/lib/**`、`src/screen/styles/variables.css`、`src/screen/style.css`（全局：`@import './styles/variables.css'` + 滚动条 + box-sizing）。

- [ ] **Step 1: 写复制脚本** `.tmp-migrate/migrate_copy.py`：

```python
import shutil
from pathlib import Path

SRC = Path(r"D:\gkproject\mm-security-platform\frontend-scaffold\.tmp-migrate")
FM = SRC / "fire-monitoring"
ROOT = Path(r"D:\gkproject\mm-security-platform\frontend-scaffold")

# 1) 源码 → src/screen（保持相对层级，内部相对导入零改写）
for d in ["views", "components", "layouts", "lib", "styles", "config", "utils", "assets"]:
    shutil.copytree(FM / "src" / d, ROOT / "src" / "screen" / d, dirs_exist_ok=True)
shutil.copy2(FM / "src" / "style.css", ROOT / "src" / "screen" / "style.css")

# 2) 源项目 docs → docs/fire-monitoring 归档
(ROOT / "docs" / "fire-monitoring").mkdir(parents=True, exist_ok=True)
for f in (FM / "docs").glob("*.md"):
    shutil.copy2(f, ROOT / "docs" / "fire-monitoring" / f.name)

# 3) mapdata 覆盖合并
shutil.copytree(FM / "mapdata", ROOT / "mapdata", dirs_exist_ok=True)

# 4) public 子目录合并（audio/images/icons；favicon/icons.svg 不动）
for d in ["audio", "images", "icons"]:
    src = FM / "public" / d
    if src.exists():
        shutil.copytree(src, ROOT / "public" / d, dirs_exist_ok=True)

# 5) zip 根 Images/（981 张设计切图超集）→ public/design
shutil.copytree(SRC / "Images", ROOT / "public" / "design", dirs_exist_ok=True)

# 校验：CJK 文件名无 U+FFFD 乱码 + 数量报告
for label, p in [("screen", ROOT / "src" / "screen"), ("design", ROOT / "public" / "design"),
                 ("fm-docs", ROOT / "docs" / "fire-monitoring")]:
    files = [x for x in p.rglob("*") if x.is_file()]
    bad = [str(x) for x in files if "\ufffd" in x.name]
    print(f"{label}: {len(files)} files, U+FFFD bad names: {bad}")
vue = [x for x in (ROOT / "src" / "screen").rglob("*.vue")]
ts = [x for x in (ROOT / "src" / "screen").rglob("*.ts")]
print(f"src/screen: {len(vue)} vue, {len(ts)} ts")
```

- [ ] **Step 2: 执行脚本**

Run: `C:/Users/7even/.workbuddy/binaries/python/versions/3.13.12/python.exe .tmp-migrate/migrate_copy.py`
Expected: `src/screen: 179 vue, 136 ts`（源 180 vue 含根 App.vue、139 ts 含 main.ts/router/vite-env.d.ts，均不迁）；design ~981；bad names 为 `[]`。

- [ ] **Step 3: 提交前备份到工作树外**

Run: `C:/Users/7even/.workbuddy/binaries/python/versions/3.13.12/python.exe -c "import shutil,tempfile,pathlib; d=pathlib.Path(tempfile.gettempdir())/'fm-migration-backup'; shutil.copytree(r'D:\gkproject\mm-security-platform\frontend-scaffold\public\design', d/'design', dirs_exist_ok=True); print(d)"`
Expected: 打印备份路径，无异常。

- [ ] **Step 4: 提交资产（无 lint 风险，二进制/geojson 不匹配 lint-staged glob）**

```bash
git add public/design public/audio public/images public/icons mapdata docs/fire-monitoring
git commit -m "chore(screen): 迁移 fire-monitoring 设计切图/音频/地图数据资产"
```

Expected: 提交成功，lint-staged 秒过（无 ts/vue/css/md 文件命中）。

### Task 2: 全局样式迁移与 variables.css 对 token 对齐

**Files:**

- Modify: `src/screen/styles/variables.css`
- Reference（不改）: `src/styles/tokens.css` `:root` 块

**Interfaces:**

- Produces: `src/screen/style.css`（子应用入口统一引入，含 variables.css + 滚动条 + box-sizing + `color-scheme: dark`）。

- [ ] **Step 1: 导出两边变量清单做 diff**

Run: `C:/Users/7even/.workbuddy/binaries/python/versions/3.13.12/python.exe -c "import re;tok=open(r'src/styles/tokens.css',encoding='utf-8').read();var=open(r'src/screen/styles/variables.css',encoding='utf-8').read();print('TOKENS:',re.findall(r'(--[\w-]+)\s*:\s*([^;]+);',tok));print('FMVARS:',re.findall(r'(--[\w-]+)\s*:\s*([^;]+);',var))"`
Expected: 两组变量清单。tokens 大屏块本就迁移自 fire-monitoring（2026-08-31），预期差异集中在少量色值微调。

- [ ] **Step 2: 逐项对齐（改 variables.css，不改 tokens.css）**

规则：同名或同语义变量（如 `--color-bg`/`--panel-bg`/`--accent-*` 等）值不一致时，**以 tokens.css 值为准**改 `variables.css`；tokens 未覆盖的（特效/滚动条/雪碧图尺寸类）原样保留。逐条改动记录到 `openspec/changes/screen-fire-monitoring-migration/token-alignment-report.md`（新建，格式：`变量 | 旧值 | 新值(token)` 表格）。

- [ ] **Step 3: 字体栈对齐品牌规范（YaHei 首位）**

`src/screen/styles/variables.css` 内：

```css
--font-display: 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
--font-body: 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', sans-serif;
```

（品牌红线「中文默认微软雅黑优先」；源项目 Noto Sans SC 依赖 Google Fonts CDN，CSP `style-src 'self'` 下本就加载不到，重排零视觉风险。）

- [ ] **Step 4: 确认 style.css 相对导入仍成立**

Read `src/screen/style.css` 首行应为 `@import './styles/variables.css';`（复制后相对路径天然成立，无需改）。

### Task 3: 门禁跑量与修复（prettier → eslint → stylelint → vue-tsc 全绿）

**Files:**

- Modify: `src/screen/**`（格式化与错误修复）
- Reference: `eslint.config.js`（`no-explicit-any` error、`multi-word-component-names` 已 off）、`.prettierrc.json`（semi/singleQuote/2 空格）、`.stylelintrc.json`

- [ ] **Step 1: prettier 全量重排**

Run: `npx prettier --write "src/screen/**/*.{ts,vue,css}"`
Expected: 源项目无分号风格被统一为脚手架风格；无报错。

- [ ] **Step 2: eslint 跑量**

Run: `npm run lint`
Expected: `src/screen/**` 报错集中在 `@typescript-eslint/no-explicit-any`、`no-unused-vars`、vue 模板类；逐个修复（`any` 换具体类型 / `_` 前缀 / 删死代码），直至 `npm run lint` 0 error（存量 3~4 warning 不计）。

- [ ] **Step 3: stylelint 跑量**

Run: `npx stylelint "src/screen/**/*.css" "src/screen/**/*.vue" --fix`
Expected: `--fix` 处理格式类；剩余（如 `!important`、未知属性）逐个修或按规范等价改写；复跑 0 error。

- [ ] **Step 4: 类型检查跑量**

Run: `npm run type-check`
Expected: `src/screen/**` 进入 `tsconfig.app.json` include（strict + noUnusedLocals/Parameters）。逐个修类型错误至 0。（源项目自身 vue-tsc 通过，预期错误量可控；若超 ~50 个，停下来向用户汇报再继续。）

- [ ] **Step 5: 源码分 3 批提交（防 lint-staged OOM）**

每批提交前：
Run: `C:/Users/7even/.workbuddy/binaries/python/versions/3.13.12/python.exe -c "import shutil,tempfile,pathlib; d=pathlib.Path(tempfile.gettempdir())/'fm-migration-backup'; shutil.copytree(r'D:\gkproject\mm-security-platform\frontend-scaffold\src\screen', d/'screen', dirs_exist_ok=True)"`

```bash
git add src/screen/lib src/screen/styles src/screen/config src/screen/utils src/screen/assets src/screen/style.css
git commit -m "chore(screen): 迁移 fire-monitoring 基础库与样式体系至 src/screen"

git add src/screen/components
git commit -m "chore(screen): 迁移 fire-monitoring 全量组件至 src/screen"

git add src/screen/views src/screen/layouts
git commit -m "chore(screen): 迁移 fire-monitoring 15 个视图与地图布局至 src/screen"
```

Expected: 3 次提交全部通过钩子；每批后 `git status` 确认无文件被 stash 清空（若出现 `lint-staged automatic backup` stash，立即按记忆中的恢复流程抢救）。

### Task 4: 硬编码色值 token 三档替换

**Files:**

- Modify: `src/screen/**/*.{vue,css}`（仅 `<style>` 块与 css 文件）
- Create: `openspec/changes/screen-fire-monitoring-migration/token-alignment-report.md`（追加替换报告）
- Reference: `src/styles/tokens.css`

**Interfaces:**

- Produces: 替换报告（同值替换清单 + 映射表冲突清单），供评审与后续增量 token 化依据。

- [ ] **Step 1: 写替换脚本** `.tmp-migrate/tokenize.py`（一次性，不提交）：

```python
import re
from pathlib import Path

ROOT = Path(r"D:\gkproject\mm-security-platform\frontend-scaffold")
tok = (ROOT / "src/styles/tokens.css").read_text(encoding="utf-8")
# 仅取 :root 默认块（大屏），mgmt/mobile 块不参与
root_block = tok.split(":root", 1)[1].split("[data-theme", 1)[0]
val2name = {}
for name, value in re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', root_block):
    value = value.strip()
    if re.fullmatch(r'#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)', value):
        val2name.setdefault(value.lower(), name)
print(f"token 色值映射 {len(val2name)} 条")

def process_style_css(css: str):
    hits = []
    def repl(m):
        lit = m.group(0)
        name = val2name.get(lit.lower())
        if name:
            hits.append((lit, name))
            return f"var({name})"
        return lit
    out = re.sub(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)', repl, css)
    return out, hits

report = []
for f in list((ROOT / "src/screen").rglob("*.css")) + list((ROOT / "src/screen").rglob("*.vue")):
    text = f.read_text(encoding="utf-8")
    if f.suffix == ".vue":
        m = re.search(r'<style[^>]*>([\s\S]*?)</style>', text)
        if not m:
            continue
        new_css, hits = process_style_css(m.group(1))
        if hits:
            text = text[:m.start(1)] + new_css + text[m.end(1):]
    else:
        text, hits = process_style_css(text)
    if hits:
        f.write_text(text, encoding="utf-8")
        report.append((str(f.relative_to(ROOT)), len(hits)))

total = sum(n for _, n in report)
print(f"替换 {total} 处，涉及 {len(report)} 文件")
for p, n in sorted(report, key=lambda x: -x[1])[:20]:
    print(f"  {n:4d}  {p}")
```

- [ ] **Step 2: 执行并复核**

Run: `C:/Users/7even/.workbuddy/binaries/python/versions/3.13.12/python.exe .tmp-migrate/tokenize.py`
Expected: 输出替换总数与 Top 文件；抽查 2~3 个文件 `git diff` 确认只动了 `<style>` 块内的色值字面量。

- [ ] **Step 3: 复跑门禁 + 提交**

Run: `npm run lint && npm run type-check && npx stylelint "src/screen/**/*.css" "src/screen/**/*.vue"`
Expected: 全绿（style 处替换不影响 lint/tsc）。

```bash
git add src/screen
git commit -m "chore(screen): 迁入代码硬编码色值按 UI 规范 token 化替换"
```

- [ ] **Step 4: 映射表冲突人工档**

对照 `docs/UI规范-大屏端.md` §7 状态/报警等级映射表与 §1 z-index 五层，人工核查 `src/screen` 中**语义命中但值不同**的残留（脚本不自动改，避免视觉回归）：状态色红/橙/绿、`z-index: 999` 类。逐个按规范值改并把每条改动记入 token-alignment-report.md（格式：`文件:行 | 旧值 | 规范值`）。改完复跑 Step 3 门禁并追加提交：

```bash
git add src/screen openspec/changes/screen-fire-monitoring-migration
git commit -m "chore(screen): 迁入代码状态色与 z-index 对齐 UI 规范映射表"
```

### Task 5: WujieHost 下传 routeParams

**Files:**

- Modify: `src/shell/WujieHost.vue`（sharedProps computed）

**Interfaces:**

- Consumes: vue-router `useRoute().params`。
- Produces: `window.$wujie.props.routeParams: Record<string, string>`——fm 子应用 main.ts 读取（Task 6 使用）。

- [ ] **Step 1: 修改 sharedProps**

`src/shell/WujieHost.vue` 中：

```ts
// 主壳 → 子应用下传共享态（子应用经 window.$wujie.props 读取）
// routeParams：二级参数页（fm-production-area 的 facilityId / fm-major-hazard 的 hazardId）
// 由主壳路由参数透传，子应用无路由树也能拿到路径参数。
const sharedProps = computed(() => ({
  user: auth.roleId,
  perms: auth.perms,
  theme: 'dark',
  routeParams: { ...route.params } as Record<string, string>,
}));
```

- [ ] **Step 2: 验证类型**

Run: `npm run type-check`
Expected: 0 error（`route.params` 值类型为 `string | string[]`，展开后经 `as` 收敛；若 no-explicit-any 报错保持显式接口写法）。

- [ ] **Step 3: 提交**

```bash
git add src/shell/WujieHost.vue
git commit -m "feat(screen): WujieHost 向子应用透传路由参数 routeParams"
```

### Task 6: 12 个 fm 子应用入口

**Files:**

- Create: `subapps/fm-{emergency,fire,rescue,typhoon,security,tv,production,production-area,major-hazard,communication,video-control,video-wall}/{index.html,main.ts}`

**Interfaces:**

- Consumes: `@/screen/style.css`、`@/shell/subappRouter`（createSubappRouter：router.push 委托主壳）、`window.$wujie.props.routeParams`（Task 5）。
- Produces: 12 个子应用 HTML 入口，URL 形如 `/subapps/fm-<name>/`（Task 7/8 使用）。

**命名与视图映射表：**

| 目录               | 视图                                              | 布局      | 标题         |
| ------------------ | ------------------------------------------------- | --------- | ------------ |
| fm-emergency       | SectorEmergencyCommand                            | 包 layout | 应急指挥     |
| fm-fire            | FireMonitoring                                    | 包 layout | 消防报警     |
| fm-rescue          | AccidentEmergencyRescue                           | 包 layout | 事故应急救援 |
| fm-typhoon         | TyphoonEmergencyDetail                            | 包 layout | 台风应急详情 |
| fm-security        | SecurityAntiTerror                                | 包 layout | 治安防恐     |
| fm-tv              | IndustrialTv                                      | 包 layout | 工业电视     |
| fm-production      | ProductionEmergency                               | 包 layout | 生产应急     |
| fm-production-area | ProductionAreaView（facilityId）                  | 包 layout | 生产区域详情 |
| fm-major-hazard    | MajorHazardListView / DetailView（hazardId 分发） | 包 layout | 重大危险源   |
| fm-communication   | ProductionCommunicationView                       | 包 layout | 生产通信     |
| fm-video-control   | VideoControlPlatform                              | **直挂**  | 视频控制平台 |
| fm-video-wall      | VideoWallView                                     | **直挂**  | 视频墙       |

- [ ] **Step 1: 每个子应用写 index.html**（模板，替换 title）：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>应急指挥</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

（不放 Google Fonts link——主壳 CSP `style-src 'self'` 会拦，且品牌规范 YaHei 优先。）

- [ ] **Step 2: 地图页 main.ts 模板**（9 个：emergency/fire/rescue/typhoon/security/tv/production/production-area/major-hazard/communication，共 10 个含参数页；以 fm-emergency 为例）：

```ts
import { createApp, h } from 'vue';
import '@/screen/style.css';
import { createSubappRouter } from '@/shell/subappRouter';
import View from '@/screen/views/SectorEmergencyCommand.vue';
import MapDashboardLayout from '@/screen/layouts/MapDashboardLayout.vue';
import ViewportSimulator from '@/screen/components/layout/ViewportSimulator.vue';
import AppToast from '@/screen/components/common/AppToast.vue';

// fm-emergency 子应用入口（fire-monitoring 迁移）：
// 1:1 复刻源项目 App.vue 组合（ViewportSimulator > MapDashboardLayout > 视图 + AppToast），
// 以 default slot 替代 router-view（子应用无路由树，跨页导航经 createSubappRouter 委托主壳）。
const app = createApp({
  render: () => [
    h(ViewportSimulator, null, {
      default: () => h(MapDashboardLayout, null, { default: () => h(View) }),
    }),
    h(AppToast),
  ],
});
app.use(createSubappRouter());
app.mount('#app');
```

其余视图仅替换 `View` 导入行（如 `import View from '@/screen/views/FireMonitoring.vue';`）。

- [ ] **Step 3: 参数页变体**

fm-production-area/main.ts 在模板基础上：

```ts
const routeParams =
  (window.$wujie?.props as { routeParams?: Record<string, string> } | undefined)?.routeParams ?? {};
const facilityId = routeParams.facilityId ?? '';
```

渲染处改为 `default: () => h(MapDashboardLayout, null, { default: () => h(View, { facilityId }) })`。

fm-major-hazard/main.ts：

```ts
import ListView from '@/screen/views/MajorHazardListView.vue';
import DetailView from '@/screen/views/MajorHazardDetailView.vue';

const routeParams =
  (window.$wujie?.props as { routeParams?: Record<string, string> } | undefined)?.routeParams ?? {};
const hazardId = routeParams.hazardId;
// 有 hazardId → 详情页；无 → 列表页（主壳两条路由指向同一子应用，靠参数分发）
```

渲染处：`default: () => h(MapDashboardLayout, null, { default: () => (hazardId ? h(DetailView, { hazardId }) : h(ListView)) })`。

- [ ] **Step 4: TV 独立页变体**（fm-video-control / fm-video-wall，源项目这两页不包 MapDashboardLayout）：

```ts
const app = createApp({
  render: () => [h(ViewportSimulator, null, { default: () => h(View) }), h(AppToast)],
});
```

（View 分别为 VideoControlPlatform / VideoWallView。）

- [ ] **Step 5: 提交（1 批，24 个小文件）**

```bash
git add subapps/fm-emergency subapps/fm-fire subapps/fm-rescue subapps/fm-typhoon subapps/fm-security subapps/fm-tv subapps/fm-production subapps/fm-production-area subapps/fm-major-hazard subapps/fm-communication subapps/fm-video-control subapps/fm-video-wall
git commit -m "feat(screen): 新增 12 个 fire-monitoring 视图的 wujie 子应用入口"
```

### Task 7: vite.config 多入口接线

**Files:**

- Modify: `vite.config.ts`（build.rollupOptions.input）

**Interfaces:**

- Consumes: Task 6 的 12 个 `subapps/fm-*/index.html`。

- [ ] **Step 1: input 增加 12 个 entry**（追加在 opsMonitorSubapp 之后）：

```ts
        fmEmergencySubapp: fileURLToPath(
          new URL('./subapps/fm-emergency/index.html', import.meta.url),
        ),
        fmFireSubapp: fileURLToPath(new URL('./subapps/fm-fire/index.html', import.meta.url)),
        fmRescueSubapp: fileURLToPath(new URL('./subapps/fm-rescue/index.html', import.meta.url)),
        fmTyphoonSubapp: fileURLToPath(
          new URL('./subapps/fm-typhoon/index.html', import.meta.url),
        ),
        fmSecuritySubapp: fileURLToPath(
          new URL('./subapps/fm-security/index.html', import.meta.url),
        ),
        fmTvSubapp: fileURLToPath(new URL('./subapps/fm-tv/index.html', import.meta.url)),
        fmProductionSubapp: fileURLToPath(
          new URL('./subapps/fm-production/index.html', import.meta.url),
        ),
        fmProductionAreaSubapp: fileURLToPath(
          new URL('./subapps/fm-production-area/index.html', import.meta.url),
        ),
        fmMajorHazardSubapp: fileURLToPath(
          new URL('./subapps/fm-major-hazard/index.html', import.meta.url),
        ),
        fmCommunicationSubapp: fileURLToPath(
          new URL('./subapps/fm-communication/index.html', import.meta.url),
        ),
        fmVideoControlSubapp: fileURLToPath(
          new URL('./subapps/fm-video-control/index.html', import.meta.url),
        ),
        fmVideoWallSubapp: fileURLToPath(
          new URL('./subapps/fm-video-wall/index.html', import.meta.url),
        ),
```

- [ ] **Step 2: dev 静态可达验证**

Run（后台起 dev）: `npm run dev`
Then: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/subapps/fm-emergency/`
Expected: `200`（appsHtmlFallback 对 /subapps/ 无扩展名请求同样回退 index.html——若无回退，确认 5173 返回的是 HTML 而非主壳首页，必要时把 fallback 正则从 `^\/apps\/` 扩为 `^\/(apps|subapps)\/`）。

- [ ] **Step 3: 提交**

```bash
git add vite.config.ts
git commit -m "feat(screen): vite 多入口接入 12 个 fm 子应用"
```

### Task 8: 菜单与二级路由接管（TDD）

**Files:**

- Modify: `src/router/menu.ts`（MENU_ROUTE_SPECS 增 fm 条目、DEFAULT_MENUS 切 fm）
- Modify: `src/router/index.ts`（FM 二级路由 + '/' redirect）
- Test: `src/router/menu.subapp.spec.ts`（先加断言）

**Interfaces:**

- Consumes: Task 7 的 `/subapps/fm-*/` URL；`@element-plus/icons-vue` 图标。
- Produces: 顶导 5 个 fm 菜单（路径 `/emergency /fire /security /tv /production`）+ 9 条 fm 二级路由（hidden，路径镜像源项目 router：`/emergency/drill`、`/emergency/typhoon`、`/fire/rescue`、`/production/area/:facilityId`、`/production/hazards`、`/production/hazards/:hazardId`、`/production/communication`、`/tv/video-control`、`/tv/video-wall`）。旧 6 菜单条目保留在 MENU_ROUTE_SPECS（可经 env 指回），仅从 DEFAULT_MENUS 摘除。

- [ ] **Step 1: 先写失败测试**（`src/router/menu.subapp.spec.ts` 追加）：

```ts
it('fm 子应用菜单条目指向 /subapps/fm-* 且默认菜单切换为 fm 五项', () => {
  expect(MENU_ROUTE_SPECS['fm-emergency'].subappUrl).toBe('/subapps/fm-emergency/');
  expect(MENU_ROUTE_SPECS['fm-fire'].subappUrl).toBe('/subapps/fm-fire/');
  expect(MENU_ROUTE_SPECS['fm-security'].subappUrl).toBe('/subapps/fm-security/');
  expect(MENU_ROUTE_SPECS['fm-tv'].subappUrl).toBe('/subapps/fm-tv/');
  expect(MENU_ROUTE_SPECS['fm-production'].subappUrl).toBe('/subapps/fm-production/');
  expect(DEFAULT_MENUS.map((m) => m.id)).toEqual([
    'fm-emergency',
    'fm-fire',
    'fm-security',
    'fm-tv',
    'fm-production',
  ]);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/router/menu.subapp.spec.ts`
Expected: FAIL（fm 条目不存在）。

- [ ] **Step 3: 实现 menu.ts**

MENU_ROUTE_SPECS 追加（旧 6 条不动）：

```ts
  // —— fire-monitoring 迁移子应用（fm-*）：默认菜单指向；旧 6 子应用保留可经 env 指回 ——
  'fm-emergency': {
    title: '应急指挥',
    perm: 'dashboard:view',
    icon: DataBoard,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_EMERGENCY_SUBAPP_URL ?? '/subapps/fm-emergency/',
  },
  'fm-fire': {
    title: '消防报警',
    perm: 'fire-alarm:view',
    icon: Warning,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_FIRE_SUBAPP_URL ?? '/subapps/fm-fire/',
  },
  'fm-security': {
    title: '治安防恐',
    perm: 'security:view',
    icon: Lock,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_SECURITY_SUBAPP_URL ?? '/subapps/fm-security/',
  },
  'fm-tv': {
    title: '工业电视',
    perm: 'video:view',
    icon: VideoCamera,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_TV_SUBAPP_URL ?? '/subapps/fm-tv/',
  },
  'fm-production': {
    title: '生产应急',
    perm: 'ops:view',
    icon: OfficeBuilding,
    component: () => import('@/shell/WujieHost.vue').then((m) => m.default),
    subapp: true,
    subappUrl: import.meta.env.VITE_FM_PRODUCTION_SUBAPP_URL ?? '/subapps/fm-production/',
  },
```

DEFAULT_MENUS 整体替换为：

```ts
// 降级默认菜单：fm-*（fire-monitoring 迁移版大屏）；旧 6 子应用保留在 MENU_ROUTE_SPECS，
// 菜单不可达时装配以下五项（对齐源项目 navItems：预警中心源项目无页面，暂不设项）
export const DEFAULT_MENUS: MenuItem[] = [
  { id: 'fm-emergency', name: '应急指挥', path: '/emergency' },
  { id: 'fm-fire', name: '消防报警', path: '/fire' },
  { id: 'fm-security', name: '治安防恐', path: '/security' },
  { id: 'fm-tv', name: '工业电视', path: '/tv' },
  { id: 'fm-production', name: '生产应急', path: '/production' },
];
```

- [ ] **Step 4: 实现 router/index.ts 二级路由**

SECONDARY_ROUTES 数组末尾追加（路径镜像源项目 router，保证子应用内 `router.push('/production/hazards')` 委托主壳后可命中）：

```ts
  // —— fire-monitoring 迁移二级页（fm-* 子应用，路径镜像源项目 router）——
  { path: '/emergency/drill', name: 'fm-drill', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '应急演练详情', perm: 'dashboard:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-rescue/' } },
  { path: '/emergency/typhoon', name: 'fm-typhoon', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '台风应急详情', perm: 'dashboard:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-typhoon/' } },
  { path: '/fire/rescue', name: 'fm-fire-rescue', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '事故应急救援', perm: 'fire-alarm:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-rescue/' } },
  { path: '/production/area/:facilityId', name: 'fm-production-area', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '生产区域详情', perm: 'ops:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-production-area/' } },
  { path: '/production/hazards', name: 'fm-major-hazard-list', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '重大危险源', perm: 'ops:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-major-hazard/' } },
  { path: '/production/hazards/:hazardId', name: 'fm-major-hazard-detail', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '重大危险源详情', perm: 'ops:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-major-hazard/' } },
  { path: '/production/communication', name: 'fm-communication', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '生产通信', perm: 'ops:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-communication/' } },
  { path: '/tv/video-control', name: 'fm-video-control', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '视频控制平台', perm: 'video:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-video-control/' } },
  { path: '/tv/video-wall', name: 'fm-video-wall', component: () => import('@/shell/WujieHost.vue').then((m) => m.default), meta: { title: '视频墙', perm: 'video:view', hidden: true, subapp: true, subappUrl: '/subapps/fm-video-wall/' } },
```

并把 layout 路由 `redirect: '/dashboard'` 改为 `redirect: '/fire'`（源项目 `'' → '/fire'`，消防监测为首页）。

- [ ] **Step 5: 跑测试至绿**

Run: `npx vitest run src/router/`
Expected: 全部 PASS（含旧用例——若有旧用例断言 DEFAULT_MENUS 内容，按新菜单更新断言后再跑）。

- [ ] **Step 6: 提交**

```bash
git add src/router/menu.ts src/router/index.ts src/router/menu.subapp.spec.ts
git commit -m "feat(screen): 菜单与二级路由切换到 fm 子应用并镜像源项目路径"
```

### Task 9: dev 冒烟与运行时修复

**Files:**

- Modify: `src/screen/**`（仅运行时错误修复，如 echarts 5/6 API 差异、wujie 沙箱假设）

- [ ] **Step 1: 起 dev server（后台）**

Run: `npm run dev`（后台，记下端口，默认 5173；如被占用按实际端口）

- [ ] **Step 2: 浏览器逐子应用冒烟**

加载 agent-browser skill，依次访问并截图：
`/`（应跳 `/fire`）、`/emergency`、`/fire`、`/security`、`/tv`、`/production`、`/emergency/drill`、`/emergency/typhoon`、`/fire/rescue`、`/production/hazards`、`/production/communication`、`/tv/video-control`、`/tv/video-wall`、`/production/area/` + 一个真实 facilityId（从 `src/screen/lib/data/productionAreaMock.ts` 取）。

每个页面核对：地图 canvas 存在且非黑屏（TV 页除外）、左右面板渲染、控制台无报错（`--init-script` 捕获 `__capturedErrors` 到所有 frame，包括沙箱 iframe）。

Expected: 逐页截图留证到 `.tmp-migrate/smoke/`；发现 echarts/vue-echarts API 错误、undefined import 等逐个修复并复跑，直至 14 条路径全部可渲染。

- [ ] **Step 3: 修复后门禁复跑 + 提交**

Run: `npm run lint && npm run type-check`
Expected: 0 error。

```bash
git add src/screen
git commit -m "fix(screen): 修复 fire-monitoring 迁入代码的 wujie 运行时问题"
```

### Task 10: 全量验证 + 规范文档修订

**Files:**

- Modify: `docs/UI规范-大屏端.md`、`AGENTS.md`

- [ ] **Step 1: 生产构建验证**

Run: `npx vite build --emptyOutDir=false`
Expected: 构建成功；`dist/subapps/fm-emergency/` 等 12 个子应用 HTML 产物存在；共享 chunk 正常提取（echarts 单 chunk）。

- [ ] **Step 2: UI 规范增补存量补位条款**

`docs/UI规范-大屏端.md` 文首「本文档定位」引用块后新增：

```markdown
> **存量代码补位约定（2026-09-02 迁移）**：`src/screen/**` 为 fire-monitoring 迁入存量。规范已覆盖项（§2 色彩 token、§7 状态映射表、z-index 五层等）以本规范为准；规范未覆盖项（特效、特殊尺寸、滚动条、雪碧图体系）沿用 `src/screen/styles/variables.css` 源体系。新增/修改代码一律按本规范执行，未覆盖值如需固化请先提案入 tokens.css。
```

- [ ] **Step 3: AGENTS.md 同步例外说明**

`AGENTS.md` §3 绝对红线第 1 条后追加一行：

```markdown
11. **存量补位例外（src/screen）**：`src/screen/**` 为 fire-monitoring 迁入存量，规范/token 已覆盖项必须用 `var(--token)`；未覆盖项可沿用 `src/screen/styles/variables.css` 源体系，新增页面不得新增未入 token 的硬编码值。
```

（同时把 §3 标题下「红线清单」编号顺序保持原状，本条作为追加项。）

- [ ] **Step 4: 提交**

```bash
git add docs/UI规范-大屏端.md AGENTS.md
git commit -m "docs: 大屏规范增补 src/screen 存量补位条款"
```

### Task 11: openspec 勾选与归档收尾

**Files:**

- Modify: `openspec/changes/screen-fire-monitoring-migration/{tasks.md,proposal.md}`（勾选）、`openspec/specs/`（如需新增 screen-fire-monitoring capability spec）

- [ ] **Step 1: 勾选 tasks.md** 全部完成项（含验证证据摘要：lint 0 error / type-check 0 error / build 产物清单 / 冒烟截图路径）。

- [ ] **Step 2: 新增 capability spec** `openspec/specs/screen-fire-monitoring/spec.md`：记录 fm 子应用清单、入口组合约定（ViewportSimulator > MapDashboardLayout > View + AppToast）、路由镜像规则、routeParams 传参、存量补位条款。

- [ ] **Step 3: 归档 change**

```bash
git mv openspec/changes/screen-fire-monitoring-migration openspec/archive/screen-fire-monitoring-migration-2026-09-02
git add -A openspec
git commit -m "docs: 归档 screen-fire-monitoring-migration 变更"
```

- [ ] **Step 4: 清理临时物**

`.tmp-migrate/` 加入 `.gitignore`（若无）并保留至用户验收后手动删除；确认无 `vite-dev*.log`、`tsc-out.txt` 类临时文件被提交（`git log --stat -1` 抽查）。

---

## Self-Review 记录

- 覆盖检查：设计文档 A–F 六节均有对应任务（A→Task1/2、B→Task6/7、C→Task8、D→Task2/4/10、E→Task1、F→Task3/9/10/11）。
- 子应用数修正：设计文档表述「13 个」按映射表实为 **12 个**（fm-major-hazard 合并 list/detail），openspec tasks.md 同步改为 12。
- 类型一致性：`routeParams: Record<string, string>`（Task 5 产出 = Task 6 消费）；`/subapps/fm-*/`（Task 6 产出 = Task 7 input、Task 8 meta.subappUrl 消费）。
