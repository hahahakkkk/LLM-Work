package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 农田表增删改查对象 pestcontrol_farmland
 *
 * @author WMX
 * @date 2025-04-14
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pestcontrol_farmland")
public class Farmland extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 
     */
    @TableId(type = IdType.AUTO)
    private Long farmlandId;

    /**
     * 
     */
    private Long userId;

    /**
     * 
     */
    private String farmlandName;

    /**
     *
     */
    private Long version;

    /**
     * 
     */
    private String pestTypes;

    /**
     * 
     */
    private String pestTactics;


    /**
     * 
     */
    private String originImageUrl;

    /**
     * 
     */
    private String processedImageUrl;


}
