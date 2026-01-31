package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.FarmlandBo;
import cn.edu.nwafu.mizhipestcontrol.domain.dao.FarmlandDao;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.FarmlandVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.StatisticsDataVO;

import java.util.Collection;
import java.util.List;

/**
 * 农田表增删改查Service接口
 *
 * @author WMX
 * @date 2025-04-14
 */
public interface IFarmlandService {

    /**
     * 1. 数据概览1
     */
    R<StatisticsDataVO>  fetchStatistics();

    /**
     * 新增农田
     */
    Boolean insertByDao(FarmlandDao dao);

    /**
     * 查询农田表增删改查
     *
     * @param id 主键
     * @return 农田表增删改查
     */
    FarmlandVo queryById(Long id);

    /**
     * 分页查询农田表增删改查列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 农田表增删改查分页列表
     */
    TableDataInfo<FarmlandVo> queryPageList(FarmlandBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的农田表增删改查列表
     *
     * @param bo 查询条件
     * @return 农田表增删改查列表
     */
    List<FarmlandVo> queryList(FarmlandBo bo);


    /**
     * 修改农田表增删改查
     *
     * @param bo 农田表增删改查
     * @return 是否修改成功
     */
    Boolean updateByBo(FarmlandBo bo);

    /**
     * 校验并批量删除农田表增删改查信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
