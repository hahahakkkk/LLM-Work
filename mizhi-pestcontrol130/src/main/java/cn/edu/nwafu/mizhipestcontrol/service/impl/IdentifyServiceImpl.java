package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.mizhipestcontrol.client.PestscienceClient;
import cn.edu.nwafu.mizhipestcontrol.domain.*;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.AreaDetectRequestBo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PestAreaDetectResultBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyResultVO;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaTaskVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WarnVO;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BestSowingVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WhiteheadDetectVo;
import cn.edu.nwafu.mizhipestcontrol.mapper.FarmlandMapper;
import cn.edu.nwafu.mizhipestcontrol.mapper.IdentifyModelMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IIdentifyService;
import cn.edu.nwafu.mizhipestcontrol.service.ImageMonitorService;
import cn.edu.nwafu.mizhipestcontrol.utils.ImagesIdentifyUtil;
import cn.edu.nwafu.mizhipestcontrol.utils.ImagesStorageUtil;
import cn.edu.nwafu.mizhipestcontrol.utils.JsonUtils;
import cn.edu.nwafu.mizhipestcontrol.utils.PestAreaConclusionUtil;
import cn.edu.nwafu.mizhipestcontrol.utils.PestAreaMeasureUtil;
import com.alibaba.fastjson2.JSONObject;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RequiredArgsConstructor
@Service
public class IdentifyServiceImpl implements IIdentifyService {
    @Autowired
    private PestscienceClient pestscienceClient;
    // 注入mapper
    private final FarmlandMapper farmlandMapper;
    // 新增注入模型Mapper
    private final IdentifyModelMapper identifyModelMapper;
    // 新增注入监控服务
    private final ImageMonitorService imageMonitorService;

    // 并发控制任务 数量，限制
    private static final int MAX_CONCURRENT_TASKS = 2;

    // 存储正在运行的任务（key: taskId, value: 提交时间 or 任意标记）
    private final Map<String, Long> runningTasks = new ConcurrentHashMap<>();

    // 存储任务元数据（key: taskId, value: 任务元信息）
    private final Map<String, TaskMetadata> taskMetadataMap = new ConcurrentHashMap<>();


    // 🌟 添加品种名称到代码的映射方法
    private String mapVarietyNameToCode(String varietyName) {
        // 在这里定义你的品种名称到代码的映射关系
        Map<String, String> varietyMapping = new HashMap<>();
        varietyMapping.put("米谷一号", "A");
        varietyMapping.put("米谷二号", "B");
        varietyMapping.put("晋谷21号", "C");
        // 可以根据实际需求添加更多映射

        return varietyMapping.getOrDefault(varietyName, varietyName);
    }

    /**
     * 任务元数据内部类
     */
    private static class TaskMetadata {
        String baseName;
        String plotName;
        String rgbUrl;
        String tifUrl;
        long createTime;
        
        TaskMetadata(String baseName, String plotName, String rgbUrl, String tifUrl) {
            this.baseName = baseName;
            this.plotName = plotName;
            this.rgbUrl = rgbUrl;
            this.tifUrl = tifUrl;
            this.createTime = System.currentTimeMillis();
        }
    }

    // 任务名额过期时间 (ms)，超过该时长的占位/任务会被视为过期并自动释放。可按需调整。
    private static final long TASK_EXPIRY_MS = 30 * 60 * 1000L; // 30 分钟

    // 用于定期清理过期名额的调度器
    private final ScheduledExecutorService slotCleaner = Executors.newSingleThreadScheduledExecutor();


    private static final Logger log = LoggerFactory.getLogger(IdentifyServiceImpl.class);

    @PostConstruct
    private void startSlotCleaner() {
        // 每 1 分钟运行一次清理任务
        slotCleaner.scheduleAtFixedRate(this::cleanupExpiredEntries, 1, 1, TimeUnit.MINUTES);
        log.info("启动任务名额清理器: 每 {} 秒检查一次过期名额", 60);
    }

    @PreDestroy
    private void stopSlotCleaner() {
        try {
            slotCleaner.shutdownNow();
        } catch (Exception e) {
            log.warn("停止任务名额清理器时发生异常", e);
        }
    }

    /**
     * 清理运行队列中已经超时的占位或任务，避免长期占用名额。
     */
    private void cleanupExpiredEntries() {
        long now = System.currentTimeMillis();
        List<String> toRemove = new ArrayList<>();
        Map<String, Long> expiredMap = new HashMap<>();
        synchronized (runningTasks) {
            for (Map.Entry<String, Long> e : runningTasks.entrySet()) {
                if (now - e.getValue() > TASK_EXPIRY_MS) {
                    toRemove.add(e.getKey());
                    expiredMap.put(e.getKey(), e.getValue());
                }
            }
            for (String k : toRemove) {
                runningTasks.remove(k);
                taskMetadataMap.remove(k); // 同时清理元数据
                long ts = expiredMap.getOrDefault(k, 0L);
                log.info("清理过期任务名额：taskId={}, ageMs={}", k, now - ts);
            }
        }
    }

    /**
     * 获取最佳播种期依据图（调用 Flask /getYiju，返回两个图的 URL）
     */
    @Override
    public R<cn.edu.nwafu.mizhipestcontrol.domain.vo.StInfoVo> getStinfo(Map<String, Object> requestData) {
        String variety = (requestData != null) ? String.valueOf(requestData.get("variety")) : null;
        String area = (requestData != null) ? String.valueOf(requestData.get("variety_area")) : null;
        if (StringUtils.isBlank(variety) || StringUtils.isBlank(area)) {
            return R.fail("请提供品种 variety 与 基地 variety_area");
        }

        String mappedVariety = mapVarietyNameToCode(variety);
        log.info("品种名称映射: {} -> {}", variety, mappedVariety);

        String endpoint = "http://172.29.1.19:25566/getYiju";
        org.apache.http.impl.client.CloseableHttpClient httpClient = org.apache.http.impl.client.HttpClients.createDefault();
        org.apache.http.client.methods.HttpPost post = new org.apache.http.client.methods.HttpPost(endpoint);
        post.setHeader("Content-Type", "application/json;charset=UTF-8");
        com.alibaba.fastjson2.JSONObject body = new com.alibaba.fastjson2.JSONObject();
//        body.put("variety", variety); // 原来为映射的品种信息
        body.put("variety", mappedVariety);
        body.put("variety_area", area);
        org.apache.http.entity.StringEntity entity = new org.apache.http.entity.StringEntity(body.toJSONString(), StandardCharsets.UTF_8);
        post.setEntity(entity);

        // 临时目录用于解压
        java.io.File tempDir = new java.io.File(System.getProperty("java.io.tmpdir"), "stinfo_" + UUID.randomUUID());
        if (!tempDir.exists()) tempDir.mkdirs();

        try (org.apache.http.client.methods.CloseableHttpResponse resp = httpClient.execute(post)) {
            int code = resp.getStatusLine().getStatusCode();
            if (code != 200) {
                return R.fail("模型接口返回状态码:" + code);
            }
            org.apache.http.HttpEntity respEntity = resp.getEntity();
            if (respEntity == null) {
                return R.fail("模型接口返回为空");
            }
            String ct = respEntity.getContentType() != null ? respEntity.getContentType().getValue() : "";
            if (!ct.contains("application/zip") && !ct.contains("application/octet-stream")) {
                return R.fail("模型返回的不是zip数据，Content-Type=" + ct);
            }

            try (InputStream in = respEntity.getContent()) {
                unzipStream(in, tempDir);
            }

            // 查找两张图
            java.io.File tempBar = new java.io.File(tempDir, "temp_bar_15.png");
            java.io.File moistBar = new java.io.File(tempDir, "moist_bar.png");

            String tempUrl = null;
            String moistUrl = null;
            if (tempBar.exists()) {
                tempUrl = ImagesStorageUtil.uploadFile(tempBar);
            }
            if (moistBar.exists()) {
                moistUrl = ImagesStorageUtil.uploadFile(moistBar);
            }

            List<String> urls = new ArrayList<>();
            if (StringUtils.isNotBlank(tempUrl)) urls.add(tempUrl);
            if (StringUtils.isNotBlank(moistUrl)) urls.add(moistUrl);
            if (!urls.isEmpty()) {
                imageMonitorService.monitorImages(urls);
            }

            cn.edu.nwafu.mizhipestcontrol.domain.vo.StInfoVo vo =
                cn.edu.nwafu.mizhipestcontrol.domain.vo.StInfoVo.builder()
                    .tempBarUrl(tempUrl)
                    .moistBarUrl(moistUrl)
                    .message("OK")
                    .build();
            return R.ok(vo);
        } catch (Exception e) {
            log.error("获取最佳播种期依据图失败", e);
            return R.fail("获取依据图失败: " + e.getMessage());
        } finally {
            // 清理临时目录
            try { deleteDirQuietly(tempDir); } catch (Exception ignore) {}
            try { httpClient.close(); } catch (IOException ignore) {}
        }
    }

    private void unzipStream(InputStream inputStream, java.io.File outputDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(inputStream)) {
            ZipEntry entry;
            byte[] buffer = new byte[8192];
            while ((entry = zis.getNextEntry()) != null) {
                java.io.File newFile = new java.io.File(outputDir, entry.getName());
                if (entry.isDirectory()) {
                    newFile.mkdirs();
                } else {
                    java.io.File parent = newFile.getParentFile();
                    if (!parent.exists()) parent.mkdirs();
                    try (java.io.FileOutputStream fos = new java.io.FileOutputStream(newFile)) {
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }
    }

    private void deleteDirQuietly(java.io.File dir) {
        if (dir == null || !dir.exists()) return;
        java.io.File[] files = dir.listFiles();
        if (files != null) {
            for (java.io.File f : files) {
                if (f.isDirectory()) deleteDirQuietly(f);
                else try { f.delete(); } catch (Exception ignore) {}
            }
        }
        try { dir.delete(); } catch (Exception ignore) {}
    }


    /**
     * 1. 病虫害区域检测 V1
     */
    @Override
    public R<IdentifyResultVO> areaDetect(Long modelId, List<MultipartFile> multi, List<MultipartFile> rgb) {
        // 0.图像校验
        //if (!ImagesValidatorUtil.validateImages(multi, rgb)) {
        //    return R.fail("文件校验失败");
        //}
        //log.info("图像校验通过");

        // 1.如果modelId为空，则查询当前数据库中model_type为"病虫害区域检测模型"，并且is_default字段为1的记录的model_url
        String modelUrl = null;
        if (modelId == null){
            modelUrl = identifyModelMapper.selectDefaultIAreaModelUrl();
            System.out.println("未接收到modelId，使用默认病虫害识别模型！");
        }else {
            // 1. 查询modelId对应的模型表中的model_url字段
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            System.out.println("病虫害识别模型地址：" + modelUrl);
        }

        // 2.上传模型
        try {
            // 3. 将原始图像上传到模型进行处理，接收模型返回的结果：原始图像、检测图像、病虫害类型
            ModelResult modelResult = ImagesIdentifyUtil.sendImages(modelUrl, multi, rgb);

            // 4.上传MINIO、查询专家知识库
            // 4.1 获取地址
            List<String> urls = new ArrayList<>();
            String originalImageUrl = ImagesStorageUtil.uploadFile(modelResult.getOriginalImage());
            String processedImageUrl = ImagesStorageUtil.uploadFile(modelResult.getProcessedImage());
            String levelImageUrl = ImagesStorageUtil.uploadFile(modelResult.getLevelImage());
            urls.add(originalImageUrl);
            urls.add(processedImageUrl);
            urls.add(levelImageUrl);
            imageMonitorService.monitorImages(urls);
            log.info("添加图像监控成功！");

            // 4.1 获取防治策略
            List<AllStrategy> allStrategies = callPestScience(modelResult.getPestJson());

            // 4.2 构建返回结果实体
            IdentifyResultVO identifyResultVO = IdentifyResultVO.builder()
                    .originImageUrl(originalImageUrl)
                    .processedImageUrl(processedImageUrl)
                    .levelImageUrl(levelImageUrl)
                    .pestTactics(allStrategies)
                    .build();

            // 6.返回结果
            System.out.println(identifyResultVO);
            return R.ok(identifyResultVO);
        } catch (IOException e) {
            e.printStackTrace();
            return R.fail("服务器错误");
        }
    }


    /**
     * 2. 病虫害识别
     * 修改 分成病害和虫害识别两个服务
     */
//    @Override
//    public R<List<RgbResult>> identifyRgb(Long modelId, List<MultipartFile> images) {
//        // 1.如果modelId为空，则查询当前数据库中model_type为"病虫害识别模型"，并且is_default字段为1的记录的model_url
//        String modelUrl = null;
//        if (modelId == null){
//            modelUrl = identifyModelMapper.selectDefaultIdentifyModelUrl();
//            System.out.println("未接收到modelId，使用默认病虫害识别模型！");
//        }else {
//            // 1. 查询modelId对应的模型表中的model_url字段
//            IdentifyModel model = identifyModelMapper.selectById(modelId);
//            if (model == null) {
//                return R.fail("未找到对应模型配置");
//            }
//             modelUrl = model.getModelUrl();
//            if (StringUtils.isBlank(modelUrl)) {
//                return R.fail("模型地址配置不完整");
//            }
//            System.out.println("病虫害识别模型地址：" + modelUrl);
//        }
//
//
//
//        // 2.上传模型
//        List<RgbResult> rgbResults = new ArrayList<>();
//        try {
//            rgbResults = ImagesIdentifyUtil.sendRgb(modelUrl, images);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//
//        System.out.println(rgbResults);
//
//        // 3.遍历rgbResults，把其中的imageUrl添加到文件监控
//        if (!CollectionUtils.isEmpty(rgbResults)) {
//            // 提取所有 imageUrl
//            List<String> imageUrls = rgbResults.stream()
//                    .map(RgbResult::getImageUrl)
//                    .filter(StringUtils::isNotBlank) // 过滤空URL
//                    .collect(Collectors.toList());
//            // 提交监控
//            imageMonitorService.monitorImages(imageUrls);
//        }
//
//        return R.ok(rgbResults);
//    }

    /**
     * 植株虫害识别服务接口
     */
    @Override
    public R<List<RgbResult>> identifyPest(Long modelId, List<MultipartFile> images) {
        // 1.如果modelId为空，则查询当前数据库中model_type为"病虫害识别模型"，并且is_default字段为1的记录的model_url
        String modelUrl = null;
        if (modelId == null){
            modelUrl = identifyModelMapper.selectDefaultIdentifyPestModelUrl();
            System.out.println("未接收到modelId，使用默认植株尺度虫害识别模型！");
        }else {
            // 1. 查询modelId对应的模型表中的model_url字段
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
             modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            System.out.println("病虫害识别模型地址：" + modelUrl);
        }



        // 2.上传模型
        List<RgbResult> rgbResults = new ArrayList<>();
        try {
            rgbResults = ImagesIdentifyUtil.sendRgb(modelUrl, images);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(rgbResults);

        // 3.遍历rgbResults，把其中的imageUrl添加到文件监控
        if (!CollectionUtils.isEmpty(rgbResults)) {
            // 提取所有 imageUrl
            List<String> imageUrls = rgbResults.stream()
                    .map(RgbResult::getImageUrl)
                    .filter(StringUtils::isNotBlank) // 过滤空URL
                    .collect(Collectors.toList());
            // 提交监控
            imageMonitorService.monitorImages(imageUrls);
        }

        return R.ok(rgbResults);
    }

    /**
     * 谷子植株病害识别服务接口
     */
    @Override
    public R<List<RgbResult>> identifyDisease(Long modelId, List<MultipartFile> images) {
        // 1.如果modelId为空，则查询当前数据库中model_type为"病虫害识别模型"，并且is_default字段为1的记录的model_url
        String modelUrl = null;
        if (modelId == null){
            modelUrl = identifyModelMapper.selectDefaultIdentifyDiseaseModelUrl();
            System.out.println("未接收到modelId，使用默认植株尺度 病害识别模型！");
        }else {
            // 1. 查询modelId对应的模型表中的model_url字段
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            System.out.println("病虫害识别模型地址：" + modelUrl);
        }



        // 2.上传模型
        List<RgbResult> rgbResults = new ArrayList<>();
        try {
            rgbResults = ImagesIdentifyUtil.sendRgb(modelUrl, images);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(rgbResults);

        // 3.遍历rgbResults，把其中的imageUrl添加到文件监控
        if (!CollectionUtils.isEmpty(rgbResults)) {
            // 提取所有 imageUrl
            List<String> imageUrls = rgbResults.stream()
                    .map(RgbResult::getImageUrl)
                    .filter(StringUtils::isNotBlank) // 过滤空URL
                    .collect(Collectors.toList());
            // 提交监控
            imageMonitorService.monitorImages(imageUrls);
        }

        return R.ok(rgbResults);
    }


    @Override
    public R<List<WhResult>> identifyWh(Long modelId, List<MultipartFile> images) {
        // 1.如果modelId为空，则查询当前数据库中model_type为"病虫害识别模型"，并且is_default字段为1的记录的model_url
        String modelUrl = null;
        if (modelId == null){
            modelUrl = identifyModelMapper.selectDefaultIdentifyModelUrl();
            System.out.println("未接收到modelId，使用默认模型！");
        }else {
            // 1. 查询modelId对应的模型表中的model_url字段
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            System.out.println("生育阶段模型地址：" + modelUrl);
        }



        // 2.上传模型
        List<WhResult> whResults = new ArrayList<>();
        try {
            whResults = ImagesIdentifyUtil.sendWh(modelUrl, images);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(whResults);

        // 3.遍历rgbResults，把其中的imageUrl添加到文件监控
        if (!CollectionUtils.isEmpty(whResults)) {
            // 提取所有 imageUrl
            List<String> imageUrls = whResults.stream()
                    .map(WhResult::getImageUrl)
                    .filter(StringUtils::isNotBlank) // 过滤空URL
                    .collect(Collectors.toList());
            // 提交监控
            imageMonitorService.monitorImages(imageUrls);
        }

        return R.ok(whResults);
    }
    @Override
    public R<List<WhResult>> identifyEr(Long modelId, List<String> imageUrls) {
        // 1. 获取模型URL
        String modelUrl = null;
        if (modelId == null) {
            modelUrl = identifyModelMapper.selectDefaultIdentifyModelUrl();
            if (modelUrl == null) {
                return R.fail("未配置默认病虫害识别模型");
            }
            System.out.println("未接收到modelId，使用默认模型！");
        } else {
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            System.out.println("出苗率模型地址：" + modelUrl);
        }

        // 2. 调用模型服务
        try {
            // 将URL列表转换为图片内容列表
            List<MultipartFile> imageFiles = new ArrayList<>();
            for (String imageUrl : imageUrls) {
                MultipartFile file = convertUrlToMultipartFile(imageUrl);
                imageFiles.add(file);
            }
            // 2.上传模型
            List<WhResult> whResults = new ArrayList<>();
            try {
                whResults = ImagesIdentifyUtil.sendEr(modelUrl, imageFiles);
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println(whResults);

            // 3.遍历rgbResults，把其中的imageUrl添加到文件监控
            if (!CollectionUtils.isEmpty(whResults)) {
                // 提取所有 imageUrl
                List<String> imageUrls2 = whResults.stream()
                        .map(WhResult::getImageUrl)
                        .filter(StringUtils::isNotBlank) // 过滤空URL
                        .collect(Collectors.toList());
                // 提交监控
                imageMonitorService.monitorImages(imageUrls2);
                return R.ok(whResults);
            }
        } catch (IOException e) {
            log.error("调用模型服务失败", e);
            return R.fail("模型识别服务调用失败：" + e.getMessage());
        }
        return R.fail("模型识别服务调用失败");
    }
    @Override
    //处理返回JSON的例子
    public R<JSONObject> identifyErs(Long modelId, List<String> imageUrls) {
        // 1. 获取模型URL
        String modelUrl = null;
        if (modelId == null) {
            modelUrl = identifyModelMapper.selectDefaultIdentifyModelUrl();
            if (modelUrl == null) {
                return R.fail("未配置默认病虫害识别模型");
            }
            System.out.println("未接收到modelId，使用默认模型！");
        } else {
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            System.out.println("出苗率模型地址：" + modelUrl);
        }

        // 2. 调用模型服务
        try {
            // 将URL列表转换为图片内容列表
            List<MultipartFile> imageFiles = new ArrayList<>();
            for (String imageUrl : imageUrls) {
                MultipartFile file = convertUrlToMultipartFile(imageUrl);
                imageFiles.add(file);
            }

            JSONObject responseJson = ImagesIdentifyUtil.sendErs(modelUrl, imageFiles);
            return R.ok(responseJson); // 假设 R.ok() 接受 JSONObject 参数
        } catch (IOException e) {
            log.error("调用模型服务失败", e);
            return R.fail("模型识别服务调用失败：" + e.getMessage());
        }
    }

    private MultipartFile convertUrlToMultipartFile(String imageUrl) throws IOException {
        // 创建HTTP客户端
        CloseableHttpClient httpClient = HttpClients.createDefault();
        imageUrl = URLDecoder.decode(imageUrl, StandardCharsets.UTF_8);
        System.out.println(imageUrl);
        HttpGet httpGet = new HttpGet(imageUrl);

        try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
            HttpEntity entity = response.getEntity();
            if (entity == null) {
                throw new IOException("从URL获取图片失败：响应为空");
            }

            // 获取图片内容
            byte[] imageBytes = EntityUtils.toByteArray(entity);

            // 从URL中提取文件名和内容类型
            String fileName = extractFileNameFromUrl(imageUrl);
            String contentType = inferContentTypeFromUrl(imageUrl);

            // 创建临时MultipartFile对象
            return new MockMultipartFile(
                    "image",                // 文件参数名
                    fileName,               // 文件名
                    contentType,            // 内容类型
                    imageBytes              // 文件内容
            );
        }
    }

    /**
     * 根据URL推断Content-Type
     */
    private String inferContentTypeFromUrl(String url) {
        if (url.endsWith(".jpg") || url.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (url.endsWith(".png")) {
            return "image/png";
        } else if (url.endsWith(".gif")) {
            return "image/gif";
        } else if (url.endsWith(".webp")) {
            return "image/webp";
        }
        // 默认返回JPEG类型
        return "image/jpeg";
    }

    /**
     * 从URL中提取文件名
     */
    private String extractFileNameFromUrl(String url) {
        try {
            URI uri = new URI(url);
            String path = uri.getPath();
            return path.substring(path.lastIndexOf('/') + 1);
        } catch (Exception e) {
            // 如果提取失败，生成一个随机文件名
            return UUID.randomUUID() + ".jpg";
        }
    }


//    @Override
//    public R<List<WhResult>> identifySt(Long modelId, List<Map<String, Object>> dailyData) {
//        // 1.如果modelId为空，则查询当前数据库中model_type为"病虫害识别模型"，并且is_default字段为1的记录的model_url
//        String modelUrl = null;
//        if (modelId == null){
//            modelUrl = identifyModelMapper.selectDefaultIdentifyModelUrl();
//            System.out.println("未接收到modelId，使用默认模型！");
//        }else {
//            // 1. 查询modelId对应的模型表中的model_url字段
//            IdentifyModel model = identifyModelMapper.selectById(modelId);
//            if (model == null) {
//                return R.fail("未找到对应模型配置");
//            }
//            modelUrl = model.getModelUrl();
//            if (StringUtils.isBlank(modelUrl)) {
//                return R.fail("模型地址配置不完整");
//            }
//            System.out.println("最佳播种期模型地址：" + modelUrl);
//        }
//
//
//
//        // 2.上传模型
//        List<WhResult> whResults = new ArrayList<>();
//        try {
//            whResults = ImagesIdentifyUtil.sendSt(modelUrl, dailyData);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//
//        System.out.println(whResults);
//
//        // 3.遍历rgbResults，把其中的imageUrl添加到文件监控
//        if (!CollectionUtils.isEmpty(whResults)) {
//            // 提取所有 imageUrl
//            List<String> imageUrls = whResults.stream()
//                    .map(WhResult::getImageUrl)
//                    .filter(StringUtils::isNotBlank) // 过滤空URL
//                    .collect(Collectors.toList());
//            // 提交监控
//            imageMonitorService.monitorImages(imageUrls);
//        }
//
//        return R.ok(whResults);
//    }


    //最佳播种期模型
    @Override
    public R<BestSowingVo> identifySt(Long modelId, Map<String, Object> requestData) {
        // 1️⃣ 获取模型地址
        String modelUrl;
        if (modelId == null) {
            modelUrl = identifyModelMapper.selectDefaultSeedingModelUrl();
            log.info("未接收到 modelId，使用默认最佳播种期检测模型！");
        } else {
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("模型地址配置不完整");
            }
            log.info("识别模型地址: {}", modelUrl);
        }

        // 验证模型URL是否为空
        if (StringUtils.isBlank(modelUrl)) {
            log.error("最佳播种期检测模型URL为空");
            return R.fail("未配置最佳播种期检测模型，请联系管理员");
        }

        // 验证请求数据格式
        if (requestData == null || requestData.isEmpty()) {
            log.error("播种期检测请求数据为空");
            return R.fail("播种期检测请求数据不能为空");
        }

        // 添加品种名称映射逻辑
        Map<String, Object> mappedRequestData = new HashMap<>(requestData);
        String variety = (String) requestData.get("variety");
        if (StringUtils.isNotBlank(variety)) {
            String mappedVariety = mapVarietyNameToCode(variety);
            mappedRequestData.put("variety", mappedVariety);
            log.info("品种名称映射: {} -> {}", variety, mappedVariety);
        }


        // 2️⃣ 调用 Flask 服务（使用你的工具类）
        BestSowingVo bestSowingVo;
        try {
            log.info("开始调用最佳播种期检测模型服务，URL: {}", modelUrl);
            log.info("请求数据字段: {}", requestData.keySet());
            log.info("品种信息: {}, 种植区域: {}", requestData.get("variety"), requestData.get("variety_area"));
            log.info("品种信息: {}, 种植区域: {}", mappedRequestData.get("variety"), mappedRequestData.get("variety_area"));
            log.info("发送的数据格式: 完整JSON对象, Content-Type: application/json");
//            bestSowingVo = ImagesIdentifyUtil.sendStForBestSowing(modelUrl, requestData);
            bestSowingVo = ImagesIdentifyUtil.sendStForBestSowing(modelUrl, mappedRequestData);
        } catch (org.apache.http.conn.HttpHostConnectException e) {
            log.error("连接最佳播种期检测模型服务失败，服务地址不可达: {}", modelUrl, e);
            return R.fail("播种期检测服务连接失败，请检查服务是否在端口25566上运行");
        } catch (java.net.ConnectException e) {
            log.error("网络连接超时，无法访问播种期检测模型服务: {}", modelUrl, e);
            return R.fail("播种期检测服务暂时不可用，请检查端口25566是否开放");
        } catch (IOException e) {
            log.error("调用最佳播种期检测模型服务失败: {}", e.getMessage(), e);
            return R.fail("播种期检测服务调用失败，错误信息: " + e.getMessage());
        } catch (Exception e) {
            log.error("播种期检测过程发生未知错误: {}", e.getMessage(), e);
            return R.fail("播种期检测服务异常，请联系技术支持");
        }

        // 3️⃣ 验证返回结果
        if (bestSowingVo == null) {
            log.error("播种期检测服务返回空结果");
            return R.fail("播种期检测服务返回无效结果");
        }

        // 4️⃣ 文件监控（将生成的图片加入监控队列）
        List<String> imageUrls = new ArrayList<>();
        if (StringUtils.isNotBlank(bestSowingVo.getForecastUrl())) {
            imageUrls.add(bestSowingVo.getForecastUrl());
        }
        if (StringUtils.isNotBlank(bestSowingVo.getTrendUrl())) {
            imageUrls.add(bestSowingVo.getTrendUrl());
        }
        if (!imageUrls.isEmpty()) {
            imageMonitorService.monitorImages(imageUrls);
            log.info("添加图像监控成功，共监控 {} 张图片", imageUrls.size());
        }

        log.info("播种期检测完成，品种: {}，地区: {}", bestSowingVo.getVariety(), bestSowingVo.getBaseName());
        return R.ok(bestSowingVo);
    }


    /**
     * 3.病虫害预警
     */
    @Override
    public R<List<WarnVO>> warn(Long deptId) {
        List<Farmland> farmlandList = farmlandMapper.selectWarnRecords(deptId);

        List<WarnVO> resultList = farmlandList.stream().map(farmland -> {
            WarnVO vo = new WarnVO();
            // 基础字段映射
            vo.setFarmlandId(farmland.getFarmlandId());
            vo.setFarmlandName(farmland.getFarmlandName());
            vo.setWarnMessage("当前农田存在"+farmland.getPestTypes()+",请及时治疗");
            vo.setPestTypes(farmland.getPestTypes());
            vo.setVersion(farmland.getVersion());
            vo.setOriginImageUrl(farmland.getOriginImageUrl());
            vo.setProcessedImageUrl(farmland.getProcessedImageUrl());
            vo.setCreateTime(farmland.getCreateTime().toString());

            // 反序列化 pestTactics
            String pestTacticsJson = farmland.getPestTactics();
            if (StringUtils.isBlank(pestTacticsJson)) {
                vo.setResultStrategies(Collections.emptyList());
                return vo;
            }
            try {
                List<AllStrategy> strategies = JsonUtils.parseStrategyList(pestTacticsJson);
                vo.setResultStrategies(strategies);
            } catch (IOException e) {
                log.error("JSON 解析失败 | farmlandId={}, JSON={}", farmland.getFarmlandId(), pestTacticsJson, e);
                vo.setResultStrategies(Collections.emptyList());
            }
            return vo;
        }).collect(Collectors.toList());

        // 统一用 R 包装结果
        return R.ok(resultList);
    }

    /**
     * 调用病虫害科普微服务获取防治策略
     *
     * @param pestJson
     * @return
     */
    public List<AllStrategy> callPestScience(String pestJson) {
        try {
            // 1. 调用 Feign 接口获取原始 JSON 字符串
            String strategyJson = pestscienceClient.getStrategy(pestJson);

            // 2. 手动解析为 List<AllStrategy>
            return JsonUtils.parseStrategyList(strategyJson);
        } catch (IOException e) {
            log.error("防治策略解析失败: {}", e.getMessage());
            throw new RuntimeException("防治策略数据格式错误");
        }
    }

    /**
     * 病害区域检测接口
     *
     *
     */

//    public  R<PestAreaDetection> areaDetect(String Rgburl, String tifurl,Long modelId){
//        String modelUrl;
//
//        // 获取模型地址
//        if(modelId ==null){
//            modelUrl = identifyModelMapper.selectDefaultIAreaModelUrl();
//        }else {
//            IdentifyModel model = identifyModelMapper.selectById(modelId);
//            if (model == null) {
//                return R.fail("未找到对应模型配置");
//            }
//            modelUrl = model.getModelUrl();
//            if (StringUtils.isBlank(modelUrl)) {
//                return R.fail("模型地址配置不完整");
//            }
//            log.info("识别模型地址: {}", modelUrl);
//        }
//        if (StringUtils.isBlank(modelUrl)) {
//            log.error("最佳播种期检测模型URL为空");
//            return R.fail("未配置最佳播种期检测模型，请联系管理员");
//        }
//
//        PestAreaDetection pestAreaDetection = new PestAreaDetection();
//        pestAreaDetection =
//
//
//        return
//    }

    @Override
    public R<PestAreaDetection> PestAreaDetect(String Rgburl, String tifurl, Long modelId,String baseName,String plotName) {
        // 1️⃣ 获取模型地址
        String modelUrl;
        if (modelId == null) {
            modelUrl = identifyModelMapper.selectDefaultIAreaModelUrl();
            log.info("未接收到 modelId，使用默认病害区域检测模型！");
        } else {
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应病害检测模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("病害检测模型地址配置不完整");
            }
            log.info("病害检测模型地址: {}", modelUrl);
        }

        if (StringUtils.isBlank(modelUrl)) {
            log.error("病害区域检测模型URL为空");
            return R.fail("未配置病害区域检测模型，请联系管理员");
        }

        // 2️⃣ 参数校验
        if (StringUtils.isBlank(Rgburl)) {
            return R.fail("RGB图像地址不能为空");
        }
        if (StringUtils.isBlank(tifurl)) {
            return R.fail("TIF图像地址不能为空");
        }

        // 3️⃣ 构建请求对象（用于调用Flask）
        AreaDetectRequestBo request = new AreaDetectRequestBo();
        request.setRgbUrl(Rgburl);
        request.setTifUrl(tifurl);
        request.setModelUrl(modelUrl);

        // 4️⃣ 调用 Flask 服务
        List<PestAreaDetectResultBo> results;
        try {
            log.info("开始调用病害区域检测模型服务，URL: {}", modelUrl);
            log.info("RGB图像: {}, TIF图像: {}", Rgburl, tifurl);
            results = ImagesIdentifyUtil.sendPa(request);
        } catch (org.apache.http.conn.HttpHostConnectException e) {
            log.error("连接病害检测模型服务失败，服务地址不可达: {}", modelUrl, e);
            return R.fail("病害检测服务连接失败，请检查服务是否运行");
        } catch (java.net.ConnectException e) {
            log.error("网络连接超时，无法访问病害检测模型服务: {}", modelUrl, e);
            return R.fail("病害检测服务暂时不可用，请检查网络或服务状态");
        } catch (IOException e) {
            log.error("调用病害检测模型服务失败: {}", e.getMessage(), e);
            return R.fail("病害检测服务调用失败，错误信息: " + e.getMessage());
        } catch (Exception e) {
            log.error("病害检测过程发生未知错误: {}", e.getMessage(), e);
            return R.fail("病害检测服务异常，请联系技术支持");
        }

        if (results.isEmpty()) {
            return R.fail("病害检测服务未返回有效结果");
        }

        PestAreaDetectResultBo detectionResult = results.get(0);

        // 5️⃣ 构建完整的 PestAreaDetection 返回对象
        PestAreaDetection response = new PestAreaDetection();
        // 业务字段（由于未传入，使用默认值或留空）
        response.setBaseName(baseName);
        response.setPlotName(plotName);
        response.setLongitude(null);
        response.setLatitude(null);
        response.setDiseaseType("白发病"); // 默认值
        response.setRgbOriginalImage(Rgburl);
        response.setTifOriginalImage(tifurl);
        response.setRgbResultImage(detectionResult.getResultImgUrl());
        response.setIncidenceRate(detectionResult.getIncidence()); // 注意字段名映射

        // 可选：生成简单描述
        if (detectionResult.getIncidence() != null) {
            response.setDescription(String.format("检测到病害发生率为 %.2f%%", detectionResult.getIncidence()));
        } else {
            response.setDescription("病害检测完成，发生率未知");
        }

        // 6️⃣ 图片监控（结果图）
        if (StringUtils.isNotBlank(response.getRgbResultImage())) {
            imageMonitorService.monitorImages(Collections.singletonList(response.getRgbResultImage()));
        }

        log.info("病害区域检测完成,结果图片: {}", response.getRgbResultImage());
        return R.ok(response);
    }

    @Override
//    public R<WhiteheadDetectVo> detectWhiteheadLevel(Long modelId, String date,
//                                                     Boolean includeTargetDay,
//                                                     Double latitude, Double longitude) {
//        String modelUrl;
//        if (modelId == null) {
//            modelUrl = identifyModelMapper.selectDefaultWhiteheadDetectModelUrl();
//            if (StringUtils.isBlank(modelUrl)) {
//                return R.fail("未配置默认白发病等级检测模型");
//            }
//        } else {
//            IdentifyModel model = identifyModelMapper.selectById(modelId);
//            if (model == null) {
//                return R.fail("未找到对应模型配置");
//            }
//            modelUrl = model.getModelUrl();
//            if (StringUtils.isBlank(modelUrl)) {
//                return R.fail("模型地址配置不完整");
//            }
//        }
//
//        if (StringUtils.isBlank(date)) {
//            return R.fail("缺少参数: date (YYYY-MM-DD)");
//        }
//
//        // 规范化基础地址，确保包含协议与主机，并拼接 /detect
//        String base = modelUrl.trim();
//        if (!base.toLowerCase().startsWith("http://") && !base.toLowerCase().startsWith("https://")) {
//            base = "http://" + base; // 默认 http
//        }
//
//        // 自愈：兼容错误写法 http://IP/25569/detect -> 识别出 path 中的“/端口”，矫正为 :端口
//        try {
//            java.net.URI tmp = new java.net.URI(base);
//            if (tmp.getHost() != null && tmp.getPort() == -1) {
//                String path = tmp.getPath();
//                if (path != null && path.matches("/(\\d+)(/.*)?")) {
//                    String digits = path.replaceFirst("/(\\d+).*$", "$1");
//                    int port = Integer.parseInt(digits);
//                    String remain = path.replaceFirst("/(\\d+)", ""); // 去掉首个/端口
//                    String newPath = (remain == null || remain.isEmpty()) ? "" : remain;
//                    java.net.URI fixed = new java.net.URI(tmp.getScheme(), tmp.getUserInfo(), tmp.getHost(), port, newPath.isEmpty()? null : newPath, tmp.getQuery(), tmp.getFragment());
//                    log.warn("检测到模型URL疑似端口写在路径中，已自动纠正: {} -> {}", base, fixed);
//                    base = fixed.toString();
//                }
//            }
//        } catch (Exception ignore) {}
//
//        String endpoint = base.endsWith("/detect") ? base : (base.endsWith("/") ? base + "detect" : base + "/detect");
//
//        java.net.URI endpointUri;
//        try {
//            endpointUri = new java.net.URI(endpoint);
//        } catch (Exception e) {
//            log.error("白发病模型URL非法: {}", endpoint, e);
//            return R.fail("模型URL非法: " + e.getMessage());
//        }
//        if (endpointUri.getHost() == null || endpointUri.getScheme() == null) {
//            log.error("白发病模型URL缺少主机或协议: {}", endpoint);
//            return R.fail("模型URL配置不正确，需包含协议与主机，例如 http://127.0.0.1:25569");
//        }
//
//        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
//            URIBuilder uriBuilder = new URIBuilder(endpointUri)
//                    .addParameter("date", date)
//                    .addParameter("include_target_day", includeTargetDay != null && includeTargetDay ? "true" : "false");
//            if (latitude != null) uriBuilder.addParameter("latitude", String.valueOf(latitude));
//            if (longitude != null) uriBuilder.addParameter("longitude", String.valueOf(longitude));
//
//                RequestConfig config = RequestConfig.custom()
//                    .setConnectTimeout(30_000)
//                    .setSocketTimeout(30_000)
//                    .setConnectionRequestTimeout(10_000)
//                    .build();
//
//            java.net.URI finalUri = uriBuilder.build();
//            log.info("调用白发病检测模型: {}", finalUri);
//            HttpGet request = new HttpGet(finalUri);
//            request.setConfig(config);
//
//            try (CloseableHttpResponse resp = httpClient.execute(request)) {
//                int code = resp.getStatusLine().getStatusCode();
//                if (code != 200) {
//                    return R.fail("模型接口返回状态码:" + code);
//                }
//                String json = EntityUtils.toString(resp.getEntity(), StandardCharsets.UTF_8);
//                JSONObject obj = JSONObject.parseObject(json);
//                Boolean ok = obj.getBoolean("ok");
//                if (ok == null || !ok) {
//                    String err = obj.getString("error");
//                    return R.fail(StringUtils.isNotBlank(err) ? err : "模型返回失败");
//                }
//
//                WhiteheadDetectVo vo = new WhiteheadDetectVo();
//                vo.setOk(true);
//
//                JSONObject input = obj.getJSONObject("input");
//                if (input != null) {
//                    WhiteheadDetectVo.Input in = new WhiteheadDetectVo.Input();
//                    in.setDate(input.getString("date"));
//                    in.setIncludeTargetDay(Boolean.TRUE.equals(input.getBoolean("include_target_day")));
//                    Double lat = input.getDouble("latitude");
//                    Double lon = input.getDouble("longitude");
//                    in.setLatitude(lat != null ? lat : 0);
//                    in.setLongitude(lon != null ? lon : 0);
//                    vo.setInput(in);
//                }
//
//                JSONObject features = obj.getJSONObject("features");
//                if (features != null) {
//                    WhiteheadDetectVo.Features fea = new WhiteheadDetectVo.Features();
//                    fea.setTMeanAvg7(features.getDoubleValue("t_mean_avg_7"));
//                    fea.setRhMeanAvg7(features.getDoubleValue("rh_mean_avg_7"));
//                    fea.setRainSum7(features.getDoubleValue("rain_sum_7"));
//                    fea.setWindowStart(features.getString("window_start"));
//                    fea.setWindowEnd(features.getString("window_end"));
//                    vo.setFeatures(fea);
//                }
//
//                JSONObject prediction = obj.getJSONObject("prediction");
//                if (prediction != null) {
//                    WhiteheadDetectVo.Prediction pre = new WhiteheadDetectVo.Prediction();
//                    pre.setLevel(prediction.getIntValue("level"));
//                    JSONObject probs = prediction.getJSONObject("probabilities");
//                    if (probs != null) {
//                        Map<String, Double> pm = new HashMap<>();
//                        for (String k : probs.keySet()) {
//                            pm.put(k, probs.getDoubleValue(k));
//                        }
//                        pre.setProbabilities(pm);
//                    }
//                    JSONObject labels = prediction.getJSONObject("label_map");
//                    if (labels != null) {
//                        Map<String, String> lm = new HashMap<>();
//                        for (String k : labels.keySet()) {
//                            lm.put(k, labels.getString(k));
//                        }
//                        pre.setLabelMap(lm);
//                    }
//                    vo.setPrediction(pre);
//                }
//
//                return R.ok(vo);
//            }
//        } catch (Exception e) {
//            log.error("白发病等级检测失败", e);
//            return R.fail("白发病等级检测失败: " + e.getMessage());
//        }
//    }
    public R<WhiteheadDetectVo> detectWhiteheadLevel(String date) {
        if (StringUtils.isBlank(date)) {
            return R.fail("date 不能为空");
        } else {
            String modelUrl = this.identifyModelMapper.selectDefaultWhiteheadDetectModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("未配置白发病等级检测模型，请联系管理员");
            } else {
                try {
                    CloseableHttpClient httpClient = HttpClients.createDefault();

                    R var10;
                    label99: {
                        R var20;
                        try {
                            CloseableHttpResponse response;
                            label101: {
                                URI uri = (new URIBuilder(modelUrl)).setParameter("date", date).build();
                                HttpGet request = new HttpGet(uri);
                                RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(5000).setSocketTimeout(15000).build();
                                request.setConfig(requestConfig);
                                response = httpClient.execute(request);

                                try {
                                    HttpEntity entity = response.getEntity();
                                    String body = entity == null ? null : EntityUtils.toString(entity, StandardCharsets.UTF_8);
                                    if (!StringUtils.isBlank(body)) {
                                        WhiteheadDetectVo vo = new WhiteheadDetectVo();
                                        vo.setOk(true);
                                        vo.setCode(0);
                                        vo.setMsg("success");

                                        try {
                                            JSONObject obj = JSONObject.parseObject(body);
                                            vo.setRaw(obj);
                                        } catch (Exception var14) {
                                            vo.setRaw(Map.of("rawText", body));
                                        }

                                        var20 = R.ok(vo);
                                        break label101;
                                    }

                                    var10 = R.fail("白发病等级检测服务返回空响应");
                                } catch (Throwable var15) {
                                    if (response != null) {
                                        try {
                                            response.close();
                                        } catch (Throwable var13) {
                                            var15.addSuppressed(var13);
                                        }
                                    }

                                    throw var15;
                                }

                                if (response != null) {
                                    response.close();
                                }
                                break label99;
                            }

                            if (response != null) {
                                response.close();
                            }
                        } catch (Throwable var16) {
                            if (httpClient != null) {
                                try {
                                    httpClient.close();
                                } catch (Throwable var12) {
                                    var16.addSuppressed(var12);
                                }
                            }

                            throw var16;
                        }

                        if (httpClient != null) {
                            httpClient.close();
                        }

                        return var20;
                    }

                    if (httpClient != null) {
                        httpClient.close();
                    }

                    return var10;
                } catch (Exception var17) {
                    Exception e = var17;
                    log.error("白发病等级检测失败, date={}, err={}", new Object[]{date, e.getMessage(), e});
                    return R.fail("白发病等级检测失败: " + e.getMessage());
                }
            }
        }
    }

    /**
     * 提交病害区域检测异步任务
     * @param rgbUrl RGB 图片 URL
     * @param tifUrl TIF 图片 URL
     * @param modelId 模型 ID（可为空，使用默认模型）
     * @param baseName 基地名称
     * @param plotName 地块名称
     * @return 包含任务 ID 的响应
     */
    @Override
    public R<cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaSubmitVo> submitPestAreaTask(String rgbUrl, String tifUrl, Long modelId, String baseName, String plotName) {
        // 1️⃣ 获取模型地址
        String modelUrl;
        if (modelId == null) {
            modelUrl = identifyModelMapper.selectDefaultIAreaModelUrl();
            log.info("未接收到 modelId，使用默认病害区域检测模型！");
        } else {
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应病害检测模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("病害检测模型地址配置不完整");
            }
            log.info("病害检测模型地址: {}", modelUrl);
        }

        if (StringUtils.isBlank(modelUrl)) {
            log.error("病害区域检测模型URL为空");
            return R.fail("未配置病害区域检测模型，请联系管理员");
        }

        // 2️⃣ 并发控制：使用占位符先尝试保留一个名额，避免超过 MAX_CONCURRENT_TASKS
        String placeholderId = UUID.randomUUID().toString();
        synchronized (runningTasks) {
            if (runningTasks.size() >= MAX_CONCURRENT_TASKS) {
                log.warn("当前运行任务数 {} 达到上限 {}，拒绝提交新任务", runningTasks.size(), MAX_CONCURRENT_TASKS);
                return R.fail("当前有 " + runningTasks.size() + " 个任务正在运行，请稍后再试");
            }
            runningTasks.put(placeholderId, System.currentTimeMillis());
        }

        // 3️⃣ 调用工具类提交任务（网络请求）
        try {
            String taskId = ImagesIdentifyUtil.submitPestAreaTask(modelUrl, rgbUrl, tifUrl);
            log.info("成功提交病害区域检测任务，任务ID: {}", taskId);

            // 替换占位符为真实 taskId（保证槽位被真实任务占用）
            synchronized (runningTasks) {
                runningTasks.remove(placeholderId);
                runningTasks.put(taskId, System.currentTimeMillis());
            }
            
            // 保存任务元数据
            taskMetadataMap.put(taskId, new TaskMetadata(baseName, plotName, rgbUrl, tifUrl));
            log.info("保存任务元数据: taskId={}, baseName={}, plotName={}, rgbUrl={}, tifUrl={}", taskId, baseName, plotName, rgbUrl, tifUrl);

            // 4️⃣ 构建响应（精简版）
            cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaSubmitVo response = 
                cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaSubmitVo.builder()
                    .taskId(taskId)
                    .message("任务已提交，请通过 /identify/pestArea/task/" + taskId + " 查询状态和进度")
                    .build();

            return R.ok(response);
        } catch (Exception e) {
            // 提交失败：清理占位符并返回错误
            runningTasks.remove(placeholderId);
            log.error("提交病害区域检测任务失败", e);
            return R.fail("提交任务失败: " + e.getMessage());
        }
    }

    /**
     * 查询病害区域检测异步任务状态和结果
     * @param taskId 任务 ID
     * @param modelId 模型 ID（可为空，使用默认模型）
     * @return 任务状态和结果
     */
    @Override
    public R<PestAreaTaskVo> queryPestAreaTask(String taskId, Long modelId) {
        // 1️⃣ 获取模型基础地址
        String modelUrl;
        if (modelId == null) {
            modelUrl = identifyModelMapper.selectDefaultIAreaModelUrl();
            log.info("未接收到 modelId，使用默认病害区域检测模型！");
        } else {
            IdentifyModel model = identifyModelMapper.selectById(modelId);
            if (model == null) {
                return R.fail("未找到对应病害检测模型配置");
            }
            modelUrl = model.getModelUrl();
            if (StringUtils.isBlank(modelUrl)) {
                return R.fail("病害检测模型地址配置不完整");
            }
        }

        if (StringUtils.isBlank(modelUrl)) {
            log.error("病害区域检测模型URL为空");
            return R.fail("未配置病害区域检测模型，请联系管理员");
        }

        try {
            // 2️⃣ 查询任务状态
            JSONObject statusJson = ImagesIdentifyUtil.queryPestAreaTaskStatus(modelUrl, taskId);
            String status = statusJson.getString("status");
            log.info("任务 {} 当前状态: {}", taskId, status);

            // 3️⃣ 根据状态处理
            Integer progress = statusJson.getInteger("progress");
            String message = statusJson.getString("message");
            
            if ("completed".equals(status)) {
                // 任务完成，下载结果
                PestAreaTaskVo result = ImagesIdentifyUtil.downloadPestAreaResult(modelUrl, taskId);

                // 根据发病率生成检测结论
                result.setConclusion(PestAreaConclusionUtil.buildConclusion(result.getIncidence()));
                // 根据发病率生成防治措施
                result.setMeasure(PestAreaMeasureUtil.buildMeasure(result.getIncidence()));
                
                // 填充元数据（baseName 和 plotName）
                TaskMetadata metadata = taskMetadataMap.get(taskId);
                if (metadata != null) {
                    result.setBaseName(metadata.baseName);
                    result.setPlotName(metadata.plotName);
                    result.setRgbUrl(metadata.rgbUrl);
                    result.setTifUrl(metadata.tifUrl);
                    result.setCreateTime(new Date(metadata.createTime));
                } else {
                    result.setCreateTime(new Date());
                }
                
                // 4️⃣ 添加图片监控（结果图片）
                if (StringUtils.isNotBlank(result.getResultImageUrl())) {
                    imageMonitorService.monitorImages(Collections.singletonList(result.getResultImageUrl()));
                    log.info("已将结果图片 {} 加入监控", result.getResultImageUrl());
                }
                // 5️⃣ 任务完成：释放运行中任务名额并清理元数据
                if (runningTasks.containsKey(taskId)) {
                    runningTasks.remove(taskId);
                    taskMetadataMap.remove(taskId);
                    log.info("已释放任务名额并清理元数据，taskId={}", taskId);
                }
                
                log.info("任务 {} 完成，发生率: {}%, 级别: {}", taskId, result.getIncidence(), result.getLevel());
                return R.ok(result);
                
            } else if ("failed".equals(status)) {
                // 任务失败
                String error = statusJson.getString("error");
                TaskMetadata metadata = taskMetadataMap.get(taskId);
                PestAreaTaskVo response = PestAreaTaskVo.builder()
                        .taskId(taskId)
                        .status("failed")
                        .progress(progress != null ? progress : 0)
                        .error(error)
                        .message(message != null ? message : "任务执行失败")
                        .baseName(metadata != null ? metadata.baseName : null)
                        .plotName(metadata != null ? metadata.plotName : null)
                        .rgbUrl(metadata != null ? metadata.rgbUrl : null)
                        .tifUrl(metadata != null ? metadata.tifUrl : null)
                        .createTime(metadata != null ? new Date(metadata.createTime) : new Date())
                        .build();
                // 释放名额并清理元数据（若存在）
                if (runningTasks.containsKey(taskId)) {
                    runningTasks.remove(taskId);
                    taskMetadataMap.remove(taskId);
                    log.info("任务失败，已释放任务名额并清理元数据，taskId={}", taskId);
                }
                log.error("任务 {} 失败: {}", taskId, error);
                return R.ok(response);
                
            } else {
                // 任务进行中（pending 或 running）
                TaskMetadata metadata = taskMetadataMap.get(taskId);
                PestAreaTaskVo response = PestAreaTaskVo.builder()
                        .taskId(taskId)
                        .status(status)
                        .progress(progress != null ? progress : 0)
                        .message(message != null ? message : ("running".equals(status) ? "任务执行中" : "任务等待中"))
                        .baseName(metadata != null ? metadata.baseName : null)
                        .plotName(metadata != null ? metadata.plotName : null)
                        .rgbUrl(metadata != null ? metadata.rgbUrl : null)
                        .tifUrl(metadata != null ? metadata.tifUrl : null)
                        .createTime(metadata != null ? new Date(metadata.createTime) : new Date())
                        .build();
                return R.ok(response);
            }
            
        } catch (Exception e) {
            log.error("查询任务 {} 状态失败", taskId, e);
            return R.fail("查询任务失败: " + e.getMessage());
        }
    }
}
