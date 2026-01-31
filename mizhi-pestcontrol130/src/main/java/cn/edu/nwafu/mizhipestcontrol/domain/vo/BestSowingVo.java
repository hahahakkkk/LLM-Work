package cn.edu.nwafu.mizhipestcontrol.domain.vo;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: BestSowingVo
 * @author: ljf
 * @description: TODO
 */

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 最佳播种器的返回结果vo
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BestSowingVo {
    private String variety; //品种
    private String baseName;//种植地区

    private LocalDate startDate;//预测可以播种开始时间
    private LocalDate endDate;  // 预测播种结束时间

    private LocalDate realStartDate; // 实际可以播种时间
    private LocalDate realEndDate; // 实际结束时间

    private String  forecastUrl;// 预测图像
    private String  trendUrl; // 趋势图像 判断依据
}
