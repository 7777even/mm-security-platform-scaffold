# 任务清单：<变更名称>

> 适用：L3 / L4。任务须可勾选、单条 ≤2h；标注 [TDD] 的先写失败测试再实现（openspec/config.yaml）。
> 任务状态只回填此处，禁止在 engineering/ 另立第二套任务清单（AGENTS.md §4）。

## 1. <模块 / 阶段一>

- [ ] <任务描述（具体文件 + 改动内容）。>
- [ ] [TDD] <先写期望测试（如 `*.spec.ts`），跑红，再实现；覆盖关键路径：deviceCode / usePermission / realtime / 移动 bridges。>

## 2. <模块 / 阶段二>

- [ ] <...>
- [ ] [TDD] <...>

## 3. 守门测试与验证

- [ ] [TDD] <关键路径集成测试（composable / http 拦截器 / 移动 bridges）经 `npm test` 必绿。>
- [ ] <按 AGENTS.md §2 验证矩阵对应行执行（lint / type-check / build），实际命令与结果记入 `engineering/qa/`。>

## 验收标准（Definition of Done）

- [ ] `tasks.md` 全部勾选，验收标准逐条满足。
- [ ] 受影响目标 `npm test` / type-check / eslint 0 error（按 §2 矩阵对应行，不连跑四套）。
- [ ] 代码若改变契约 / 行为，同步 `docs/` 与对应 `docs/UI规范-*.md`（短期记录不写进 docs/）。
- [ ] 提交按 scope 拆分：`type(scope): 描述`，单行成句、禁止 `- ` 分点列表；临时输出文件不入库。
- [ ] L3 / L4 完成后即刻写 `engineering/qa/` + `engineering/retro/`，不攒到最后补。
