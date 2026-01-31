package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.satoken.utils.LoginHelper;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
import cn.edu.nwafu.mizhipestcontrol.domain.RgbResult;
import cn.edu.nwafu.mizhipestcontrol.domain.WhResult;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.AreaDetectRequestBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyResultVO;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WarnVO;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BestSowingVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaTaskVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaSubmitVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WhiteheadDetectVo;
import cn.edu.nwafu.mizhipestcontrol.service.IIdentifyService;
import com.alibaba.fastjson2.JSONObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 病虫害识别
 */
@Slf4j
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/identify")
public class IdentifyController {
    private final IIdentifyService iIdentifyService;

    /**
     * 病虫害区域检测 V1
     */
    @PostMapping("/areaDetect")
    public R<IdentifyResultVO> identify(@RequestParam(value = "modelId", required = false) Long modelId,
                                        @RequestParam("multi") List<MultipartFile> multi,
                                        @RequestParam("rgb") List<MultipartFile> rgb) {
        return iIdentifyService.areaDetect(modelId, multi, rgb);
    }


    /**
     * 病虫害识别
     */

    /**
     分为病害识别和虫害识别两个部分
     */
    @PostMapping("/rgb")
    public R<List<RgbResult>> identify(@RequestParam(value = "modelId", required = false) Long modelId,
                                       @RequestParam("images") List<MultipartFile> images) {
        return iIdentifyService.identifyPest(modelId, images);
    }
    /**
     * 植株病害识别接口识别
     */
    @PostMapping("/diseaseId")
    public R<List<RgbResult>> identifyDiseaseId(@RequestParam(value = "modelId", required = false) Long modelId,
                                       @RequestParam("images") List<MultipartFile> images) {
        return iIdentifyService.identifyDisease(modelId, images);
    }

    /**
     *虫害植株识别接口
     */
    @PostMapping("/pestId")
    public R<List<RgbResult>> identifyPestId(@RequestParam(value = "modelId", required = false) Long modelId,
                                       @RequestParam("images") List<MultipartFile> images) {
        return iIdentifyService.identifyPest(modelId, images);
    }

    /**
     * 生育阶段识别
     */
    @PostMapping("/wh")
    public R<List<WhResult>> identifyWh(@RequestParam(value = "modelId", required = false) Long modelId,
                                             @RequestParam("images") List<MultipartFile> images) {
        return iIdentifyService.identifyWh(modelId, images);
    }
    /**
     * 出苗率
     */
    @PostMapping("/er")
    public R<List<WhResult>> identifyEr(@RequestParam(value = "modelId", required = false) Long modelId,
                                    @RequestParam("images") List<String> images) {
        return iIdentifyService.identifyEr(modelId, images);
    }
    /**
     * 播种期
     */
    @PostMapping("/st")
    public R<BestSowingVo> identifySt(@RequestParam(value = "modelId", required = false) Long modelId,
                                        @RequestBody Map<String, Object> requestData) {
        return iIdentifyService.identifySt(modelId, requestData);
    }

    /**
     * 病虫害预警
     */
    @GetMapping("warn")
    public R<List<WarnVO>> warn(){
        String deptTdStr = StpUtil.getExtra(LoginHelper.DEPT_KEY).toString();
        System.out.println(deptTdStr);
        return iIdentifyService.warn(Long.parseLong(deptTdStr));
    }

//    @PostMapping("/pestArea")
//    public  R<PestAreaDetection> pestArea(@RequestBody AreaDetectRequestBo b){
//        return iIdentifyService.PestAreaDetect(b.getRgbUrl(), b.getTifUrl(), null, b.getBaseName(), b.getPlotName());
//    }

    /**
     * 提交病害区域检测异步任务
     * @param request 请求参数
     * @return 任务 ID
     */
    @PostMapping("/pestArea/submit")
    public R<PestAreaSubmitVo> submitPestAreaTask(@RequestBody AreaDetectRequestBo request) {
        log.info("提交病害区域检测异步任务 - 基地: {}, 地块: {}, RGB: {}, TIF: {}", 
                request.getBaseName(), request.getPlotName(), request.getRgbUrl(), request.getTifUrl());
        return iIdentifyService.submitPestAreaTask(request.getRgbUrl(), request.getTifUrl(), 
                null, request.getBaseName(), request.getPlotName());
    }

    /**
     * 查询病害区域检测异步任务状态和结果
     * @param taskId 任务 ID
     * @param modelId 模型 ID（可选）
     * @return 任务状态和结果
     */
    @GetMapping("/pestArea/task/{taskId}")
    public R<PestAreaTaskVo> queryPestAreaTask(
            @PathVariable("taskId") String taskId,
            @RequestParam(value = "modelId", required = false) Long modelId) {
        log.info("查询病害区域检测任务状态 - 任务ID: {}, 模型ID: {}", taskId, modelId);
        return iIdentifyService.queryPestAreaTask(taskId, modelId);
    }

    /**
     * 获取最佳播种期依据图（温度/墒情）
     * 请求：{"variety":"A", "variety_area":"jiangxingzhuang"}
     */
    @PostMapping("/stinfo")
    public R<cn.edu.nwafu.mizhipestcontrol.domain.vo.StInfoVo> getStinfo(@RequestBody Map<String, Object> requestData) {
        log.info("获取最佳播种期依据图，请求参数: {}", requestData);
        return iIdentifyService.getStinfo(requestData);
    }

    @GetMapping({"/bf-warning/predict", "/BfWarning"})
    public R<WhiteheadDetectVo> detectWhiteheadLevel(@RequestParam("date") String date) {
        log.info("白发病等级/气象预测请求 - date: {}", date);
        return this.iIdentifyService.detectWhiteheadLevel(date);
    }

}
