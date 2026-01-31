package cn.edu.nwafu.mizhipestcontrol.mapper;

import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Mapper;
import com.baomidou.mybatisplus.annotation.InterceptorIgnore;

/**
 * 作物品种信息查询（忽略租户与数据权限拦截）
 */
@Mapper
public interface CropVarietyMapper {

    @InterceptorIgnore(tenantLine = "true", dataPermission = "true")
    @Select("SELECT grain_color_info, growth_form_info FROM crop_variety WHERE name = #{name} LIMIT 1")
    CropVarietyInfo selectInfoByName(String name);

    class CropVarietyInfo {
        public String grainColorInfo;
        public String growthFormInfo;
    }
}
