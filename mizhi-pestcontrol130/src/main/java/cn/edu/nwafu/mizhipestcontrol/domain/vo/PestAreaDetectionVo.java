package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.common.translation.annotation.Translation;
import cn.edu.nwafu.common.translation.constant.TransConstant;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
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
 * 病虫害区域检测记录视图对象 pest_area_detection
 *
 * @author LJF
 * @date 2025-10-30
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = PestAreaDetection.class)
public class PestAreaDetectionVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键ID
     */
    @ExcelProperty(value = "自增主键ID")
    private Long id;

    /**
     * 基地名
     */
    @ExcelProperty(value = "基地名")
    private String baseName;

    /**
     * 地块名
     */
    @ExcelProperty(value = "地块名")
    private String plotName;

    /**
     * 地块经度
     */
    @ExcelProperty(value = "地块经度")
    private Double longitude;

    /**
     * 地块纬度
     */
    @ExcelProperty(value = "地块纬度")
    private Double latitude;

    /**
     * 病害类型，默认白发病
     */
    @ExcelProperty(value = "病害类型，默认白发病")
    private String diseaseType;

    /**
     * 病害发生率（百分比数值，如 23.45 表示 23.45%）
     */
    @ExcelProperty(value = "病害发生率", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "百=分比数值，如,2=3.45,表=示,2=3.45%")
    private Double incidenceRate;

    /**
     * 检测原图RGB（OSS路径）
     */
    @ExcelProperty(value = "检测原图RGB", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "O=SS路径")
    private String rgbOriginalImage;

    /**
     * 检测原图RGB（OSS路径）Url
     */
//    @Translation(type = TransConstant.OSS_ID_TO_URL, mapper = "rgbOriginalImage")
//    private String rgbOriginalImageUrl;
    /**
     * TIF原图（OSS路径）
     */
    @ExcelProperty(value = "TIF原图", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "O=SS路径")
    private String tifOriginalImage;

    /**
     * TIF原图（OSS路径）Url
     */
//    @Translation(type = TransConstant.OSS_ID_TO_URL, mapper = "tifOriginalImage")
//    private String tifOriginalImageUrl;
    /**
     * 检测结果图RGB（OSS路径）
     */
    @ExcelProperty(value = "检测结果图RGB", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "O=SS路径")
    private String rgbResultImage;

    /**
     * 检测结果图RGB（OSS路径）Url
     */
//    @Translation(type = TransConstant.OSS_ID_TO_URL, mapper = "rgbResultImage")
//    private String rgbResultImageUrl;
    /**
     * 检测结果描述
     */
    @ExcelProperty(value = "检测结果描述")
    private String description;

    /**
     * 创建人
     */
    @ExcelProperty(value = "创建人")
    private String createBy;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

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


}
