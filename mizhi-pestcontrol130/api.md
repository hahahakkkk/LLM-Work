# mizhi-pestcontrol 接口清单

说明：按控制器分组列出接口，仅包含“接口名称（访问地址）”与“接口描述”。如同一路径存在多种方法（GET/POST/PUT/DELETE），在此合并为一条记录并给出综合功能说明。

## Farmland（/farmland）
| 接口名称 | 接口描述 |
|---|---|
| /farmland/fetchStatistics | 区域数据概览统计，汇总病虫害区域数量、面积占比、近期变化趋势等，用于看板或首页概览展示。 |
| /farmland | 区域信息的新增与修改：用于在完成区域检测后补录/修订区域元数据（地块、病害类型、面积、图像结果链接等）。 |
| /farmland/list | 分页查询区域信息，支持按基地/地块、病害类型、时间区间等条件检索，并返回结构化列表用于表格展示。 |
| /farmland/export | 导出区域信息清单为 Excel，便于线下归档与分析。 |
| /farmland/{farmlandId} | 按主键获取区域信息详情，包含基础属性、检测结果关联信息与图片地址等。 |
| /farmland/{farmlandIds} | 批量删除区域信息，通常用于清理误检或重复记录。 |
| /farmland/test | 外部数据接口演示：返回病虫害发生的地块信息列表，供对接/演示使用。 |

## PestAreaDetection（/areaDetection）
| 接口名称 | 接口描述 |
|---|---|
| /areaDetection/list | 分页查询病虫害区域检测记录，支持条件过滤与排序，用于管理端表格展示。 |
| /areaDetection/export | 导出病虫害区域检测记录为 Excel，包含检测时间、病害类型、发病率、图像链接等关键字段。 |
| /areaDetection/{id} | 查询单条检测记录详情，展示检测原图、结果图、分级图及计算指标。 |
| /areaDetection | 新增或修改检测记录：用于外部检测流程完成后的结果落库与后续修订。 |
| /areaDetection/{ids} | 批量删除检测记录，支持多选清理误检数据。 |
| /areaDetection/getDeskINfo | 获取大屏/后台卡片所需的区域病害聚合数据（含地块代码、基地名、等级、代表图等）。 |
| /areaDetection/BackDiseaseAreaStaticVo | 获取后台统计概览（如区域数、等级分布、近期趋势）用于总览卡片。 |
| /areaDetection/report/{id} | 生成并下载病害区域检测 PDF 报告（流式输出，含图文说明与治理建议）。 |

## Identify（/identify）
| 接口名称 | 接口描述 |
|---|---|
| /identify/areaDetect | 病虫害区域检测（V1）：接收多光谱/可见光影像，选取默认或指定模型完成区域分割、分级与结果图生成。 |
| /identify/rgb | 植株尺度虫害识别：对上传植株图片进行虫害识别，返回类别、置信度与结果图链接。 |
| /identify/diseaseId | 植株尺度病害识别：对上传植株图片进行病害识别，输出病害类型与可视化结果。 |
| /identify/pestId | 植株尺度虫害识别：与 /identify/rgb 同类能力，面向特定前端调用路径。 |
| /identify/wh | 生育阶段识别：基于植株图像智能判断当前生育期（如出苗/拔节/抽穗/灌浆/成熟）。 |
| /identify/er | 出苗率识别：基于图片 URL 列表进行苗情评估，给出出苗率及等级建议。 |
| /identify/st | 播种期识别与推荐：结合历史与气象因子，给出最佳播种期窗口与说明。 |
| /identify/warn | 病虫害预警：基于部门/基地上下文返回近期风险点与预警信息。 |
| /identify/pestArea/submit | 提交病害区域检测异步任务：登记任务元数据与资源地址，后台异步处理并限流控制。 |
| /identify/pestArea/task/{taskId} | 查询异步任务状态与结果：返回进度、结果图与统计指标，用于前端轮询。 |
| /identify/stinfo | 获取最佳播种期依据图：返回温度/墒情两张指标图的可访问链接，用于辅助决策说明。 |

## IdentifyModel（/identifyModel）
| 接口名称 | 接口描述 |
|---|---|
| /identifyModel/list | 识别模型分页列表：支持按模型类型（区域/植株/病害/虫害）与状态检索。 |
| /identifyModel/listAreaModel | 区域检测模型列表：列出可用于遥感/区域分割的模型集合。 |
| /identifyModel/listIdentifyModel | 识别模型列表：列出植株尺度识别可用模型，支持默认模型标记。 |
| /identifyModel/getPestModel/{modelId} | 根据模型ID获取虫害模型详情（元数据、版本、存储位置等）。 |
| /identifyModel/getDieaseModel/{modelId} | 根据模型ID获取病害模型详情。 |
| /identifyModel/export | 导出模型清单为 Excel，便于治理与归档。 |
| /identifyModel/{modelId} | 通用模型详情查询。 |
| /identifyModel | 新增或修改识别模型：维护模型元数据、默认标记与模型地址。 |
| /identifyModel/{modelIds} | 批量删除模型，清理失效或历史版本。 |

## Plant（/plant）
| 接口名称 | 接口描述 |
|---|---|
| /plant | 植株信息新增与修改：维护植株样本的基础信息与关联图片，用于识别结果溯源。 |
| /plant/list | 植株信息分页查询：按品种、时间与基地维度检索。 |
| /plant/export | 导出植株清单为 Excel，便于线下分析与盘点。 |
| /plant/{id} | 获取植株详情，查看样本的基础属性与关联识别记录。 |
| /plant/{ids} | 批量删除植株信息。 |

## PlantResults（/PlantResults）
| 接口名称 | 接口描述 |
|---|---|
| /PlantResults/list | 植株识别结果分页列表：展示识别类别、置信度、时间与图片链接等。 |
| /PlantResults/getMultipleDiseaseRecords | 获取多种病害的植株检测记录（可按生育期筛选），支持看板图表展示。 |
| /PlantResults/getSuHuiMingDetectionRecords | 获取粟灰螟的专项检测记录，便于监测重点虫害。 |
| /PlantResults/export | 导出识别结果为 Excel，支撑线下复核与分析。 |
| /PlantResults/{id} | 获取单条识别结果详情，包含图片及识别明细。 |
| /PlantResults | 新增或修改识别结果记录（一般由识别流程自动写入，亦支持人工修订）。 |
| /PlantResults/{ids} | 批量删除识别结果。 |
| /PlantResults/getBackPestInfo | 获取后台展示所需的虫害概览信息（趋势、占比等聚合指标）。 |

## GuziEmergenceHistory（/emergenceHistory）
| 接口名称 | 接口描述 |
|---|---|
| /emergenceHistory/list | 出苗率历史记录分页查询，支持多条件筛选与排序。 |
| /emergenceHistory/export | 导出出苗率历史记录为 Excel，用于留存与对比分析。 |
| /emergenceHistory/{id} | 查询指定出苗率历史记录详情，查看检测时间、出苗率等级与结果图片。 |
| /emergenceHistory | 新增或修改出苗率历史记录。 |
| /emergenceHistory/{ids} | 批量删除出苗率历史记录。 |
| /emergenceHistory/avginfo | 获取后台出苗率平均信息与统计概览，用于大屏展示。 |
| /emergenceHistory/Pdf/{id} | 生成并下载指定记录的出苗率 PDF 报告（含图文、等级与管理建议）。 |
| /emergenceHistory/report | 依据请求体直接生成并下载出苗率报告，便于快速出具成果文档。 |
| /emergenceHistory/deskEmergenceData | 返回大屏需要的出苗率卡片数据（等级、地块、图片与日期等）。 |

## LandChangeAnalysis（/changeAnalysis）
| 接口名称 | 接口描述 |
|---|---|
| /changeAnalysis/list | 土地变化分析分页查询，呈现地块时序变化与面积变动等结果。 |
| /changeAnalysis/export | 导出土地变化分析清单为 Excel。 |
| /changeAnalysis/{id} | 查询单条土地变化分析详情。 |
| /changeAnalysis | 新增或修改土地变化分析结果记录。 |
| /changeAnalysis/{ids} | 批量删除土地变化分析记录。 |

## RemoteSenseProxy（/proxy）
| 接口名称 | 接口描述 |
|---|---|
| /proxy/remote-sense/list | 查询并转发遥感采集数据，支持按基地/地块与时间区间过滤，聚合返回用于业务查询或可视化。 |

## SowingPredict（/predict）
| 接口名称 | 接口描述 |
|---|---|
| /predict/list | 播种计划分页列表（信息整合版），展示基地、品种、预测播种区间等要素。 |
| /predict/export | 导出播种计划为 Excel，便于任务下发与归档。 |
| /predict/{id} | 查看单条播种计划详情。 |
| /predict | 新增或修改播种计划记录。 |
| /predict/{ids} | 批量删除播种计划。 |

## SowingRecord（/record）
| 接口名称 | 接口描述 |
|---|---|
| /record/list | 实际播种记录分页列表：展示基地、品种、播种日期等核心信息。 |
| /record/export | 导出实际播种记录为 Excel。 |
| /record/{id} | 查询单条实际播种记录详情。 |
| /record | 新增或修改实际播种记录。 |
| /record/{ids} | 批量删除实际播种记录。 |
| /record/period | 按基地名查询当前生育期（可带日期），返回阶段名称与天数等。 |
| /record/period/by-id | 按基地ID查询当前生育期（可带日期），便于跨系统以 ID 维度快速查询。 |
| /record/period/all | 查询所有基地在指定日期（默认当天）的生育期，用于大屏总览。 |

## SowingInfo（/sowingInfo）
| 接口名称 | 接口描述 |
|---|---|
| /sowingInfo/getSowingInfo | 按基地 ID 聚合“实际播种记录 + 预测播种区间”，用于比对执行达成与计划合理性。 |

## SeedingHistory（/seeding）
| 接口名称 | 接口描述 |
|---|---|
| /seeding | 出苗率检测历史记录的新增与修改：存档检测结果用于纵向对比。 |
| /seeding/{id} | 查询或删除单条出苗率历史记录。 |
| /seeding/list | 条件查询出苗率历史记录列表，支持按基地/地块与时间过滤。 |
| /seeding/batch | 批量删除出苗率历史记录，便于成批清理。 |

---

覆盖确认：
- 已扫描全部控制器并收录未注释端点；同一路径的不同方法在本表合并为单条说明。
- 源码中被注释的历史端点未纳入清单；新增端点请同步更新本文件。
