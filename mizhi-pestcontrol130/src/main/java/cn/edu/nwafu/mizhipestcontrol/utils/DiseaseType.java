package cn.edu.nwafu.mizhipestcontrol.utils;

import java.util.HashMap;
import java.util.Map;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.utils
 * @className: DiseaseType
 * @author: ljf
 * @description: 病虫害做映射
 */

public class DiseaseType {
    private static final Map<String, String> CN_MAP = new HashMap<>();
    static {
        CN_MAP.put("BaiFa", "谷子白发病");
        CN_MAP.put("BaiFa_CiTou", "白发病刺头");
        CN_MAP.put("BaiFa_QiangGan", "白发病枪杆");
        CN_MAP.put("BaiFa_Huibei", "白发病灰背");
        CN_MAP.put("BaiFa_ShuiZi", "白发病水渍");

        CN_MAP.put("YeBan", "叶斑病");
        CN_MAP.put("YeBan_YeBan", "叶斑");

        CN_MAP.put("ChongHai", "虫害");

        CN_MAP.put("Funi", "谷子负泥虫");
        CN_MAP.put("Funi_YouChong", "负泥虫幼虫");
        CN_MAP.put("Funi_ZhengZhuang", "负泥虫症状");

        CN_MAP.put("Su_YouChong", "粟灰螟幼虫");
        CN_MAP.put("Su_ChengChong", "粟灰螟成虫");
        CN_MAP.put("Su_zhengzhuang", "粟灰螟症状");
        CN_MAP.put("Su_KuXin", "粟灰螟枯心苗");
    }

    public static String getChinese(String enName) {
        if (enName == null || enName.trim().isEmpty()) {
            return "未知类型";
        }
        return CN_MAP.getOrDefault(enName.trim(), enName); // 未映射则返回原名
    }
}