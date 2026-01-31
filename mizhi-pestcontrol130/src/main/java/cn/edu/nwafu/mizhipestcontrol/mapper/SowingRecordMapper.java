package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.mizhipestcontrol.domain.SowingRecord;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.SowingRecordVo;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 基地实际播种日期记录Mapper接口
 *
 * @author LJF
 * @date 2025-11-04
 */
public interface SowingRecordMapper extends BaseMapperPlus<SowingRecord, SowingRecordVo> {

    @Select("SELECT * FROM sowing_record WHERE base_name = #{baseName} LIMIT 1")
    SowingRecordVo selectByBaseName(String baseName);

    @Select("SELECT * FROM sowing_record WHERE base_id = #{baseId} LIMIT 1")
    SowingRecordVo selectByBaseId(Long baseId);

    /**
     * 查询所有基地的最新播种记录（每个基地只返回最新的一条）
     */
    @Select("SELECT sr.* FROM sowing_record sr WHERE sr.id IN (SELECT MAX(id) FROM sowing_record GROUP BY base_id)")
    List<SowingRecordVo> selectLatestByAllBases();

}
