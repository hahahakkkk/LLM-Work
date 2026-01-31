# 对象一览（序号 / 模块 / 类名 / 描述 / 复用/开发）

本表根据代码目录 src/main/java/cn/edu/nwafu/mizhipestcontrol/domain（含 bo/、vo/、dao/）整理，描述以类职责为准；“复用/开发”表示是否常作为跨子系统契约复用或主要在本服务内使用。

| 序号 | 模块 | 类名 | 描述 | 复用/开发 |
|---:|---|---|---|---|
| 1 | 地块/区域 | Farmland | 地块/耕地实体，包含基地/地块信息与边界，用于区域管理与统计。 | 开发 |
| 2 | 区域检测 | PestAreaDetection | 病害/虫害区域检测记录，含检测元数据、结果图与状态。 | 开发 |
| 3 | 植株识别 | Plant | 植株/样本实体，用于植株管理与检索。 | 开发 |
| 4 | 识别结果 | PlantResults | 植株识别结果实体，含类别、置信度、图片与关联信息。 | 开发 |
| 5 | 模型元数据 | IdentifyModel | 识别模型元数据（类型、URL、默认等），用于模型选择。 | 复用 |
| 6 | 出苗率历史 | GuziEmergenceHistory | 谷子出苗率历史记录，支持统计与报告生成。 | 开发 |
| 7 | 出苗检测历史 | SeedingHistory | 单次出苗检测记录，含图片、检测值与时间，用于回溯。 | 开发 |
| 8 | 播种计划 | SowingPredict | 播种预测/计划，存储预测区间、建议与基地信息。 | 开发 |
| 9 | 播种记录 | SowingRecord | 实际播种与生育期记录，含播种时间、出苗率与田块关联。 | 开发 |
| 10 | 土地分析 | LandChangeAnalysis | 地块面积变化分析记录，含增减数据与地块信息。 | 开发 |
| 11 | 识别结果 | RgbResult | 可见光（RGB）识别结果对象，用于植株识别返回。 | 开发 |
| 12 | 识别结果 | WhResult | 生育阶段识别/计算结果对象（wh 场景）。 | 开发 |
| 13 | 识别结果 | ErResult | 出苗率识别结果对象，封装识别值与说明。 | 开发 |
| 14 | 识别结果 | ModelResult | 通用模型调用结果封装，用于适配多模型输出。 | 开发 |
| 15 | 策略 | AllStrategy | 专家策略集合对象，存放病虫害处置建议。 | 复用 |
| 16 | 上下文 | RequestContextHolder | 请求上下文持有器，封装任务/会话相关信息。 | 开发 |
| 17 | DAO | FarmlandDao | 地块数据访问辅助对象（组合查询/聚合）。 | 开发 |
| 18 | 地块入参 | FarmlandBo | 地块业务入参对象（校验、分页查询条件）。 | 开发 |
| 19 | 模型入参 | IdentifyModelBo | 模型元数据入参（名称、类型、默认、地址、描述）。 | 开发 |
| 20 | 植株入参 | PlantBo | 植株业务入参（监测点、图像地址等）。 | 开发 |
| 21 | 识别结果入参 | PlantResultsBo | 植株识别结果入参（类型、备注、结果图与关联）。 | 开发 |
| 22 | 播种计划入参 | SowingPredictBo | 播种计划入参（基地、品种、区间日期）。 | 开发 |
| 23 | 播种记录入参 | SowingRecordBo | 播种记录入参（基地、品种、日期等）。 | 开发 |
| 24 | 出苗信息入参 | SeedingInfoBo | 外部/聚合的播种/出苗信息入参对象。 | 开发 |
| 25 | 土地分析入参 | LandChangeAnalysisBo | 地块面积变化分析入参（面积增减等）。 | 开发 |
| 26 | 区域检测入参 | PestAreaDetectionBo | 区域检测入参（经纬度、病害类型、发生率等）。 | 开发 |
| 27 | 区域检测请求 | AreaDetectRequestBo | 区域检测提交请求参数对象（模型选择/图片）。 | 开发 |
| 28 | 区域结果入参 | PestAreaDetectResultBo | 区域检测结果入参（结果图、描述等）。 | 开发 |
| 29 | 地块信息入参 | FarmlandInfoBo | 地块信息聚合入参（多源查询参数）。 | 开发 |
| 30 | 统计卡片 VO | StatisticsDataVO | 后台统计汇总卡片 VO。 | 复用 |
| 31 | 出苗后台 VO | DeskEmergenceDataVo | 出苗率后台卡片展示数据。 | 复用 |
| 32 | 病害后台 VO | DeskDiseaseAreaVo | 后台病害区域卡片展示数据。 | 复用 |
| 33 | 害虫后台 VO | BackPestVo | 后台病虫害信息聚合展示。 | 复用 |
| 34 | 病害统计 VO | BackDieaseAreaStaticVo | 后台病害区域统计展示数据。 | 复用 |
| 35 | 出苗均值 VO | AvgEmergenceInfoVo | 出苗率平均信息 VO（聚合统计）。 | 复用 |
| 36 | 植株 VO | PlantVo | 前端植株展示 VO。 | 复用 |
| 37 | 植株检测 VO | PlantDetectionRecordVo | 植株检测记录展示 VO。 | 复用 |
| 38 | 识别结果 VO | PlantResultsVo | 植株识别结果展示 VO（含多病害视图）。 | 复用 |
| 39 | 地块 VO | FarmlandVo | 地块展示 VO（裁剪字段）。 | 复用 |
| 40 | 模型 VO | IdentifyModelVo | 模型元数据展示 VO。 | 复用 |
| 41 | 识别封装 VO | IdentifyResultVO | 通用识别结果封装（检测项/置信度/建议）。 | 复用 |
| 42 | 区域检测 VO | PestAreaDetectionVo | 区域检测结果展示 VO（边界/统计）。 | 复用 |
| 43 | 区域提交 VO | PestAreaSubmitVo | 区域检测提交参数 VO（图片/模型/任务）。 | 开发 |
| 44 | 区域任务 VO | PestAreaTaskVo | 区域检测异步任务视图 VO（任务元数据）。 | 开发 |
| 45 | 生育期 VO | GrowthPeriodVo | 生育期/生长周期返回 VO（按基地/日期）。 | 复用 |
| 46 | 出苗历史 VO | GuziEmergenceHistoryVo | 出苗率历史展示 VO。 | 复用 |
| 47 | 播种聚合 VO | SowingInfoVo | 播种信息聚合视图 VO（实际+预测）。 | 复用 |
| 48 | 播种计划 VO | SowingPredictVo | 播种计划展示 VO。 | 复用 |
| 49 | 播种记录 VO | SowingRecordVo | 播种记录展示 VO。 | 复用 |
| 50 | 播种导出 VO | SowingRecordExportVo | 播种记录导出行映射 VO（Excel）。 | 开发 |
| 51 | 播种预测信息 VO | SowingPredictInfoVo | 播种预测信息细化展示 VO。 | 复用 |
| 52 | 最佳播种 VO | BestSowingVo | 最佳播种期建议/图示 VO。 | 复用 |
| 53 | 播种期图 VO | StInfoVo | 最佳播种期依据图（温度/墒情） VO。 | 复用 |
| 54 | 预警 VO | WarnVO | 病虫害预警数据 VO（按部门维度）。 | 复用 |
| 55 | 土地分析 VO | LandChangeAnalysisVo | 土地变化分析展示 VO。 | 复用 |
| 56 | 地块/区域 | FarmlandDao | 地块 DAO 辅助（数据访问封装）。 | 开发 |
| 57 | 遥感/其他 | BackPestVo | 后台害虫信息展示（重复出现于列表以强调）。 | 复用 |

注：若后续新增对象（DTO、枚举等），可在本表补充；当前覆盖 domain 根目录及 bo/、vo/、dao/ 下的全部类声明。
