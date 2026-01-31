package cn.edu.nwafu.mizhipestcontrol.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantResultsBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BackPestVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantDetectionRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SuHuiMingDetectionVo;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.*;
import cn.dev33.satoken.annotation.SaCheckPermission;
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
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantResultsVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantResultsBo;
import cn.edu.nwafu.mizhipestcontrol.service.IPlantResultsService;
import cn.edu.nwafu.mizhipestcontrol.service.IPdfReportService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 病虫害植株识别结果
 * 前端访问路由地址为:/system/results
 *
 * @author LJF
 * @date 2025-10-27
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/PlantResults")
public class PlantResultsController extends BaseController {

    private final IPlantResultsService plantResultsService;
        private final IPdfReportService pdfReportService;

    /**
     * 查询病虫害植株识别结果列表
     */
//    @SaCheckPermission("system:results:list")
    @GetMapping("/list")
    public TableDataInfo<PlantResultsVo> list(PlantResultsBo bo, PageQuery pageQuery) {
        return plantResultsService.queryPageList(bo, pageQuery);
    }

    /**
     * 获取植株检测记录信息
     * 多种  负泥1 白发2 混合3
     */
    @GetMapping("/getMultipleDiseaseRecords")
    public R<List<PlantDetectionRecordVo>> getPlantDetectionRecords(@RequestParam(required = false) Integer growthStage) {
        List<PlantDetectionRecordVo> records = plantResultsService.getPlantDetectionRecords(growthStage);
        return R.ok(records);
    }

    /**
     * 获取粟灰螟检测记录
     */
    @GetMapping("/getSuHuiMingDetectionRecords")
    public R<List<SuHuiMingDetectionVo>> getSuHuiMingDetectionRecords() {
        List<SuHuiMingDetectionVo> records = plantResultsService.getSuHuiMingDetectionRecords();
        return R.ok(records);
    }

    /**
     * 导出病虫害植株识别结果列表
     */
//    @SaCheckPermission("system:results:export")
    @Log(title = "病虫害植株识别结果", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(PlantResultsBo bo, HttpServletResponse response) {
        List<PlantResultsVo> list = plantResultsService.queryList(bo);
        ExcelUtil.exportExcel(list, "病虫害植株识别结果", PlantResultsVo.class, response);
    }

    /**
     * 获取病虫害植株识别结果详细信息
     *
     * @param id 主键
     */
//    @SaCheckPermission("system:results:query")
    @GetMapping("/{id}")
    public R<PlantResultsVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(plantResultsService.queryById(id));
    }

    /**
     * 新增病虫害植株识别结果
     */
//    @SaCheckPermission("system:results:add")
    @Log(title = "病虫害植株识别结果", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PlantResultsBo bo) {
        return toAjax(plantResultsService.insertByBo(bo));
    }

    /**
     * 修改病虫害植株识别结果
     */
//    @SaCheckPermission("system:results:edit")
    @Log(title = "病虫害植株识别结果", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PlantResultsBo bo) {
        return toAjax(plantResultsService.updateByBo(bo));
    }

    /**
     * 删除病虫害植株识别结果
     *
     * @param ids 主键串
     */
//    @SaCheckPermission("system:results:remove")
    @Log(title = "病虫害植株识别结果", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        boolean deleted = plantResultsService.deleteWithValidByIds(List.of(ids), true);
        if (deleted) {
            return R.ok(null);
        }
        return R.fail("删除失败：未删除任何数据。"+
        "请检查当前账号数据范围及租户是否匹配。");
    }

    @GetMapping("/getBackPestInfo")
    public R<BackPestVo> getBackPestInfo() {
        return plantResultsService.getBacckPestInfo();
    }

    @GetMapping("/report/{id}")
    public void downloadPlantResultReport(@NotNull(message = "主键不能为空")
                                          @PathVariable Long id,
                                          HttpServletResponse response) throws IOException {
        PlantResultsVo plantResult = plantResultsService.queryById(id);
        if (plantResult == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        response.reset();
        response.setContentType("application/pdf");
        String encodedFileName = URLEncoder.encode("plant-result-" + id + ".pdf", StandardCharsets.UTF_8);
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFileName);

        try {
            pdfReportService.generatePestAreaReport(plantResult, response.getOutputStream());
            response.flushBuffer();
        } catch (Exception ex) {
            throw new RuntimeException("生成病虫害检测报告失败", ex);
        }
    }
}
