package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 病害区域检测异步任务查询响应VO（完整版）
 *
 * @author System
 * @date 2025-11-17
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PestAreaTaskVo {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 任务状态: pending, running, completed, failed
     */
    private String status;
    
    /**
     * 任务进度 (0-100)
     */
    private Integer progress;
    
    /**
     * 提示信息/进度消息
     */
    private String message;
    
    /**
     * 基地名称
     */
    private String baseName;
    
    /**
     * 地块名称
     */
    private String plotName;

    /**
     * 上传检测请求的 RGB 原图 URL
     */
    @JsonProperty("rgb_url")
    private String rgbUrl;

    /**
     * 上传检测请求的 TIF 原图 URL
     */
    @JsonProperty("tif_url")
    private String tifUrl;

    /**
     * 创建时间（默认当前时间）
     */
    private Date createTime;

    /**
     * 地块经度（completed时返回）
     */
    private Double longitude;

    /**
     * 地块纬度（completed时返回）
     */
    private Double latitude;
    
    /**
     * 发病率（百分比，completed时返回）
     */
    private Double incidence;

    /**
     * 检测结论（根据发病率生成，completed时返回）
     */
    private String conclusion;
    
    /**
     * 病害等级: 轻度、中度、重度（completed时返回）
     */
    private String level;
    
    /**
     * 防治措施建议（completed时返回）
     */
    private Map<String, List<String>> measure;
    
    /**
     * 结果可视化图像URL（completed时返回）
     */
    private String resultImageUrl;
    
    /**
     * 下载链接（completed时返回）
     */
    private String downloadUrl;
    
    /**
     * 错误信息（failed时返回）
     */
    private String error;
}
