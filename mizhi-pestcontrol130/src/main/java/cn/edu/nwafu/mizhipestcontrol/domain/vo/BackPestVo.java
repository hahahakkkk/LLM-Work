package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: BackPestVo
 * @author: ljf
 * @description: TODO
 */

//后台查看历史记录卡片 显示数据
@Data
public class BackPestVo {
    //总数
    private Integer total;
    //今日
    private Integer today;
    //本周
    private Integer thisWeek;
}
