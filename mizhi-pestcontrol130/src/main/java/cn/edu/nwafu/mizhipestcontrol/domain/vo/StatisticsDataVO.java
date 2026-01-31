package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

@Data
public class StatisticsDataVO {
    // 区域总数和变化
    private Integer totalAreas;
    private Integer totalAreasChange;

    // 病虫害区域数量和变化
    private Integer infectedAreas;
    private Integer infectedAreasChange;

    // 病虫害发生率相关
    private Double infectionRate;
    private Double infectionRateChange;

    // 病虫害类别相关
    private Integer categories;
    private Integer categoriesChange;

}
