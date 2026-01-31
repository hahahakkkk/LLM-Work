package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.mizhipestcontrol.domain.LandChangeAnalysis;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.LandChangeAnalysisVo;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
/**
 * 土地变化分析Mapper接口
 *
 * @author LJF
 * @date 2025-12-11
 */
@DataPermission( {
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface LandChangeAnalysisMapper extends BaseMapperPlus<LandChangeAnalysis, LandChangeAnalysisVo> {

}
