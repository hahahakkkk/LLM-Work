package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GrowthPeriodVo;
import com.alibaba.cloud.commons.lang.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.DubboService;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.SowingRecordBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordExportVo;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingRecord;
import cn.edu.nwafu.mizhipestcontrol.mapper.SowingRecordMapper;
import cn.edu.nwafu.mizhipestcontrol.service.ISowingRecordService;
import cn.edu.nwafu.mizhipestcontrol.mapper.CropVarietyMapper;
import cn.edu.nwafu.mz_external_program_api.api.BaseTranslation;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Collection;

/**
 * 基地实际播种日期记录Service业务层处理
 *
 * @author LJF
 * @date 2025-11-04
 * 这个模块对外提供远程调用
 */
@RequiredArgsConstructor
@Service
@DubboService
public class SowingRecordServiceImpl implements ISowingRecordService {

    @DubboReference
    private final BaseTranslation baseTranslation;

    private final SowingRecordMapper baseMapper;
    private final CropVarietyMapper cropVarietyMapper;

    /**
     * 查询基地实际播种日期记录
     *
     * @param id 主键
     * @return 基地实际播种日期记录
     */
    @Override
    public SowingRecordVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询基地实际播种日期记录列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 基地实际播种日期记录分页列表
     */
    @Override
    public TableDataInfo<SowingRecordVo> queryPageList(SowingRecordBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<SowingRecord> lqw = buildQueryWrapper(bo);
        Page<SowingRecordVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的基地实际播种日期记录列表
     *
     * @param bo 查询条件
     * @return 基地实际播种日期记录列表
     */
    @Override
    public List<SowingRecordVo> queryList(SowingRecordBo bo) {
        LambdaQueryWrapper<SowingRecord> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    /**
     * 查询导出数据（含颜色与形态信息）
     */
    @Override
    public List<SowingRecordExportVo> queryExportInfoList(SowingRecordBo bo) {
        LambdaQueryWrapper<SowingRecord> lqw = buildQueryWrapper(bo);
        List<SowingRecordVo> list = baseMapper.selectVoList(lqw);
        List<SowingRecordExportVo> result = new ArrayList<>();
        for (SowingRecordVo sr : list) {
            CropVarietyMapper.CropVarietyInfo info = cropVarietyMapper.selectInfoByName(sr.getVariety());
            SowingRecordExportVo vo = new SowingRecordExportVo();
            vo.setId(sr.getId());
            vo.setBaseName(sr.getBaseName());
            vo.setVariety(sr.getVariety());
            vo.setSowingDate(sr.getSowingDate());
            if (info != null) {
                vo.setGrainColorInfo(info.grainColorInfo);
                vo.setGrowthFormInfo(info.growthFormInfo);
            }
            result.add(vo);
        }
        return result;
    }

    private LambdaQueryWrapper<SowingRecord> buildQueryWrapper(SowingRecordBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<SowingRecord> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(bo.getBaseName()), SowingRecord::getBaseName, bo.getBaseName());
        lqw.eq(StringUtils.isNotBlank(bo.getVariety()), SowingRecord::getVariety, bo.getVariety());
        lqw.eq(bo.getSowingDate() != null, SowingRecord::getSowingDate, bo.getSowingDate());
        lqw.eq(bo.getUpdateTime() != null, SowingRecord::getUpdateTime, bo.getUpdateTime());
        return lqw;
    }

    /**
     * 新增基地实际播种日期记录
     *
     * @param bo 基地实际播种日期记录
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(SowingRecordBo bo) {
        SowingRecord add = MapstructUtils.convert(bo, SowingRecord.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    /**
     * 修改基地实际播种日期记录
     *
     * @param bo 基地实际播种日期记录
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(SowingRecordBo bo) {
        SowingRecord update = MapstructUtils.convert(bo, SowingRecord.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(SowingRecord entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除基地实际播种日期记录信息
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


    private static final int GERMINATION_DAYS = 8;   // 出苗期
    private static final int JOINTING_DAYS = 30;     // 拔节期
    private static final int HEADING_DAYS = 88;      // 抽穗期
    private static final int GRAIN_FILLING_DAYS = 118; // 灌浆期
    private static final int MATURITY_DAYS = 150;    // 成熟期

    @Override
    @DubboService
    public R<GrowthPeriodVo> queryGrowthPeriodByBaseName(String baseName,LocalDate date) {
        SowingRecordVo record = baseMapper.selectByBaseName(baseName);
        if (record == null) {
            return R.fail("该基地未录入实际播种期，请先录入播种日期！");
        }

        LocalDate sowingDate = record.getSowingDate();

        LocalDate today = LocalDate.now();
        if (date != null){
           today = date;
        }

        long days = ChronoUnit.DAYS.between(sowingDate, today);
        GrowthPeriodVo vo = getGrowthPeriodVo(baseName, days, sowingDate);
        return R.ok(vo);
    }



    private static @NotNull GrowthPeriodVo getGrowthPeriodVo(String baseName, long days, LocalDate sowingDate) {
        String stage;

        if (days < 0) {
            stage = "未到播种日期";
        } else if (days <= GERMINATION_DAYS) {
            stage = "出苗期";
        } else if (days <= JOINTING_DAYS) {
            stage = "拔节期";
        } else if (days <= HEADING_DAYS) {
            stage = "抽穗期";
        } else if (days <= GRAIN_FILLING_DAYS) {
            stage = "灌浆期";
        } else if (days <= MATURITY_DAYS) {
            stage = "成熟期";
        } else {
            stage = "已过成熟期";
        }

        GrowthPeriodVo vo = new GrowthPeriodVo();
        vo.setBaseName(baseName);
        vo.setSowingDate(sowingDate);
        if(days>0){
            vo.setDaysSinceSowing(days);
        }else {
            vo.setDaysSinceSowing(0);
        }
        vo.setCurrentStage(stage);
        return vo;
    }

    /**
     * 根据基地名查询查询实际播种期
     * @param baseName 基地名
     * @return
     */
    @Override
    public SowingRecordVo querySowingSowingDateByBaseName(String baseName) {
        return baseMapper.selectByBaseName(baseName);
    }

    /**
     * 根据基地ID查询当前生育期
     *
     * @param baseId 基地ID
     * @param date 查询日期（可选，默认为今天）
     * @return 生育期信息
     */
    @Override
    public R<GrowthPeriodVo> queryGrowthPeriodByBaseId(Long baseId, LocalDate date) {
        SowingRecordVo record = baseMapper.selectByBaseId(baseId);
        if (record == null) {
            return R.fail("该基地未录入实际播种期，请先录入播种日期！");
        }

        LocalDate sowingDate = record.getSowingDate();

        LocalDate today = LocalDate.now();
        if (date != null) {
            today = date;
        }

        long days = ChronoUnit.DAYS.between(sowingDate, today);
        GrowthPeriodVo vo = getGrowthPeriodVo(record.getBaseName(), days, sowingDate);
        return R.ok(vo);
    }

    /**
     * 查询所有基地的当前生育期
     *
     * @param date 查询日期（可选，默认为今天）
     * @return 所有基地的生育期信息列表
     */
    @Override
    public R<List<GrowthPeriodVo>> queryAllBasesGrowthPeriod(LocalDate date) {
        List<SowingRecordVo> records = baseMapper.selectLatestByAllBases();
        if (records == null || records.isEmpty()) {
            return R.fail("暂无基地播种期数据");
        }

        LocalDate today = LocalDate.now();
        if (date != null) {
            today = date;
        }

        List<GrowthPeriodVo> result = new ArrayList<>();
        for (SowingRecordVo record : records) {
            LocalDate sowingDate = record.getSowingDate();
            long days = ChronoUnit.DAYS.between(sowingDate, today);
            GrowthPeriodVo vo = getGrowthPeriodVo(record.getBaseName(), days, sowingDate);
            result.add(vo);
        }
        return R.ok(result);
    }
}

