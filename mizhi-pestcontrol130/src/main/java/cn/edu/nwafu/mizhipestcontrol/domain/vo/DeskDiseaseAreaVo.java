package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: DeskDiseaseAreaVo
 * @author: ljf
 * @description: TODO
 */
@Data
public class DeskDiseaseAreaVo {
    private Long id; //编号
    private String landCode;        // 地块编号（前端必需：用于匹配地图）
    private String baseName;        // 基地名称，如“侯家沟”
    private String baseId;          // 基地ID，如“hjg”
    private String plotId;
    private String diseaseType;  //病害 类型 白发病
    private Integer Leval;
    private String imageUrl; // 检测结果图
    private Double incidenceRate;
}
