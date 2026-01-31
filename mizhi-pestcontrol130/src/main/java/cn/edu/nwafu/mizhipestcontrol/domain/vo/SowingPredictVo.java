package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import java.time.LocalDate;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingPredict;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import cn.edu.nwafu.common.excel.annotation.ExcelDictFormat;
import cn.edu.nwafu.common.excel.convert.ExcelDictConvert;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;


/**
 * 基地播种计划视图对象 sowing_predict
 *
 * @author LJF
 * @date 2025-11-21
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = SowingPredict.class)
public class SowingPredictVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @ExcelProperty(value = "主键ID")
    private Long id;

    /**
     * 基地名
     */
    @ExcelProperty(value = "基地名")
    private String baseName;

    /**
     * 品种
     */
    @ExcelProperty(value = "品种")
    private String variety;

    /**
     * 预测播种开始日期
     */
    @ExcelProperty(value = "预测播种开始日期")
    private LocalDate sowingStartDate;

    /**
     * 预测播种结束日期
     */
    @ExcelProperty(value = "预测播种结束日期")
    private LocalDate sowingEndDate;

    /**
     * 创建时间
     *
     */
    private   LocalDate createTime;

}
