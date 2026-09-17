# 前端 E2E（Playwright）· 三端写回链路

本目录是「端到端自动化验证三端交互」的 **UI 层** 部分。它驱动真实浏览器走
`提交 → 真后端落库 → 列表回显` 的整链路，覆盖管理端 / 大屏 / 移动端三条写回路径。

## 与既有 API 级冒烟的关系

- **权威的三端数据一致性 E2E（已验证通过）** 在仓库根的 `tools/smoke/`：
  - `smoke_write_closed_loop.py` — 21 项断言全 PASS：R1–R4 写链路 submit→persist→echo，
    并对移动端/管理端/大屏三套读端点做一致性核对，且验证「中文枚举必须被拒收(code=100)」。
  - `smoke_stress_write_links.py` — 80 并发写后 GET 一致性：0 丢失 / 0 重复。
  - 这两个脚本直接打**真后端 API**，是数据一致性兜底的硬证据。
- **本 Playwright 套件** 在这之上补 **UI 交互层** 验证：确保按钮、表单、枚举下拉、
  回显列表在真实浏览器里也能跑通（不只是接口对）。

两者互补：**接口级冒烟保数据一致，UI 级 E2E 保交互闭环。**

## 本地运行

```bash
# 1) 起一个隔离端口(8899)的验证后端（勿用 8787 实例）
cd ../backend-scaffold
JAVA_HOME=... mvn -s ci-settings.xml spring-boot:run -DskipTests &   # 见 MEMORY.md 命令
#   或复用已起好的 8899 后端

# 2) 浏览器二选一：
#    a) 标准做法（CI/有网络）：让 Playwright 自带 chromium
npx playwright install chromium
#    b) 复用本机已装 Chrome（沙箱无网络下载时可用，playwright.config 已配 executablePath 兜底）
#       PW_CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx playwright test

# 3) 跑 E2E（playwright.config 以 --mode e2e 加载 .env.e2e，自动拉起 vite dev 并指向 8899 后端）
npx playwright test                 # 默认 localhost:5173
npx playwright test --project=chromium --headed   # 可视化调试
npx playwright show-report          # 看报告
```

> **为什么是 `--mode e2e` + `.env.e2e`**：`.env.development` 里的 `VITE_API_BASE` 指向 `8787`，
> 而 vite 的 `.env` 文件会**覆盖** `process.env`，导致自动登录打到未启动的 8787。
> `.env.e2e`（已随仓库提交，内容为 dev 凭据 + `8899`）专门给 E2E 用，绕开 8787。

环境变量（可选覆盖默认值）：

- `E2E_API_BASE` 后端地址，默认 `http://localhost:8899/api/v1`
- `E2E_BASE_URL` 前端 dev 地址，默认 `http://localhost:5173`
- `E2E_DEV_USER` / `E2E_DEV_PASSWORD` dev 自动登录凭据，默认 `admin` / `admin@2026`
- `PW_CHROME_PATH` 复用系统 Chrome 的可执行路径（免下载 chromium）

> **鉴权预热（`ensureAuthed`）**：`apps/mgmt` 等独立子应用自身不登录，依赖主壳登录后种下的
> `rt`(HttpOnly) Cookie 做静默续期。直接深链进 `/apps/mgmt/...` 会被踢回主壳登录页且丢失原路径，
> 故每个 mgmt/screen spec 先访问主壳 `/` 触发 dev 自动登录、待 `rt` Cookie 落盘后再进深链
> （`support/helpers.ts` 的 `ensureAuthed` 用 `context.cookies()` 轮询 rt，因为 HttpOnly 读不到）。

## 实际运行结果（本机验证）

```
Running 4 tests
  3 passed
  1 skipped
```

- ✅ `mgmt/duty-signin` — R2 值班签到：UI 提交(英文枚举 SIGN_IN)→落库→列表回显，真实跑通
- ✅ `mgmt/patrol-execution` — R4 消防巡更执行：UI 提交(英文枚举 NORMAL)→落库→回显，真实跑通
- ✅ `mobile/field-report` — 移动端在 dev 登录态下正常渲染
- ⏭️ `screen/fire-patrol` — R4 大屏巡检上报：**本沙箱 headless 无 GPU，Cesium 大屏挂载失败
  自动 skip**；R4 写链路本身已由 `mgmt/patrol-execution` E2E + `tools/smoke` API 冒烟覆盖，
  不受影响。在有 GPU 的机器（或带 `--use-gl=swiftshader` 的 headed Chrome）上会完整执行写回断言。

## 首次运行需核对的 3 个集成点

1. **登录**：依赖 dev 自动登录 + 主壳 `rt` Cookie 续期，需 `VITE_USE_DEV_MOCK=false` 且后端在 8899 可达。
2. **大屏路由**：`/fire` 是主壳重定向到的屏幕主页（Cesium 一张图，需 WebGL/GPU）；若屏幕挂载路径变化，改 `fire-patrol.spec.ts` 的 `goto('/fire')`。
3. **写侧可见性**：大屏「上报」按钮要求后端存在 ≥1 条 `/fire/patrols` 巡检记录且账号持
   `fire-alarm:patrol:write` 权限；管理端两个表单的**占位符/按钮文案**以
   `apps/mgmt/views/...` 实际代码为准（spec 内已对齐）。

## 文件

- `playwright.config.ts` — 配置（webServer 自动起 dev + 隔离后端 env）
- `support/helpers.ts` — 公共 helper（日期选择、toast 等待）
- `mgmt/duty-signin.spec.ts` — R2 值班签到（高置信，选择器已对齐源码）
- `mgmt/patrol-execution.spec.ts` — R4 消防巡更执行（管理端表单，首次核对字段）
- `screen/fire-patrol.spec.ts` — R4 大屏巡检上报（依赖预置记录 + 权限）
- `mobile/field-report.spec.ts` — 移动端页面可达性（三端覆盖占位，可扩展为写链路）
