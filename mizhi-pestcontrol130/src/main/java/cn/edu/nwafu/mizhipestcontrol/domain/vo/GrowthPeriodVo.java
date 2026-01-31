package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

import java.time.LocalDate;

/**
 * 基地生育期信息视图对象
 */
@Data
public class GrowthPeriodVo {
    private String baseName;         // 基地名
    private LocalDate sowingDate;    // 实际播种日期
    private long daysSinceSowing;    // 播种至今的天数
    private String currentStage;     // 当前生育期阶段
}