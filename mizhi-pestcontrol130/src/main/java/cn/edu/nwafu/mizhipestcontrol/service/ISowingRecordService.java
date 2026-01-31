package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingRecord;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GrowthPeriodVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordExportVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.SowingRecordBo;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Date;
import java.util.List;

/**
 * 基地实际播种日期记录Service接口
 *
 * @author LJF
 * @date 2025-11-04
 */
public interface ISowingRecordService {

    /**
     * 查询基地实际播种日期记录
     *
     * @param id 主键
     * @return 基地实际播种日期记录
     */
    SowingRecordVo queryById(Long id);

    /**
     * 分页查询基地实际播种日期记录列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 基地实际播种日期记录分页列表
     */
    TableDataInfo<SowingRecordVo> queryPageList(SowingRecordBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的基地实际播种日期记录列表
     *
     * @param bo 查询条件
     * @return 基地实际播种日期记录列表
     */
    List<SowingRecordVo> queryList(SowingRecordBo bo);

    /**
     * 查询导出数据（含颜色与形态信息）
     */
    List<SowingRecordExportVo> queryExportInfoList(SowingRecordBo bo);

    /**
     * 新增基地实际播种日期记录
     *
     * @param bo 基地实际播种日期记录
     * @return 是否新增成功
     */
    Boolean insertByBo(SowingRecordBo bo);

    /**
     * 修改基地实际播种日期记录
     *
     * @param bo 基地实际播种日期记录
     * @return 是否修改成功
     */
    Boolean updateByBo(SowingRecordBo bo);

    /**
     * 校验并批量删除基地实际播种日期记录信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    /**
     * 根据基地名查询当前生育期
     *
     * @param baseName 基地名
     * @return 生育期信息
     */
    R<GrowthPeriodVo> queryGrowthPeriodByBaseName(String baseName, LocalDate date);

    /**
     * 根据基地ID查询当前生育期
     *
     * @param baseId 基地ID
     * @param date 查询日期（可选）
     * @return 生育期信息
     */
    R<GrowthPeriodVo> queryGrowthPeriodByBaseId(Long baseId, LocalDate date);

    /**
     * 查询所有基地的当前生育期
     *
     * @param date 查询日期（可选）
     * @return 所有基地的生育期信息列表
     */
    R<List<GrowthPeriodVo>> queryAllBasesGrowthPeriod(LocalDate date);

    /**
     * 根据基地名查询查询实际播种期 返回最新的一条
     *
     * @param baseName 基地名
     * @return 生育期信息
     */
    SowingRecordVo querySowingSowingDateByBaseName(String baseName);
}
