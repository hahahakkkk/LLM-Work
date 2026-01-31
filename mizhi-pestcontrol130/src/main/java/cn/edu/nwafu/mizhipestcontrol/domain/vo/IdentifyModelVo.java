package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.IdentifyModel;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;


/**
 * 病虫害识别模型视图对象 pestcontrol_identify_model
 *
 * @author WMX
 * @date 2025-05-01
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = IdentifyModel.class)
public class IdentifyModelVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 模型id
     */
    @ExcelProperty(value = "模型id")
    private Long modelId;

    /**
     * 模型名称
     */
    @ExcelProperty(value = "模型名称")
    private String modelName;

    /**
     * 模型类型
     */
    @ExcelProperty(value = "模型类型")
    private String modelType;

    /**
     * 是否是默认的模型
     */
    @ExcelProperty(value = "是否是默认的模型")
    private Long isDefault;

    /**
     * 访问地址
     */
    @ExcelProperty(value = "访问地址")
    private String modelUrl;

    /**
     * 描述
     */
    @ExcelProperty(value = "备注")
    private String description;

    /**
     * 创建时间，自动更新
     */
    @ExcelProperty(value = "创建时间，自动更新")
    private Date createTime;

    /**
     * 更新时间，自动更新
     */
    @ExcelProperty(value = "更新时间，自动更新")
    private Date updateTime;


}
