# engineering/qa/evidence/ — QA 截图证据

存放 L3 / L4 质量保障（QA）结论的**必要附件**：UI 改动页面截图、关键验证终端输出快照等。

## 规则

- 本目录证据与 `engineering/qa/<YYYY-MM-DD>-<slug>.md` 一一对应，文件名保持一致前缀。
- 证据为二进制（png/jpg）时仅在 QA 记录中引用（如 `![验收截图](evidence/xxx.png)`），不内嵌；超大原图不入库。
- 与 `engineering/README.md` 三条纪律一致：临时产物不入库、报告实际执行命令、不写第二套任务。
- 本目录兼作 `engineering/qa/` 的占位（git 不追踪空目录），请勿删除。
