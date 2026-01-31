package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: BackDieaseAreaStaticVo
 * @author: ljf
 * @description: TODO
 */

@Data
public class BackDieaseAreaStaticVo {
    //后台病害区域统计
    private  Integer total;
    private  Integer thisWeek;
    private  Integer today;
}
