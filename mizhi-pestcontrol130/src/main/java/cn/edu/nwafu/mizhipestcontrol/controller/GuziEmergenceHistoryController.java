package cn.edu.nwafu.mizhipestcontrol.controller;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.AvgEmergenceInfoVo;
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
import cn.edu.nwafu.common.log.annotation.Log;
import cn.edu.nwafu.common.web.core.BaseController;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.common.log.enums.BusinessType;
import cn.edu.nwafu.common.excel.utils.ExcelUtil;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GuziEmergenceHistoryVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.GuziEmergenceHistoryBo;
import cn.edu.nwafu.mizhipestcontrol.service.IGuziEmergenceHistoryService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 谷子出苗率历史记录
 * 前端访问路由地址为:/system/emergenceHistory
 *
 * @author LJF
 * @date 2025-10-29
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/emergenceHistory")
public class GuziEmergenceHistoryController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(GuziEmergenceHistoryController.class);
    private final IGuziEmergenceHistoryService guziEmergenceHistoryService;

    /**
     * 查询谷子出苗率历史记录列表
     */
//    @SaCheckPermission("pestcontrol:emergenceHistory:list")
    @GetMapping("/list")
    public TableDataInfo<GuziEmergenceHistoryVo> list(GuziEmergenceHistoryBo bo, PageQuery pageQuery) {
        return guziEmergenceHistoryService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出谷子出苗率历史记录列表
     */
//    @SaCheckPermission("pestcontrol:emergenceHistory:export")
    @Log(title = "谷子出苗率历史记录", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(GuziEmergenceHistoryBo bo, HttpServletResponse response) {
        List<GuziEmergenceHistoryVo> list = guziEmergenceHistoryService.queryList(bo);
        ExcelUtil.exportExcel(list, "谷子出苗率历史记录", GuziEmergenceHistoryVo.class, response);
    }

    /**
     * 获取谷子出苗率历史记录详细信息
     *
     * @param id 主键
     */
//    @SaCheckPermission("pestcontrol:emergenceHistory:query")
    @GetMapping("/{id}")
    public R<GuziEmergenceHistoryVo> getInfo(@NotNull(message = "主键不能为空")
                                             @PathVariable Long id) {
        return R.ok(guziEmergenceHistoryService.queryById(id));
    }

    /**
     * 新增谷子出苗率历史记录
     */
//    @SaCheckPermission("pestcontrol:emergenceHistory:add")
    @Log(title = "谷子出苗率历史记录", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody GuziEmergenceHistoryBo bo) {
        return toAjax(guziEmergenceHistoryService.insertByBo(bo));
    }

    /**
     * 修改谷子出苗率历史记录
     */
//    @SaCheckPermission("pestcontrol:emergenceHistory:edit")
    @Log(title = "谷子出苗率历史记录", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody GuziEmergenceHistoryBo bo) {
        return toAjax(guziEmergenceHistoryService.updateByBo(bo));
    }

    /**
     * 删除谷子出苗率历史记录
     *
     * @param ids 主键串
     */
//    @SaCheckPermission("pestcontrol:emergenceHistory:remove")
    @Log(title = "谷子出苗率历史记录", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(guziEmergenceHistoryService.deleteWithValidByIds(List.of(ids), true));
    }
    /**
     * 后台出苗率展示数据
     *
     * @param
     */
    @GetMapping("/avginfo")
    public R<AvgEmergenceInfoVo> getAvgInfo() {
        return R.ok(guziEmergenceHistoryService.getAvgEmergenceInfo());
    }


    // 指定记录下载历史报告
    @RepeatSubmit
    @GetMapping("Pdf/{id}")
    @Log(title = "出苗率报告", businessType = BusinessType.EXPORT)
//    public void rateSeedingReport(HttpServletResponse response,@NotNull(message = "主键不能为空") @PathVariable Long id, OutputStream outputStream) throws IOException {
//        byte[] pdfBytes = guziEmergenceHistoryService.generateSeedingReportById(id, outputStream);
//
//        // 设置响应头信息
//        response.setContentType("application/pdf;charset=UTF-8");
//        response.setHeader("Content-Disposition", "attachment; filename=EmergenceRate.pdf");
//        response.setHeader("Cache-Control", "no-cache");
//        response.setContentLength(pdfBytes.length);
//
//        try (ServletOutputStream outputStream = response.getOutputStream()) {
//            outputStream.write(pdfBytes);
//            outputStream.flush();
//        }
//    }
    public void generatePestAreaReport(
            HttpServletResponse response,
            @NotNull(message = "主键不能为空") @PathVariable Long id) throws IOException {

        String filename = "出苗率检测报告_" + id + ".pdf";
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8.toString())
                .replaceAll("\\+", "%20");

        response.setContentType("application/pdf");
//        response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedFilename + "\"");
        response.setHeader("Content-Disposition",
                "attachment; filename*=UTF-8''" + URLEncoder.encode(filename, StandardCharsets.UTF_8));
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        try (ServletOutputStream outputStream = response.getOutputStream()) {
            // 调用服务层方法，直接将PDF内容写入输出流
            guziEmergenceHistoryService.generateSeedingReportById(id, outputStream);
            outputStream.flush();

            log.info("成功生成并发送出苗率检测报告，ID: {}", id);
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


    @RepeatSubmit
    @PostMapping({"/report"})
    public void GenerateSeedingReport(HttpServletResponse response, @Validated({AddGroup.class}) @RequestBody GuziEmergenceHistory emergenceHistory) throws IOException {
        String filename = "出苗率检测报告.pdf";
        response.setContentType("application/pdf");
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-Disposition", "attachment; filename=EmergenceReport.pdf; filename*=UTF-8''" + encoded);
        response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0L);

        try {
            ServletOutputStream outputStream = response.getOutputStream();

            try {
                this.guziEmergenceHistoryService.generateSeedingReportDirectly(emergenceHistory, outputStream);
                outputStream.flush();
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
                throw e;
            } else {
                log.warn("客户端提前断开连接，PDF 下载被取消。/emergenceHistory/report");
            }
        } catch (Exception var11) {
            Exception e = var11;
            throw new RuntimeException("报告生成失败", e);
        }
    }
    
    // @RepeatSubmit ()
    @GetMapping("/deskEmergenceData")
    public R<List<DeskEmergenceDataVo>> getDeskEmergenceData(GuziEmergenceHistoryBo bo) {
        // 1. 调用服务层，获取列表
        List<GuziEmergenceHistory> historyList = guziEmergenceHistoryService.queryGuziEmergenceHistoryList(bo);

        // 2. 转换为 VO 列表
        List<DeskEmergenceDataVo> voList = new ArrayList<>();

        for (GuziEmergenceHistory history : historyList) {
            DeskEmergenceDataVo vo = new DeskEmergenceDataVo();

            // 设置缺苗等级 level
            Double rate = history.getEmergenceRate();
            if (rate == null) {
                vo.setLevel(-1); // 未知
            } else if (rate >= 80) {
                vo.setLevel(0); // 正常
            } else if (rate >= 65) {
                vo.setLevel(1); // 轻度
            } else if (rate >= 50) {
                vo.setLevel(2); // 中度
            } else if (rate >= 0.0) {
                vo.setLevel(3); // 重度
            }

            // 其他字段映射
            vo.setId(history.getId());
            vo.setLandCode(history.getPlotName());
            vo.setBaseName(history.getBaseName());
            // 保留原始主键，前端需要关联基地/地块
            vo.setBaseId(history.getBaseId() == null ? null : String.valueOf(history.getBaseId()));
            vo.setPlotId(history.getPlotId() == null ? null : String.valueOf(history.getPlotId()));
            vo.setEmergenceRate(rate); // 建议保留为 Double，前端格式化为 "92.5%"
            vo.setTotalSeedings(history.getTotalSeedlings());

            // 日期处理：避免 toString()，建议格式化
            if (history.getCreateTime() != null) {
                // 假设 createTime 是 LocalDateTime 或 Date，这里以 LocalDateTime 为例
                vo.setDetectionDate(history.getCreateTime().toString()); // 或用格式化
            } else {
                vo.setDetectionDate("无");
            }

            vo.setImageUrl(history.getResultImage());

            voList.add(vo);
        }

        // 3. 返回成功结果
        return R.ok(voList);
    }


}
