package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.PlantResults;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import cn.edu.nwafu.common.excel.annotation.ExcelDictFormat;
import cn.edu.nwafu.common.excel.convert.ExcelDictConvert;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;


/**
 * 病虫害植株识别结果视图对象 plant_results
 *
 * @author LJF
 * @date 2025-12-04
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PlantResults.class)
public class PlantResultsVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键
     */
    @ExcelProperty(value = "自增主键")
    private Long id;

    /**
     * 基地名
     */
    @ExcelProperty(value = "基地名")
    private String baseName;

    /**
     * 地块编号
     */
    @ExcelProperty(value = "地块编号")
    private String plotCode;

    /**
     * 病虫害类型
     */
    @ExcelProperty(value = "病虫害类型")
    private String diseaseType;

    /**
     * 备注信息
     */
    @ExcelProperty(value = "备注信息")
    private String description;

    /**
     * 处理结果图像（OSS 图像地址）
     */
    @ExcelProperty(value = "处理结果图像", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "O=SS,图=像地址")
    private String resultImageUrl;

    /**
     * 基地ID，关联基地主键
     */
    @ExcelProperty(value = "基地ID，关联基地主键")
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    @ExcelProperty(value = "地块ID，关联地块主键")
    private Long plotId;

    /**
     * 创建时间，自动更新
     */
    @ExcelProperty(value = "创建时间，自动更新")
    private Date createTime;

    // /**
    //  * 更新时间，自动更新
    //  */
    // @ExcelProperty(value = "更新时间，自动更新")
    // private Date updateTime;


}
