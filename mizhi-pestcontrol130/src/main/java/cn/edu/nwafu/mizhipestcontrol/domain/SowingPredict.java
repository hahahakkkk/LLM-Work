package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serial;

/**
 * 基地播种计划对象 sowing_predict
 *
 * @author LJF
 * @date 2025-11-21
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sowing_predict")
public class SowingPredict extends TenantEntity {

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
     * 预测播种开始日期
     */
    private Date sowingStartDate;

    /**
     * 预测播种结束日期
     */
    private Date sowingEndDate;


}
