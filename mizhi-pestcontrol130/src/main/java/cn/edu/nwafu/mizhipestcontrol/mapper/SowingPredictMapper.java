package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingPredict;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingPredictInfoVo;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import org.apache.ibatis.annotations.Select;

/**
 * 基地播种计划Mapper接口
 *
 * @author LJF
 * @date 2025-11-21
 */@DataPermission({
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface SowingPredictMapper extends BaseMapperPlus<SowingPredict, SowingPredictVo> {
    @Select("SELECT * FROM sowing_predict WHERE base_name = #{baseName} ORDER BY id DESC LIMIT 1")
    SowingPredictVo queryByBaseName(String baseName);

    @Select("SELECT * FROM sowing_predict WHERE base_id = #{baseId} ORDER BY id DESC LIMIT 1")
    SowingPredictVo queryLatestByBaseId(Long baseId);

    // 移除联表方法，改为服务层组合

}
