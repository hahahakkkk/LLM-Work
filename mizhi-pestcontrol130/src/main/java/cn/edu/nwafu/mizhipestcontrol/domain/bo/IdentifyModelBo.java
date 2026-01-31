package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import cn.edu.nwafu.mizhipestcontrol.domain.IdentifyModel;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 病虫害识别模型业务对象 pestcontrol_identify_model
 *
 * @author WMX
 * @date 2025-05-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = IdentifyModel.class, reverseConvertGenerate = false)
public class IdentifyModelBo extends BaseEntity {

    private Long modelId;

    /**
     * 模型名称
     */
    @NotBlank(message = "模型名称不能为空", groups = { EditGroup.class })
    private String modelName;

    /**
     * 模型类型
     */
    @NotBlank(message = "模型类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String modelType;

    /**
     * 是否是默认的模型
     */
    @NotNull(message = "是否是默认的模型不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long isDefault;

    /**
     * 访问地址
     */
    @NotBlank(message = "访问地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String modelUrl;

    /**
     * 描述
     */
    @NotBlank(message = "描述不能为空", groups = { AddGroup.class, EditGroup.class })
    private String description;


}
