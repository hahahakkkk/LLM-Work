package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GuziEmergenceHistoryVo;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 谷子出苗率历史记录Mapper接口
 *
 * @author LJF
 * @date 2025-10-29
 */
@DataPermission( {
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface GuziEmergenceHistoryMapper extends BaseMapperPlus<GuziEmergenceHistory, GuziEmergenceHistoryVo> {
    @Select("SELECT IFNULL(AVG(emergence_rate), 0) FROM guzi_emergence_history")
    Double getAverageEmergenceRate();

    // 今日检测地块数
    @Select("SELECT COUNT(*) FROM guzi_emergence_history WHERE DATE(create_time) = CURDATE()")
    Integer getTodayPlotCount();

    // 异常地块数（低于达标线，比如85%）
    @Select("SELECT COUNT(*) FROM guzi_emergence_history WHERE emergence_rate < #{threshold}")
    Integer getAbnormalPlotCount(Double threshold);

    // 总地块数
    @Select("SELECT COUNT(DISTINCT plot_name) FROM guzi_emergence_history")
    Integer getTotalPlotCount();

    /**
     * 获取出苗数据
     * @param baseId 基地ID（可选）
     * @return
     */
    List<GuziEmergenceHistory> getSeedingData(@Param("baseId") Long baseId);

}
