# `.cursor/` 适配层与 opsx-* 命令安装说明

本目录让 **Cursor / Claude Code / Codex / WorkBuddy** 等任意 AI 编码工具，都能读到根 `AGENTS.md` 定义的那套工程化约束（L0–L4 分级、openspec 唯一规格源、验证矩阵、UI token 红线、API 契约红线）。

```
.cursor/
├── README.md                     ← 本文件：安装与排错说明
├── rules/
│   ├── frontend-scaffold-core.mdc      # 入口/分级/openspec 唯一源/验证矩阵/提交/分层读取链
│   ├── ui-tokens-theme.mdc             # token 单源/三端主题挂载/视觉语言/移动端特殊项
│   └── api-contract.mdc                # 零下行控制/B3 包络/20位MDM/HMAC签名/令牌内存态/L4门禁
└── commands/
    ├── opsx-propose.md           # 创建 change 并生成 proposal/design/tasks/specs-delta 四件套
    ├── opsx-apply.md             # 按 tasks.md 逐项实施（TDD + 验收）
    ├── opsx-archive.md           # 验收通过后归档到 openspec/archive
    ├── opsx-explore.md           # 只读探索模式（只思考不写码）
    ├── opsx-sync.md              # 把 delta spec 合并回 openspec/specs 主规格
    └── opsx-update.md            # 修订规划产物（proposal/design/tasks）
```

> 这些 rules / commands 都是**对根 `AGENTS.md` 的镜像**，不是第二套规范。若 AGENTS.md 改了，这里要同步改（见末尾"一致性约定"）。

---

## 一、opsx-* 命令依赖什么

`opsx-*` 命令是对 **OpenSpec CLI** 的封装，命令体里调用的是裸二进制 `openspec`（例如 `openspec list`、`openspec validate`、`openspec archive`）。

**前置条件：本机必须能直接执行 `openspec` 命令。**

- 没装 → 任何 `/opsx:` 命令都会报 `openspec: command not found` 或 `无法将"openspec"识别为命令`。
- 装了但不在仓库根目录运行 → 读不到 `openspec/config.yaml`，会报 schema / 找不到 changes 目录。

---

## 二、安装 OpenSpec CLI

### 方式 A（推荐）：全局安装，命令体可直接用 `openspec`

```bash
# 用 npm（本项目 package-lock.json 表明主包管理是 npm）
npm install -g @fission-ai/openspec

# 若你习惯 pnpm
pnpm add -g @fission-ai/openspec
```

> 选全局安装的原因：opsx-* 命令里写的是裸 `openspec`，只有全局（或在 PATH 内）安装才能直接命中，避免每次 `npx` 拉取。

### 方式 B：不全局安装，用 npx 包一层（参考 safety 项目的写法）

不全局装时，把命令体里的 `openspec` 改成 `npx @fission-ai/openspec`（首次会临时下载）。
safety 仓库里就是这样用的，例如：

```bash
npx @fission-ai/openspec validate --strict --change "<change-id>"
```

如果你们的团队约定"禁止全局装 + 一律 npx"，请同步把 `.cursor/commands/opsx-*.md` 里的 `openspec` 字面量批量替换成 `npx @fission-ai/openspec`。

### 版本说明

- 当前最新：`@fission-ai/openspec@1.12.0`（bin 名 `openspec`）。
- 本工作区已预装 `openspec` 于 `C:\nvm4w\nodejs\openspec`，版本 `1.5.0`，可直接使用，**无需再装**。
- 团队统一建议 pin 一个版本（如 `npm install -g @fission-ai/openspec@1.12.0`），避免不同人 CLI 版本差异导致 `openspec validate` 规则不一致。

---

## 三、验证安装

```bash
# 应输出版号（如 1.5.0 / 1.12.0），而不是 "command not found"
openspec --version

# 确认能读到本仓库的 openspec 布局（在仓库根目录执行）
cd <仓库根>/frontend-scaffold
openspec list          # 列出当前 active changes（应与 openspec/changes/ 一致）
openspec list --specs  # 列出稳定规格（openspec/specs/）
```

能正常列出，说明 CLI 与仓库 `openspec/config.yaml` 已对上。

---

## 四、使用前提（必读）

1. **从仓库根目录运行**：`openspec` 以"当前工作目录"定位 `openspec/` 与 `config.yaml`。在 Cursor 里执行 `/opsx:*` 命令时，确保打开的工作区根就是 `frontend-scaffold/`（即含 `AGENTS.md` 与 `openspec/` 的那一层）。
2. **只用于 L3 / L4 改动**：`opsx-*` 是 openspec 流程的驱动器，对应 AGENTS §1 的"改业务能力 / 高风险"等级。L0/L1/L2 不要走这套（直接改 + 跑最小验证矩阵即可）。
3. **命令是脚手架，不是规范**：命令帮你建目录、填四件套、跑校验，但最终内容（proposal 措辞、tasks 拆分、验收标准）仍需人审，且必须回到 `AGENTS.md` 的红线。

---

## 五、常见排错

| 现象                            | 原因                                | 处理                                                                                              |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `openspec: command not found`   | CLI 未装 / 未进 PATH                | 按"二"安装；或把命令体 `openspec` 换成 `npx @fission-ai/openspec`                                 |
| `No changes found` / 找不到目录 | 不在仓库根目录运行                  | `cd` 到 `frontend-scaffold/` 再执行                                                               |
| `validate` 报 schema 错误       | CLI 版本与仓库 `config.yaml` 不兼容 | 统一 pin 到同一版本（建议 1.12.0）                                                                |
| AI 没读 UI 规范就改了样式       | 漏读端专属文件                      | 确认 `frontend-scaffold-core.mdc` 已加载，且按"改哪读哪"读了对应 `AGENTS.md` + `docs/UI规范-*.md` |

---

## 六、一致性约定（维护者必看）

- `CLAUDE.md`、`.cursor/rules/*.mdc` 是根 `AGENTS.md` 的**投影**，不是独立规范。
- 改 `AGENTS.md`（尤其 §1 分级、§3 API 契约、§6 红线、§2 验证矩阵）后，**必须同步**更新本目录的对应 rules，否则跨工具行为会漂移。
- `opsx-*` 命令体跟随 OpenSpec CLI 官方子命令；CLI 升级改名时同步改这里。
- 不要把业务规则写进 `.cursor/` 而绕过 `AGENTS.md`——单一真源永远在根 `AGENTS.md`。
