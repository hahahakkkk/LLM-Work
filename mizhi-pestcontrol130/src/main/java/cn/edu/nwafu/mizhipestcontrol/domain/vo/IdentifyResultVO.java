package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.AllStrategy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IdentifyResultVO {
    // 单个原始图像地址
    private String originImageUrl;

    // 单个识别处理后图像地址
    private String processedImageUrl;
    // 分级结果
    private String levelImageUrl;

    // 病虫害类别、发生率、防治策略
    private List<AllStrategy> pestTactics;
}

