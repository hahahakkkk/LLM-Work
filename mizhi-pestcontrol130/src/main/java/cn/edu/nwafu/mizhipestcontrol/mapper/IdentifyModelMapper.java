package cn.edu.nwafu.mizhipestcontrol.mapper;

import cn.edu.nwafu.common.mybatis.core.mapper.BaseMapperPlus;
import cn.edu.nwafu.mizhipestcontrol.domain.IdentifyModel;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyModelVo;
import org.apache.ibatis.annotations.Select;

/**
 * 病虫害识别模型Mapper接口
 *
 * @author WMX
 * @date 2025-05-01
 */
public interface IdentifyModelMapper extends BaseMapperPlus<IdentifyModel, IdentifyModelVo> {

    /**
     * 查询默认的病虫害识别模型url
     * @return 默认模型的 model_id（若存在多个默认模型，返回第一个）
     */
    @Select("SELECT model_url FROM pestcontrol_identify_model " +
            "WHERE model_type = '病虫害识别模型' AND is_default = 1 " +
            "LIMIT 1")
    String selectDefaultIdentifyModelUrl();

    /**
     * 查询默认的病害识别模型 的URL
     */
    @Select("SELECT model_url FROM pestcontrol_identify_model " +
            "WHERE model_type = '虫害植株识别模型' AND is_default = 1 " +
            "LIMIT 1")
    String selectDefaultIdentifyPestModelUrl();


    /**
     * 查询默认的虫害识别模型 的URL
     */
    @Select("SELECT model_url FROM pestcontrol_identify_model " +
            "WHERE model_type = '病害植株识别模型' AND is_default = 1 " +
            "LIMIT 1")
    String selectDefaultIdentifyDiseaseModelUrl();

    /**
     * 查询默认的病虫害区域检测模型url
     * @return 默认模型的 model_id（若存在多个默认模型，返回第一个）
     */
    @Select("SELECT model_url FROM pestcontrol_identify_model " +
            "WHERE model_type = '病虫害区域检测模型' AND is_default = 1 " +
            "LIMIT 1")
    String selectDefaultIAreaModelUrl();

    /**
     * 查询默认的最佳播种期检测模型url
     * @return 默认模型的 model_url（若存在多个默认模型，返回第一个）
     */
    @Select("SELECT model_url FROM pestcontrol_identify_model " +
            "WHERE model_type = '播种期模型' AND is_default = 1 " +
            "LIMIT 1")
    String selectDefaultSeedingModelUrl();

    /**
     * 查询默认的白发病等级检测模型url
     */
    @Select("SELECT model_url FROM pestcontrol_identify_model " +
            "WHERE model_type = '白发病等级检测模型' AND is_default = 1 " +
            "LIMIT 1")
    String selectDefaultWhiteheadDetectModelUrl();

}
