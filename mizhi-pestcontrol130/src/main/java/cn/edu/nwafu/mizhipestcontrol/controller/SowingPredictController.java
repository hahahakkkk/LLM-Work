package cn.edu.nwafu.mizhipestcontrol.controller;

import java.util.List;

import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.*;
import cn.dev33.satoken.annotation.SaCheckPermission;
import org.apache.commons.io.output.UnsynchronizedByteArrayOutputStream;
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
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.SowingPredictBo;
import cn.edu.nwafu.mizhipestcontrol.service.ISowingPredictService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 基地播种计划
 * 前端访问路由地址为:/pestcontrol/predict
 *
 * @author LJF
 * @date 2025-11-21
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/predict")
public class SowingPredictController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(SowingPredictController.class);
    private final ISowingPredictService sowingPredictService;

    /**
     * 查询基地播种计划列表
     */
//    @SaCheckPermission("pestcontrol:predict:list")
    @GetMapping("/list")
    public TableDataInfo<cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictInfoVo> list(SowingPredictBo bo, PageQuery pageQuery) {
        return sowingPredictService.queryInfoPageList(bo, pageQuery);
    }

    /**
     * 导出基地播种计划列表
     */
   @SaCheckPermission("pestcontrol:predict:export")
    @Log(title = "基地播种计划", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(SowingPredictBo bo, HttpServletResponse response) {
        List<cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictInfoVo> list = sowingPredictService.queryInfoList(bo);
        ExcelUtil.exportExcel(list, "基地播种计划", cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictInfoVo.class, response);
        log.error("commons-io location: " +
                UnsynchronizedByteArrayOutputStream.class.getProtectionDomain().getCodeSource().getLocation());
    }

    /**
     * 获取基地播种计划详细信息
     *
     * @param id 主键
     */
//    @SaCheckPermission("pestcontrol:predict:query")
    @GetMapping("/{id}")
    public R<SowingPredictVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(sowingPredictService.queryById(id));
    }

    /**
     * 新增基地播种计划
     */
   @SaCheckPermission("pestcontrol:predict:add")
    @Log(title = "基地播种计划", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody SowingPredictBo bo) {
        return toAjax(sowingPredictService.insertByBo(bo));
    }

    /**
     * 修改基地播种计划
     */
   @SaCheckPermission("pestcontrol:predict:edit")
    @Log(title = "基地播种计划", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody SowingPredictBo bo) {
        return toAjax(sowingPredictService.updateByBo(bo));
    }

    /**
     * 删除基地播种计划
     *
     * @param ids 主键串
     */
   @SaCheckPermission("pestcontrol:predict:remove")
    @Log(title = "基地播种计划", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(sowingPredictService.deleteWithValidByIds(List.of(ids), true));
    }

    /**
     *获取对应基地的预测结果信息
     */

//    @GetMapping("/getPredictResult/{baseId}")
//    public R<SowingPredictVo> getPredictResult(@NotNull(message = "基地id不能为空")){
//        return R.ok(sowingPredictService.getPredictResult(baseId));
//    }
}
