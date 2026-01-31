package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import cn.edu.nwafu.mizhipestcontrol.domain.BfWarning;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import cn.edu.nwafu.common.excel.annotation.ExcelDictFormat;
import cn.edu.nwafu.common.excel.convert.ExcelDictConvert;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;


/**
 * 气象预警与建议数据视图对象 bf_warning
 *
 * @author LJF
 * @date 2026-01-22
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = BfWarning.class)
public class BfWarningVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键
     */
    @ExcelProperty(value = "自增主键")
    private Long id;

    /**
     * 预警等级
     */
    @ExcelProperty(value = "预警等级")
    private String warningLevel;

    /**
     * 预测日期
     */
    @ExcelProperty(value = "预测日期")
    private Date predictionDate;

    /**
     * 平均温度（℃，过去七天平均）
     */
    @ExcelProperty(value = "平均温度", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "℃=，过去七天平均")
    private Double tMean;

    /**
     * 平均相对湿度（%，过去七天的平均）
     */
    @ExcelProperty(value = "平均相对湿度", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "%=，过去七天的平均")
    private Double rhMean;

    /**
     * 日照时间（h，过去七天平均）
     */
    @ExcelProperty(value = "日照时间", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "h=，过去七天平均")
    private Long SSD;

    /**
     * 累计降水量（mm，过去七天累计）
     */
    @ExcelProperty(value = "累计降水量", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "m=m，过去七天累计")
    private Double RF;

    /**
     * 参考作物蒸散量（mm，过去七天平均）
     */
    @ExcelProperty(value = "参考作物蒸散量", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "m=m，过去七天平均")
    private Double ET0;

    /**
     * 建议措施
     */
    @ExcelProperty(value = "建议措施")
    private String recommendation;


}
