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
import cn.edu.nwafu.mizhipestcontrol.domain.bo.BfWarningBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BfWarningVo;
import cn.edu.nwafu.mizhipestcontrol.domain.BfWarning;
import cn.edu.nwafu.mizhipestcontrol.mapper.BfWarningMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IBfWarningService;

import java.util.List;
import java.util.Map;
import java.util.Collection;

/**
 * 气象预警与建议数据Service业务层处理
 *
 * @author LJF
 * @date 2026-01-22
 */
@RequiredArgsConstructor
@Service
public class BfWarningServiceImpl implements IBfWarningService {

    private final BfWarningMapper baseMapper;

    /**
     * 查询气象预警与建议数据
     *
     * @param id 主键
     * @return 气象预警与建议数据
     */
    @Override
    public BfWarningVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询气象预警与建议数据列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 气象预警与建议数据分页列表
     */
    @Override
    public TableDataInfo<BfWarningVo> queryPageList(BfWarningBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<BfWarning> lqw = buildQueryWrapper(bo);
        Page<BfWarningVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的气象预警与建议数据列表
     *
     * @param bo 查询条件
     * @return 气象预警与建议数据列表
     */
    @Override
    public List<BfWarningVo> queryList(BfWarningBo bo) {
        LambdaQueryWrapper<BfWarning> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<BfWarning> buildQueryWrapper(BfWarningBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<BfWarning> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getId() != null, BfWarning::getId, bo.getId());
        lqw.like(StringUtils.isNotBlank(bo.getWarningLevel()), BfWarning::getWarningLevel, bo.getWarningLevel());
        lqw.eq(bo.getPredictionDate() != null, BfWarning::getPredictionDate, bo.getPredictionDate());
        lqw.eq(bo.getTMean() != null, BfWarning::getTMean, bo.getTMean());
        lqw.eq(bo.getRhMean() != null, BfWarning::getRhMean, bo.getRhMean());
        lqw.eq(bo.getSSD() != null, BfWarning::getSSD, bo.getSSD());
        lqw.eq(bo.getRF() != null, BfWarning::getRF, bo.getRF());
        lqw.eq(bo.getET0() != null, BfWarning::getET0, bo.getET0());
        lqw.eq(StringUtils.isNotBlank(bo.getRecommendation()), BfWarning::getRecommendation, bo.getRecommendation());
        return lqw;
    }

    /**
     * 新增气象预警与建议数据
     *
     * @param bo 气象预警与建议数据
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(BfWarningBo bo) {
        BfWarning add = MapstructUtils.convert(bo, BfWarning.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    /**
     * 修改气象预警与建议数据
     *
     * @param bo 气象预警与建议数据
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(BfWarningBo bo) {
        BfWarning update = MapstructUtils.convert(bo, BfWarning.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(BfWarning entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除气象预警与建议数据信息
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

    public Boolean saveOrUpdateByPredictionDate(BfWarningBo bo) {
        if (bo != null && bo.getPredictionDate() != null) {
            LambdaQueryWrapper<BfWarning> lqw = Wrappers.lambdaQuery();
            lqw.eq(BfWarning::getPredictionDate, bo.getPredictionDate());
            BfWarning existing = (BfWarning)this.baseMapper.selectOne(lqw);
            if (existing != null) {
                bo.setId(existing.getId());
                return this.updateByBo(bo);
            } else {
                return this.insertByBo(bo);
            }
        } else {
            return false;
        }
    }
}
