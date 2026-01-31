package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * 实际播种记录导出视图（可包含扩展字段）
 */
@Data
@ExcelIgnoreUnannotated
public class SowingRecordExportVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty("主键ID")
    private Long id;

    @ExcelProperty("基地名")
    private String baseName;

    @ExcelProperty("品种")
    private String variety;

    @ExcelProperty("播种日期")
    private LocalDate sowingDate;

    // 扩展字段：颜色/形态（如后续需要填充）
    @ExcelProperty("谷子颜色信息")
    private String grainColorInfo;

    @ExcelProperty("生长形态信息")
    private String growthFormInfo;
}
