package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import cn.edu.nwafu.mizhipestcontrol.domain.Plant;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 病虫害植株业务对象 pestcontrol_plant
 *
 * @author WMX
 * @date 2025-05-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = Plant.class, reverseConvertGenerate = false)
public class PlantBo extends BaseEntity {

    private Long id;

    /**
     * 监测点名称
     */
    @NotNull(message = "监测点名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String detectPointName;

    /**
     * 图像地址
     */
    @NotBlank(message = "图像地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String imageUrl;

    /**
     * 病虫害类型
     */
    private String pestTypes;


}
