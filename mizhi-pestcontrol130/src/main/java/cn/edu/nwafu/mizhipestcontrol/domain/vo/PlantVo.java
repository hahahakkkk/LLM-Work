package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.Plant;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;


/**
 * 病虫害植株视图对象 pestcontrol_plant
 *
 * @author WMX
 * @date 2025-05-01
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = Plant.class)
public class PlantVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    /**
     * 监测点名称
     */
    @ExcelProperty(value = "监测点名称")
    private String detectPointName;

    /**
     * 图像地址
     */
    @ExcelProperty(value = "图像地址")
    private String imageUrl;

    /**
     * 病虫害类型
     */
    @ExcelProperty(value = "病虫害类型")
    private String pestTypes;

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
