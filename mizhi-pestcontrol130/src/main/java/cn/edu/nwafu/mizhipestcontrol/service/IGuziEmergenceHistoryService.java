package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.AvgEmergenceInfoVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GuziEmergenceHistoryVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.GuziEmergenceHistoryBo;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.io.OutputStream;
import java.util.Collection;
import java.util.List;

/**
 * 谷子出苗率历史记录Service接口
 *
 * @author LJF
 * @date 2025-10-29
 */
public interface IGuziEmergenceHistoryService {

    /**
     * 查询谷子出苗率历史记录
     *
     * @param id 主键
     * @return 谷子出苗率历史记录
     */
    GuziEmergenceHistoryVo queryById(Long id);

    /**
     * 分页查询谷子出苗率历史记录列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 谷子出苗率历史记录分页列表
     */
    TableDataInfo<GuziEmergenceHistoryVo> queryPageList(GuziEmergenceHistoryBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的谷子出苗率历史记录列表
     *
     * @param bo 查询条件
     * @return 谷子出苗率历史记录列表
     */
    List<GuziEmergenceHistoryVo> queryList(GuziEmergenceHistoryBo bo);

    /**
     * 新增谷子出苗率历史记录
     *
     * @param bo 谷子出苗率历史记录
     * @return 是否新增成功
     */
    Boolean insertByBo(GuziEmergenceHistoryBo bo);

    /**
     * 修改谷子出苗率历史记录
     *
     * @param bo 谷子出苗率历史记录
     * @return 是否修改成功
     */
    Boolean updateByBo(GuziEmergenceHistoryBo bo);

    /**
     * 校验并批量删除谷子出苗率历史记录信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    AvgEmergenceInfoVo getAvgEmergenceInfo();

    //根据id 生成检测报告
//    byte[] generateSeedingReportById(Long  id);

    void generateSeedingReportById(Long  id, OutputStream outputStream);
    // 直接生成报告

    byte[] generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory);

    void generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory, OutputStream outputStream);

    //获取所有的数据实体记录
    List<GuziEmergenceHistory> queryGuziEmergenceHistoryList(GuziEmergenceHistoryBo bo);
}
