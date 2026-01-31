package cn.edu.nwafu.mizhipestcontrol.utils;

import cn.edu.nwafu.mizhipestcontrol.domain.*;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.AreaDetectRequestBo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PestAreaDetectResultBo;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.google.gson.*;
import lombok.extern.slf4j.Slf4j;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.entity.StringEntity;
import org.springframework.http.HttpHeaders;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import com.google.gson.JsonArray;
import com.google.gson.JsonParser;


/**
 * author WMX
 * 病虫害识别工具类，上传图像到模型，返回检测后的一组图像
 */
@Slf4j
public class ImagesIdentifyUtil {

    // 本地临时目录 Origin+uuid，Result+uuid
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir");

    /**
     * 1. 病虫害区域检测、接收一组原始图像，返回一组检测后的图像
     */
    public static ModelResult sendImages(String modelUrl, List<MultipartFile> multi, List<MultipartFile> rgb) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String originMultiPath = TEMP_DIR + File.separator + "origin_multi_" + uuid;
        String originRgbPath = TEMP_DIR + File.separator + "origin_rgb_" + uuid;
        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File originMulti = new File(originMultiPath);
        if (!originMulti.exists()) {
            originMulti.mkdirs();
            System.out.println("Created directory: " + originMultiPath);
        }
        File originRgb = new File(originRgbPath);
        if (!originRgb.exists()) {
            originRgb.mkdirs();
            System.out.println("Created directory: " + originRgbPath);
        }
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            System.out.println("Created directory for result: " + resultDirPath);
        }

        // 存储目录，返回结果之前删除临时目录
        RequestContextHolder.setResultDirPath(resultDirPath);

        // 2.保存上传的图像
        saveImages(multi, originMulti);
        saveImages(rgb, originRgb);

        // 3. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        addFilesToRequest(builder, originMulti, "origin_multi");
        addFilesToRequest(builder, originRgb, "origin_rgb");

        // 4. 发出请求，并获取响应结果
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        System.out.println("Sending request to Flask server: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);
        HttpEntity responseEntity = response.getEntity();
        System.out.println("Received response from Flask server.");
        // 删除origin对应的目录
        if (DirectoryDeleteUtil.deleteDirectory(originMultiPath) && DirectoryDeleteUtil.deleteDirectory(originRgbPath)){
            System.out.println("Origin Images Deleted Successfully.");
        }else {
            System.out.println("Origin Images Deleted Failed!");
        }


        // 5. 解压压缩包并保存到本地
        InputStream inputStream = responseEntity.getContent(); // 获取压缩包的输入流
        System.out.println("Unzipping received ZIP file...");
        unzip(inputStream, resultDir.getPath()); // 解压文件


        // 6. 读取并返回所有的处理结果图像
        ModelResult modelResult = new ModelResult();

        File originImage = new File(resultDir, "origin.jpg");
        File processedImage = new File(resultDir, "processed.jpg");
        File levelImage = new File(resultDir, "level.jpg");
        File outputJsonFile = new File(resultDir, "output.json");

        if (originImage.exists() && processedImage.exists()  && levelImage.exists() && outputJsonFile.exists()) {
            try {
                // 读取 JSON 文件内容
                String jsonContent = new String(Files.readAllBytes(outputJsonFile.toPath()));
                JSONArray jsonArray = new JSONArray(jsonContent);

                // 创建 ModelResult 对象并添加到列表
                modelResult.setOriginalImage(originImage);
                modelResult.setProcessedImage(processedImage);
                modelResult.setLevelImage(levelImage);
                modelResult.setPestJson(jsonArray.toString());
            } catch (Exception e) {
                System.out.println("Error reading or parsing output.json in result directory");
                e.printStackTrace();
            }
        } else {
            System.out.println("Warning: Missing expected files in result directory. Required files: origin.jpg, processed.jpg, level.jpg, output.json");
        }

        return modelResult;
    }

    /**
     * 2. 病虫害识别
     */
//    public static List<RgbResult> sendRgb(String modelUrl, List<MultipartFile> images) throws IOException {
//        // 0. 生成UUID
//        String uuid = UUID.randomUUID().toString();
//        System.out.println("Generated UUID: " + uuid);
//
//        // 1. 创建临时目录
//        String originRgbPath = TEMP_DIR + File.separator + "origin_rgb_" + uuid;
//        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
//        File originRgb = new File(originRgbPath);
//        if (!originRgb.exists()) {
//            originRgb.mkdirs();
//            System.out.println("Created directory: " + originRgbPath);
//        }
//        File resultDir = new File(resultDirPath);
//        if (!resultDir.exists()) {
//            resultDir.mkdirs();
//            System.out.println("Created directory for result: " + resultDirPath);
//        }
//
//        // 存储目录，返回结果之前删除临时目录
//        RequestContextHolder.setResultDirPath(resultDirPath);
//
//        // 2.保存上传的图像
//        saveImages(images, originRgb);
//
//        // 3. 构建请求
//        CloseableHttpClient httpClient = HttpClients.createDefault();
//        HttpPost uploadFile = new HttpPost(modelUrl);
//        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
//        addFilesToRequest(builder, originRgb, "images");
//
//        // 4. 发出请求，并获取响应结果
//        HttpEntity multipart = builder.build();
//        uploadFile.setEntity(multipart);
//        System.out.println("Sending request to Flask server: " + modelUrl);
//        CloseableHttpResponse response = httpClient.execute(uploadFile);
//        HttpEntity responseEntity = response.getEntity();
//        System.out.println("Received response from Flask server.");
//        // 删除origin对应的目录
//        if (DirectoryDeleteUtil.deleteDirectory(originRgbPath)){
//            System.out.println("Origin Images Deleted Successfully.");
//        }else {
//            System.out.println("Origin Images Deleted Failed!");
//        }
//
//
//        // 5. 解压压缩包并保存到本地
//        InputStream inputStream = responseEntity.getContent(); // 获取压缩包的输入流
//        System.out.println("Unzipping received ZIP file...");
//        unzip(inputStream, resultDir.getPath()); // 解压文件
//
//
//        // 6. 读取并返回所有的处理结果图像
//        // 读取 types.txt 文件，构建图片名到病虫害类型的映射
//        Map<String, String> pestTypesMap = new HashMap<>();
//        File typesFile = new File(resultDir, "types.txt");
//        if (typesFile.exists()) {
//            try (BufferedReader reader = new BufferedReader(new FileReader(typesFile))) {
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    String[] parts = line.split(" ", 2);
//                    if (parts.length == 2) {
//                        pestTypesMap.put(parts[0], parts[1]);
//                    }
//                }
//            }
//        }
//
//        // 7. 遍历结果目录，构建 RgbResult 列表
//        List<RgbResult> results = new ArrayList<>();
//        File[] resultFiles = resultDir.listFiles();
//        if (resultFiles != null) {
//            for (File file : resultFiles) {
//                if (file.isFile() && !file.getName().equals("types.txt")) {
//                    // 提取图片名（不含扩展名）
//                    String fileName = file.getName();
//                    String imageName = fileName.substring(0, fileName.lastIndexOf('.'));
//
//                    // 获取对应的病虫害类型
//                    String pestTypes = pestTypesMap.getOrDefault(imageName, "未知类型");
//
//                    // 上传图片并构建 RgbResult
//                    try {
//                        String imageUrl = ImagesStorageUtil.uploadFile(file);
//                        RgbResult result = new RgbResult();
//                        result.setImageUrl(imageUrl);
//                        result.setPestTypes(pestTypes);
//                        results.add(result);
//                    } catch (IOException e) {
//                        System.err.println("文件上传失败: " + fileName);
//                    }
//                }
//            }
//        }
//
//        return results;
//    }
    public static List<RgbResult> sendRgb(String modelUrl, List<MultipartFile> images) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String originRgbPath = TEMP_DIR + File.separator + "origin_rgb_" + uuid;
        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File originRgb = new File(originRgbPath);
        if (!originRgb.exists()) {
            originRgb.mkdirs();
            System.out.println("Created directory: " + originRgbPath);
        }
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            System.out.println("Created directory for result: " + resultDirPath);
        }

        RequestContextHolder.setResultDirPath(resultDirPath);

        // 2. 保存上传的图像
        saveImages(images, originRgb);

        // 3. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        addFilesToRequest(builder, originRgb, "images");

        // 4. 发出请求，并获取响应结果
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        System.out.println("Sending request to Flask server: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);
        HttpEntity responseEntity = response.getEntity();
        System.out.println("Received response from Flask server.");

        // 删除 origin 目录
        if (DirectoryDeleteUtil.deleteDirectory(originRgbPath)) {
            System.out.println("Origin Images Deleted Successfully.");
        } else {
            System.out.println("Origin Images Deleted Failed!");
        }

        // 5. 解压压缩包
        InputStream inputStream = responseEntity.getContent();
        System.out.println("Unzipping received ZIP file...");
        unzip(inputStream, resultDir.getPath());

        // 6. 从 result.json 读取检测结果，构建 图片名 -> 病害类型（中文） 映射
        Map<String, String> imageToPestTypes = new HashMap<>();
        File resultJsonFile = new File(resultDir, "result.json");

        if (resultJsonFile.exists()) {
            try (FileReader reader = new FileReader(resultJsonFile)) {
                JsonArray resultsArray = JsonParser.parseReader(reader).getAsJsonArray();

                for (JsonElement elem : resultsArray) {
                    JsonObject item = elem.getAsJsonObject();
                    String imageName = item.get("image").getAsString(); // e.g., "leaf2.jpg"

                    JsonArray detections = item.getAsJsonArray("detections");
                    Set<String> classNames = new LinkedHashSet<>(); // 去重 + 保序

                    for (JsonElement det : detections) {
                        String className = det.getAsJsonObject().get("class").getAsString();
                        classNames.add(className);
                    }

                    // 转为中文，用顿号连接
                    String pestTypes = classNames.stream()
                            .map(DiseaseType::getChinese) // 使用工具类映射
                            .collect(Collectors.joining("、"));

                    imageToPestTypes.put(imageName, pestTypes.isEmpty() ? "未知类型" : pestTypes);
                }
            } catch (Exception e) {
                System.err.println("解析 result.json 失败: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("result.json 不存在！");
        }

        // 7. 遍历结果目录中的图片文件，构建 RgbResult 列表
        List<RgbResult> results = new ArrayList<>();
        File[] resultFiles = resultDir.listFiles();
        if (resultFiles != null) {
            for (File file : resultFiles) {
                String fileName = file.getName();
                // 跳过非图片文件
                if (file.isFile() && !fileName.equals("result.json") && !fileName.equals("types.txt")) {
                    // ✅ 直接使用完整文件名（如 leaf2.jpg）作为 key
                    String pestTypes = imageToPestTypes.getOrDefault(fileName, "未知类型");

                    try {
                        String imageUrl = ImagesStorageUtil.uploadFile(file);
                        RgbResult result = new RgbResult();
                        result.setImageUrl(imageUrl);
                        result.setPestTypes(pestTypes);
                        results.add(result);
                    } catch (IOException e) {
                        System.err.println("文件上传失败: " + fileName);
                    }
                }
            }
        }

        return results;
    }
    public static List<WhResult> sendWh(String modelUrl, List<MultipartFile> images) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String originRgbPath = TEMP_DIR + File.separator + "origin_rgb_" + uuid;
        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File originRgb = new File(originRgbPath);
        if (!originRgb.exists()) {
            originRgb.mkdirs();
            System.out.println("Created directory: " + originRgbPath);
        }
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            System.out.println("Created directory for result: " + resultDirPath);
        }

        // 存储目录，返回结果之前删除临时目录
        RequestContextHolder.setResultDirPath(resultDirPath);

        // 2.保存上传的图像
        saveImages(images, originRgb);

        // 3. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        addFilesToRequest(builder, originRgb, "images");

        // 4. 发出请求，并获取响应结果
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        System.out.println("Sending request to Flask server: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);
        HttpEntity responseEntity = response.getEntity();
        System.out.println("Received response from Flask server.");
        // 删除origin对应的目录
        if (DirectoryDeleteUtil.deleteDirectory(originRgbPath)){
            System.out.println("Origin Images Deleted Successfully.");
        }else {
            System.out.println("Origin Images Deleted Failed!");
        }


        // 5. 解压压缩包并保存到本地
        InputStream inputStream = responseEntity.getContent(); // 获取压缩包的输入流
        System.out.println("Unzipping received ZIP file...");
        unzip(inputStream, resultDir.getPath()); // 解压文件


        // 6. 读取并返回所有的处理结果图像
        // 读取 types.txt 文件，构建图片名到病虫害类型的映射
        Map<String, String> pestTypesMap = new HashMap<>();
        File typesFile = new File(resultDir, "types.txt");
        if (typesFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(typesFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] parts = line.split(" ", 2);
                    if (parts.length == 2) {
                        pestTypesMap.put(parts[0], parts[1]);
                    }
                }
            }
        }

        // 7. 遍历结果目录，构建 RgbResult 列表
        List<WhResult> results = new ArrayList<>();
        File[] resultFiles = resultDir.listFiles();
        if (resultFiles != null) {
            for (File file : resultFiles) {
                if (file.isFile() && !file.getName().equals("types.txt")) {
                    // 提取图片名（不含扩展名）
                    String fileName = file.getName();
//                    String imageName = fileName.substring(0, fileName.lastIndexOf('.'));
//
//                    // 获取对应的病虫害类型
//                    String pestTypes = pestTypesMap.getOrDefault(imageName, "未知类型");

                    // 上传图片并构建 RgbResult
                    try {
                        String imageUrl = ImagesStorageUtil.uploadFile(file);
                        WhResult result = new WhResult();
                        result.setImageUrl(imageUrl);
                        results.add(result);
                    } catch (IOException e) {
                        System.err.println("文件上传失败: " + fileName);
                    }
                }
            }
        }

        return results;
    }
    public static List<WhResult> sendEr(String modelUrl, List<MultipartFile> images) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String originRgbPath = TEMP_DIR + File.separator + "origin_rgb_" + uuid;
        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File originRgb = new File(originRgbPath);
        if (!originRgb.exists()) {
            originRgb.mkdirs();
            System.out.println("Created directory: " + originRgbPath);
        }
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            System.out.println("Created directory for result: " + resultDirPath);
        }

        // 存储目录，返回结果之前删除临时目录
        RequestContextHolder.setResultDirPath(resultDirPath);

        // 2.保存上传的图像
        saveImages(images, originRgb);

        // 3. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        addFilesToRequest(builder, originRgb, "image");

        // 4. 发出请求，并获取响应结果
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        System.out.println("Sending request to Flask server: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);
        HttpEntity responseEntity = response.getEntity();
        System.out.println("Received response from Flask server.");
        // 删除origin对应的目录
        if (DirectoryDeleteUtil.deleteDirectory(originRgbPath)){
            System.out.println("Origin Images Deleted Successfully.");
        }else {
            System.out.println("Origin Images Deleted Failed!");
        }


        // 5. 解压压缩包并保存到本地
        InputStream inputStream = responseEntity.getContent(); // 获取压缩包的输入流
        System.out.println("Unzipping received ZIP file...");
        unzip(inputStream, resultDir.getPath()); // 解压文件


        // 6. 读取并返回所有的处理结果图像
        // 读取 types.txt 文件，构建图片名到病虫害类型的映射
        Map<String, String> pestTypesMap = new HashMap<>();
        File typesFile = new File(resultDir, "types.txt");
        if (typesFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(typesFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] parts = line.split(" ", 2);
                    if (parts.length == 2) {
                        pestTypesMap.put(parts[0], parts[1]);
                    }
                }
            }
        }

        // 7. 遍历结果目录，构建 RgbResult 列表
        List<WhResult> results = new ArrayList<>();
        File[] resultFiles = resultDir.listFiles();
        if (resultFiles != null) {
            for (File file : resultFiles) {
                if (file.isFile() && !file.getName().equals("types.txt")) {
                    // 提取图片名（不含扩展名）
                    String fileName = file.getName();
//                    String imageName = fileName.substring(0, fileName.lastIndexOf('.'));
//
//                    // 获取对应的病虫害类型
//                    String pestTypes = pestTypesMap.getOrDefault(imageName, "未知类型");

                    // 上传图片并构建 RgbResult
                    try {
                        String imageUrl = ImagesStorageUtil.uploadFile(file);
                        WhResult result = new WhResult();
                        result.setImageUrl(imageUrl);
                        results.add(result);
                    } catch (IOException e) {
                        System.err.println("文件上传失败: " + fileName);
                    }
                }
            }
        }

        return results;
    }
    public static JSONObject sendErs(String modelUrl, List<MultipartFile> images) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String originRgbPath = TEMP_DIR + File.separator + "origin_rgb_" + uuid;
        File originRgb = new File(originRgbPath);
        if (!originRgb.exists()) {
            originRgb.mkdirs();
            System.out.println("Created directory: " + originRgbPath);
        }

        // 2.保存上传的图像
        saveImages(images, originRgb);

        // 3. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        addFilesToRequest(builder, originRgb, "images");

        // 4. 发出请求，并获取响应结果
        HttpEntity multipart = builder.build();
        uploadFile.setEntity(multipart);
        System.out.println("Sending request to Flask server: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);
        HttpEntity responseEntity = response.getEntity();
        System.out.println("Received response from Flask server.");
        // 删除origin对应的目录
        if (DirectoryDeleteUtil.deleteDirectory(originRgbPath)){
            System.out.println("Origin Images Deleted Successfully.");
        }else {
            System.out.println("Origin Images Deleted Failed!");
        }

        // 5. 解析JSON响应
        String jsonResponse = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
        System.out.println("JSON response received: " + jsonResponse);

        // 使用FastJSON解析JSON字符串
        JSONObject jsonObject = JSON.parseObject(jsonResponse);
        System.out.println("Parsed JSON object: " + jsonObject.toJSONString());

        return jsonObject;
    }

    /**
     * 最佳播种期检测 - 返回BestSowingVo
     */
    public static cn.edu.nwafu.mizhipestcontrol.domain.vo.BestSowingVo sendStForBestSowing(String modelUrl, Map<String, Object> requestData) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            System.out.println("Created directory for result: " + resultDirPath);
        }

        // 存储目录，返回结果之前删除临时目录
        RequestContextHolder.setResultDirPath(resultDirPath);

        // 2. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);

        // 设置请求头
        uploadFile.setHeader("Content-Type", "application/json");
        uploadFile.setHeader("Accept", "application/json");
        uploadFile.setHeader("User-Agent", "Java/Spring-Boot-Pest-Control");

        // 使用FastJSON将完整的requestData转换为JSON字符串
        String jsonPayload = JSON.toJSONString(requestData);
        System.out.println("=== 播种期检测请求详情 ===");
        System.out.println("目标URL: " + modelUrl);
        System.out.println("请求方法: POST");
        System.out.println("Content-Type: application/json");
        System.out.println("品种: " + requestData.get("variety"));
        System.out.println("种植区域: " + requestData.get("variety_area"));
        System.out.println("完整JSON Payload: " + jsonPayload);
        System.out.println("========================");

        // 设置JSON实体
        StringEntity entity = new StringEntity(jsonPayload, "UTF-8");
        uploadFile.setEntity(entity);

        // 3. 发出请求，并获取响应结果
        System.out.println("正在发送JSON请求到播种期检测服务: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);

        // 检查响应状态码
        int statusCode = response.getStatusLine().getStatusCode();
        System.out.println("响应状态码: " + statusCode);
        System.out.println("响应状态: " + response.getStatusLine().getReasonPhrase());

        if (statusCode != 200) {
            String errorMsg = "Flask服务返回错误状态码: " + statusCode + " - " + response.getStatusLine().getReasonPhrase();
            System.err.println(errorMsg);
            throw new IOException(errorMsg);
        }

        HttpEntity responseEntity = response.getEntity();
        if (responseEntity == null) {
            throw new IOException("Flask服务返回空响应体");
        }

        // 检查响应类型
        String contentType = responseEntity.getContentType() != null ? 
                           responseEntity.getContentType().getValue() : "";
        System.out.println("响应Content-Type: " + contentType);

        // 4. 处理ZIP文件响应
        if (contentType.equals("application/zip") || contentType.equals("application/octet-stream")) {
            System.out.println("接收到ZIP响应，正在解压...");
            InputStream inputStream = responseEntity.getContent();
            unzip(inputStream, resultDir.getPath());
            
            // 5. 读取meta.json文件
            File metaFile = new File(resultDir, "meta.json");
            if (!metaFile.exists()) {
                throw new IOException("返回的ZIP包中缺少meta.json文件");
            }

            // 解析meta.json
            String metaContent = new String(Files.readAllBytes(metaFile.toPath()), StandardCharsets.UTF_8);
            System.out.println("meta.json内容: " + metaContent);
            JSONObject metaJson = JSON.parseObject(metaContent);

            // 6. 读取图片文件
            File trendFile = new File(resultDir, "trend.png");
            File forecastFile = new File(resultDir, "temp_rain_line.png");
            
            String trendUrl = null;
            String forecastUrl = null;

            if (trendFile.exists()) {
                trendUrl = ImagesStorageUtil.uploadFile(trendFile);
                System.out.println("趋势图上传成功: " + trendUrl);
            }

            if (forecastFile.exists()) {
                forecastUrl = ImagesStorageUtil.uploadFile(forecastFile);
                System.out.println("预测图上传成功: " + forecastUrl);
            }

            // 7. 构建BestSowingVo对象
            // 处理日期格式：start/end 是 MM-dd 格式，需要添加年份
            String startDateStr = metaJson.getString("start");        // 格式: 05-21
            String endDateStr = metaJson.getString("end");            // 格式: 05-23
            String startFullDateStr = metaJson.getString("start_full"); // 格式: 2025-05-21
            String endFullDateStr = metaJson.getString("end_full");    // 格式: 2025-05-23
            
            // 从 start_full 中提取年份
            int year = java.time.LocalDate.parse(startFullDateStr).getYear();
            
            // 构造完整的日期字符串
            String predictedStartDate = String.format("%04d-%s", year, startDateStr);   // 2025-05-21
            String predictedEndDate = String.format("%04d-%s", year, endDateStr);       // 2025-05-23
            
            cn.edu.nwafu.mizhipestcontrol.domain.vo.BestSowingVo bestSowingVo = 
                cn.edu.nwafu.mizhipestcontrol.domain.vo.BestSowingVo.builder()
                    .variety(metaJson.getString("variety"))
                    .baseName(metaJson.getString("area"))
                    .startDate(java.time.LocalDate.parse(predictedStartDate))
                    .endDate(java.time.LocalDate.parse(predictedEndDate))
                    .realStartDate(java.time.LocalDate.parse(startFullDateStr))
                    .realEndDate(java.time.LocalDate.parse(endFullDateStr))
                    .forecastUrl(forecastUrl)
                    .trendUrl(trendUrl)
                    .build();

            System.out.println("BestSowingVo构建完成: " + bestSowingVo);
            return bestSowingVo;
        } else {
            // 尝试作为JSON处理
            String responseText = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
            System.out.println("接收到文本响应: " + responseText);
            throw new IOException("不支持的响应类型: " + contentType + ", 响应内容: " + responseText);
        }
    }

    /**
     * 原有的播种期检测方法 - 返回List<WhResult>
     * 保留以兼容现有代码
     */
    public static List<WhResult> sendSt(String modelUrl, Map<String, Object> requestData) throws IOException {
        // 0. 生成UUID
        String uuid = UUID.randomUUID().toString();
        System.out.println("Generated UUID: " + uuid);

        // 1. 创建临时目录
        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            System.out.println("Created directory for result: " + resultDirPath);
        }

        // 存储目录，返回结果之前删除临时目录
        RequestContextHolder.setResultDirPath(resultDirPath);

        // 3. 构建请求
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost uploadFile = new HttpPost(modelUrl);

        // 设置请求头
        uploadFile.setHeader("Content-Type", "application/json");
        uploadFile.setHeader("Accept", "application/json");
        uploadFile.setHeader("User-Agent", "Java/Spring-Boot-Pest-Control");

        // 使用FastJSON将完整的requestData转换为JSON字符串
        String jsonPayload = JSON.toJSONString(requestData);
        System.out.println("=== 播种期检测请求详情 ===");
        System.out.println("目标URL: " + modelUrl);
        System.out.println("请求方法: POST");
        System.out.println("Content-Type: application/json");
        
        // 提取daily_data数组长度
        Object dailyDataObj = requestData.get("daily_data");
        int dataCount = 0;
        if (dailyDataObj instanceof List) {
            dataCount = ((List<?>) dailyDataObj).size();
        }
        System.out.println("品种: " + requestData.get("variety"));
        System.out.println("种植区域: " + requestData.get("variety_area"));
        System.out.println("日常数据条数: " + dataCount);
        System.out.println("完整JSON Payload: " + jsonPayload);
        System.out.println("========================");

        // 设置JSON实体
        StringEntity entity = new StringEntity(jsonPayload, "UTF-8");
        uploadFile.setEntity(entity);

        // 4. 发出请求，并获取响应结果
        System.out.println("正在发送JSON请求到播种期检测服务: " + modelUrl);
        CloseableHttpResponse response = httpClient.execute(uploadFile);

        // 检查响应状态码
        int statusCode = response.getStatusLine().getStatusCode();
        System.out.println("响应状态码: " + statusCode);
        System.out.println("响应状态: " + response.getStatusLine().getReasonPhrase());

        if (statusCode != 200) {
            String errorMsg = "Flask服务返回错误状态码: " + statusCode + " - " + response.getStatusLine().getReasonPhrase();
            System.err.println(errorMsg);
            throw new IOException(errorMsg);
        }

        HttpEntity responseEntity = response.getEntity();
        if (responseEntity == null) {
            throw new IOException("Flask服务返回空响应体");
        }

        // 检查响应类型
        String contentType = responseEntity.getContentType() != null ? 
                           responseEntity.getContentType().getValue() : "";
        System.out.println("响应Content-Type: " + contentType);

        List<WhResult> results = new ArrayList<>();
        
        // 5. 根据Content-Type处理不同类型的响应
        if (contentType.startsWith("image/")) {
            // 处理图片响应
            System.out.println("接收到图片响应，正在保存...");
            InputStream inputStream = responseEntity.getContent();
            
            // 保存图片到本地临时文件
            String fileName = "sowing_result_" + uuid + ".png";
            File imageFile = new File(resultDir, fileName);
            
            try (FileOutputStream fos = new FileOutputStream(imageFile);
                 BufferedInputStream bis = new BufferedInputStream(inputStream)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = bis.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
            
            System.out.println("图片保存成功: " + imageFile.getAbsolutePath());
            
            // 上传图片到对象存储
            try {
                String imageUrl = ImagesStorageUtil.uploadFile(imageFile);
                WhResult result = new WhResult();
                result.setImageUrl(imageUrl);
                // 可以设置其他属性，比如播种期预测结果
                results.add(result);
                System.out.println("图片上传到对象存储成功: " + imageUrl);
            } catch (IOException e) {
                System.err.println("图片上传到对象存储失败: " + e.getMessage());
                throw e;
            }
        } else if (contentType.equals("application/zip") || contentType.equals("application/octet-stream")) {
            // 处理ZIP文件响应（保持原有逻辑）
            System.out.println("接收到ZIP响应，正在解压...");
            InputStream inputStream = responseEntity.getContent();
            unzip(inputStream, resultDir.getPath());
            
            // 原有的ZIP处理逻辑
            Map<String, String> pestTypesMap = new HashMap<>();
            File typesFile = new File(resultDir, "types.txt");
            if (typesFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(typesFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        String[] parts = line.split(" ", 2);
                        if (parts.length == 2) {
                            pestTypesMap.put(parts[0], parts[1]);
                        }
                    }
                }
            }

            File[] resultFiles = resultDir.listFiles();
            if (resultFiles != null) {
                for (File file : resultFiles) {
                    if (file.isFile() && !file.getName().equals("types.txt")) {
                        try {
                            String imageUrl = ImagesStorageUtil.uploadFile(file);
                            WhResult result = new WhResult();
                            result.setImageUrl(imageUrl);
                            results.add(result);
                        } catch (IOException e) {
                            System.err.println("文件上传失败: " + file.getName());
                        }
                    }
                }
            }
        } else {
            // 尝试作为JSON处理
            String responseText = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
            System.out.println("接收到文本响应: " + responseText);
            throw new IOException("不支持的响应类型: " + contentType + ", 响应内容: " + responseText);
        }

        return results;
    }
    private static void saveImages(List<MultipartFile> images, File destinationDir) throws IOException {
        for (MultipartFile image : images) {
            String fileName = image.getOriginalFilename();
            if (fileName != null) {
                File file = new File(destinationDir, fileName);
                image.transferTo(file); // 保存文件
                System.out.println("Saved image: " + file.getAbsolutePath());
            }
        }
    }

    /**
     * 将文件添加到Http请求中
     */
    private static void addFilesToRequest(MultipartEntityBuilder builder, File directory, String fieldName) throws FileNotFoundException {
        for (File file : directory.listFiles()) {
            if (file.isFile()) {
                String fileName = file.getName();
                builder.addBinaryBody(fieldName, new FileInputStream(file), ContentType.APPLICATION_OCTET_STREAM, fileName);
                System.out.println("Added file: " + fileName);
            }
        }
    }


    /**
     * 解压输入流中的ZIP文件到指定目录
     */
    private static void unzip(InputStream inputStream, String outputDir) throws IOException {
        try (ZipInputStream zipIn = new ZipInputStream(inputStream)) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                try {
                    String filePath = outputDir + File.separator + entry.getName();
                    if (!entry.isDirectory()) {
                        extractFile(zipIn, filePath);
                        System.out.println("Extracted file: " + filePath);
                    } else {
                        File dir = new File(filePath);
                        dir.mkdirs();
                        System.out.println("Created directory: " + filePath);
                    }
                } catch (IOException e) {
                    System.err.println("Error extracting file: " + entry.getName());
                    e.printStackTrace(); // Log the stack trace for debugging
                }
                zipIn.closeEntry();
            }
        }
    }


    /**
     * 提取ZIP中的文件
     */
    private static void extractFile(ZipInputStream zipIn, String filePath) throws IOException {
        try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(filePath))) {
            byte[] bytesIn = new byte[4096];
            int read;
            while ((read = zipIn.read(bytesIn)) != -1) {
                bos.write(bytesIn, 0, read);
            }
            System.out.println("Finished extracting file: " + filePath);
        }
    }

    private static void deleteDirectory(File directory) {
        if (directory != null && directory.exists()) {
            try {
                File[] files = directory.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.isDirectory()) {
                            deleteDirectory(file);
                        } else {
                            if (!file.delete()) {
                                System.err.println("Failed to delete file: " + file.getAbsolutePath());
                            }
                        }
                    }
                }
                if (!directory.delete()) {
                    System.err.println("Failed to delete directory: " + directory.getAbsolutePath());
                }
            } catch (Exception e) {
                System.err.println("Error deleting directory: " + directory.getAbsolutePath());
                e.printStackTrace();
            }
        }
    }


    /**
     * 病害区域检测请求flask
     *param : AreaDetectRequestBo
     * return : PestAreaDetection  直接构建数据库实体的返回参数
     */
    /**
     * 3. 播种期预测：发送结构化数据（非图像）到模型，接收图像或 ZIP 响应
     */
    /**
     * 调用病虫害区域检测模型服务，支持返回 ZIP（含图片 + result.json）
     *
     * @param request 包含 rgbUrl, tifUrl, modelUrl 的请求对象
     * @return 检测结果（图片 URL + 病害发生率）
     * @throws IOException 网络或文件 IO 异常
     */
    public static List<PestAreaDetectResultBo> sendPa(AreaDetectRequestBo request) throws IOException {
        String uuid = UUID.randomUUID().toString();
        log.info("Generated UUID for pest detection: {}", uuid);

        String resultDirPath = TEMP_DIR + File.separator + "result_" + uuid;
        File resultDir = new File(resultDirPath);
        if (!resultDir.exists()) {
            resultDir.mkdirs();
            log.info("Created result directory: {}", resultDirPath);
        }

        RequestContextHolder.setResultDirPath(resultDirPath);

        // 构建请求体（不包含 modelUrl）
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("rgbUrl", request.getRgbUrl());
        requestData.put("tifUrl", request.getTifUrl());

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(request.getModelUrl());
            httpPost.setHeader(HttpHeaders.CONTENT_TYPE, "application/json");
            httpPost.setHeader(HttpHeaders.ACCEPT, "application/json");
            httpPost.setHeader("User-Agent", "Java/Spring-Boot-Pest-Control");

            String jsonPayload = JSON.toJSONString(requestData);
            log.info("Sending pest detection request to: {}", request.getModelUrl());
            log.debug("Request payload: {}", jsonPayload);
            log.info("【请求头】:");
            for (Header header : httpPost.getAllHeaders()) {
                log.info("  {}: {}", header.getName(), header.getValue());
            }

            // 打印请求体（前提是 body 是 StringEntity）
            if (httpPost.getEntity() instanceof StringEntity) {
                StringEntity entity = (StringEntity) httpPost.getEntity();
                // 注意：StringEntity 内容无法直接获取（因为是流），但你可以提前保存
                // 所以建议：先构造 jsonPayload，再 setEntity，然后打印 jsonPayload
                log.info("【请求体】: {}", jsonPayload); // ← 这个你已经有！
            }

            httpPost.setEntity(new StringEntity(jsonPayload, StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();
                log.info("Received response with status: {} {}", statusCode, response.getStatusLine().getReasonPhrase());

                if (statusCode != 200) {
                    String errorMsg = String.format("Flask service returned error: %d - %s", statusCode, response.getStatusLine().getReasonPhrase());
                    log.error(errorMsg);
                    throw new IOException(errorMsg);
                }

                HttpEntity responseEntity = response.getEntity();
                if (responseEntity == null) {
                    throw new IOException("Response body is null");
                }

                String contentType = Optional.ofNullable(responseEntity.getContentType())
                        .map(org.apache.http.Header::getValue)
                        .orElse("");

                log.info("Response Content-Type: {}", contentType);

                // 目前只处理 ZIP 响应（含图片 + JSON）
                if (contentType.contains("zip") || contentType.equals("application/octet-stream")) {
                    try (InputStream inputStream = responseEntity.getContent()) {
                        log.info("Unzipping response ZIP...");
                        unzip(inputStream, resultDirPath);
                    }

                    // 查找 JSON 和图片文件
                    File resultJsonFile = null;
                    File resultImageFile = null;

                    File[] files = resultDir.listFiles();
                    if (files != null) {
                        for (File file : files) {
                            if (file.getName().equals("result.json")) {
                                resultJsonFile = file;
                            } else if (file.getName().matches(".*\\.(png|jpg|jpeg|tif|tiff)$")) {
                                resultImageFile = file;
                            }
                        }
                    }

                    // 必须同时存在 JSON 和图片
                    if (resultJsonFile == null || resultImageFile == null) {
                        throw new IOException("Missing result.json or image file in ZIP response");
                    }

                    // 解析 JSON
                    String jsonContent = new String(Files.readAllBytes(resultJsonFile.toPath()), StandardCharsets.UTF_8);
                    JSONObject jsonObj = JSON.parseObject(jsonContent);

                    Double incidence = jsonObj.getDouble("incidence");
                    if (incidence == null) {
                        log.warn("Field 'incidence' not found in result.json");
                    }

                    // 上传图片
                    String imageUrl = ImagesStorageUtil.uploadFile(resultImageFile);
                    log.info("Uploaded result image: {}", imageUrl);

                    // 构建结果
                    PestAreaDetectResultBo result = new PestAreaDetectResultBo();
                    result.setResultImgUrl(imageUrl);
                    result.setIncidence(incidence);

                    return Collections.singletonList(result);

                } else if (contentType.startsWith("image/")) {
                    // 如果未来只返回图片（无 JSON），可降级处理，但 incidence 为 null
                    String fileName = "pest_result_" + uuid + ".png";
                    File imageFile = new File(resultDir, fileName);
                    try (InputStream is = responseEntity.getContent();
                         BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(imageFile))) {
                        byte[] buffer = new byte[8192];
                        int bytesRead;
                        while ((bytesRead = is.read(buffer)) != -1) {
                            bos.write(buffer, 0, bytesRead);
                        }
                    }
                    String imageUrl = ImagesStorageUtil.uploadFile(imageFile);
                    PestAreaDetectResultBo result = new PestAreaDetectResultBo();
                    result.setResultImgUrl(imageUrl);
                    // incidence 为 null
                    return Collections.singletonList(result);

                } else {
                    String responseText = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
                    log.warn("Unexpected response type: {}, content: {}", contentType, responseText);
                    throw new IOException("Unsupported response content type: " + contentType);
                }
            }
        }
    }

    /**
     * 提交病虫害区域检测异步任务
     * 
     * @param modelUrl Flask服务地址
     * @param rgbUrl RGB图像URL
     * @param tifUrl TIF图像URL
     * @return 任务ID
     */
    public static String submitPestAreaTask(String modelUrl, String rgbUrl, String tifUrl) throws IOException {
        log.info("=== 提交病虫害区域检测任务 ===");
        log.info("模型URL: {}", modelUrl);
        log.info("RGB URL: {}", rgbUrl);
        log.info("TIF URL: {}", tifUrl);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(modelUrl);

        // 设置请求头
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setHeader("Accept", "application/json");

        // 构建请求体
        JSONObject requestBody = new JSONObject();
        requestBody.put("rgbUrl", rgbUrl);
        requestBody.put("tifUrl", tifUrl);

        StringEntity entity = new StringEntity(requestBody.toJSONString(), StandardCharsets.UTF_8);
        httpPost.setEntity(entity);

        try {
            log.info("发送请求到Flask服务...");
            CloseableHttpResponse response = httpClient.execute(httpPost);
            
            int statusCode = response.getStatusLine().getStatusCode();
            log.info("响应状态码: {}", statusCode);

            if (statusCode != 202) {
                String errorMsg = "Flask服务返回错误状态码: " + statusCode;
                log.error(errorMsg);
                throw new IOException(errorMsg);
            }

            HttpEntity responseEntity = response.getEntity();
            if (responseEntity == null) {
                throw new IOException("Flask服务返回空响应体");
            }

            String responseText = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
            log.info("Flask响应: {}", responseText);

            JSONObject responseJson = JSON.parseObject(responseText);
            String taskId = responseJson.getString("task_id");

            if (taskId == null || taskId.isEmpty()) {
                throw new IOException("Flask服务未返回task_id");
            }

            log.info("✅ 任务提交成功，task_id: {}", taskId);
            return taskId;

        } finally {
            try {
                httpClient.close();
            } catch (IOException e) {
                log.warn("关闭HTTP客户端失败", e);
            }
        }
    }

    /**
     * 查询病虫害区域检测任务状态
     * 
     * @param modelBaseUrl Flask服务基础地址（不含路径）
     * @param taskId 任务ID
     * @return 任务状态信息
     */
    public static JSONObject queryPestAreaTaskStatus(String modelBaseUrl, String taskId) throws IOException {
        String queryUrl = modelBaseUrl.replaceAll("/detect$", "") + "/task/" + taskId;
        log.info("查询任务状态: {}", queryUrl);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        org.apache.http.client.methods.HttpGet httpGet = new org.apache.http.client.methods.HttpGet(queryUrl);

        try {
            CloseableHttpResponse response = httpClient.execute(httpGet);
            
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode != 200) {
                throw new IOException("查询任务状态失败，状态码: " + statusCode);
            }

            HttpEntity responseEntity = response.getEntity();
            String responseText = EntityUtils.toString(responseEntity, StandardCharsets.UTF_8);
            log.info("任务状态响应: {}", responseText);

            return JSON.parseObject(responseText);

        } finally {
            try {
                httpClient.close();
            } catch (IOException e) {
                log.warn("关闭HTTP客户端失败", e);
            }
        }
    }

    /**
     * 下载病虫害区域检测结果
     * 
     * @param modelBaseUrl Flask服务基础地址
     * @param taskId 任务ID
     * @return 包含结果图像URL的对象
     */
    public static cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaTaskVo downloadPestAreaResult(
            String modelBaseUrl, String taskId) throws IOException {
        
        String downloadUrl = modelBaseUrl.replaceAll("/detect$", "") + "/download/" + taskId;
        log.info("下载任务结果: {}", downloadUrl);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        org.apache.http.client.methods.HttpGet httpGet = new org.apache.http.client.methods.HttpGet(downloadUrl);

        // 生成UUID用于临时目录
        String uuid = UUID.randomUUID().toString();
        String resultDirPath = TEMP_DIR + File.separator + "pest_area_" + uuid;
        File resultDir = new File(resultDirPath);
        resultDir.mkdirs();

        try {
            CloseableHttpResponse response = httpClient.execute(httpGet);
            
            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode != 200) {
                throw new IOException("下载结果失败，状态码: " + statusCode);
            }

            HttpEntity responseEntity = response.getEntity();
            String contentType = responseEntity.getContentType() != null ? 
                               responseEntity.getContentType().getValue() : "";

            if (!contentType.contains("application/zip") && !contentType.contains("application/octet-stream")) {
                throw new IOException("期望ZIP文件，但收到: " + contentType);
            }

            // 解压ZIP文件
            InputStream inputStream = responseEntity.getContent();
            unzip(inputStream, resultDir.getPath());

            // 读取result.json
            File resultJsonFile = new File(resultDir, "result.json");
            if (!resultJsonFile.exists()) {
                throw new IOException("ZIP包中缺少result.json文件");
            }

            String jsonContent = new String(Files.readAllBytes(resultJsonFile.toPath()), StandardCharsets.UTF_8);
            JSONObject resultJson = JSON.parseObject(jsonContent);
            Double incidence = resultJson.getDouble("incidence");
            Double longitude = resultJson.getDouble("longitude");
            Double latitude = resultJson.getDouble("latitude");

            // 查找图像文件（可能是.jpg或.png）
            File[] imageFiles = resultDir.listFiles((dir, name) -> 
                name.toLowerCase().endsWith(".jpg") || 
                name.toLowerCase().endsWith(".png") ||
                name.toLowerCase().endsWith(".jpeg")
            );

            String resultImageUrl = null;
            if (imageFiles != null && imageFiles.length > 0) {
                // 上传第一个图像文件
                resultImageUrl = ImagesStorageUtil.uploadFile(imageFiles[0]);
                log.info("结果图像上传成功: {}", resultImageUrl);
            }

            // 构建返回对象
            cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaTaskVo vo = 
                cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaTaskVo.builder()
                    .taskId(taskId)
                    .status("completed")
                    .progress(100)
                    .message("任务已完成")
                    .createTime(new Date())
                    .incidence(incidence)
                    .longitude(longitude)
                    .latitude(latitude)
                    .resultImageUrl(resultImageUrl)
                    .downloadUrl(downloadUrl)
                    .build();

            // 设置病害等级和措施
            if (incidence != null) {
                if (incidence <= 5) {
                    vo.setLevel("轻度");
                } else if (incidence <= 25) {
                    vo.setLevel("中度");
                } else {
                    vo.setLevel("重度");
                }

                // 防治措施（结构化JSON对象）
                vo.setMeasure(PestAreaMeasureUtil.buildMeasure(incidence));
            }

            return vo;

        } finally {
            try {
                httpClient.close();
            } catch (IOException e) {
                log.warn("关闭HTTP客户端失败", e);
            }
            
            // 清理临时目录
            DirectoryDeleteUtil.deleteDirectory(resultDirPath);
        }
    }

}
