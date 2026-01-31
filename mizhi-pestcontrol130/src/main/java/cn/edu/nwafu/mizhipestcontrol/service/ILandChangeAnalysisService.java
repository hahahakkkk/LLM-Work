package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.mizhipestcontrol.domain.LandChangeAnalysis;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.LandChangeAnalysisVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.LandChangeAnalysisBo;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 土地变化分析Service接口
 *
 * @author LJF
 * @date 2025-12-11
 */
public interface ILandChangeAnalysisService {

    /**
     * 查询土地变化分析
     *
     * @param id 主键
     * @return 土地变化分析
     */
    LandChangeAnalysisVo queryById(Long id);

    /**
     * 分页查询土地变化分析列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 土地变化分析分页列表
     */
    TableDataInfo<LandChangeAnalysisVo> queryPageList(LandChangeAnalysisBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的土地变化分析列表
     *
     * @param bo 查询条件
     * @return 土地变化分析列表
     */
    List<LandChangeAnalysisVo> queryList(LandChangeAnalysisBo bo);

    /**
     * 新增土地变化分析
     *
     * @param bo 土地变化分析
     * @return 是否新增成功
     */
    Boolean insertByBo(LandChangeAnalysisBo bo);

    /**
     * 修改土地变化分析
     *
     * @param bo 土地变化分析
     * @return 是否修改成功
     */
    Boolean updateByBo(LandChangeAnalysisBo bo);

    /**
     * 校验并批量删除土地变化分析信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
