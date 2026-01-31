package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.core.validate.AddGroup;
import cn.edu.nwafu.common.core.validate.EditGroup;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;
import cn.edu.nwafu.common.translation.annotation.Translation;
import cn.edu.nwafu.common.translation.constant.TransConstant;

/**
 * 谷子出苗率历史记录业务对象 guzi_emergence_history
 *
 * @author LJF
 * @date 2025-12-04
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = GuziEmergenceHistory.class, reverseConvertGenerate = false)
public class GuziEmergenceHistoryBo extends BaseEntity {

    /**
     * 检测编号（主键ID）
     */
    @NotNull(message = "检测编号（主键ID）不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 基地名
     */
    @NotBlank(message = "基地名不能为空", groups = { AddGroup.class, EditGroup.class })
    private String baseName;

    /**
     * 检测人用户名（当前操作用户的user_name）
     */
    @NotBlank(message = "检测人用户名（当前操作用户的user_name）不能为空", groups = { AddGroup.class, EditGroup.class })
    private String inspectorUser;

    /**
     * 地块名称
     */
    @NotBlank(message = "地块名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String plotName;

    /**
     * 经度
     */
    @NotNull(message = "经度不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long longitude;

    /**
     * 纬度
     */
    @NotNull(message = "纬度不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long latitude;

    /**
     * 出苗率（%）
     */
    @NotNull(message = "出苗率（%）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long emergenceRate;

    /**
     * 总苗数
     */
    @NotNull(message = "总苗数不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long totalSeedlings;

    /**
     * 地块面积（单位：㎡）
     */
    @NotNull(message = "地块面积（单位：㎡）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long plotArea;

    /**
     * 苗密度（株/㎡）
     */
    @NotNull(message = "苗密度（株/㎡）不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long seedlingDensity;

    /**
     * 检测原图(OSS存储路径)
     */
    @NotBlank(message = "检测原图(OSS存储路径)不能为空", groups = { AddGroup.class, EditGroup.class })
    private String originImage;

    /**
     * 检测结果图(OSS存储路径)
     */
    @NotBlank(message = "检测结果图(OSS存储路径)不能为空", groups = { AddGroup.class, EditGroup.class })
    private String resultImage;

    /**
     * 基地ID，关联基地主键
     */
    @NotNull(message = "基地ID，关联基地主键不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long baseId;

    /**
     * 地块ID，关联地块主键
     */
    @NotNull(message = "地块ID，关联地块主键不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long plotId;


}
