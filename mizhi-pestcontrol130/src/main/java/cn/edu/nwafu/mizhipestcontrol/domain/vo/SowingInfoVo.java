package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: SowingInfoVo
 * @author: ljf
 * @description: TODO
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SowingInfoVo {
    private String baseName;
    private String variety;

    private LocalDate SowingRealDate;
    private LocalDate sowingStartDate;
    private LocalDate sowingEndDate;
}
