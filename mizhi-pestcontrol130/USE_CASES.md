# 用例与角色说明

文件包含：角色定义、从代码自动推断的用例（功能）清单，以及对应的 PlantUML 源文件 `USE_CASES.puml`（可用 PlantUML 渲染为用例图）。

**角色（Actors）**
- 前端用户（Frontend User）：系统的常用调用方（种植人员/巡检员/站点操作员），主要发起识别、提交检测任务、查询报告与管理自身数据。
- 管理员（Admin）：拥有带权限注解的管理操作（导出、增删改、权限受控接口），用于运维/数据治理。
- 专家知识库服务（Expert Knowledge Service）：外部服务，被 `Identify` 流程调用以获取防治策略（Feign client）。
- 遥感服务（RemoteSense Service）：外部遥感数据提供方（Dubbo），由 `RemoteSenseProxy` 转发/聚合调用。
- 系统/调度（System/Scheduler）：负责异步任务管理、过期清理与定时任务（如区域检测任务清理、图片监控）。

**用例（Use Cases）摘要**
（下列用例映射自控制器与接口注解，括号内为主接口路径或控制器）

- 地块管理（Manage Farmlands）：创建/查询/修改/删除/导出地块信息（`/farmland`）
- 植株管理（Manage Plants）：植株增删改查与导出（`/plant`）
- 植株识别（Identify Plant）：RGB/病害/虫害识别、返回识别结果与策略（`/identify/rgb`, `/identify/diseaseId`, `/identify/pestId`）
- 生育阶段识别（Detect Growth Stage）：`/identify/wh`（返回 `WhResult`）
- 出苗率识别与报告（Emergence Rate / Report）：`/identify/er`, 出苗率历史与 PDF（`/emergenceHistory`）
- 区域病害检测（Area Detection async）：提交异步任务、查询任务状态、结果入库与报告（`/identify/pestArea/submit`, `/identify/pestArea/task/{taskId}`, `/areaDetection/*`）
- 模型管理（Manage Identify Models）：模型列表、增加/修改/删除、导出（`/identifyModel`）
- 识别结果管理（Manage Plant Results）：识别结果列表、查询、导出、后台聚合（`/PlantResults`）
- 土地变化分析（Land Change Analysis）：增删改查与导出（`/changeAnalysis`）
- 遥感数据代理（Remote Sense Proxy）：转发/聚合遥感数据查询（`/proxy/remote-sense/list`）
- 播种计划（Sowing Predict）：预测计划增删改查与导出（`/predict`）
- 播种记录（Sowing Record）：实际播种记录与生育期查询/导出（`/record`、`/record/period*`）
- 播种信息聚合（Sowing Info）：聚合“实际播种记录 + 预测播种区间”（`/sowingInfo/getSowingInfo`）

**角色 ↔ 用例 映射（简表）**
- 前端用户：地块管理、植株管理、植株识别、生育阶段识别、出苗率识别、区域检测提交与查询、查看报告、播种查询/提交。
- 管理员：上述所有用例中的导出/管理动作（带 `@SaCheckPermission` 的接口，如导出/删除/编辑/新增等）。
- 专家知识库服务：作为被调用方，参与“植株识别”用例（策略回填）。
- 遥感服务：作为被调用方，参与“遥感数据代理”用例。
- 系统/调度：执行区域检测任务调度、清理过期任务与图片监控，作为后台行为触发并维护任务元数据。

**PlantUML 渲染**
1. 在本目录运行 PlantUML（需安装 PlantUML + Graphviz），或使用在线 PlantUML 渲染器。文件：`USE_CASES.puml`。
2. 本项目内渲染示例（若已安装 `plantuml` 命令行）：

```bash
plantuml USE_CASES.puml
```

生成的 `USE_CASES.png`（或 SVG）会包含角色与用例的交互关系，便于设计评审与需求确认。

---
文件 `USE_CASES.puml` 已与本说明一起保存于项目根下；如需我把某些用例拆分成子用例或增加权限细化（按 `@SaCheckPermission` 的具体权限），我可以更新 PlantUML 并在图中标注权限标签。
