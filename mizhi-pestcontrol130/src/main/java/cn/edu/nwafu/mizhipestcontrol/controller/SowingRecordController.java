package cn.edu.nwafu.mizhipestcontrol.controller;

import java.time.LocalDate;
import java.util.List;

import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GrowthPeriodVo;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.*;
import cn.dev33.satoken.annotation.SaCheckPermission;
import org.springframework.format.annotation.DateTimeFormat;
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
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.SowingRecordBo;
import cn.edu.nwafu.mizhipestcontrol.service.ISowingRecordService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 基地实际播种日期记录
 * 前端访问路由地址为:/pestcontrol/record
 *
 * @author LJF
 * @date 2025-11-04
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/record")
public class SowingRecordController extends BaseController {

    private final ISowingRecordService sowingRecordService;

    /**
     * 查询基地实际播种日期记录列表
     */
//    @SaCheckPermission("pestcontrol:record:list")
    @GetMapping("/list")
    public TableDataInfo<SowingRecordVo> list(SowingRecordBo bo, PageQuery pageQuery) {
        return sowingRecordService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出基地实际播种日期记录列表
     */
//    @SaCheckPermission("pestcontrol:record:export")
    @Log(title = "基地实际播种日期记录", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(SowingRecordBo bo, HttpServletResponse response) {
        List<SowingRecordVo> list = sowingRecordService.queryList(bo);
        ExcelUtil.exportExcel(list, "基地实际播种日期记录", SowingRecordVo.class, response);
    }

    /**
     * 获取基地实际播种日期记录详细信息
     *
     * @param id 主键
     */
//    @SaCheckPermission("pestcontrol:record:query")
    @GetMapping("/{id}")
    public R<SowingRecordVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(sowingRecordService.queryById(id));
    }

    /**
     * 新增基地实际播种日期记录
     */
//    @SaCheckPermission("pestcontrol:record:add")
    @Log(title = "基地实际播种日期记录", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody SowingRecordBo bo) {
        return toAjax(sowingRecordService.insertByBo(bo));
    }

    /**
     * 修改基地实际播种日期记录
     */
//    @SaCheckPermission("pestcontrol:record:edit")
    @Log(title = "基地实际播种日期记录", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody SowingRecordBo bo) {
        return toAjax(sowingRecordService.updateByBo(bo));
    }

    /**
     * 删除基地实际播种日期记录
     *
     * @param ids 主键串
     */
//    @SaCheckPermission("pestcontrol:record:remove")
    @Log(title = "基地实际播种日期记录", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(sowingRecordService.deleteWithValidByIds(List.of(ids), true));
    }
    /**
     * 根据基地名查询当前生育期
     *
     * @param baseName 基地名
     * @return 当前生育期信息
     */
//    @SaCheckPermission("pestcontrol:growth:query")
    @Log(title = "基地生育期查询", businessType = BusinessType.OTHER)
    @GetMapping("/period")
    public R<GrowthPeriodVo> getGrowthPeriod(@NotBlank(message = "基地名不能为空")
                                             @RequestParam String baseName,
                                             @RequestParam(required = false)
                                             @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) // 支持 "yyyy-MM-dd" 格式
                                                 LocalDate date) {
        return sowingRecordService.queryGrowthPeriodByBaseName(baseName,date);
    }

    /**
     * 根据基地ID查询当前生育期
     * 用于前端大屏等系统根据baseId快速查询生育期信息
     *
     * @param baseId 基地ID
     * @param date 查询日期（可选，默认为今天）
     * @return 当前生育期信息
     */
//    @SaCheckPermission("pestcontrol:growth:query")
    @Log(title = "基地生育期查询(按ID)", businessType = BusinessType.OTHER)
    @GetMapping("/period/by-id")
    public R<GrowthPeriodVo> getGrowthPeriodByBaseId(@NotNull(message = "基地ID不能为空")
                                                     @RequestParam Long baseId,
                                                     @RequestParam(required = false)
                                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                                         LocalDate date) {
        return sowingRecordService.queryGrowthPeriodByBaseId(baseId, date);
    }

    /**
     * 查询所有基地的当前生育期
     * 用于大屏展示所有基地的生育期信息
     *
     * @param date 查询日期（可选，默认为今天）
     * @return 所有基地的生育期信息列表
     */
//    @SaCheckPermission("pestcontrol:growth:query")
    @Log(title = "查询所有基地生育期", businessType = BusinessType.OTHER)
    @GetMapping("/period/all")
    public R<List<GrowthPeriodVo>> getAllBasesGrowthPeriod(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                LocalDate date) {
        return sowingRecordService.queryAllBasesGrowthPeriod(date);
    }
}
