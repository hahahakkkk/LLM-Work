package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.utils.DateUtils;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mz_external_program_api.api.BaseTranslation;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantResultsVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaDetectionVo;
import cn.edu.nwafu.mizhipestcontrol.service.IPdfReportService;
import cn.edu.nwafu.mizhipestcontrol.utils.GeoCoordinateUtil;
import cn.edu.nwafu.mizhipestscience.domain.AllStrategy;
import cn.edu.nwafu.mizhipestscience.service.IClassifyService;
import com.esotericsoftware.minlog.Log;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.rpc.RpcException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.Objects;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicBoolean;


@Service
public class IPdfReportServiceImpl implements IPdfReportService {

    @DubboReference(check = false, timeout = 5000, retries = 0)
    private IClassifyService classifyService;
    private final AtomicBoolean tacticsServiceAvailable = new AtomicBoolean(true);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final int IMAGE_FETCH_CONNECT_TIMEOUT_MS = 5_000;
    private static final int IMAGE_FETCH_READ_TIMEOUT_MS = 10_000;
    private static final int IMAGE_FETCH_MAX_BYTES = 8 * 1024 * 1024;
    private static final int IMAGE_FETCH_MAX_REDIRECTS = 3;
    //加载中文字体
    private static final String FONT_RESOURCE_PATH = "fronts/NotoSerifSC-VariableFont_wght.ttf";

    //出苗等级映射
    private static final NavigableMap<Double, String> EMERATE_LEVEL_MAP = new TreeMap<>();
    static {
        EMERATE_LEVEL_MAP.put(0.0, "高度缺苗");
        EMERATE_LEVEL_MAP.put(50.0, "中度缺苗");
        EMERATE_LEVEL_MAP.put(65.0, "低度缺苗");
        EMERATE_LEVEL_MAP.put(80.0, "正常");
    }

    // 病虫害区域等级映射
    private static final NavigableMap<Double, String> Pest_AREA_LEVEL_MAP = new TreeMap<>();
    static {
        Pest_AREA_LEVEL_MAP.put(0.0, "轻度病害");
        Pest_AREA_LEVEL_MAP.put(5.0, "中度病害");
        Pest_AREA_LEVEL_MAP.put(25.0, "重度病害");
//        EMERATE_LEVEL_MAP.put(80.0, "正常");
    }
    // 病害区域对应措施
    private static final NavigableMap<Double, String> Pest_AREA_OPERATIONS_MAP = new TreeMap<>();
    static {
        // 轻度病害
        Pest_AREA_OPERATIONS_MAP.put(0.0,
                "建议采用复配药剂协同施用，推荐亩用标准配方：磷酸二氢钾100g、芸苔素10ml，进行叶面调理，施药时需根据田间实际病情，灵活调整药剂复配方案或采用分次喷施的方式，以确保有效控制病害蔓延。同时注意不同作用机理药剂的轮换使用，延缓抗药性产生。加强田间通风排湿，应及时拔除零星病株，以切断病菌传播途径，提升整体防控效果。\n");
        // 中度病害
        Pest_AREA_OPERATIONS_MAP.put(5.0,
                "建议采用复配药剂协同施用，推荐亩用标准配方：甲霜·霜霉威25%可湿性粉剂100g，或戊唑·咪鲜胺45%水乳剂25ml，于病害发生初期均匀喷雾施药。根据田间实际病情，灵活调整药剂复配方案或采用分次喷施的方式，以确保有效控制病害蔓延。同时注意不同作用机理药剂的轮换使用，延缓抗药性产生。应及时拔除零星病株，以切断病菌传播途径，提升整体防控效果。\n");

        // 重度病害
        Pest_AREA_OPERATIONS_MAP.put(25.0,
                "甲霜灵类药剂长期单一使用易诱导病菌产生抗药性，建议采用复配药剂协同施用。推荐亩用标准配⽅：甲霜・霜霉威100g、戊唑・咪鲜胺25mL、5%⾼效n氯氟氰菊酯25mL、芸苔素10mL、磷酸二氢钾100g。施药时需根据田间实际病情，灵活调整药剂复配方案或采取分次喷施的方式；针对病害发生严重的区域，应及时拔除零星病株，以切断病菌传播途径，提升整体防控效果。\n");
    }

    private static final NavigableMap<Double, String> OPERATIONs_MAP = new TreeMap<>();
    static {
        OPERATIONs_MAP.put(0.0,
                "   抢救性管理\n" +
                        "1. 紧急水肥干预：立即进行重灌水、重追肥" + "，做最后抢救。\n" +
                        "2. 设置观察期（5-7天），密切监控苗情响应。\n" +
                        "3. 评估与决策：若观察期后苗情明显好转，则\n" +
                        "纳入橙色区域管理；若无改善则果断翻耕改种\n" +
                        "短生育期作物");
        OPERATIONs_MAP.put(50.0,
                "加强水肥，全力保产。将该区域列为水肥优先" + "管理区，增加灌溉次数和追肥量，采用水肥一" + "体化等方式进行强力扶持。\n");
        OPERATIONs_MAP.put(65.0,
                "补水追肥，促进生长。立即对该区域进行紧急" + "灌溉补水，并增施速效性氮肥或叶面肥，以水" +
                        "促肥，激发幼苗生长潜力\n");
        OPERATIONs_MAP.put(80.0, "加强水肥，全力保产。将该区域列为水肥优先" + "管理区，增加灌溉次数和追肥量，采用水肥一" +
                "体化等方式进行强力扶持\n");
    }
    // 获取对应等级文字
    public static String GetEmrateLevel(Double rate) {
        if (rate == null) return "未知";
        // 找到小于等于 rate 的最大 key 对应的等级
        Map.Entry<Double, String> entry = EMERATE_LEVEL_MAP.floorEntry(rate);
        return entry != null ? entry.getValue() : "未知";
    }

    //根据等级返回对应举措
    public static String GetEmrateOperation(Double rate) {
        if (rate == null) return "未知";
        // 找到小于等于 rate 的最大 key 对应的等级
        Map.Entry<Double, String> entry = OPERATIONs_MAP.floorEntry(rate);
        return entry != null ? entry.getValue() : "未知";
    }


    // 获取对应病虫害区域检检测等级文字
    public static String GetPestAreaLevel(Double rate) {
        if (rate == null) return "未知";
        // 找到小于等于 rate 的最大 key 对应的等级
        Map.Entry<Double, String> entry = Pest_AREA_LEVEL_MAP.floorEntry(rate);
        return entry != null ? entry.getValue() : "未知";
    }
    // 获取对应病虫害区域检测措施文字
    public static String GetPestAreaOprations(Double rate) {
        if (rate == null) return "未知";
        // 找到小于等于 rate 的最大 key 对应的等级
        Map.Entry<Double, String> entry = Pest_AREA_OPERATIONS_MAP.floorEntry(rate);
        return entry != null ? entry.getValue() : "未知";
    }


    private final BaseFont bfChinese;
    private final Font chineseFontNormal;
    private final Font chineseFontBold;
    private final Font chineseFontSmallItalic;

    // 类初始化
    public IPdfReportServiceImpl() throws DocumentException, IOException {
        // 从 classpath 中读取字体文件
        InputStream fontStream = Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream(FONT_RESOURCE_PATH),
                "字体文件未找到，请确认路径在 resources/fronts/ 下"
        );

        // OpenPDF 只能从文件加载字体，所以写到临时文件
        Path tempFontFile = Files.createTempFile("font", ".ttf");
        Files.copy(fontStream, tempFontFile, StandardCopyOption.REPLACE_EXISTING);

        // 创建 BaseFont（支持中文）
        this.bfChinese = BaseFont.createFont(
                tempFontFile.toAbsolutePath().toString(),
                BaseFont.IDENTITY_H,
                BaseFont.EMBEDDED
        );

        // 创建不同样式的中文字体
        this.chineseFontNormal = new Font(bfChinese, 12, Font.NORMAL);
        this.chineseFontBold = new Font(bfChinese, 18, Font.BOLD);
        this.chineseFontSmallItalic = new Font(bfChinese, 10, Font.ITALIC);
    }

    // 添加单元格方法（使用中文字体）
    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.BOX);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private String safeText(Object value) {
        if (value == null) {
            return "-";
        }
        String text = String.valueOf(value);
        return text.isBlank() ? "-" : text;
    }

    private String formatStrategy(Object strategyObj) {
        if (strategyObj == null) {
            return "-";
        }
        if (strategyObj instanceof String str) {
            String trimmed = str.trim();
            if (!trimmed.isEmpty() && (trimmed.startsWith("{") || trimmed.startsWith("[") )) {
                try {
                    JsonNode node = OBJECT_MAPPER.readTree(trimmed);
                    return formatStrategy(node);
                } catch (IOException ignored) {
                    // fall through, keep raw string
                }
            }
            return trimmed.isEmpty() ? "-" : trimmed;
        }
        if (strategyObj instanceof JsonNode node) {
            if (node.isObject()) {
                StringBuilder sb = new StringBuilder();
                node.fields().forEachRemaining(e -> {
                    String key = e.getKey();
                    String val = e.getValue() == null ? "" : e.getValue().asText("");
                    if (!key.isBlank() && !val.isBlank()) {
                        sb.append(key).append("：").append(val).append("\n");
                    }
                });
                String res = sb.toString().trim();
                return res.isEmpty() ? node.toString() : res;
            }
            return node.asText(node.toString());
        }
        if (strategyObj instanceof Map<?, ?> map) {
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<?, ?> e : map.entrySet()) {
                String key = safeText(e.getKey());
                String val = safeText(e.getValue());
                if (!"-".equals(key) && !"-".equals(val)) {
                    sb.append(key).append("：").append(val).append("\n");
                }
            }
            String res = sb.toString().trim();
            return res.isEmpty() ? map.toString() : res;
        }
        return String.valueOf(strategyObj);
    }

    private Map<String, String> resolveIntroAndAdvice(PlantResultsVo p) {
        String intro = null;
        String advice = null;

        String requestJson = buildStrategyRequestJson(p);
        if (classifyService != null
                && tacticsServiceAvailable.get()
                && requestJson != null) {
            try {
                List<AllStrategy> strategies = classifyService.getStrategy(requestJson);
                if (strategies != null && !strategies.isEmpty()) {
                    AllStrategy first = strategies.get(0);
                    if (first.getIntro() != null && !first.getIntro().isBlank()) {
                        intro = first.getIntro();
                    }
                    advice = formatStrategy(first.getStrategy());
                }
            } catch (Exception e) {
                Throwable root = (e instanceof RpcException && e.getCause() != null) ? e.getCause() : e;
                boolean disable = root instanceof BadSqlGrammarException
                        || (root.getMessage() != null && (root.getMessage().contains("pestscience_classify")
                        || root.getMessage().contains("Serialization Security")));
                if (disable && tacticsServiceAvailable.compareAndSet(true, false)) {
                    Log.warn("获取防治策略失败，已切换为本地默认文案: " + root.getMessage());
                } else {
                    Log.warn("获取防治策略失败: " + root.getMessage());
                }
            }
        }

        if (intro == null || intro.isBlank() || "-".equals(intro)) {
            intro = p == null ? "-" : safeText(p.getDescription());
        }
        if (advice == null || advice.isBlank() || "-".equals(advice)) {
            advice = "建议结合田间实测情况，及时采取防治措施。";
        }

        Map<String, String> res = new HashMap<>();
        res.put("intro", intro);
        res.put("advice", advice);
        return res;
    }

    private String buildStrategyRequestJson(PlantResultsVo p) {
        if (p == null) {
            return null;
        }
        String diseaseType = p.getDiseaseType();
        if (diseaseType == null || diseaseType.isBlank()) {
            return null;
        }
        String[] types = diseaseType.split("[,，]");
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (String raw : types) {
            if (raw == null) {
                continue;
            }
            String type = raw.trim();
            if (type.isEmpty()) {
                continue;
            }
            if (count == 0) {
                sb.append('[');
            } else {
                sb.append(',');
            }
            sb.append('{').append("\"class\":\"").append(escapeJson(type)).append("\"}");
            count++;
        }
        if (count == 0) {
            return null;
        }
        sb.append(']');
        return sb.toString();
    }

    private String escapeJson(String value) {
        StringBuilder sb = new StringBuilder(value.length());
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.toString();
    }

    private String formatTime(Date date) {
        if (date == null) {
            return "-";
        }
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
    }


    private void logExceptionStack(String prefix, Throwable t) {
        if (t == null) {
            return;
        }
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        pw.println(prefix + ": " + t);
        t.printStackTrace(pw);
        pw.flush();
        Log.warn(sw.toString());
    }

    private byte[] fetchImageBytesWithDebug(String imageUrl) {
        String current = imageUrl;
        for (int i = 0; i <= IMAGE_FETCH_MAX_REDIRECTS; i++) {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(current);
                conn = (HttpURLConnection) url.openConnection();
                conn.setInstanceFollowRedirects(false);
                conn.setConnectTimeout(IMAGE_FETCH_CONNECT_TIMEOUT_MS);
                conn.setReadTimeout(IMAGE_FETCH_READ_TIMEOUT_MS);
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "mizhi-pestcontrol/pdf-image-loader");

                int code = conn.getResponseCode();
                String contentType = conn.getContentType();
                int contentLength = conn.getContentLength();
                Log.warn("图片HTTP探测: url=" + current + ", code=" + code + ", contentType=" + contentType + ", contentLength=" + contentLength);

                if (code == HttpURLConnection.HTTP_MOVED_PERM
                        || code == HttpURLConnection.HTTP_MOVED_TEMP
                        || code == HttpURLConnection.HTTP_SEE_OTHER
                        || code == 307
                        || code == 308) {
                    String location = conn.getHeaderField("Location");
                    Log.warn("图片HTTP重定向: from=" + current + ", location=" + location);
                    if (location == null || location.isBlank()) {
                        return null;
                    }
                    URI base = URI.create(current);
                    current = base.resolve(location).toString();
                    continue;
                }

                if (code >= 400) {
                    try (InputStream err = conn.getErrorStream()) {
                        if (err != null) {
                            byte[] buf = err.readNBytes(1024);
                            Log.warn("图片HTTP错误响应(前1KB): url=" + current + ", body=" + new String(buf));
                        }
                    } catch (Exception ignored) {
                        // ignore
                    }
                    return null;
                }

                try (InputStream in = conn.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[8192];
                    int total = 0;
                    int read;
                    while ((read = in.read(buffer)) != -1) {
                        total += read;
                        if (total > IMAGE_FETCH_MAX_BYTES) {
                            Log.warn("图片下载超过上限(截断): url=" + current + ", total=" + total + ", max=" + IMAGE_FETCH_MAX_BYTES);
                            return null;
                        }
                        out.write(buffer, 0, read);
                    }
                    Log.warn("图片下载完成: url=" + current + ", bytes=" + total);
                    return out.toByteArray();
                }
            } catch (Exception e) {
                Log.warn("图片HTTP拉取失败: url=" + current + ", err=" + e);
                logExceptionStack("图片HTTP拉取异常堆栈", e);
                return null;
            } finally {
                if (conn != null) {
                    try {
                        conn.disconnect();
                    } catch (Exception ignored) {
                        // ignore
                    }
                }
            }
        }
        Log.warn("图片HTTP重定向次数超限: url=" + imageUrl);
        return null;
    }

    // 加载图像，若失败则返回 null（由上层写入 fallback 文案）
//    private Image loadImage(String imageUrl) throws IOException, BadElementException {
//        if (imageUrl == null || imageUrl.trim().isEmpty()) {
//            Log.warn("图片URL为空，无法加载");
//            return null;
//        }
//
//        String url = imageUrl.trim();
//        try {
//            URI uri = URI.create(url);
//            Log.warn("尝试加载图片: url=" + url + ", scheme=" + uri.getScheme() + ", host=" + uri.getHost() + ", path=" + uri.getPath());
//        } catch (Exception e) {
//            Log.warn("图片URL解析失败(继续尝试加载): url=" + url + ", err=" + e);
//        }
//
//        // 1) 先走 OpenPDF 自带 URL/路径加载
//        try {
//            return Image.getInstance(url);
//        } catch (Exception e) {
//            Log.warn("Image.getInstance(url) 失败: url=" + url + ", err=" + e);
//            logExceptionStack("Image.getInstance(url) 异常堆栈", e);
//        }
//
//        // 2) 若是 http(s) URL，再尝试手动下载字节后解析，便于定位是网络/鉴权/重定向问题还是图片解析问题
//        if (url.startsWith("http://") || url.startsWith("https://")) {
//            byte[] bytes = fetchImageBytesWithDebug(url);
//            if (bytes != null && bytes.length > 0) {
//                try {
//                    return Image.getInstance(bytes);
//                } catch (Exception e) {
//                    Log.warn("Image.getInstance(bytes) 失败: url=" + url + ", bytes=" + bytes.length + ", err=" + e);
//                    logExceptionStack("Image.getInstance(bytes) 异常堆栈", e);
//                }
//            }
//        }
//
//        Log.warn("图片加载最终失败: url=" + url);
//        return null;
//    }
    private Image loadImage(String imageUrl) throws IOException, BadElementException {
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            String url = imageUrl.trim();
            URI uri = null;

            Exception e;
            try {
                uri = URI.create(url);
                Log.warn("尝试加载图片: url=" + url + ", scheme=" + uri.getScheme() + ", host=" + uri.getHost() + ", path=" + uri.getPath());
            } catch (Exception var7) {
                e = var7;
                Log.warn("图片URL解析失败(继续尝试加载): url=" + url + ", err=" + String.valueOf(e));
            }

            if (uri == null || uri.getScheme() == null) {
                String relative = url;
                if (!relative.startsWith("file:")) {
                    if (relative.startsWith("/")) {
                        relative = relative.substring(1);
                    }

                    try {
                        Path candidate = Path.of(System.getProperty("user.dir"), relative).normalize();
                        if (Files.exists(candidate, new LinkOption[0]) && Files.isRegularFile(candidate, new LinkOption[0])) {
                            Log.warn("使用本地文件加载图片: " + String.valueOf(candidate.toAbsolutePath()));
                            return Image.getInstance(candidate.toAbsolutePath().toString());
                        }
                    } catch (Exception var6) {
                        e = var6;
                        Log.warn("本地文件图片解析失败(继续尝试): url=" + url + ", err=" + String.valueOf(e));
                    }

                    Image example = this.loadExampleImage();
                    if (example != null) {
                        Log.warn("静态路径图片不存在，使用示例图片 example_images/res1.jpg 兜底: url=" + url);
                        return example;
                    }
                }
            }

            try {
                return Image.getInstance(url);
            } catch (Exception var9) {
                e = var9;
                Log.warn("Image.getInstance(url) 失败: url=" + url + ", err=" + String.valueOf(e));
                this.logExceptionStack("Image.getInstance(url) 异常堆栈", e);
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    byte[] bytes = this.fetchImageBytesWithDebug(url);
                    if (bytes != null && bytes.length > 0) {
                        try {
                            return Image.getInstance(bytes);
                        } catch (Exception var8) {
                            e = var8;
                            Log.warn("Image.getInstance(bytes) 失败: url=" + url + ", bytes=" + bytes.length + ", err=" + String.valueOf(e));
                            this.logExceptionStack("Image.getInstance(bytes) 异常堆栈", e);
                        }
                    }
                }

                Log.warn("图片加载最终失败: url=" + url);
                return null;
            }
        } else {
            Log.warn("图片URL为空，无法加载");
            return null;
        }
    }

    private Image loadExampleImage() {
        try {
            InputStream is = this.getClass().getClassLoader().getResourceAsStream("example_images/res1.jpg");

            Object var8;
            label60: {
                Image var3;
                label61: {
                    try {
                        if (is == null) {
                            Log.warn("示例图片不存在: classpath:example_images/res1.jpg");
                            var8 = null;
                            break label60;
                        }

                        byte[] bytes = is.readAllBytes();
                        if (bytes.length == 0) {
                            Log.warn("示例图片为空: classpath:example_images/res1.jpg");
                            var3 = null;
                            break label61;
                        }

                        var3 = Image.getInstance(bytes);
                    } catch (Throwable var5) {
                        if (is != null) {
                            try {
                                is.close();
                            } catch (Throwable var4) {
                                var5.addSuppressed(var4);
                            }
                        }

                        throw var5;
                    }

                    if (is != null) {
                        is.close();
                    }

                    return var3;
                }

                if (is != null) {
                    is.close();
                }

                return var3;
            }

            if (is != null) {
                is.close();
            }

            return (Image)var8;
        } catch (Exception var6) {
            Exception e = var6;
            Log.warn("加载示例图片失败: classpath:example_images/res1.jpg, err=" + String.valueOf(e));
            return null;
        }
    }

    private String buildPlantResultsAdvice(PlantResultsVo p) {
        String diseaseType = p == null ? null : p.getDiseaseType();
        if (diseaseType == null || diseaseType.isBlank()) {
            return "建议结合田间实测情况，及时采取防治措施。";
        }
        return "建议针对“" + diseaseType + "”开展田间复核，并按当地植保建议及时防治。";
    }



    //生成出苗率检测报告
    @Override
    public void generateSeedingReport(GuziEmergenceHistory emergenceHistory, OutputStream outputStream){
        String detecttime = DateUtils.parseDateToStr("yyyy-MM-dd HH:mm:ss", emergenceHistory.getCreateTime());

        String baseName = emergenceHistory.getBaseName();
        String plotName = emergenceHistory.getPlotName();

        String inspectorUser = emergenceHistory.getInspectorUser();
        Double emergenceRate = emergenceHistory.getEmergenceRate();
        Double plotArea = emergenceHistory.getPlotArea();
        Double longitude = emergenceHistory.getLongitude();
        Double latitude = emergenceHistory.getLatitude();

        Long totalSeedlings = emergenceHistory.getTotalSeedlings();
        Double seedlingDensity = emergenceHistory.getSeedlingDensity();
        String resultImageUrl = emergenceHistory.getResultImage();
        //出苗总数
        String totalSeedlingsStr = (emergenceHistory.getTotalSeedlings()).toString();



        Document doc = new Document(PageSize.A4);
        try {

            PdfWriter.getInstance(doc, outputStream);
            doc.open();

            // ==============================
            // 标题
            // ==============================
            Paragraph title = new Paragraph("出苗率检测报告", chineseFontBold);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15f);
            doc.add(title);

            // ==============================
            // 基本信息表格
            // ==============================
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            addCell(table, "检测时间", chineseFontNormal);
            addCell(table, detecttime, chineseFontNormal);


            addCell(table, "检测人员", chineseFontNormal);
            addCell(table, inspectorUser, chineseFontNormal);

            addCell(table, "所属基地", chineseFontNormal);
            addCell(table, baseName, chineseFontNormal);

            addCell(table, "地块编号", chineseFontNormal);
            addCell(table, plotName, chineseFontNormal);

            addCell(table, "检测单位", chineseFontNormal);
            addCell(table, "谷子数智化管理系统", chineseFontNormal);

            addCell(table, "地块位置(经纬度坐标)", chineseFontNormal);
            addCell(table, "(" + GeoCoordinateUtil.longitudeToDms(longitude) + " , " + GeoCoordinateUtil.latitudeToDms(latitude) + ")", chineseFontNormal);

            addCell(table, "出苗率", chineseFontNormal);
            addCell(table, Double.toString(emergenceRate), chineseFontNormal);

            addCell(table, "苗情等级", chineseFontNormal);
            addCell(table, GetEmrateLevel(emergenceRate), chineseFontNormal);

            addCell(table, "出苗总数", chineseFontNormal);
            addCell(table, totalSeedlingsStr+"株", chineseFontNormal);

//            addCell(table, "补苗数量", chineseFontNormal);
//            addCell(table, "536 株", chineseFontNormal);

            doc.add(table);

            //检测结果 图
            Image img = null;
            try {
                img = loadImage(resultImageUrl);
            } catch (Exception e) {
                Log.warn("出苗率报告加载图像失败: url=" + resultImageUrl + ", err=" + e);
                logExceptionStack("出苗率报告加载图像异常堆栈", e);
            }

            if (img != null) {
                img.scaleToFit(600, 400);
                img.setAlignment(Element.ALIGN_CENTER);
                doc.add(img);
            } else {
                Paragraph imgFallback = new Paragraph("图片信息加载失败，请检查图片信息", chineseFontNormal);
                imgFallback.setAlignment(Element.ALIGN_CENTER);
                imgFallback.setSpacingBefore(10f);
                imgFallback.setSpacingAfter(10f);
                doc.add(imgFallback);
            }
            //添加图片备注
            // ==============================
            // 出苗率说明
            // ==============================


            Paragraph summary = new Paragraph(
                    "       经谷子出苗率功能检测, "+ plotName+"地块"+",总面积约为： "+ BigDecimal.valueOf(plotArea)
                            .divide(BigDecimal.valueOf(666.6667), 2, RoundingMode.HALF_UP) +" 亩,"+ "出苗率达:"+ emergenceRate +"%  ,出苗总数为:" + totalSeedlingsStr+"株,"+
                            "苗情等级判定为:"+GetEmrateLevel(emergenceRate)+" 。 建议措施："+GetEmrateOperation(emergenceRate)+"。",
                    chineseFontNormal
            );


            summary.setSpacingBefore(10f);
            summary.setSpacingAfter(10f);
            doc.add(summary);

            // ==============================
            // 分割线
            // ==============================
            LineSeparator line = new LineSeparator();
            line.setLineWidth(1f);
            line.setLineColor(Color.GRAY);
            doc.add(new Chunk(line));

            // ==============================
            // 备注
            // ==============================

            Paragraph note = new Paragraph();
            note.setAlignment(Element.ALIGN_LEFT);
            doc.add(note);

            // ==============================
            // 苗情等级与推荐措施表
            // ==============================
            PdfPTable levelTable = new PdfPTable(2);
            levelTable.setWidthPercentage(100);
            levelTable.setSpacingBefore(10f);

            addCell(levelTable, "图片颜色", chineseFontBold);
            addCell(levelTable, "出苗情况", chineseFontBold);

            addCell(levelTable, "绿色区域", chineseFontNormal);
            addCell(levelTable, "正常 (出苗率 >80%)", chineseFontNormal);

            addCell(levelTable, "黄色区域", chineseFontNormal);
            addCell(levelTable, "低度缺苗 (出苗率 65%-80%)", chineseFontNormal);

            addCell(levelTable, "橙色区域", chineseFontNormal);
            addCell(levelTable, "中度缺苗 (出苗率 50%-65%)", chineseFontNormal);

            addCell(levelTable, "红色区域", chineseFontNormal);
            addCell(levelTable, "高度缺苗 (出苗率 <50%)", chineseFontNormal);
            doc.add(levelTable);



            doc.close();
//            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("生成PDF报告失败", e);
        }
    }



    // 病害区域检查报告
    @Override
    public void generatePestAreaReport(PestAreaDetectionVo  p, OutputStream outputStream) throws Exception{

        Document doc = new Document(PageSize.A4);
        try {
            // 直接写入传入的 outputStream，不要经过 ByteArrayOutputStream
            PdfWriter writer = PdfWriter.getInstance(doc, outputStream);
            doc.open();
            // ==============================
            // 标题
            // ==============================
            Paragraph title = new Paragraph("病害区域检测报告", chineseFontBold);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15f);
            doc.add(title);

            // ==============================
            // 基本信息表格
            // ==============================
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 3f});
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

//            addCell(table, "检测编号", chineseFontNormal);
//            addCell(table, "地块-侯家沟 030", chineseFontNormal);

            addCell(table, "检测时间", chineseFontNormal);
//            addCell(table, String.valueOf(p.getCreateTime()), chineseFontNormal);
            addCell(table, new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(p.getCreateTime()), chineseFontNormal);
            addCell(table, "检测基地", chineseFontNormal);
            addCell(table, p.getBaseName(), chineseFontNormal);
            addCell(table, "检测人员", chineseFontNormal);
            addCell(table, String.valueOf(p.getCreateBy()), chineseFontNormal);
            addCell(table, "地块名称", chineseFontNormal);
            addCell(table, p.getPlotName(), chineseFontNormal);

            addCell(table, "地块位置(经纬度坐标)", chineseFontNormal);
            addCell(table, ("("+p.getLongitude() + " , " + p.getLatitude()+")"), chineseFontNormal);

            addCell(table, "病害发生率", chineseFontNormal);
            addCell(table, String.valueOf(p.getIncidenceRate())+"%", chineseFontNormal);

            addCell(table, "病害等级", chineseFontNormal);
            addCell(table, GetPestAreaLevel(p.getIncidenceRate()), chineseFontNormal);

            addCell(table, "建议措施", chineseFontNormal);
            addCell(table, GetPestAreaOprations(p.getIncidenceRate()), chineseFontNormal);

            doc.add(table);

            // ==============================
            // 检测结果图
            // ==============================
            String resultImageUrl = p.getRgbResultImage();
            Image img = null;
            try {
                img = loadImage(resultImageUrl);
            } catch (Exception e) {
                Log.warn("病害区域报告加载图像失败: " + e.getMessage());
            }

            if (img != null) {
                img.scaleToFit(600, 400);
                img.setAlignment(Element.ALIGN_CENTER);
                doc.add(img);
            } else {
                Paragraph imgFallback = new Paragraph("图片信息加载失败，请检查图片信息", chineseFontNormal);
                imgFallback.setAlignment(Element.ALIGN_CENTER);
                imgFallback.setSpacingBefore(10f);
                imgFallback.setSpacingAfter(10f);
                doc.add(imgFallback);
            }

            // ==============================
            // 病害说明段落
            // ==============================
            Paragraph summary = new Paragraph(
                    "   检测结果:" + p.getPlotName()+"地块发生:"+p.getDiseaseType()+" ,该地块存在病害区域，" +
                            "经模型判定病害发生率为："+ p.getIncidenceRate()+"%"+ "，病害等级为： " +GetPestAreaLevel(p.getIncidenceRate())+"。"+
                            "请按建议措施进行防控。",
                    chineseFontNormal
            );
            summary.setSpacingBefore(10f);
            summary.setSpacingAfter(10f);
            doc.add(summary);


            doc.close();

        } catch (Exception e) {
            throw new RuntimeException("生成病害检测PDF报告失败", e);
        }
    }


    // 病虫情植株监测报告
   @Override
    public void generatePestAreaReport(PlantResultsVo p, OutputStream outputStream) throws Exception {

        if (p == null) {
            throw new IllegalArgumentException("PlantResultsVo 不能为空");
        }

        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(doc, outputStream);
            doc.open();

            // ========================= 标题 =========================
            Paragraph title = new Paragraph("病虫害类型检测报告", chineseFontBold);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            doc.add(title);

            // ========================= 基本信息表格 =========================
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 3.8f});
            table.setSpacingBefore(5f);
            table.setSpacingAfter(10f);

            addCell(table, "检测编号", chineseFontNormal);
            addCell(table, safeText(p.getId()), chineseFontNormal);
            // 检测人要不要？


            addCell(table, "检测时间", chineseFontNormal);
            addCell(table, formatTime(p.getCreateTime()), chineseFontNormal);

            // 检测基地
            addCell(table, "检测基地", chineseFontNormal);
            addCell(table, safeText(p.getBaseName()), chineseFontNormal);
            // 检测地块
            addCell(table, "检测地块", chineseFontNormal);
            addCell(table, safeText(p.getPlotCode()), chineseFontNormal);


            addCell(table, "病虫害类型", chineseFontNormal);
            addCell(table, safeText(p.getDiseaseType()), chineseFontNormal);

            Map<String, String> introAndAdvice = resolveIntroAndAdvice(p);
        
            addCell(table, "病虫害信息", chineseFontNormal);
            addCell(table, safeText(introAndAdvice.get("intro")), chineseFontNormal);

            addCell(table, "建议措施", chineseFontNormal);
            addCell(table, safeText(introAndAdvice.get("advice")), chineseFontNormal);

            doc.add(table);

            // ========================= 图片说明 =========================
            Paragraph imgLabel = new Paragraph("检测结果图片：", chineseFontNormal);
            imgLabel.setSpacingAfter(5f);
            doc.add(imgLabel);

            // ========================= 识别结果图片 =========================
            Image img = null;
            try {
                img = loadImage(p.getResultImageUrl());
            } catch (Exception e) {
                Log.warn("病虫害类型报告加载图像失败: " + e.getMessage());
            }

            if (img != null) {
                img.scaleToFit(450, 300);
                img.setAlignment(Element.ALIGN_CENTER);
                doc.add(img);
            } else {
                Paragraph imgFallback = new Paragraph("图片信息加载失败，请检查图片信息", chineseFontNormal);
                imgFallback.setAlignment(Element.ALIGN_CENTER);
                imgFallback.setSpacingBefore(10f);
                imgFallback.setSpacingAfter(10f);
                doc.add(imgFallback);
            }

        } catch (Exception e) {
            throw new RuntimeException("生成虫害检测报告PDF失败", e);
        } finally {
            if (doc.isOpen()) {
                doc.close();
            }
        }
    }


    // 苗情检查报告
//    @Override
//    public byte[] generateMorphologyReport() {
//        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
//            Document doc = new Document();
//            PdfWriter.getInstance(doc, out);
//            doc.open();
//
//            // 使用中文字体创建标题
//            Paragraph title = new Paragraph("苗情检测报告", chineseFontBold);
//            title.setAlignment(Element.ALIGN_CENTER);
//            doc.add(title);
//
//            // 添加实线分割线
//            LineSeparator line = new LineSeparator();
//            line.setLineWidth(1f);
//            line.setLineColor(Color.GRAY);
//            doc.add(new Chunk(line));
//
//            // 检测信息表格
//            PdfPTable table = new PdfPTable(2);
//            table.setWidthPercentage(100);
//            table.setSpacingBefore(10f);
//            table.setSpacingAfter(10f);
//
//            addCell(table, "检测编号");
//            addCell(table, "MQR-20250808-001");
//
//            addCell(table, "检测时间");
//            addCell(table, "2025-08-08");
//
//            addCell(table, "检测人/单位");
//            addCell(table, "农业智能平台系统");
//
//            addCell(table, "图片分辨率");
//            addCell(table, "1920×1080 px");
//
//            addCell(table, "苗株数量");
//            addCell(table, "312 株");
//
//            addCell(table, "健康植株比例");
//            addCell(table, "89.4%");
//
//            addCell(table, "生长分布情况");
//            addCell(table, "均匀");
//
//            doc.add(table);
//
//            // 插入苗情图像（如有）
////      Image img = Image.getInstance("src/main/resources/imgs/seedling_status.jpg");
////      img.scaleAbsolute(300, 400);
////      doc.add(img);
//
//            // 检测结果摘要
//            Paragraph summary = new Paragraph(
//                    "系统通过图像识别技术对苗情进行了自动检测，识别到苗株共计 312 株，其中健康植株约占 89.4%。整体分布较为均匀，生长状态良好，未发现明显缺苗区域。",
//                    chineseFontNormal
//            );
//            summary.setSpacingBefore(10f);
//            summary.setSpacingAfter(10f);
//            doc.add(summary);
//
//            LineSeparator line2 = new LineSeparator();
//            line2.setLineWidth(1f);
//            line2.setLineColor(Color.GRAY);
//            doc.add(new Chunk(line2));
//
//            // 建议
//            doc.add(Chunk.NEWLINE);
//            Paragraph suggestion = new Paragraph(
//                    "建议持续监测苗情变化，确保土壤湿度适宜，及时补苗并进行病虫害预防措施，提升整体作物质量和产量。",
//                    chineseFontNormal
//            );
//            suggestion.setSpacingBefore(5f);
//            suggestion.setSpacingAfter(10f);
//            doc.add(suggestion);
//
//            // 备注
//            Paragraph note = new Paragraph(
//                    "本报告由农业智能系统自动生成，结合深度学习模型与图像识别算法分析所得，检测结果供参考，请结合实际农田情况科学决策。",
//                    chineseFontSmallItalic
//            );
//            note.setAlignment(Element.ALIGN_LEFT);
//            doc.add(note);
//
//            doc.close();
//            return out.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("生成苗情检测报告失败", e);
//        }
//    }

}
