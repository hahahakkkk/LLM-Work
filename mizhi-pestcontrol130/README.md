# 米脂病虫害识别子系统（mizhi-pestcontrol）完整说明

## 子系统概述
- 目标：提供病虫害识别（植株/区域）、地块变更分析、播种计划与实际记录、出苗率统计等核心能力，支撑农业种植智能化场景。
- 类型：Spring Boot 微服务（Java 17），继承父工程 `mizhi-cloud-plus`，与同仓库其他子系统协作。
- 角色：对前端与内部系统暴露 REST 接口；调用“专家知识库服务”获取策略；通过 Dubbo/Feign 与外部/兄弟服务集成。

## 技术架构
- 框架：Spring Boot、Spring Cloud OpenFeign、Spring Cloud LoadBalancer。
- 数据访问：MyBatis + XML 映射，`@MapperScan`；开启驼峰映射（`mapUnderscoreToCamelCase`）。
- 配置与注册：Nacos（`mizhi-common-nacos` 与父工程Profile管理）。
- 鉴权与会话：Sa-Token（`sa-token-spring-boot3-starter`），`FeignAuthInterceptor` 透传 `Authorization` 与 `clientid`。
- 工具库：EasyExcel（导出）、OpenPDF（报告生成）、Gson/Fastjson2（JSON）、Apache HttpClient（外部HTTP请求）。
- 监控与日志：`logback-plus.xml`，`mizhi-common-log` 规范化审计日志（`@Log` 注解）。

## 目录结构与模块划分
```text
src/main/java/cn/edu/nwafu/mizhipestcontrol
├─ MizhiPestcontrolApplication.java          # 应用入口
├─ controller/                               # 接口层（REST）
├─ service/                                  # 业务接口 + 实现（impl/、impl/externalApi）
├─ mapper/                                   # MyBatis 映射接口
├─ domain/                                   # 领域模型（实体、BO/VO、DAO）、VO/BO/DAO
├─ client/                                   # Feign 客户端（调用专家知识库等）
├─ interceptor/                              # Feign 请求拦截（鉴权透传）
├─ config/                                   # MyBatis-Plus、全局配置
├─ component/                                # 业务组件（如临时文件缓存、图片监控）
└─ utils/                                    # 工具类（图像存储/识别调用等）

src/main/resources
├─ application.yml                           # 应用与Nacos占位配置
├─ logback-plus.xml                          # 日志配置
├─ fronts/                                   # OpenPDF 字体等静态资源
├─ example_images/                           # 示例图片
└─ mapper/mizhipestcontrol/*.xml             # MyBatis XML 映射
```

## 接口清单（按控制器分组）
以下为主要接口摘要，参数、返回体采用统一响应包装 `R<T>`，分页采用 `TableDataInfo<T>`。

1) Farmland（地块与区域汇总） – `/farmland`
- GET `/fetchStatistics`：数据概览（统计）
- POST `/`：新增区域信息（通过检测后入库）
- GET `/list`：分页查询区域信息
- POST `/export`：导出区域信息 Excel
- GET `/{farmlandId}`：详情
- PUT `/`：修改
- DELETE `/{farmlandIds}`：删除
- GET `/test`：对外接口演示（返回病虫害信息列表）

2) Pest Area Detection（病害区域检测记录） – `/areaDetection`
- GET `/list`：分页查询检测记录
- POST `/export`：导出检测记录 Excel
- GET `/{id}`：详情
- POST `/`：新增
- PUT `/`：修改
- DELETE `/{ids}`：删除
- GET `/getDeskINfo`：后台卡片展示数据（聚合）
- GET `/BackDiseaseAreaStaticVo`：后台统计卡片
- GET `/report/{id}`：生成并下载病害区域检测 PDF 报告（OpenPDF 流式输出）

3) Identify（识别与任务编排） – `/identify`
- POST `/areaDetect`：病虫害区域检测V1（多光谱/可见光双输入）
- POST `/rgb`：植株虫害识别（图片列表）
- POST `/diseaseId`：植株病害识别（图片列表）
- POST `/pestId`：植株虫害识别（同 `/rgb` 功能一致）
- POST `/wh`：生育阶段识别（图片列表）
- POST `/er`：出苗率（图片URL列表）
- POST `/st`：播种期识别与推荐（JSON 请求）
- GET `/warn`：病虫害预警（按部门维度）
- POST `/pestArea/submit`：提交病害区域检测异步任务
- GET `/pestArea/task/{taskId}`：查询异步任务状态与结果
- POST `/stinfo`：获取最佳播种期依据图（温度/墒情两个图）

4) Plant（病虫害植株） – `/plant`
- POST `/`：新增
- GET `/list`：分页
- POST `/export`：导出 Excel
- GET `/{id}`：详情
- PUT `/`：修改
- DELETE `/{ids}`：删除

5) PlantResults（植株识别结果） – `/PlantResults`
- GET `/list`：分页
- GET `/getMultipleDiseaseRecords`：多病害检测记录（可选生育期过滤）
- GET `/getSuHuiMingDetectionRecords`：粟灰螟检测记录
- POST `/export`：导出 Excel
- GET `/{id}`：详情
- POST `/`、PUT `/`、DELETE `/{ids}`：增改删
- GET `/getBackPestInfo`：后台展示信息聚合

6) GuziEmergenceHistory（谷子出苗率历史） – `/emergenceHistory`
- GET `/list`：分页
- POST `/export`：导出 Excel
- GET `/{id}`：详情
- POST `/`、PUT `/`、DELETE `/{ids}`：增改删
- GET `/avginfo`：后台出苗率平均信息
- GET `/Pdf/{id}`：按记录生成出苗率 PDF 报告（流式输出）
- POST `/report`：入参即数据，直接生成并下载 PDF 报告

7) LandChangeAnalysis（土地变化分析） – `/changeAnalysis`
- GET `/list`、POST `/export`、GET `/{id}`、POST `/`、PUT `/`、DELETE `/{ids}`

8) RemoteSenseProxy（遥感数据代理） – `/proxy`
- GET `/remote-sense/list`：转发/聚合遥感采集数据（Dubbo：`RpcRemoteSenseService`）

9) SowingPredict（基地播种计划） – `/predict`
- GET `/list`：分页（含扩展信息 VO）
- POST `/export`：导出 Excel
- GET `/{id}`、POST `/`、PUT `/`、DELETE `/{ids}`

10) SowingRecord（实际播种记录与生育期） – `/record`
- GET `/list`、POST `/export`、GET `/{id}`、POST `/`、PUT `/`、DELETE `/{ids}`
- GET `/period`：按基地名查询当前生育期（可带日期）
- GET `/period/by-id`：按基地ID查询当前生育期（可带日期）
- GET `/period/all`：查询所有基地当前生育期（可带日期）

11) SowingInfo（播种信息聚合） – `/sowingInfo`
- POST `/getSowingInfo`：按 baseId 返回“实际播种记录 + 预测播种区间”的聚合视图

## 业务层与职责
- `IIdentifyService` 与 `IdentifyServiceImpl`：
	- 统一编排识别流程：模型选择（默认/指定）、图像上传与处理（`ImagesIdentifyUtil`）、MINIO 上传与监控（`ImagesStorageUtil` + `ImageMonitorService`）。
	- 通过 `PestscienceClient` 调用“专家知识库服务”，将 `pestJson` 转换为“防治策略”集合并回填。
	- 病害区域检测异步任务：并发名额限制、任务元数据与过期清理（定时任务）。
- `IPdfReportService` 与实现：
	- 基于 OpenPDF 构建中文 PDF 报告（引入 `fronts/NotoSerifSC-VariableFont_wght.ttf` 字体）。
	- 支持出苗率报告、病害区域检测报告生成；控制器采用流式下载（`Content-Disposition` UTF-8 兼容）。
- `impl/externalApi/*`：
	- `GrowStageImpl`（Dubbo）：按基地ID/日期推算生育阶段；提供“全基地生育期”聚合。
	- `PestInfoImpl`（Dubbo）：输出病虫害地块数据（供外部系统消费）。
	- `SeedingInfoImpl`：苗情外部数据适配（若启用）。

## 领域模型（核心一览）
- 实体：`Farmland`（地块/区域）、`PestAreaDetection`（区域检测记录）、`Plant`/`PlantResults`（植株与识别结果）、`IdentifyModel`（模型元数据）、`GuziEmergenceHistory`（出苗率历史）、`SeedingHistory`（出苗率检测历史）、`SowingPredict`（播种计划）、`SowingRecord`（实际播种记录）、`LandChangeAnalysis`（地块变化）。
- VO/BO/DAO：
	- `vo/*` 面向前端展示，如 `StatisticsDataVO`、`DeskDiseaseAreaVo`、`PestAreaTaskVo`、`BestSowingVo`、`StInfoVo` 等。
	- `bo/*` 面向业务入参与查询，如 `FarmlandBo`、`PestAreaDetectionBo`、`Sowing*Bo` 等。
	- `dao/*` 数据访问辅助对象，如 `FarmlandDao`。

## 数据访问与映射
- Mapper 接口：`mapper/*Mapper.java` 与 XML：`resources/mapper/mizhipestcontrol/*.xml` 成对维护。
- MyBatis-Plus 配置：`config/MybatisPlusConfig.java` 开启数据库下划线到 Java 驼峰自动映射。
- 导出：统一使用 `ExcelUtil.exportExcel` 输出列表数据。

## 外部集成
- 专家知识库服务：`client/PestscienceClient` 通过网关 `mizhi-gateway` 调用 `/pestscience/classify/getStrategy`，参数 `pestJson`。
- Dubbo：
	- `@DubboReference RpcRemoteSenseService`：遥感数据查询（RemoteSenseProxy）。
	- `@DubboService GrowStageImpl`、`PestInfoImpl`：对外暴露生育期/病虫害数据能力。
- 认证透传：`interceptor/FeignAuthInterceptor` 从 Sa-Token 中提取 `Authorization: Bearer <token>` 与 `clientid` 头部，确保跨服务鉴权一致性。

## 配置与环境
- `application.yml` 采用 Maven 占位符，由 Profile 注入：
	- `spring.profiles.active = @profiles.active@`
	- Nacos：`@nacos.server@`、`@nacos.username@`、`@nacos.password@`、`@nacos.discovery.group@`、`@nacos.config.group@`。
	- 通过 `spring.config.import` 引入远程配置：`application-common.yml`、`datasource.yml`、`{appName}.yml`。
- 端口：`server.port: 9808`。
- 临时文件/图片监控：`temp.image.expire-seconds` 控制图片监控有效期（默认 20 分钟）。

## 构建与运行
本服务继承父工程 Profile。若父工程已定义 `dev`/`prod` 等环境：

```bash
# 构建
mvn -pl mizhi-pestcontrol -am clean package -DskipTests

# 运行（示例：使用 dev 配置）
java -jar target/mizhi-pestcontrol-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

依赖 Nacos、网关与兄弟服务正常可用（pestscience、外部 Dubbo 服务等）。

## 安全与权限
- 接口默认基于 Sa-Token 体系；部分 `@SaCheckPermission` 已留位（视部署策略启用）。
- Feign 调用自动携带登录上下文令牌与 `clientid`，下游可感知调用主体。

## 可观测性与导出
- 日志：统一 `logback-plus.xml`；业务操作使用 `@Log` 标注导出/新增/修改/删除。
- 导出：各资源 `POST /export` 导出 Excel。
- 报告：PDF 按 ID 或请求体直接生成，采用流式输出，文件名 UTF-8 兼容（`filename*=`）。

## 错误处理与返回约定
- 统一返回包装：`R<T>`，包含 `code`、`msg`、`data`。
- 分页包装：`TableDataInfo<T>`，包含 `rows`、`total`、分页参数。
- 常见错误：模型地址未配置、外部HTTP调用失败、图片上传异常、任务名额占满/过期等，均通过 `R.fail()` 统一返回。

## 典型数据流
1) 植株识别（虫害/病害）：
	 - 前端上传图片至 `/identify/pestId|diseaseId|rgb`。
	 - 服务选择模型（默认/指定）、调用识别接口，将结果图片与原图上传存储并监控，查询专家知识库策略，返回结构化识别结果。
2) 区域检测（异步）：
	 - 前端调用 `/identify/pestArea/submit` 提交任务，后台控制并发名额并记录任务元数据，周期清理过期任务。
	 - 前端通过 `/identify/pestArea/task/{taskId}` 轮询查看状态与结果，结果入库后可由 `/areaDetection/*` 查询与生成报告。
3) 播种信息聚合：
	 - `/sowingInfo/getSowingInfo` 基于 baseId 聚合“实际播种记录 + 预测播种区间”，并回传给前端。

## 扩展建议
- 模型治理：将模型元数据（类型、默认标记、URL）统一维护于 `IdentifyModel`，通过接口筛选默认/可用模型，避免魔法常量。
- 任务队列化：区域检测异步任务可结合消息队列/任务中心，提升可扩展性与容错。
- 契约统一：对外 Dubbo 与 Feign 契约应在 `external-interface/api` 或独立契约包集中维护，便于多服务共享与演进。
- 配置治理：Nacos 中拆分公共/数据源/应用级配置，严格区分环境变量与密钥，禁止硬编码敏感信息。

## 关键依赖（节选）
- Spring Boot、Spring Cloud OpenFeign、Sa-Token、MyBatis-Plus
- `mizhi-common-*`（log、nacos、web、mybatis、security、tenant、idempotent、excel、translation、doc、oss）
- EasyExcel 3.3.4、OpenPDF 1.3.30、Apache HttpClient 4.5.8、commons-io 2.11.0

—— 本文档覆盖结构、功能、接口、配置与运行的完整说明，便于研发、测试与运维协同。
