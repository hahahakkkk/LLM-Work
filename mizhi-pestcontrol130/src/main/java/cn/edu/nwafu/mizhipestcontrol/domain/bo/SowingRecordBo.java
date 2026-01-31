package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingRecord;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 基地实际播种日期记录业务对象 sowing_record
 *
 * @author LJF
 * @date 2025-11-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = SowingRecord.class, reverseConvertGenerate = false)
public class SowingRecordBo extends BaseEntity {

    /**
     * 主键ID
     */
    @NotNull(message = "主键ID不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 基地名
     */
    @NotBlank(message = "基地名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseName;

    /**
     * 品种
     */
    @NotBlank(message = "品种不能为空", groups = { AddGroup.class, EditGroup.class })
    private String variety;

    /**
     * 播种日期
     */
    @NotNull(message = "播种日期不能为空", groups = { AddGroup.class, EditGroup.class })
    private Date sowingDate;


}
