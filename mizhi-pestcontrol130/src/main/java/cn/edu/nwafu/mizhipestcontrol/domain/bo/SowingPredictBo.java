package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingPredict;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingPredict;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 基地播种计划业务对象 sowing_predict
 *
 * @author LJF
 * @date 2025-11-21
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = SowingPredict.class, reverseConvertGenerate = false)
public class SowingPredictBo extends BaseEntity {

    /**
     * 主键ID
     */
    @NotNull(message = "主键ID不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 基地名
     */
    @NotBlank(message = "基地名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseName;

    /**
     * 品种
     */
    @NotBlank(message = "品种不能为空", groups = { AddGroup.class, EditGroup.class })
    private String variety;

    /**
     * 预测播种开始日期
     */
    @NotNull(message = "预测播种开始日期不能为空", groups = { AddGroup.class, EditGroup.class })
    private LocalDate sowingStartDate;

    /**
     * 预测播种结束日期
     */
    @NotNull(message = "预测播种结束日期不能为空", groups = { AddGroup.class, EditGroup.class })
    private LocalDate sowingEndDate;


}
