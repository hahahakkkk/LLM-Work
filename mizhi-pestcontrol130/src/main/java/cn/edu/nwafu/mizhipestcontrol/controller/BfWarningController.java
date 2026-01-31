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
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BfWarningVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.BfWarningBo;
import cn.edu.nwafu.mizhipestcontrol.service.IBfWarningService;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;

/**
 * 气象预警与建议数据
 * 前端访问路由地址为:/mizhipestcontrol/warning
 *
 * @author LJF
 * @date 2026-01-22
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/warning")
public class BfWarningController extends BaseController {

    private final IBfWarningService bfWarningService;

    /**
     * 查询气象预警与建议数据列表
     */
    @SaCheckPermission("mizhipestcontrol:warning:list")
    @GetMapping("/list")
    public TableDataInfo<BfWarningVo> list(BfWarningBo bo, PageQuery pageQuery) {
        return bfWarningService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出气象预警与建议数据列表
     */
    @SaCheckPermission("mizhipestcontrol:warning:export")
    @Log(title = "气象预警与建议数据", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(BfWarningBo bo, HttpServletResponse response) {
        List<BfWarningVo> list = bfWarningService.queryList(bo);
        ExcelUtil.exportExcel(list, "气象预警与建议数据", BfWarningVo.class, response);
    }

    /**
     * 获取气象预警与建议数据详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("mizhipestcontrol:warning:query")
    @GetMapping("/{id}")
    public R<BfWarningVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(bfWarningService.queryById(id));
    }

    /**
     * 新增气象预警与建议数据
     */
    @SaCheckPermission("mizhipestcontrol:warning:add")
    @Log(title = "气象预警与建议数据", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody BfWarningBo bo) {
        return toAjax(bfWarningService.insertByBo(bo));
    }

    /**
     * 修改气象预警与建议数据
     */
    @SaCheckPermission("mizhipestcontrol:warning:edit")
    @Log(title = "气象预警与建议数据", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody BfWarningBo bo) {
        return toAjax(bfWarningService.updateByBo(bo));
    }

    /**
     * 删除气象预警与建议数据
     *
     * @param ids 主键串
     */
    @SaCheckPermission("mizhipestcontrol:warning:remove")
    @Log(title = "气象预警与建议数据", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(bfWarningService.deleteWithValidByIds(List.of(ids), true));
    }
}
