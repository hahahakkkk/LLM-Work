package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BackDieaseAreaStaticVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.DeskDiseaseAreaVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaDetectionVo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PestAreaDetectionBo;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;

import java.io.OutputStream;
import java.util.Collection;
import java.util.List;

/**
 * 病虫害区域检测记录Service接口
 *
 * @author LJF
 * @date 2025-10-30
 */
public interface IPestAreaDetectionService {

    /**
     * 查询病虫害区域检测记录
     *
     * @param id 主键
     * @return 病虫害区域检测记录
     */
    PestAreaDetectionVo queryById(Long id);

    /**
     * 分页查询病虫害区域检测记录列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害区域检测记录分页列表
     */
    TableDataInfo<PestAreaDetectionVo> queryPageList(PestAreaDetectionBo bo, PageQuery pageQuery);

    /**
     * 查询符合条件的病虫害区域检测记录列表
     *
     * @param bo 查询条件
     * @return 病虫害区域检测记录列表
     */
    List<PestAreaDetectionVo> queryList(PestAreaDetectionBo bo);

    /**
     * 新增病虫害区域检测记录
     *
     * @param bo 病虫害区域检测记录
     * @return 是否新增成功
     */
    Boolean insertByBo(PestAreaDetectionBo bo);

    /**
     * 修改病虫害区域检测记录
     *
     * @param bo 病虫害区域检测记录
     * @return 是否修改成功
     */
    Boolean updateByBo(PestAreaDetectionBo bo);

    /**
     * 校验并批量删除病虫害区域检测记录信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    /**
     * 获取前台桌面信息
     * @return
     */
//    public R<List<DeskDiseaseAreaVo>> getDeskINfo();
    R<BackDieaseAreaStaticVo> getDeskINfo();

//    byte [] generatePestAreaReportById(Long id, OutputStream outputStream);
    void  generatePestAreaReportById(Long id, OutputStream outputStream);

    void generatePestAreaReport(PestAreaDetectionVo vo, OutputStream outputStream);


}
