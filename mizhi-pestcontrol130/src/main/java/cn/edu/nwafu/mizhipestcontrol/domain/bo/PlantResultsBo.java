package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.PlantResults;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

/**
 * 病虫害植株识别结果业务对象 plant_results
 *
 * @author LJF
 * @date 2025-12-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = PlantResults.class, reverseConvertGenerate = false)
public class PlantResultsBo extends BaseEntity {

    /**
     * 自增主键
     */
    @NotNull(message = "自增主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 基地名
     */
    @NotBlank(message = "基地名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseName;

    /**
     * 地块编号
     */
    @NotBlank(message = "地块编号不能为空", groups = { AddGroup.class, EditGroup.class })
    private String plotCode;

    /**
     * 病虫害类型
     */
    @NotBlank(message = "病虫害类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String diseaseType;

    /**
     * 备注信息
     */
    @NotBlank(message = "备注信息不能为空", groups = { AddGroup.class, EditGroup.class })
    private String description;

    /**
     * 处理结果图像（OSS 图像地址）
     */
    @NotBlank(message = "处理结果图像（OSS 图像地址）不能为空", groups = { AddGroup.class, EditGroup.class })
    private String resultImageUrl;

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
