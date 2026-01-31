package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import cn.edu.nwafu.mizhipestcontrol.domain.Plant;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantVo;

/**
 * 病虫害植株Mapper接口
 *
 * @author WMX
 * @date 2025-05-01
 */
@DataPermission({
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface PlantMapper extends BaseMapperPlus<Plant, PlantVo> {

}
