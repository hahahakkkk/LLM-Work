package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BackPestVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantDetectionRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SuHuiMingDetectionVo;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantResultsBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantResultsVo;
import cn.edu.nwafu.mizhipestcontrol.domain.PlantResults;
import cn.edu.nwafu.mizhipestcontrol.mapper.PlantResultsMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IPlantResultsService;
import cn.edu.nwafu.mizhipestcontrol.service.ImageMonitorService;

import java.util.List;
import java.util.Map;
import java.util.Collection;

/**
 * 病虫害植株识别结果Service业务层处理
 *
 * @author LJF
 * @date 2025-10-27
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class PlantResultsServiceImpl implements IPlantResultsService {

    private final PlantResultsMapper baseMapper;
    private final ImageMonitorService imageMonitorService;

    /**
     * 查询病虫害植株识别结果
     *
     * @param id 主键
     * @return 病虫害植株识别结果
     */
    @Override
    public PlantResultsVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询病虫害植株识别结果列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害植株识别结果分页列表
     */
    @Override
    public TableDataInfo<PlantResultsVo> queryPageList(PlantResultsBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<PlantResults> lqw = buildQueryWrapper(bo);
        Page<PlantResultsVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的病虫害植株识别结果列表
     *
     * @param bo 查询条件
     * @return 病虫害植株识别结果列表
     */
    @Override
    public List<PlantResultsVo> queryList(PlantResultsBo bo) {
        LambdaQueryWrapper<PlantResults> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<PlantResults> buildQueryWrapper(PlantResultsBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<PlantResults> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getId() != null, PlantResults::getId, bo.getId());
        lqw.like(StringUtils.isNotBlank(bo.getBaseName()), PlantResults::getBaseName, bo.getBaseName());
        lqw.eq(StringUtils.isNotBlank(bo.getPlotCode()), PlantResults::getPlotCode, bo.getPlotCode());
        lqw.eq(StringUtils.isNotBlank(bo.getDiseaseType()), PlantResults::getDiseaseType, bo.getDiseaseType());
        lqw.eq(StringUtils.isNotBlank(bo.getDescription()), PlantResults::getDescription, bo.getDescription());
        lqw.eq(StringUtils.isNotBlank(bo.getResultImageUrl()), PlantResults::getResultImageUrl, bo.getResultImageUrl());
        lqw.eq(bo.getCreateTime() != null, PlantResults::getCreateTime, bo.getCreateTime());
        lqw.eq(bo.getBaseId() != null, PlantResults::getBaseId, bo.getBaseId());
        lqw.eq(bo.getPlotId() != null, PlantResults::getPlotId, bo.getPlotId());
        return lqw;
    }

    /**
     * 新增病虫害植株识别结果
     *
     * @param bo 病虫害植株识别结果
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(PlantResultsBo bo) {
        PlantResults add = MapstructUtils.convert(bo, PlantResults.class);
        validEntityBeforeSave(add);
        boolean inserted = baseMapper.insert(add) > 0;
        if (!inserted) {
            return false;
        }

        bo.setId(add.getId());
        // 新增成功后，确认该图片已“被业务引用”，从监控队列移除，避免定时任务误删 MinIO 临时文件
        if (StringUtils.isNotBlank(add.getResultImageUrl())) {
            try {
                imageMonitorService.confirmSaved(List.of(add.getResultImageUrl()));
            } catch (Exception e) {
                log.warn("确认保存图像失败，可能导致定时任务误删: {}", add.getResultImageUrl(), e);
            }
        }
        return true;
    }

    /**
     * 修改病虫害植株识别结果
     *
     * @param bo 病虫害植株识别结果
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(PlantResultsBo bo) {
        PlantResults update = MapstructUtils.convert(bo, PlantResults.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(PlantResults entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除病虫害植株识别结果信息
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
    public R<BackPestVo> getBacckPestInfo() {
        BackPestVo backPestVo = new BackPestVo();
        if(baseMapper.getThisWeekCount()!=null){
            backPestVo.setThisWeek(baseMapper.getThisWeekCount());
        }else {
            backPestVo.setThisWeek(0);
        }
        if(baseMapper.getTodayCount()!=null){
            backPestVo.setToday(baseMapper.getTodayCount());
        }else {
            backPestVo.setToday(0);
        }
        if (baseMapper.getTotalCount()!=null) {
            backPestVo.setTotal(baseMapper.getTotalCount());
        }else {
            backPestVo.setTotal(0);
        }

//        backPestVo.setTotal(baseMapper.getTotalCount());
//        backPestVo.setToday(baseMapper.getTodayCount());
//        backPestVo.setThisWeek(baseMapper.getThisWeekCount());
        return R.ok(backPestVo);
    }

    /**
     * 获取植株检测记录信息
     *
     * @param growthStage 生育期筛选条件（可选）
     * @return 植株检测记录列表
     */
    @Override
    public List<PlantDetectionRecordVo> getPlantDetectionRecords(Integer growthStage) {
        return baseMapper.getPlantDetectionRecords(growthStage);
    }

    /**
     * 获取粟灰螟检测记录
     *
     * @return 粟灰螟检测记录列表
     */
    @Override
    public List<SuHuiMingDetectionVo> getSuHuiMingDetectionRecords() {
        return baseMapper.getSuHuiMingDetectionRecords();
    }
}
