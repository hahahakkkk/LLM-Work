package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serial;

/**
 * 气象预警与建议数据对象 bf_warning
 *
 * @author LJF
 * @date 2026-01-22
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bf_warning")
public class BfWarning extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 预警等级
     */
    private String warningLevel;

    /**
     * 预测日期
     */
    private Date predictionDate;

    /**
     * 平均温度（℃，过去七天平均）
     */
    @TableField("T_Mean")
    private Double tMean;

    /**
     * 平均相对湿度（%，过去七天的平均）
     */
    @TableField("RH_mean")
    private Double rhMean;

    /**
     * 日照时间（h，过去七天平均）
     */
    @TableField("SSD")
    private Long SSD;

    /**
     * 累计降水量（mm，过去七天累计）
     */
    @TableField("RF")
    private Double RF;

    /**
     * 参考作物蒸散量（mm，过去七天平均）
     */
    @TableField("ET0")
    private Double ET0;

    /**
     * 建议措施
     */
    private String recommendation;


}
