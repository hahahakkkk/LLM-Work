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
import cn.edu.nwafu.mizhipestcontrol.domain.bo.LandChangeAnalysisBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.LandChangeAnalysisVo;
import cn.edu.nwafu.mizhipestcontrol.domain.LandChangeAnalysis;
import cn.edu.nwafu.mizhipestcontrol.mapper.LandChangeAnalysisMapper;
import cn.edu.nwafu.mizhipestcontrol.service.ILandChangeAnalysisService;

import java.util.List;
import java.util.Map;
import java.util.Collection;

/**
 * 土地变化分析Service业务层处理
 *
 * @author LJF
 * @date 2025-12-11
 */
@RequiredArgsConstructor
@Service
public class LandChangeAnalysisServiceImpl implements ILandChangeAnalysisService {

    private final LandChangeAnalysisMapper baseMapper;

    /**
     * 查询土地变化分析
     *
     * @param id 主键
     * @return 土地变化分析
     */
    @Override
    public LandChangeAnalysisVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询土地变化分析列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 土地变化分析分页列表
     */
    @Override
    public TableDataInfo<LandChangeAnalysisVo> queryPageList(LandChangeAnalysisBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<LandChangeAnalysis> lqw = buildQueryWrapper(bo);
        Page<LandChangeAnalysisVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的土地变化分析列表
     *
     * @param bo 查询条件
     * @return 土地变化分析列表
     */
    @Override
    public List<LandChangeAnalysisVo> queryList(LandChangeAnalysisBo bo) {
        LambdaQueryWrapper<LandChangeAnalysis> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<LandChangeAnalysis> buildQueryWrapper(LandChangeAnalysisBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<LandChangeAnalysis> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getId() != null, LandChangeAnalysis::getId, bo.getId());
        lqw.eq(StringUtils.isNotBlank(bo.getBaseId()), LandChangeAnalysis::getBaseId, bo.getBaseId());
        lqw.like(StringUtils.isNotBlank(bo.getBaseName()), LandChangeAnalysis::getBaseName, bo.getBaseName());
        lqw.eq(StringUtils.isNotBlank(bo.getLandId()), LandChangeAnalysis::getLandId, bo.getLandId());
        lqw.eq(StringUtils.isNotBlank(bo.getLandCode()), LandChangeAnalysis::getLandCode, bo.getLandCode());
        lqw.eq(bo.getLandAreaMu() != null, LandChangeAnalysis::getLandAreaMu, bo.getLandAreaMu());
        lqw.eq(bo.getIncreasedAreaMu() != null, LandChangeAnalysis::getIncreasedAreaMu, bo.getIncreasedAreaMu());
        lqw.eq(bo.getDecreasedAreaMu() != null, LandChangeAnalysis::getDecreasedAreaMu, bo.getDecreasedAreaMu());
        lqw.eq(bo.getCreateTime() != null, LandChangeAnalysis::getCreateTime, bo.getCreateTime());
        return lqw;
    }

    /**
     * 新增土地变化分析
     *
     * @param bo 土地变化分析
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(LandChangeAnalysisBo bo) {
        LandChangeAnalysis add = MapstructUtils.convert(bo, LandChangeAnalysis.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    /**
     * 修改土地变化分析
     *
     * @param bo 土地变化分析
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(LandChangeAnalysisBo bo) {
        LandChangeAnalysis update = MapstructUtils.convert(bo, LandChangeAnalysis.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(LandChangeAnalysis entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除土地变化分析信息
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
}
