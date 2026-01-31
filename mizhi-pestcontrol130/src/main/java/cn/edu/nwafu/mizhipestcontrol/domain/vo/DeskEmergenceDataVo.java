package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: DataEmergenceVo
 * @author: ljf
 * @description: TODO
 */
@Data
public class DeskEmergenceDataVo {
//    大屏前台出苗率展示数据

        private Long id; //编号
        private String landCode;        // 地块编号（前端必需：用于匹配地图）
        private String baseName;        // 基地名称，如“侯家沟”
        private String baseId;          // 基地ID，如“hjg”
        private String PlotId;
        private Double emergenceRate;   // 出苗率，如 "92.5%"
        private  Long totalSeedings;  // 出苗株数，如 "1850"
        private Integer Level;       // 缺苗严重等级：0=高度缺苗, 1=重度缺苗, 2=低度缺苗, 3=正常
        private String detectionDate;   // 检测日期，格式 "yyyy-MM-dd"
        private String imageUrl;        // 图片路径


}
