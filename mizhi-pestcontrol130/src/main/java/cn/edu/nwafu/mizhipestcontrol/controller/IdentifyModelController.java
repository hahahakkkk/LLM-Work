package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.common.excel.utils.ExcelUtil;
import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import cn.edu.nwafu.common.log.annotation.Log;
import cn.edu.nwafu.common.log.enums.BusinessType;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.web.core.BaseController;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.IdentifyModelBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyModelVo;
import cn.edu.nwafu.mizhipestcontrol.service.IIdentifyModelService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 病虫害模型
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/identifyModel")
public class IdentifyModelController extends BaseController {

    private final IIdentifyModelService identifyModelService;

    /**
     * 查询病虫害模型列表
     */
    @GetMapping("/list")
    public TableDataInfo<IdentifyModelVo> list(IdentifyModelBo bo, PageQuery pageQuery) {
        return identifyModelService.queryPageList(bo, pageQuery);
    }

    /**
     * 查询区域检测模型
     */
    @GetMapping("/listAreaModel")
    public TableDataInfo<IdentifyModelVo> listAreaModel(IdentifyModelBo bo, PageQuery pageQuery) {
        return identifyModelService.listAreaModel(bo, pageQuery);
    }
    /**
     * 获取虫害植株模型详细信息
     *
     * @param modelId 主键
     */
    @GetMapping("/getPestModel/{modelId}")
    public R<IdentifyModelVo> getPestModel(
            @PathVariable
            @NotNull(message = "模型ID不能为空")
            Long modelId) {
        return R.ok(identifyModelService.queryById(modelId));
    }

    /**
     * 获取病害植株模型详细信息
     *
     * @param modelId 主键
     */
    @GetMapping("/getDieaseModel/{modelId}")
    public R<IdentifyModelVo> getDieaseModel(
            @PathVariable
            @NotNull(message = "模型ID不能为空")
            Long modelId) {
        return R.ok(identifyModelService.queryById(modelId));
    }
    /**
     * 查询病虫害识别模型
     */
    @GetMapping("/listIdentifyModel")
    public TableDataInfo<IdentifyModelVo> listIdentifyModel(IdentifyModelBo bo, PageQuery pageQuery) {
        return identifyModelService.listIdentifyModel(bo, pageQuery);
    }




    /**
     * 导出病虫害模型列表
     */
    @Log(title = "病虫害模型", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(IdentifyModelBo bo, HttpServletResponse response) {
        List<IdentifyModelVo> list = identifyModelService.queryList(bo);
        ExcelUtil.exportExcel(list, "病虫害模型", IdentifyModelVo.class, response);
    }

    /**
     * 获取病虫害模型详细信息
     *
     * @param modelId 主键
     */
    @GetMapping("/{modelId}")
    public R<IdentifyModelVo> getInfo(@NotNull(message = "主键不能为空")
                                      @PathVariable Long modelId) {
        return R.ok(identifyModelService.queryById(modelId));
    }

    /**
     * 新增病虫害模型
     */
    @Log(title = "病虫害模型", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody IdentifyModelBo bo) {
        return toAjax(identifyModelService.insertByBo(bo));
    }

    /**
     * 修改病虫害模型
     */
    @Log(title = "病虫害模型", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody IdentifyModelBo bo) {
        return toAjax(identifyModelService.updateByBo(bo));
    }

    /**
     * 删除病虫害模型
     *
     * @param modelIds 主键串
     */
    @Log(title = "病虫害模型", businessType = BusinessType.DELETE)
    @DeleteMapping("/{modelIds}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] modelIds) {
        return toAjax(identifyModelService.deleteWithValidByIds(List.of(modelIds), true));
    }
}
