package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.mizhipestcontrol.domain.BfWarning;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BfWarningVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.BfWarningBo;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 气象预警与建议数据Service接口
 *
 * @author LJF
 * @date 2026-01-22
 */
public interface IBfWarningService {

    /**
     * 查询气象预警与建议数据
     *
     * @param id 主键
     * @return 气象预警与建议数据
     */
    BfWarningVo queryById(Long id);

    /**
     * 分页查询气象预警与建议数据列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 气象预警与建议数据分页列表
     */
    TableDataInfo<BfWarningVo> queryPageList(BfWarningBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的气象预警与建议数据列表
     *
     * @param bo 查询条件
     * @return 气象预警与建议数据列表
     */
    List<BfWarningVo> queryList(BfWarningBo bo);

    /**
     * 新增气象预警与建议数据
     *
     * @param bo 气象预警与建议数据
     * @return 是否新增成功
     */
    Boolean insertByBo(BfWarningBo bo);

    /**
     * 修改气象预警与建议数据
     *
     * @param bo 气象预警与建议数据
     * @return 是否修改成功
     */
    Boolean updateByBo(BfWarningBo bo);

    /**
     * 校验并批量删除气象预警与建议数据信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    Boolean saveOrUpdateByPredictionDate(BfWarningBo bo);
}
