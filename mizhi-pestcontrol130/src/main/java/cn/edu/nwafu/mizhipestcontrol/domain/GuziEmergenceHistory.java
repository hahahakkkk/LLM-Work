package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import cn.edu.nwafu.mizhipestcontrol.utils.json.MultiFormatDateDeserializer;
import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.EqualsAndHashCode;
import cn.edu.nwafu.common.translation.annotation.Translation;
import cn.edu.nwafu.common.translation.constant.TransConstant;

import java.io.Serial;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * 谷子出苗率历史记录对象 guzi_emergence_history
 *
 * @author LJF
 * @date 2025-10-29
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("guzi_emergence_history")
public class GuziEmergenceHistory extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 检测编号（主键ID）
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 基地名
     */
    private String baseName;

    /**
     * 检测人用户名（当前操作用户的user_name）
     */
    private String inspectorUser;

    /**
     * 地块名称
     */
    private String plotName;
    /**
     * 基地ID，关联基地主键
     */
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    private Long plotId;


    /**
     * 经度
     */
    private Double longitude;

    /**
     * 纬度
     */
    private Double latitude;

    /**
     * 出苗率（%）
     */
    private Double emergenceRate;

    /**
     * 总苗数
     */
    private Long totalSeedlings;

    /**
     * 地块面积（单位：㎡）
     */
    private Double plotArea;

    /**
     * 苗密度（株/㎡）
     */
    private Double seedlingDensity;

    /**
     * 检测原图(OSS存储路径)
     */
    private String originImage;

    /**
     * 检测结果图(OSS存储路径)
     */
    private String resultImage;
    /**
     * 创建时间
     */
    @JsonDeserialize(
            using = MultiFormatDateDeserializer.class
    )
    private Date createTime;



}
