package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import com.alibaba.cloud.commons.lang.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.SowingPredictBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictInfoVo;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingPredict;
import cn.edu.nwafu.mizhipestcontrol.mapper.SowingPredictMapper;
import cn.edu.nwafu.mizhipestcontrol.mapper.CropVarietyMapper;
import cn.edu.nwafu.mizhipestcontrol.service.ISowingPredictService;

import java.util.List;
import java.util.Map;
import java.util.Collection;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * 基地播种计划Service业务层处理
 *
 * @author LJF
 * @date 2025-11-21
 */
@RequiredArgsConstructor
@Service
public class SowingPredictServiceImpl implements ISowingPredictService {

    private final SowingPredictMapper baseMapper;
    private final CropVarietyMapper cropVarietyMapper;

    /**
     * 查询基地播种计划
     *
     * @param id 主键
     * @return 基地播种计划
     */
    @Override
    public SowingPredictVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询基地播种计划列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 基地播种计划分页列表
     */
    @Override
    public TableDataInfo<SowingPredictVo> queryPageList(SowingPredictBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<SowingPredict> lqw = buildQueryWrapper(bo);
        Page<SowingPredictVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的基地播种计划列表
     *
     * @param bo 查询条件
     * @return 基地播种计划列表
     */
    @Override
    public List<SowingPredictVo> queryList(SowingPredictBo bo) {
        LambdaQueryWrapper<SowingPredict> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<SowingPredict> buildQueryWrapper(SowingPredictBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<SowingPredict> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(bo.getBaseName()), SowingPredict::getBaseName, bo.getBaseName());
        lqw.eq(StringUtils.isNotBlank(bo.getVariety()), SowingPredict::getVariety, bo.getVariety());
        lqw.eq(bo.getSowingStartDate() != null, SowingPredict::getSowingStartDate, bo.getSowingStartDate());
        lqw.eq(bo.getSowingEndDate() != null, SowingPredict::getSowingEndDate, bo.getSowingEndDate());
        lqw.eq(bo.getCreateTime() != null, SowingPredict::getCreateTime, bo.getCreateTime());
        return lqw;
    }

    /**
     * 新增基地播种计划
     *
     * @param bo 基地播种计划
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(SowingPredictBo bo) {
        SowingPredict add = MapstructUtils.convert(bo, SowingPredict.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    /**
     * 修改基地播种计划
     *
     * @param bo 基地播种计划
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(SowingPredictBo bo) {
        SowingPredict update = MapstructUtils.convert(bo, SowingPredict.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(SowingPredict entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除基地播种计划信息
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
    public SowingPredictVo queryByBaseName(String baseName) {
        return baseMapper.queryByBaseName(baseName);
    }

    @Override
    public TableDataInfo<SowingPredictInfoVo> queryInfoPageList(SowingPredictBo bo, PageQuery pageQuery) {
        // 先按原有条件分页查询 sowing_predict
        LambdaQueryWrapper<SowingPredict> lqw = buildQueryWrapper(bo);
        Page<SowingPredictVo> spPage = baseMapper.selectVoPage(pageQuery.build(), lqw);

        // 将每条记录按 variety 关联查询 crop_variety（忽略租户/数据权限）并组装返回
        List<SowingPredictInfoVo> records = new java.util.ArrayList<>();
        for (SowingPredictVo sp : spPage.getRecords()) {
            CropVarietyMapper.CropVarietyInfo info = cropVarietyMapper.selectInfoByName(sp.getVariety());
            SowingPredictInfoVo vo = new SowingPredictInfoVo();
            vo.setId(sp.getId());
            vo.setBaseName(sp.getBaseName());
            vo.setVariety(sp.getVariety());
            // 将 Date 转 LocalDate，如果你的 VO/实体用的是 LocalDate
            java.time.LocalDate start = sp.getSowingStartDate();
            java.time.LocalDate end = sp.getSowingEndDate();
            vo.setSowingStartDate(start);
            vo.setSowingEndDate(end);
            if (info != null) {
                vo.setGrainColorInfo(info.grainColorInfo);
                vo.setGrowthFormInfo(info.growthFormInfo);
            }
            records.add(vo);
        }

        Page<SowingPredictInfoVo> page = new Page<>(spPage.getCurrent(), spPage.getSize(), spPage.getTotal());
        page.setRecords(records);
        return TableDataInfo.build(page);
    }

    @Override
    public List<SowingPredictInfoVo> queryInfoList(SowingPredictBo bo) {
        LambdaQueryWrapper<SowingPredict> lqw = buildQueryWrapper(bo);
        List<SowingPredictVo> spList = baseMapper.selectVoList(lqw);
        List<SowingPredictInfoVo> result = new java.util.ArrayList<>();
        for (SowingPredictVo sp : spList) {
            CropVarietyMapper.CropVarietyInfo info = cropVarietyMapper.selectInfoByName(sp.getVariety());
            SowingPredictInfoVo vo = new SowingPredictInfoVo();
            vo.setId(sp.getId());
            vo.setBaseName(sp.getBaseName());
            vo.setVariety(sp.getVariety());
            java.time.LocalDate start = sp.getSowingStartDate();
            java.time.LocalDate end = sp.getSowingEndDate();
            vo.setSowingStartDate(start);
            vo.setSowingEndDate(end);
            if (info != null) {
                vo.setGrainColorInfo(info.grainColorInfo);
                vo.setGrowthFormInfo(info.growthFormInfo);
            }
            result.add(vo);
        }
        return result;
    }

    @Override
    public SowingPredictVo queryLatestByBaseId(Long baseId) {
        return baseMapper.queryLatestByBaseId(baseId);
    }
}
