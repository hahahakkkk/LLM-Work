package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.ErResult;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
import cn.edu.nwafu.mizhipestcontrol.domain.RgbResult;
import cn.edu.nwafu.mizhipestcontrol.domain.WhResult;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyResultVO;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WarnVO;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.BestSowingVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaTaskVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.StInfoVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WhiteheadDetectVo;
import com.alibaba.fastjson2.JSONObject;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 病虫害识别Service接口
 *
 * @author WMX
 * @date 2025-01-17
 */

public interface IIdentifyService {
    /**
     * 1. 病虫害区域检测 V1
     */
    R<IdentifyResultVO> areaDetect(Long modelId, List<MultipartFile> multi, List<MultipartFile> rgb);

    /**
     * 2.病虫害识别
     */
//    R<List<RgbResult>> identifyRgb(Long modelId, List<MultipartFile> images);
    /**
     * 2. 虫害识别
     */
    R<List<RgbResult>> identifyPest(Long modelId, List<MultipartFile> images);

    /**
     * 3.病害识别
     */
    R<List<RgbResult>> identifyDisease(Long modelId, List<MultipartFile> images);

    /**
     * 3.病虫害识别
     */
    R<List<WhResult>> identifyWh(Long modelId, List<MultipartFile> images);

    /**
     * 4.病虫害识别
     */
    R<List<WhResult>> identifyEr(Long modelId, List<String> imageUrls);
    R<JSONObject> identifyErs(Long modelId, List<String> imageUrls);

    /**
     * 5.播种期检测
     */
    R<BestSowingVo> identifySt(Long modelId, Map<String, Object> requestData);

    /**
     * 6.病虫害预警
     */
    R<List<WarnVO>> warn(Long deptId);

    /**
     * 7.病虫害区域检测 V2（同步）
     * @param Rgburl
     * @param tifurl
     * @param modelId
     * @param baseName
     * @param plotName
     * @return
     */
    R<PestAreaDetection> PestAreaDetect(String Rgburl, String tifurl, Long modelId, String baseName, String plotName);

    /**
     * 8.病虫害区域检测 V3（异步） - 提交任务
     * @param rgbUrl RGB图像URL
     * @param tifUrl TIF图像URL
     * @param modelId 模型ID
     * @param baseName 基地名称
     * @param plotName 地块名称
     * @return 任务信息
     */
    R<cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaSubmitVo> submitPestAreaTask(String rgbUrl, String tifUrl, Long modelId, String baseName, String plotName);

    /**
     * 9.查询病虫害区域检测任务状态
     * @param taskId 任务ID
     * @return 任务状态信息
     */
    R<PestAreaTaskVo> queryPestAreaTask(String taskId,Long modelId);

    /**
     * 10. 获取最佳播种期依据图（温度/墒情）
     * 请求示例：{"variety":"A", "variety_area":"jiangxingzhuang"}
     */
    R<StInfoVo> getStinfo(Map<String, Object> requestData);

    /**
     * 11. 白发病等级检测（基于气象特征）
     */
    R<WhiteheadDetectVo> detectWhiteheadLevel(String date);
}
