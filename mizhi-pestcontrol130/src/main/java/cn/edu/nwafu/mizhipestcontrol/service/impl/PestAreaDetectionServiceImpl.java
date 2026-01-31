package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BackDieaseAreaStaticVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.DeskDiseaseAreaVo;
import cn.edu.nwafu.mizhipestcontrol.service.IPdfReportService;
import cn.edu.nwafu.mizhipestcontrol.service.ImageMonitorService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PestAreaDetectionBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaDetectionVo;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
import cn.edu.nwafu.mizhipestcontrol.mapper.PestAreaDetectionMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IPestAreaDetectionService;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.*;

/**
 * 病虫害区域检测记录Service业务层处理
 *
 * @author LJF
 * @date 2025-10-30
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class PestAreaDetectionServiceImpl implements IPestAreaDetectionService {

    private final PestAreaDetectionMapper baseMapper;
    private final IPdfReportServiceImpl pdfReportService;
    private final ImageMonitorService imageMonitorService;

    /**
     * 查询病虫害区域检测记录
     *
     * @param id 主键
     * @return 病虫害区域检测记录
     */
    @Override
    public PestAreaDetectionVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询病虫害区域检测记录列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害区域检测记录分页列表
     */
    @Override
    public TableDataInfo<PestAreaDetectionVo> queryPageList(PestAreaDetectionBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<PestAreaDetection> lqw = buildQueryWrapper(bo);
        Page<PestAreaDetectionVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的病虫害区域检测记录列表
     *
     * @param bo 查询条件
     * @return 病虫害区域检测记录列表
     */
    @Override
    public List<PestAreaDetectionVo> queryList(PestAreaDetectionBo bo) {
        LambdaQueryWrapper<PestAreaDetection> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<PestAreaDetection> buildQueryWrapper(PestAreaDetectionBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<PestAreaDetection> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getId() != null, PestAreaDetection::getId, bo.getId());
        lqw.like(StringUtils.isNotBlank(bo.getBaseName()), PestAreaDetection::getBaseName, bo.getBaseName());
        lqw.like(StringUtils.isNotBlank(bo.getPlotName()), PestAreaDetection::getPlotName, bo.getPlotName());
        lqw.eq(bo.getLongitude() != null, PestAreaDetection::getLongitude, bo.getLongitude());
        lqw.eq(bo.getLatitude() != null, PestAreaDetection::getLatitude, bo.getLatitude());
        lqw.eq(StringUtils.isNotBlank(bo.getDiseaseType()), PestAreaDetection::getDiseaseType, bo.getDiseaseType());
        lqw.eq(bo.getIncidenceRate() != null, PestAreaDetection::getIncidenceRate, bo.getIncidenceRate());
        lqw.eq(StringUtils.isNotBlank(bo.getRgbOriginalImage()), PestAreaDetection::getRgbOriginalImage, bo.getRgbOriginalImage());
        lqw.eq(StringUtils.isNotBlank(bo.getTifOriginalImage()), PestAreaDetection::getTifOriginalImage, bo.getTifOriginalImage());
        lqw.eq(StringUtils.isNotBlank(bo.getRgbResultImage()), PestAreaDetection::getRgbResultImage, bo.getRgbResultImage());
        lqw.eq(StringUtils.isNotBlank(bo.getDescription()), PestAreaDetection::getDescription, bo.getDescription());
//        lqw.eq(StringUtils.isNotBlank(bo.getCreateBy()), PestAreaDetection::getCreateBy, bo.getCreateBy());
        lqw.eq(bo.getCreateTime() != null, PestAreaDetection::getCreateTime, bo.getCreateTime());
        lqw.eq(bo.getBaseId() != null, PestAreaDetection::getBaseId, bo.getBaseId());
        lqw.eq(bo.getPlotId() != null, PestAreaDetection::getPlotId, bo.getPlotId());
        return lqw;
    }

    /**
     * 新增病虫害区域检测记录
     *
     * @param bo 病虫害区域检测记录
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(PestAreaDetectionBo bo) {
        PestAreaDetection add = MapstructUtils.convert(bo, PestAreaDetection.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    /**
     * 修改病虫害区域检测记录
     *
     * @param bo 病虫害区域检测记录
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(PestAreaDetectionBo bo) {
        PestAreaDetection update = MapstructUtils.convert(bo, PestAreaDetection.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(PestAreaDetection entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除病虫害区域检测记录信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if(isValid){
            //TODO 做一些业务上的校验,判断是否需要校验
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public R<BackDieaseAreaStaticVo> getDeskINfo() {
        BackDieaseAreaStaticVo backDieaseAreaStaticVo = new BackDieaseAreaStaticVo();
        if (baseMapper.getTotalCount() != null) {
            backDieaseAreaStaticVo.setTotal(baseMapper.getTotalCount());
        } else{
            backDieaseAreaStaticVo.setTotal(0);
        }
        if (baseMapper.getThisWeekCount() != null) {
            backDieaseAreaStaticVo.setThisWeek(baseMapper.getThisWeekCount());
        } else{
            backDieaseAreaStaticVo.setThisWeek(0);
        }
        if (baseMapper.getTodayCount() != null) {
            backDieaseAreaStaticVo.setToday(baseMapper.getTodayCount());
        }else {
            backDieaseAreaStaticVo.setToday(0);
        }
//        backDieaseAreaStaticVo.setTotal(baseMapper.getTotalCount());
//        backDieaseAreaStaticVo.setThisWeek(baseMapper.getThisWeekCount());
//        backDieaseAreaStaticVo.setToday(baseMapper.getTodayCount());
        return R.ok(backDieaseAreaStaticVo);
    }

    @Override
//    public  byte []  generatePestAreaReportById(Long id, OutputStream outputStream)
    public  void generatePestAreaReportById(Long id, OutputStream outputStream){
        PestAreaDetectionVo pestAreaDetectionVo = queryById(id);
        if(pestAreaDetectionVo != null){
//            return pdfReportService.generatePestAreaReport(pestAreaDetectionVo, outputStream);
            try {
                pdfReportService.generatePestAreaReport(pestAreaDetectionVo, outputStream);
            }catch (Exception e){
                throw new RuntimeException("生成病害检测PDF报告失败", e);
            }
//            pdfReportService.generatePestAreaReport(pestAreaDetectionVo, outputStream);
        }else {
            throw new RuntimeException("未找到该记录");
        }
    }

    @Override
    public void generatePestAreaReport(PestAreaDetectionVo vo, OutputStream outputStream) {
        if (vo == null) {
            throw new IllegalArgumentException("报告参数不能为空");
        } else {
            if (vo.getCreateTime() == null) {
                vo.setCreateTime(new Date());
            }

            if (vo.getIncidenceRate() == null) {
                throw new IllegalArgumentException("发病率(incidenceRate)不能为空");
            } else {
                byte[] pdfBytes;
                try {
                    try (ByteArrayOutputStream buffer = new ByteArrayOutputStream(262144)) {
                        this.pdfReportService.generatePestAreaReport(vo, buffer);
                        pdfBytes = buffer.toByteArray();
                    }
                } catch (Exception e) {
                    throw new RuntimeException("生成病害检测PDF报告失败", e);
                }

                List<String> toConfirm = new ArrayList<>(3);
                if (StringUtils.isNotBlank(vo.getRgbOriginalImage())) {
                    toConfirm.add(vo.getRgbOriginalImage());
                }

                if (StringUtils.isNotBlank(vo.getTifOriginalImage())) {
                    toConfirm.add(vo.getTifOriginalImage());
                }

                if (StringUtils.isNotBlank(vo.getRgbResultImage())) {
                    toConfirm.add(vo.getRgbResultImage());
                }

                if (!toConfirm.isEmpty()) {
                    try {
                        this.imageMonitorService.confirmSaved(toConfirm.stream().distinct().toList());
                    } catch (Exception e) {
                        log.warn("确认保存图像失败，可能导致定时任务误删: {}", toConfirm, e);
                    }
                }

                PestAreaDetection entity = new PestAreaDetection();
                entity.setBaseName(vo.getBaseName());
                entity.setPlotName(vo.getPlotName());
                entity.setLongitude(vo.getLongitude());
                entity.setLatitude(vo.getLatitude());
                entity.setDiseaseType(vo.getDiseaseType());
                entity.setIncidenceRate(vo.getIncidenceRate());
                entity.setRgbOriginalImage(vo.getRgbOriginalImage());
                entity.setTifOriginalImage(vo.getTifOriginalImage());
                entity.setRgbResultImage(vo.getRgbResultImage());
                entity.setDescription(vo.getDescription());
                entity.setBaseId(vo.getBaseId());
                entity.setPlotId(vo.getPlotId());
                int inserted = this.baseMapper.insert(entity);
                if (inserted <= 0) {
                    throw new RuntimeException("保存病害区域检测记录失败");
                } else {
                    vo.setId(entity.getId());

                    try {
                        outputStream.write(pdfBytes);
                    } catch (Exception e) {
                        throw new RuntimeException("输出PDF失败", e);
                    }
                }
            }
        }
    }
}
