package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.common.excel.utils.ExcelUtil;
import cn.edu.nwafu.common.idempotent.annotation.RepeatSubmit;
import cn.edu.nwafu.common.log.annotation.Log;
import cn.edu.nwafu.common.log.enums.BusinessType;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.web.core.BaseController;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.FarmlandBo;
import cn.edu.nwafu.mizhipestcontrol.domain.dao.FarmlandDao;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.FarmlandVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.StatisticsDataVO;
import cn.edu.nwafu.mizhipestcontrol.service.IFarmlandService;
import cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi.PestInfoImpl;
import cn.edu.nwafu.mz_external_program_api.vo.PestInfo;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 病虫害区域信息
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/farmland")
public class FarmlandController extends BaseController {

    private final IFarmlandService farmlandService;
    private final PestInfoImpl pestInfoImpl;

    /**
     * 数据概览1
     */
    @GetMapping("/fetchStatistics")
    public R<StatisticsDataVO> fetchStatistics() {
        // 只能通过区域检测之后新增区域信息
        return farmlandService.fetchStatistics();
    }


    /**
     * 新增区域信息
     */
    @PostMapping()
    @RepeatSubmit(interval = 10000)
    public R<Void> add(@RequestBody FarmlandDao dao) {
        // 只能通过区域检测之后新增区域信息
        return toAjax(farmlandService.insertByDao(dao));
    }

    /**
     * 查询区域信息列表
     */
    @GetMapping("/list")
    public TableDataInfo<FarmlandVo> list(FarmlandBo bo, PageQuery pageQuery) {
        return farmlandService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出区域信息列表
     */
    @Log(title = "区域信息管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(FarmlandBo bo, HttpServletResponse response) {
        List<FarmlandVo> list = farmlandService.queryList(bo);
        ExcelUtil.exportExcel(list, "区域信息管理", FarmlandVo.class, response);
    }

    /**
     * 获取区域信息详细信息
     *
     * @param farmlandId 主键
     */
    @GetMapping("/{farmlandId}")
    public R<FarmlandVo> getInfo(@NotNull(message = "主键不能为空")
                                 @PathVariable Long farmlandId) {
        return R.ok(farmlandService.queryById(farmlandId));
    }



    /**
     * 修改区域信息
     */
    @Log(title = "区域信息管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody FarmlandBo bo) {
        return toAjax(farmlandService.updateByBo(bo));
    }

    /**
     * 删除区域信息
     *
     * @param farmlandIds 主键串
     */
    @Log(title = "区域信息管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{farmlandIds}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] farmlandIds) {
        return toAjax(farmlandService.deleteWithValidByIds(List.of(farmlandIds), true));
    }

    // test 对外数据接口
    @GetMapping("/test")
    public List<PestInfo> test() {
        return pestInfoImpl.getPestData();
    }
}
