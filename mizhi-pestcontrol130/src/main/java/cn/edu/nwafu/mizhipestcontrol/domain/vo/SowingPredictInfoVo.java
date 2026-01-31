package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * 基地播种计划视图（含品种颜色与形态信息）
 */
@Data
@ExcelIgnoreUnannotated
public class SowingPredictInfoVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty("主键ID")
    private Long id;

    @ExcelProperty("基地名")
    private String baseName;

    @ExcelProperty("品种")
    private String variety;

    @ExcelProperty("预测播种开始日期")
    private LocalDate sowingStartDate;

    @ExcelProperty("预测播种结束日期")
    private LocalDate sowingEndDate;

    @ExcelProperty("谷子颜色信息")
    private String grainColorInfo;

    @ExcelProperty("生长形态信息")
    private String growthFormInfo;
}
