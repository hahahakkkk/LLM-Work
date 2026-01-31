package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.mizhipestcontrol.domain.PlantResults;
import cn.edu.nwafu.mizhipestcontrol.domain.PlantResults;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantDetectionRecordVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantResultsVo;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SuHuiMingDetectionVo;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

/**
 * 病虫害植株识别结果Mapper接口
 *
 * @author LJF
 * @date 2025-10-27
 */
@DataPermission( {
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface PlantResultsMapper extends BaseMapperPlus<PlantResults, PlantResultsVo> {
    @Select("SELECT COUNT(*) FROM plant_results ")
    Integer getTotalCount();

    // 获取今日新增（按 create_time）
    @Select({
            "<script>",
            "SELECT COUNT(*) FROM plant_results",
            "WHERE tenant_id = #{tenantId}",
            "AND DATE(create_time) = CURDATE()",
            "</script>"
    })
    Integer getTodayCount();

    // 获取本周新增（周一到周日）
    @Select({
            "<script>",
            "SELECT COUNT(*) FROM plant_results",
            "WHERE tenant_id = #{tenantId}",
            "AND YEARWEEK(create_time, 1) = YEARWEEK(CURDATE(), 1)",
            "</script>"
    })
    Integer getThisWeekCount();

    /**
     *
     * 前台获取病害类型展示数据
     * 白发 只有负泥虫 1  只有白发 2   白发+负泥 3
     */

    List<PlantDetectionRecordVo> getPlantDetectionRecords(@Param("growthStage") Integer growthStage);

    /**
     * 获取粟灰螟检测记录
     *
     * @return 粟灰螟检测记录列表
     */
    List<SuHuiMingDetectionVo> getSuHuiMingDetectionRecords();

}
