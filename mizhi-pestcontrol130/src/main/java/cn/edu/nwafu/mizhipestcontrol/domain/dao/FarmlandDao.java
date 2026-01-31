package cn.edu.nwafu.mizhipestcontrol.domain.dao;

import cn.edu.nwafu.common.mybatis.core.domain.BaseEntity;
import cn.edu.nwafu.mizhipestcontrol.domain.AllStrategy;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * 农田表增删改查业务对象 pestcontrol_farmland
 *
 * @author WMX
 * @date 2025-04-14
 */
@Data
public class FarmlandDao extends BaseEntity {

    private Long farmlandId;

    @NotBlank(message = "不能为空")
    private String farmlandName;

    @NotBlank(message = "不能为空")
    private String pestTypes;

    @NotBlank(message = "不能为空")
    private List<AllStrategy> pestTactics;

    @NotBlank(message = "不能为空")
    private String originImageUrl;

    @NotBlank(message = "不能为空")
    private String processedImageUrl;


}
