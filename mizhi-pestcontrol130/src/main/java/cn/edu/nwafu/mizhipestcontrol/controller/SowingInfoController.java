package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingInfoVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordVo;
import cn.edu.nwafu.mizhipestcontrol.service.ISowingPredictService;
import cn.edu.nwafu.mizhipestcontrol.service.ISowingRecordService;
import cn.edu.nwafu.mizhipestcontrol.service.impl.SowingRecordServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import cn.edu.nwafu.mz_external_program_api.api.BaseTranslation;

import java.time.LocalDate;
import java.util.Date;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.controller
 * @className: SowingInfoController
 * @author: ljf
 * @description: TODO
 */
@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/sowingInfo")
public class SowingInfoController {
    private final ISowingRecordService sowingRecordService;
    private  final ISowingPredictService sowingPredictService;

    @DubboReference
    private final BaseTranslation baseTranslation;

    /**
     * 获取基地实际播种信息和预测播种信息
     * @return
     */
    @PostMapping("/getSowingInfo")
    public R<SowingInfoVo> getSowingInfo(@RequestParam Long baseId){
        log.info("[SowingInfo] 请求入参 baseId={}", baseId);

        // 预测信息直接按 baseId 查询最新一条
        SowingPredictVo sowingPredictVo = sowingPredictService.queryLatestByBaseId(baseId);
        if (sowingPredictVo == null) {
            log.warn("[SowingInfo] 未查询到预测信息, baseId={}", baseId);
            return R.warn("未查询到预测播种信息");
        }

        // 实际记录目前仍基于 baseName 查询（待库表增加 base_id 后再改造）
        String baseName = sowingPredictVo.getBaseName();
        SowingRecordVo sowingRecordVo = sowingRecordService.querySowingSowingDateByBaseName(baseName);
        log.info("[SowingInfo] 查询结果 sowingRecordVo={}, sowingPredictVo={} ", sowingRecordVo, sowingPredictVo);
        if(sowingRecordVo == null || sowingPredictVo == null){
            log.warn("[SowingInfo] 查询信息失败, baseName={}, sowingRecordVo={}, sowingPredictVo={} ", baseName, sowingRecordVo, sowingPredictVo);
            return R.warn("查询信息失败");
        }

        String variety = sowingRecordVo.getVariety();

        LocalDate Sowing_real = sowingRecordVo.getSowingDate();

        LocalDate Sowing_predict_start = sowingPredictVo.getSowingStartDate();
        LocalDate  Sowing_predict_end = sowingPredictVo.getSowingEndDate();
        SowingInfoVo sowingInfoVo = new SowingInfoVo(baseName,variety,Sowing_real,Sowing_predict_start,Sowing_predict_end);
        log.info("[SowingInfo] 组装返回数据: {}", sowingInfoVo);
        return R.ok("查询信息成功",sowingInfoVo);
    }

}
