package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantResultsBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BackPestVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantDetectionRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SuHuiMingDetectionVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantResultsVo;

import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 病虫害植株识别结果Service接口
 *
 * @author LJF
 * @date 2025-10-27
 */
public interface IPlantResultsService {

    /**
     * 查询病虫害植株识别结果
     *
     * @param id 主键
     * @return 病虫害植株识别结果
     */
    PlantResultsVo queryById(Long id);

    /**
     * 分页查询病虫害植株识别结果列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害植株识别结果分页列表
     */
    TableDataInfo<PlantResultsVo> queryPageList(PlantResultsBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的病虫害植株识别结果列表
     *
     * @param bo 查询条件
     * @return 病虫害植株识别结果列表
     */
    List<PlantResultsVo> queryList(PlantResultsBo bo);

    /**
     * 新增病虫害植株识别结果
     *
     * @param bo 病虫害植株识别结果
     * @return 是否新增成功
     */
    Boolean insertByBo(PlantResultsBo bo);

    /**
     * 修改病虫害植株识别结果
     *
     * @param bo 病虫害植株识别结果
     * @return 是否修改成功
     */
    Boolean updateByBo(PlantResultsBo bo);

    /**
     * 校验并批量删除病虫害植株识别结果信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);


    //后台查看记录卡片展示数据
    R<BackPestVo> getBacckPestInfo();

    /**
     * 获取植株检测记录信息
     *
     * @param growthStage 生育期筛选条件（可选）
     * @return 植株检测记录列表
     */
    List<PlantDetectionRecordVo> getPlantDetectionRecords(Integer growthStage);

    /**
     * 获取粟灰螟检测记录
     *
     * @return 粟灰螟检测记录列表
     */
    List<SuHuiMingDetectionVo> getSuHuiMingDetectionRecords();
}
