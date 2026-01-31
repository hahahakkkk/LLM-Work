package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import java.time.LocalDate;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingRecord;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import cn.edu.nwafu.common.excel.annotation.ExcelDictFormat;
import cn.edu.nwafu.common.excel.convert.ExcelDictConvert;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;


/**
 * 基地实际播种日期记录视图对象 sowing_record
 *
 * @author LJF
 * @date 2025-11-04
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = SowingRecord.class)
public class SowingRecordVo implements Serializable {

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
     * 播种日期
     */
    @ExcelProperty(value = "播种日期")
    private LocalDate sowingDate;


}
