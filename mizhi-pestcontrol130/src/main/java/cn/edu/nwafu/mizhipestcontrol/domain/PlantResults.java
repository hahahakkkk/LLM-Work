package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 病虫害植株识别结果对象 plant_results
 *
 * @author LJF
 * @date 2025-12-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("plant_results")
public class PlantResults extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 基地名
     */
    private String baseName;

    /**
     * 地块编号
     */
    private String plotCode;

    /**
     * 病虫害类型
     */
    private String diseaseType;

    /**
     * 备注信息
     */
    private String description;

    /**
     * 处理结果图像（OSS 图像地址）
     */
    private String resultImageUrl;

    /**
     * 基地ID，关联基地主键
     */
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    private Long plotId;


}
