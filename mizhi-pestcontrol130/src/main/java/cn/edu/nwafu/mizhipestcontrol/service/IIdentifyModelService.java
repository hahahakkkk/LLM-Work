package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.IdentifyModelBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyModelVo;

import java.util.Collection;
import java.util.List;

/**
 * 病虫害识别模型Service接口
 *
 * @author WMX
 * @date 2025-05-01
 */
public interface IIdentifyModelService {

    /**
     * 查询病虫害识别模型
     *
     * @param modelId 主键
     * @return 病虫害识别模型
     */
    IdentifyModelVo queryById(Long modelId);

    /**
     * 分页查询病虫害识别模型列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害识别模型分页列表
     */
    TableDataInfo<IdentifyModelVo> queryPageList(IdentifyModelBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的病虫害识别模型列表
     *
     * @param bo 查询条件
     * @return 病虫害识别模型列表
     */
    List<IdentifyModelVo> queryList(IdentifyModelBo bo);

    /**
     * 新增病虫害识别模型
     *
     * @param bo 病虫害识别模型
     * @return 是否新增成功
     */
    Boolean insertByBo(IdentifyModelBo bo);

    /**
     * 修改病虫害识别模型
     *
     * @param bo 病虫害识别模型
     * @return 是否修改成功
     */
    Boolean updateByBo(IdentifyModelBo bo);

    /**
     * 校验并批量删除病虫害识别模型信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    TableDataInfo<IdentifyModelVo> listAreaModel(IdentifyModelBo bo, PageQuery pageQuery);

    TableDataInfo<IdentifyModelVo> listIdentifyModel(IdentifyModelBo bo, PageQuery pageQuery);
}
