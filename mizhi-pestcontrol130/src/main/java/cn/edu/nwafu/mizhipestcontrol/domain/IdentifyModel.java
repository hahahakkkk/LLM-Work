package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 病虫害识别模型对象 pestcontrol_identify_model
 *
 * @author WMX
 * @date 2025-05-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pestcontrol_identify_model")
public class IdentifyModel extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 模型id
     */
    @TableId(value = "model_id")
    private Long modelId;

    /**
     * 模型名称
     */
    private String modelName;

    /**
     * 模型类型
     */
    private String modelType;

    /**
     * 是否是默认的模型
     */
    private Long isDefault;

    /**
     * 访问地址
     */
    private String modelUrl;

    /**
     * 描述
     */
    private String description;


}
