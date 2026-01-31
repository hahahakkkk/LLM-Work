package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.mizhipestcontrol.domain.PestAreaDetection;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaDetectionVo;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import org.apache.ibatis.annotations.Select;

/**
 * 病虫害区域检测记录Mapper接口
 *
 * @author LJF
 * @date 2025-10-30
 */
@DataPermission( {
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface PestAreaDetectionMapper extends BaseMapperPlus<PestAreaDetection, PestAreaDetectionVo> {

    @Select("SELECT COUNT(*) FROM pest_area_detection ")
    Integer getTotalCount();

    // 获取今日新增（按 create_time）
    @Select({
            "<script>",
            "SELECT COUNT(*) FROM pest_area_detection",
            "WHERE tenant_id = #{tenantId}",
            "AND DATE(create_time) = CURDATE()",
            "</script>"
    })
    Integer getTodayCount();

    // 获取本周新增（周一到周日）
    @Select({
            "<script>",
            "SELECT COUNT(*) FROM pest_area_detection",
            "WHERE tenant_id = #{tenantId}",
            "AND YEARWEEK(create_time, 1) = YEARWEEK(CURDATE(), 1)",
            "</script>"
    })
    Integer getThisWeekCount();

}
