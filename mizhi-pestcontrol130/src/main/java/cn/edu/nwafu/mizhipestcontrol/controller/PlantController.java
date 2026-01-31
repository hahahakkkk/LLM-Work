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
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantVo;
import cn.edu.nwafu.mizhipestcontrol.service.IPlantService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 病虫害植株
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/plant")
public class PlantController extends BaseController {

    private final IPlantService plantService;

    /**
     * 新增病虫害植株
     */
    @PostMapping()
    @RepeatSubmit(interval = 10000)
    public R<Void> add(@Validated(AddGroup.class) @RequestBody PlantBo bo) {
        return toAjax(plantService.insertByBo(bo));
    }


    /**
     * 查询病虫害植株列表
     */
    @GetMapping("/list")
    public TableDataInfo<PlantVo> list(PlantBo bo, PageQuery pageQuery) {
        return plantService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出病虫害植株列表
     */
    @Log(title = "病虫害植株", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(PlantBo bo, HttpServletResponse response) {
        List<PlantVo> list = plantService.queryList(bo);
        ExcelUtil.exportExcel(list, "病虫害植株", PlantVo.class, response);
    }

    /**
     * 获取病虫害植株详细信息
     *
     * @param id 主键
     */
    @GetMapping("/{id}")
    public R<PlantVo> getInfo(@NotNull(message = "主键不能为空")
                              @PathVariable Long id) {
        return R.ok(plantService.queryById(id));
    }



    /**
     * 修改病虫害植株
     */
    @Log(title = "病虫害植株", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody PlantBo bo) {
        return toAjax(plantService.updateByBo(bo));
    }

    /**
     * 删除病虫害植株
     *
     * @param ids 主键串
     */
    @Log(title = "病虫害植株", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return toAjax(plantService.deleteWithValidByIds(List.of(ids), true));
    }
}
