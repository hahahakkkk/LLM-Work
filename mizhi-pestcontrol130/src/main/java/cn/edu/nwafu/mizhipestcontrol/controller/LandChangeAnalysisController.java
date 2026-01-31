package cn.edu.nwafu.mizhipestcontrol.controller;

import java.util.List;

import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
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
import cn.edu.nwafu.mizhipestcontrol.domain.vo.LandChangeAnalysisVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.LandChangeAnalysisBo;
import cn.edu.nwafu.mizhipestcontrol.service.ILandChangeAnalysisService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 土地变化分析
 * 前端访问路由地址为:/mizhipestcontrol/changeAnalysis
 *
 * @author LJF
 * @date 2025-12-11
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/changeAnalysis")
public class LandChangeAnalysisController extends BaseController {

    private final ILandChangeAnalysisService landChangeAnalysisService;

    /**
     * 查询土地变化分析列表
     */
    // @SaCheckPermission("mizhipestcontrol:changeAnalysis:list")
    @GetMapping("/list")
    public TableDataInfo<LandChangeAnalysisVo> list(LandChangeAnalysisBo bo, PageQuery pageQuery) {
        return landChangeAnalysisService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出土地变化分析列表
     */
    @SaCheckPermission("mizhipestcontrol:changeAnalysis:export")
    @Log(title = "土地变化分析", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(LandChangeAnalysisBo bo, HttpServletResponse response) {
        List<LandChangeAnalysisVo> list = landChangeAnalysisService.queryList(bo);
        ExcelUtil.exportExcel(list, "土地变化分析", LandChangeAnalysisVo.class, response);
    }

    /**
     * 获取土地变化分析详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("mizhipestcontrol:changeAnalysis:query")
    @GetMapping("/{id}")
    public R<LandChangeAnalysisVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(landChangeAnalysisService.queryById(id));
    }

    /**
     * 新增土地变化分析
     */
    @SaCheckPermission("mizhipestcontrol:changeAnalysis:add")
    @Log(title = "土地变化分析", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody LandChangeAnalysisBo bo) {
        return toAjax(landChangeAnalysisService.insertByBo(bo));
    }

    /**
     * 修改土地变化分析
     */
    @SaCheckPermission("mizhipestcontrol:changeAnalysis:edit")
    @Log(title = "土地变化分析", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody LandChangeAnalysisBo bo) {
        return toAjax(landChangeAnalysisService.updateByBo(bo));
    }

    /**
     * 删除土地变化分析
     *
     * @param ids 主键串
     */
    @SaCheckPermission("mizhipestcontrol:changeAnalysis:remove")
    @Log(title = "土地变化分析", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(landChangeAnalysisService.deleteWithValidByIds(List.of(ids), true));
    }
}
