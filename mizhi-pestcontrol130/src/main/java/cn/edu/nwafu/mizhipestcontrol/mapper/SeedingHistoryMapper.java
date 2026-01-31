package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.annotation.DataColumn;
import cn.edu.nwafu.common.mybatis.annotation.DataPermission;
import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import cn.edu.nwafu.mizhipestcontrol.domain.SeedingHistory;
import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import org.apache.ibatis.annotations.Param;

import java.util.Collection;
import java.util.List;

/**
 * 出苗率检测历史结果 Mapper 接口
 */
@DataPermission({
        @DataColumn(key = "deptName", value = "create_dept"),
        @DataColumn(key = "userName", value = "create_by")
})
public interface SeedingHistoryMapper extends BaseMapperPlus<SeedingHistory, SeedingHistory> {

	SeedingHistory selectById(@Param("id") Long id);

	/** 条件查询列表 */
	List<SeedingHistory> selectList(@Param("entity") SeedingHistory entity);

	/** 苗情对外接口数据查询 */
	@InterceptorIgnore(tenantLine = "true")
	List<cn.edu.nwafu.mizhipestcontrol.domain.bo.SeedingInfoBo> selectSeedingInfoList();

	/** 新增 */
	int insert(SeedingHistory entity);

	/** 按主键更新（动态） */
	int updateById(SeedingHistory entity);

	/** 按主键删除 */
	int deleteById(@Param("id") Long id);

	int deleteByIds(@Param("ids") Collection<?> ids);
}


