package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serial;

/**
 * 基地实际播种日期记录对象 sowing_record
 *
 * @author LJF
 * @date 2025-11-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sowing_record")
public class SowingRecord extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 基地名
     */
    private String baseName;

    /**
     * 品种
     */
    private String variety;

    /**
     * 播种日期
     */
    private Date sowingDate;


}
