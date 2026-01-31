package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.LandChangeAnalysis;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import cn.edu.nwafu.common.tenant.core.TenantEntity;
import cn.edu.nwafu.mizhipestcontrol.utils.FourDecimalSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

/**
 * 土地变化分析业务对象 land_change_analysis
 *
 * @author LJF
 * @date 2025-12-11
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = LandChangeAnalysis.class, reverseConvertGenerate = false)
public class LandChangeAnalysisBo extends BaseEntity {

    /**
     * 主键ID，自增
     */
    @NotNull(message = "主键ID，自增不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 基地ID
     */
    @NotBlank(message = "基地ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseId;

    /**
     * 基地名称
     */
    @NotBlank(message = "基地名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseName;

    /**
     * 地块ID
     */
    @NotBlank(message = "地块ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private String landId;

    /**
     * 地块编码
     */
    @NotBlank(message = "地块编码不能为空", groups = { AddGroup.class, EditGroup.class })
    private String landCode;

    /**
     * 地块原始面积（亩）
     */
    @NotNull(message = "地块原始面积（亩）不能为空", groups = { AddGroup.class, EditGroup.class })
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double landAreaMu;

    /**
     * 新增面积（亩）
     */
    @NotNull(message = "新增面积（亩）不能为空", groups = { AddGroup.class, EditGroup.class })
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double increasedAreaMu;

    /**
     * 减少面积（亩）
     */
    @NotNull(message = "减少面积（亩）不能为空", groups = { AddGroup.class, EditGroup.class })
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double decreasedAreaMu;


}
