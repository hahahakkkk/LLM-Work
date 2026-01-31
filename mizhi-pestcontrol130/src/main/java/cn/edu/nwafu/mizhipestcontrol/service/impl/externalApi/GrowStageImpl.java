package cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordVo;
import cn.edu.nwafu.mz_external_program_api.vo.GrowthPeriodVo;
import cn.edu.nwafu.mizhipestcontrol.mapper.SowingRecordMapper;
import cn.edu.nwafu.mz_external_program_api.api.MzGrowStageApi;
import lombok.AllArgsConstructor;
import org.apache.dubbo.config.annotation.DubboService;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi
 * @className: GrowStageImpl
 * @author: ljf
 * @description: TODO
 */
@Service
@DubboService
@AllArgsConstructor
public class GrowStageImpl implements MzGrowStageApi {

    private static final int GERMINATION_DAYS = 8;   // 出苗期
    private static final int JOINTING_DAYS = 30;     // 拔节期
    private static final int HEADING_DAYS = 88;      // 抽穗期
    private static final int GRAIN_FILLING_DAYS = 118; // 灌浆期
    private static final int MATURITY_DAYS = 150;    // 成熟期


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


    private final SowingRecordMapper baseMapper;
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
