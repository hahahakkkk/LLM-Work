package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FarmlandInfoBo {
    private Long farmlandId;
    private String farmlandName;
    private String pestTypes;
    private String pestTactics;
    private String originImageUrl;
    private String processedImageUrl;
    private LocalDateTime landUpdateTime;
}
