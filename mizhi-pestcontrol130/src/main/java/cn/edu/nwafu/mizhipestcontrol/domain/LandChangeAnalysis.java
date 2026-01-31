package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import cn.edu.nwafu.mizhipestcontrol.utils.FourDecimalSerializer;
import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 土地变化分析对象 land_change_analysis
 *
 * @author LJF
 * @date 2025-12-11
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("land_change_analysis")
public class LandChangeAnalysis extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID，自增
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 基地ID
     */
    private String baseId;

    /**
     * 基地名称
     */
    private String baseName;

    /**
     * 地块ID
     */
    private String landId;

    /**
     * 地块编码
     */
    private String landCode;

    /**
     * 地块原始面积（亩）
     */
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double landAreaMu;

    /**
     * 新增面积（亩）
     */
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double increasedAreaMu;

    /**
     * 减少面积（亩）
     */
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double decreasedAreaMu;


}
