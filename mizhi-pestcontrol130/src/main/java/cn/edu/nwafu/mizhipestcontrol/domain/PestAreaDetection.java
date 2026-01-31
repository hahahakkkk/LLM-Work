package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 病虫害区域检测记录对象 pest_area_detection
 *
 * @author LJF
 * @date 2025-12-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pest_area_detection")
public class PestAreaDetection extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键ID
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 基地名
     */
    private String baseName;

    /**
     * 地块名
     */
    private String plotName;

    /**
     * 地块经度
     */
    private Double longitude;

    /**
     * 地块纬度
     */
    private Double latitude;

    /**
     * 病害类型，默认白发病
     */
    private String diseaseType;

    /**
     * 病害发生率（百分比数值，如 23.45 表示 23.45%）
     */
    private Double incidenceRate;

    /**
     * 检测原图RGB（OSS路径）
     */
    private String rgbOriginalImage;

    /**
     * TIF原图（OSS路径）
     */
    private String tifOriginalImage;

    /**
     * 检测结果图RGB（OSS路径）
     */
    private String rgbResultImage;

    /**
     * 检测结果描述
     */
    private String description;

    /**
     * 基地ID，关联基地主键
     */
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    private Long plotId;


}
