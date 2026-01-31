package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import cn.edu.nwafu.mizhipestcontrol.domain.Farmland;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.FarmlandBo;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.FarmlandInfoBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.FarmlandVo;
import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.apache.ibatis.annotations.Param;

import java.util.Collection;
import java.util.List;

/**
 * 农田表增删改查Mapper接口
 *
 * @author WMX
 * @date 2025-04-14
 */
@DataPermission({
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface FarmlandMapper extends BaseMapperPlus<Farmland, FarmlandVo> {

    List<Farmland> selectWarnRecords(@Param("deptId") Long deptId);

    /**
     * 查询指定农田名称和用户的最大版本号
     * @param farmlandName 农田名称
     * @param userId 用户ID
     * @return 最大版本号（可能为 null）
     */
    Long selectMaxVersion(
            @Param("farmlandName") String farmlandName,
            @Param("userId") Long userId
    );

    FarmlandVo selectVoById(@Param("farmlandId") Long farmlandId);

    int deleteByIds(@Param("ids") Collection<?> ids);


    // dubbo 调用 不是用 mybatis 验证方式
    @InterceptorIgnore(tenantLine = "true")
    List <FarmlandInfoBo> selectFarmlandInfoList();

}
