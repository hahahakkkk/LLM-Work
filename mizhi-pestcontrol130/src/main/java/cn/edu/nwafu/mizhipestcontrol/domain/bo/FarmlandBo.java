package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import cn.edu.nwafu.mizhipestcontrol.domain.Farmland;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 农田表增删改查业务对象 pestcontrol_farmland
 *
 * @author WMX
 * @date 2025-04-14
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = Farmland.class, reverseConvertGenerate = false)
public class FarmlandBo extends BaseEntity {

    private Long farmlandId;

    private String farmlandName;

    private String pestTypes;

    private String pestTactics;

    private String originImageUrl;

    private String processedImageUrl;


}
