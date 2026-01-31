package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import cn.edu.nwafu.common.translation.annotation.Translation;
import cn.edu.nwafu.common.translation.constant.TransConstant;

/**
 * 病虫害区域检测记录业务对象 pest_area_detection
 *
 * @author LJF
 * @date 2025-12-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PestAreaDetection.class, reverseConvertGenerate = false)
public class PestAreaDetectionBo extends BaseEntity {

    /**
     * 自增主键ID
     */
    @NotNull(message = "自增主键ID不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 基地名
     */
    @NotBlank(message = "基地名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseName;

    /**
     * 地块名
     */
    @NotBlank(message = "地块名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String plotName;

    /**
     * 地块经度
     */
    @NotNull(message = "地块经度不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double longitude;

    /**
     * 地块纬度
     */
    @NotNull(message = "地块纬度不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double latitude;

    /**
     * 病害类型，默认白发病
     */
    @NotBlank(message = "病害类型，默认白发病不能为空", groups = { AddGroup.class, EditGroup.class })
    private String diseaseType;

    /**
     * 病害发生率（百分比数值，如 23.45 表示 23.45%）
     */
    @NotNull(message = "病害发生率（百分比数值，如 23.45 表示 23.45%）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Double incidenceRate;

    /**
     * 检测原图RGB（OSS路径）
     */
    @NotBlank(message = "检测原图RGB（OSS路径）不能为空", groups = { AddGroup.class, EditGroup.class })
    private String rgbOriginalImage;

    /**
     * TIF原图（OSS路径）
     */
    @NotBlank(message = "TIF原图（OSS路径）不能为空", groups = { AddGroup.class, EditGroup.class })
    private String tifOriginalImage;

    /**
     * 检测结果图RGB（OSS路径）
     */
    @NotBlank(message = "检测结果图RGB（OSS路径）不能为空", groups = { AddGroup.class, EditGroup.class })
    private String rgbResultImage;

    /**
     * 检测结果描述
     */
    @NotBlank(message = "检测结果描述不能为空", groups = { AddGroup.class, EditGroup.class })
    private String description;

    /**
     * 基地ID，关联基地主键
     */
    @NotNull(message = "基地ID，关联基地主键不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    @NotNull(message = "地块ID，关联地块主键不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long plotId;


}
