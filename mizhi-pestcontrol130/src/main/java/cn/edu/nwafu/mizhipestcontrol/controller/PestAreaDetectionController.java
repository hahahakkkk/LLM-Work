package cn.edu.nwafu.mizhipestcontrol.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BackDieaseAreaStaticVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.DeskDiseaseAreaVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.DeskEmergenceDataVo;
import jakarta.servlet.ServletOutputStream;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.*;
import cn.dev33.satoken.annotation.SaCheckPermission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
//import annotation.cn.edu.nwafu.common.idempotent.RepeatSubmit;
import cn.edu.nwafu.common.log.annotation.Log;
import cn.edu.nwafu.common.web.core.BaseController;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.common.log.enums.BusinessType;
import cn.edu.nwafu.common.excel.utils.ExcelUtil;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaDetectionVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PestAreaDetectionBo;
import cn.edu.nwafu.mizhipestcontrol.service.IPestAreaDetectionService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 病虫害区域检测记录
 * 前端访问路由地址为:/system/areaDetection
 *
 * @author LJF
 * @date 2025-10-30
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/areaDetection")
public class PestAreaDetectionController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(PestAreaDetectionController.class);
    private final IPestAreaDetectionService pestAreaDetectionService;

    /**
     * 查询病虫害区域检测记录列表
     */
//    @SaCheckPermission("system:areaDetection:list")
    @GetMapping("/list")
    public TableDataInfo<PestAreaDetectionVo> list(PestAreaDetectionBo bo, PageQuery pageQuery) {
        return pestAreaDetectionService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出病虫害区域检测记录列表
     */
//    @SaCheckPermission("system:areaDetection:export")
    @Log(title = "病虫害区域检测记录", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(PestAreaDetectionBo bo, HttpServletResponse response) {
        List<PestAreaDetectionVo> list = pestAreaDetectionService.queryList(bo);
        ExcelUtil.exportExcel(list, "病虫害区域检测记录", PestAreaDetectionVo.class, response);
    }

    /**
     * 获取病虫害区域检测记录详细信息
     *
     * @param id 主键
     */
//    @SaCheckPermission("system:areaDetection:query")
    @GetMapping("/{id}")
    public R<PestAreaDetectionVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(pestAreaDetectionService.queryById(id));
    }

    /**
     * 新增病虫害区域检测记录
     */
//    @SaCheckPermission("system:areaDetection:add")
    @Log(title = "病虫害区域检测记录", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PestAreaDetectionBo bo) {
        return toAjax(pestAreaDetectionService.insertByBo(bo));
    }

    /**
     * 修改病虫害区域检测记录
     */
//    @SaCheckPermission("system:areaDetection:edit")
    @Log(title = "病虫害区域检测记录", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PestAreaDetectionBo bo) {
        return toAjax(pestAreaDetectionService.updateByBo(bo));
    }

    /**
     * 删除病虫害区域检测记录
     *
     * @param ids 主键串
     */
//    @SaCheckPermission("system:areaDetection:remove")
    @Log(title = "病虫害区域检测记录", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(pestAreaDetectionService.deleteWithValidByIds(List.of(ids), true));
    }

    @GetMapping("/getDeskINfo")
    public R<List<DeskDiseaseAreaVo>> getDeskINfo(PestAreaDetectionBo bo, PageQuery pageQuery){
        TableDataInfo<PestAreaDetectionVo> result = pestAreaDetectionService.queryPageList(bo, pageQuery);
//        List<DeskDiseaseAreaVo> resultList = new ArrayList<>();
        List<DeskDiseaseAreaVo> resultList = result.getRows().stream()
                .map(vo -> {
                    DeskDiseaseAreaVo deskDiseaseAreaVo = new DeskDiseaseAreaVo();

                    deskDiseaseAreaVo.setId(vo.getId());
                    deskDiseaseAreaVo.setLandCode(vo.getPlotName());
                    deskDiseaseAreaVo.setBaseName(vo.getBaseName());
                    if (vo.getBaseId() != null) {
                        deskDiseaseAreaVo.setBaseId(String.valueOf(vo.getBaseId()));
                    }
                    if (vo.getPlotId() != null) {
                        deskDiseaseAreaVo.setPlotId(String.valueOf(vo.getPlotId()));
                    }
                    deskDiseaseAreaVo.setDiseaseType(vo.getDiseaseType());
                    deskDiseaseAreaVo.setIncidenceRate(vo.getIncidenceRate());
//                    deskDiseaseAreaVo.setLeval(vo.getIncidenceRate().intValue());
                    deskDiseaseAreaVo.setImageUrl(vo.getRgbResultImage());
                    if (vo.getIncidenceRate() == null){
                        deskDiseaseAreaVo.setLeval(-1);
                    }else if(vo.getIncidenceRate() > 25.0){
                        deskDiseaseAreaVo.setLeval(3);
                    }else if(vo.getIncidenceRate() >5.0){
                        deskDiseaseAreaVo.setLeval(2);
                    }else if(vo.getIncidenceRate() > 0.0){
                        deskDiseaseAreaVo.setLeval(1);
                    }else{
                        deskDiseaseAreaVo.setLeval(-1);
                    }

                    return deskDiseaseAreaVo;
                })
                .collect(Collectors.toList());
//        return R.ok(pestAreaDetectionService.getDeskINfo());
        return R.ok(resultList);
    }

    // 后台卡片信息获取
    @GetMapping("/BackDiseaseAreaStaticVo")
    public R<BackDieaseAreaStaticVo> getBackDieaseAreaStaticVo(){
        return pestAreaDetectionService.getDeskINfo();
    }

//    @GetMapping("/report/{id}")
//    @Log(title = "出苗率报告", businessType = BusinessType.EXPORT)
//    public void generatePestAreaReport(HttpServletResponse response,@NotNull(message = "主键不能为空") @PathVariable Long id) throws IOException {
//        byte[] pdfBytes = pestAreaDetectionService.generatePestAreaReportById(id);
////        log.warn("PDF bytes: {}", pdfBytes);
//        // 设置响应头信息
//        if (pdfBytes != null){
//            log.info("Pdf is not null");
//        }
//        response.setContentType("application/pdf;charset=UTF-8");
//        response.setHeader("Content-Disposition", "attachment; filename=PeatArea.pdf");
//        response.setHeader("Cache-Control", "no-cache");
//        if (pdfBytes != null) {
//            response.setContentLength(pdfBytes.length);
//        }
//
//        try (ServletOutputStream outputStream = response.getOutputStream()) {
//            outputStream.write(pdfBytes);
//            outputStream.flush();
//        }
//    }



//    @GetMapping("/report/{id}")
//    @Log(title = "出苗率报告", businessType = BusinessType.EXPORT)
//    public void generatePestAreaReport(
//            HttpServletResponse response,
//            @NotNull(message = "主键不能为空") @PathVariable Long id) throws IOException {
//
//        String filename = "病害区域检测报告_" + id + ".pdf";
//        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8.toString())
//                .replaceAll("\\+", "%20");
//
//        response.setContentType("application/pdf");
//        response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedFilename + "\"");
//        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//        response.setHeader("Pragma", "no-cache");
//        response.setDateHeader("Expires", 0);
//
//        try (ServletOutputStream outputStream = response.getOutputStream()) {
//            pestAreaDetectionService.generatePestAreaReportById(id, outputStream);
//            outputStream.flush();
//        } catch (IOException e) {
//            String message = e.getMessage();
//            if (message != null && (
//                    message.contains("你的主机中的软件中止了一个已建立的连接") ||
//                            message.contains("Broken pipe") ||
//                            message.contains("Connection reset by peer"))) {
//                log.warn("客户端提前断开连接，PDF 下载被取消。ID: {}", id);
//                return;
//            }
//            log.error("生成出苗率报告时发生 IO 异常，ID: {}", id, e);
//            throw e;
//        } catch (Exception e) {
//            log.error("生成出苗率报告失败，ID: {}", id, e);
//            throw new RuntimeException("报告生成失败", e);
//        }
//    }
@GetMapping("/report/{id}")
@Log(title = "病害区域检测报告", businessType = BusinessType.EXPORT)
public void generatePestAreaReport(
        HttpServletResponse response,
        @NotNull(message = "主键不能为空") @PathVariable Long id) throws IOException {

    String filename = "病害区域检测报告_" + id + ".pdf";
    String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8.toString())
            .replaceAll("\\+", "%20");

    response.setContentType("application/pdf");
//    response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedFilename + "\"");
    response.setHeader("Content-Disposition",
            "attachment; filename*=UTF-8''" + URLEncoder.encode(filename, StandardCharsets.UTF_8));
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    response.setHeader("Pragma", "no-cache");
    response.setDateHeader("Expires", 0);

    try (ServletOutputStream outputStream = response.getOutputStream()) {
        // 调用服务层方法，直接将PDF内容写入输出流
        pestAreaDetectionService.generatePestAreaReportById(id, outputStream);
        outputStream.flush();

        log.info("成功生成并发送病害区域检测报告，ID: {}", id);
    } catch (IOException e) {
        String message = e.getMessage();
        if (message != null && (
                message.contains("你的主机中的软件中止了一个已建立的连接") ||
                        message.contains("Broken pipe") ||
                        message.contains("Connection reset by peer"))) {
            log.warn("客户端提前断开连接，PDF 下载被取消。ID: {}", id);
            return;
        }
        log.error("生成病害区域检测报告时发生 IO 异常，ID: {}", id, e);
        throw e;
    } catch (Exception e) {
        log.error("生成病害区域检测报告失败，ID: {}", id, e);
        throw new RuntimeException("报告生成失败", e);
    }
}
    @PostMapping({"/report"})
    @Log(
            title = "病害区域检测报告",
            businessType = BusinessType.EXPORT
    )
    public void generatePestAreaReportByParams(HttpServletResponse response, @RequestBody PestAreaDetectionVo vo) throws IOException {
        if (vo == null) {
            response.sendError(400, "报告参数不能为空");
        } else {
            if (vo.getCreateTime() == null) {
                vo.setCreateTime(new Date());
            }

            if (vo.getIncidenceRate() == null) {
                response.sendError(400, "发病率(incidenceRate)不能为空");
            } else {
                String suffix = String.valueOf(System.currentTimeMillis());
                String filename = "病害区域检测报告_自定义_" + suffix + ".pdf";
                response.setContentType("application/pdf");
                response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + URLEncoder.encode(filename, StandardCharsets.UTF_8));
                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                response.setHeader("Pragma", "no-cache");
                response.setDateHeader("Expires", 0L);

                try {
                    ServletOutputStream outputStream = response.getOutputStream();

                    try {
                        this.pestAreaDetectionService.generatePestAreaReport(vo, outputStream);
                        outputStream.flush();
                        log.info("成功生成并发送病害区域检测报告(参数生成)");
                    } catch (Throwable var9) {
                        if (outputStream != null) {
                            try {
                                outputStream.close();
                            } catch (Throwable var8) {
                                var9.addSuppressed(var8);
                            }
                        }

                        throw var9;
                    }

                    if (outputStream != null) {
                        outputStream.close();
                    }

                } catch (IOException var10) {
                    IOException e = var10;
                    String message = e.getMessage();
                    if (message == null || !message.contains("你的主机中的软件中止了一个已建立的连接") && !message.contains("Broken pipe") && !message.contains("Connection reset by peer")) {
                        log.error("生成病害区域检测报告时发生 IO 异常(参数生成)", e);
                        throw e;
                    } else {
                        log.warn("客户端提前断开连接，PDF 下载被取消(参数生成)");
                    }
                } catch (Exception var11) {
                    Exception e = var11;
                    log.error("生成病害区域检测报告失败(参数生成)", e);
                    throw new RuntimeException("报告生成失败", e);
                }
            }
        }
    }

}
