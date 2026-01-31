package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 病害区域检测任务提交响应VO（精简版）
 *
 * @author System
 * @date 2025-11-19
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PestAreaSubmitVo {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 提示信息
     */
    private String message;
}
