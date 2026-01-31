package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.BfWarning;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 气象预警与建议数据业务对象 bf_warning
 *
 * @author LJF
 * @date 2026-01-22
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = BfWarning.class, reverseConvertGenerate = false)
public class BfWarningBo extends BaseEntity {

    /**
     * 自增主键
     */
    @NotNull(message = "自增主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 预警等级
     */
    @NotBlank(message = "预警等级不能为空", groups = { AddGroup.class, EditGroup.class })
    private String warningLevel;

    /**
     * 预测日期
     */
    @NotNull(message = "预测日期不能为空", groups = { AddGroup.class, EditGroup.class })
    private Date predictionDate;

    /**
     * 平均温度（℃，过去七天平均）
     */
    @NotNull(message = "平均温度（℃，过去七天平均）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double tMean;

    /**
     * 平均相对湿度（%，过去七天的平均）
     */
    @NotNull(message = "平均相对湿度（%，过去七天的平均）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double rhMean;

    /**
     * 日照时间（h，过去七天平均）
     */
    @NotNull(message = "日照时间（h，过去七天平均）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long SSD;

    /**
     * 累计降水量（mm，过去七天累计）
     */
    @NotNull(message = "累计降水量（mm，过去七天累计）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double RF;

    /**
     * 参考作物蒸散量（mm，过去七天平均）
     */
    @NotNull(message = "参考作物蒸散量（mm，过去七天平均）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double ET0;

    /**
     * 建议措施
     */
    @NotBlank(message = "建议措施不能为空", groups = { AddGroup.class, EditGroup.class })
    private String recommendation;


}
