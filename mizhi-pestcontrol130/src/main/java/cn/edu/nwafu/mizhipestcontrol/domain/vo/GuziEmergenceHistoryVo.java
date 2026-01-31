package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.common.translation.annotation.Translation;
import cn.edu.nwafu.common.translation.constant.TransConstant;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import cn.edu.nwafu.common.excel.annotation.ExcelDictFormat;
import cn.edu.nwafu.common.excel.convert.ExcelDictConvert;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;


/**
 * 谷子出苗率历史记录视图对象 guzi_emergence_history
 *
 * @author LJF
 * @date 2025-10-29
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = GuziEmergenceHistory.class)
public class GuziEmergenceHistoryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 检测编号（主键ID）
     */
    @ExcelProperty(value = "检测编号", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "主=键ID")
    private Long id;

    /**
     * 基地名
     */
    @ExcelProperty(value = "基地名")
    private String baseName;

    /**
     * 检测人用户名（当前操作用户的user_name）
     */
    @ExcelProperty(value = "检测人用户名", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "当=前操作用户的user_name")
    private String inspectorUser;

    /**
     * 地块名称
     */
    @ExcelProperty(value = "地块名称")
    private String plotName;

    /**
     * 经度
     */
    @ExcelProperty(value = "经度")
    private Double longitude;

    /**
     * 纬度
     */
    @ExcelProperty(value = "纬度")
    private Double latitude;

    /**
     * 出苗率（%）
     */
    @ExcelProperty(value = "出苗率", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "%=")
    private Double emergenceRate;

    /**
     * 总苗数
     */
    @ExcelProperty(value = "总苗数")
    private Long totalSeedlings;

    /**
     * 地块面积（单位：㎡）
     */
    @ExcelProperty(value = "地块面积", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "单=位：㎡")
    private Double plotArea;

    /**
     * 苗密度（株/㎡）
     */
    @ExcelProperty(value = "苗密度", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "株=/㎡")
    private Double seedlingDensity;

    /**
     * 检测原图(OSS存储路径)
     */
    @ExcelProperty(value = "检测原图(OSS存储路径)")
    private String originImage;

    /**
     * 检测原图(OSS存储路径)Url
     */

    //这个注解自动对 oss 对象进行检查
//    @Translation(type = TransConstant.OSS_ID_TO_URL, mapper = "originImage")
//    private String originImageUrl;
    /**
     * 检测结果图(OSS存储路径)
     */
    @ExcelProperty(value = "检测结果图(OSS存储路径)")
    private String resultImage;

    /**
     * 检测结果图(OSS存储路径)Url
     */
//    @Translation(type = TransConstant.OSS_ID_TO_URL, mapper = "resultImage")
//    private String resultImageUrl;
    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private LocalDateTime createTime;



    @ExcelProperty(value = "基地ID，关联基地主键")
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    @ExcelProperty(value = "地块ID，关联地块主键")
    private Long plotId;

}
