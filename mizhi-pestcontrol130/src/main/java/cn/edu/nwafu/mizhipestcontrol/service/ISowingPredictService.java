package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.mizhipestcontrol.domain.SowingPredict;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictInfoVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.SowingPredictBo;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 基地播种计划Service接口
 *
 * @author LJF
 * @date 2025-11-21
 */
public interface ISowingPredictService {

    /**
     * 查询基地播种计划
     *
     * @param id 主键
     * @return 基地播种计划
     */
    SowingPredictVo queryById(Long id);

    /**
     * 分页查询基地播种计划列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 基地播种计划分页列表
     */
    TableDataInfo<SowingPredictVo> queryPageList(SowingPredictBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的基地播种计划列表
     *
     * @param bo 查询条件
     * @return 基地播种计划列表
     */
    List<SowingPredictVo> queryList(SowingPredictBo bo);

    /**
     * 新增基地播种计划
     *
     * @param bo 基地播种计划
     * @return 是否新增成功
     */
    Boolean insertByBo(SowingPredictBo bo);

    /**
     * 修改基地播种计划
     *
     * @param bo 基地播种计划
     * @return 是否修改成功
     */
    Boolean updateByBo(SowingPredictBo bo);

    /**
     * 校验并批量删除基地播种计划信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    /**
     * 根据基地名查询基地的预测 sowing_predict
     * @param baseName
     * @return
     */
    SowingPredictVo queryByBaseName(String baseName);

    /**
     * 根据基地ID查询最新的预测记录（按id倒序或更新时间）
     * @param baseId
     * @return 最新记录
     */
    SowingPredictVo queryLatestByBaseId(Long baseId);

    /**
     * 分页查询包含颜色与形态信息的计划列表
     * @param bo 查询条件（暂未应用到联表查询）
     * @param pageQuery 分页参数
     * @return 分页数据
     */
    TableDataInfo<SowingPredictInfoVo> queryInfoPageList(SowingPredictBo bo, PageQuery pageQuery);

    /**
     * 查询包含颜色与形态信息的计划列表（用于导出）
     * @param bo 查询条件
     * @return 列表
     */
    List<SowingPredictInfoVo> queryInfoList(SowingPredictBo bo);
}
