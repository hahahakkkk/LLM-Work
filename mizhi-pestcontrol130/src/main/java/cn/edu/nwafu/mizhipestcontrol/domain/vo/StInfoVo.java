package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 最佳播种期 - 依据图（温度/墒情）返回结果
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StInfoVo {
    /** 温度双向条形图 URL */
    private String tempBarUrl;
    /** 墒情双向条形图 URL */
    private String moistBarUrl;
    /** 提示信息 */
    private String message;
}
