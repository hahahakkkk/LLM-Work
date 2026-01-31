package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 病虫害植株对象 pestcontrol_plant
 *
 * @author WMX
 * @date 2025-05-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pestcontrol_plant")
public class Plant extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键，自增
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 用户编号，user表的外键
     */
    private Long userId;

    /**
     * 监测点名称
     */
    private String detectPointName;

    /**
     * 图像地址
     */
    private String imageUrl;

    /**
     * 病虫害类型
     */
    private String pestTypes;


}
