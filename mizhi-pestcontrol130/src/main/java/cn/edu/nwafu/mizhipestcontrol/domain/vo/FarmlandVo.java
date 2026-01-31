package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.Farmland;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;


/**
 * 农田表增删改查视图对象 pestcontrol_farmland
 *
 * @author WMX
 * @date 2025-04-14
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = Farmland.class)
public class FarmlandVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "区域Id")
    private String farmlandId;

    @ExcelProperty(value = "区域名称")
    private String farmlandName;

    @ExcelProperty(value = "版本")
    private Long version;

    @ExcelProperty(value = "病虫害类别")
    private String pestTypes;

    @ExcelProperty(value = "病虫害防治策略")
    private String pestTactics;

    @ExcelProperty(value = "原始全景图像")
    private String originImageUrl;

    @ExcelProperty(value = "识别处理全景图像\n")
    private String processedImageUrl;

    /**
     *
     */
    @ExcelProperty(value = "创建日期")
    private Date createTime;

    /**
     *
     */
    @ExcelProperty(value = "修改日期")
    private Date updateTime;



}
