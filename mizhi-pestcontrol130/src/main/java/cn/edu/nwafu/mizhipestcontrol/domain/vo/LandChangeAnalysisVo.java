package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.LandChangeAnalysis;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.format.NumberFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import cn.edu.nwafu.common.tenant.core.TenantEntity;
import cn.edu.nwafu.mizhipestcontrol.utils.FourDecimalSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;



/**
 * 土地变化分析视图对象 land_change_analysis
 *
 * @author LJF
 * @date 2025-12-11
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = LandChangeAnalysis.class)
public class LandChangeAnalysisVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID，自增
     */
    @ExcelProperty(value = "主键ID，自增")
    private Long id;

    /**
     * 基地ID
     */
    @ExcelProperty(value = "基地ID")
    private String baseId;

    /**
     * 基地名称
     */
    @ExcelProperty(value = "基地名称")
    private String baseName;

    /**
     * 地块ID
     */
    @ExcelProperty(value = "地块ID")
    private String landId;

    /**
     * 地块编码
     */
    @ExcelProperty(value = "地块编码")
    private String landCode;

    /**
     * 地块原始面积（亩）
     */
    @ExcelProperty(value = "地块原始面积(亩)")
    @NumberFormat("0.0000")
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double landAreaMu;

    /**
     * 新增面积（亩）
     */
    @ExcelProperty(value = "新增面积(亩)")
    @NumberFormat("0.0000")
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double increasedAreaMu;

    /**
     * 减少面积（亩）
     */
    @ExcelProperty(value = "减少面积(亩)")
    @NumberFormat("0.0000")
    @JsonSerialize(using = FourDecimalSerializer.class)
    private Double decreasedAreaMu;


}
