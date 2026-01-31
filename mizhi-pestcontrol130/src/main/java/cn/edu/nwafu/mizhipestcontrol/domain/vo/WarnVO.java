package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.AllStrategy;
import lombok.Data;

import java.util.List;

@Data
public class WarnVO {
    private Long farmlandId; // 农田id
    private String farmlandName; // 农田名称
    private String warnMessage; // 预警信息
    private String pestTypes; // 病虫害类别
    private List<AllStrategy> resultStrategies; // 病虫害类别、发生率、防治策略
    private Long version; // 版本
    private String originImageUrl; // 原始图像地址
    private String processedImageUrl; // 识别处理后图像地址
    private String createTime; // 创建时间
}
