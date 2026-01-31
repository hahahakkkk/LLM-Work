package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantVo;

import java.util.Collection;
import java.util.List;

/**
 * 病虫害植株Service接口
 *
 * @author WMX
 * @date 2025-05-03
 */
public interface IPlantService {

    /**
     * 查询病虫害植株
     *
     * @param id 主键
     * @return 病虫害植株
     */
    PlantVo queryById(Long id);

    /**
     * 分页查询病虫害植株列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害植株分页列表
     */
    TableDataInfo<PlantVo> queryPageList(PlantBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的病虫害植株列表
     *
     * @param bo 查询条件
     * @return 病虫害植株列表
     */
    List<PlantVo> queryList(PlantBo bo);

    /**
     * 新增病虫害植株
     *
     * @param bo 病虫害植株
     * @return 是否新增成功
     */
    Boolean insertByBo(PlantBo bo);

    /**
     * 修改病虫害植株
     *
     * @param bo 病虫害植株
     * @return 是否修改成功
     */
    Boolean updateByBo(PlantBo bo);

    /**
     * 校验并批量删除病虫害植株信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}