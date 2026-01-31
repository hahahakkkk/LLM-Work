package cn.edu.nwafu.mizhipestcontrol.utils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 根据病害发生率生成防治措施建议。
 */
public class PestAreaMeasureUtil {

    private PestAreaMeasureUtil() {
        // utility class
    }

    /**
     * 基于发病率生成防治措施建议。
     *
     * 返回结构示例：
     * {
     *   "化学防治": ["...", "..."],
     *   "田间管理": ["..."],
     *   "抗药性管理": ["..."],
     *   "传播途径阻断": ["..."]
     * }
     *
     * @param incidence 发病率（百分比数值，例如 20.0 表示 20%）
     * @return 防治措施（按防治方式分组）
     */
    public static Map<String, List<String>> buildMeasure(Double incidence) {
        Map<String, List<String>> measures = new LinkedHashMap<>();
        if (incidence == null) {
            measures.put("提示", List.of("暂无发病率数据，建议尽快补充检测结果后再制定防治方案。"));
            return measures;
        }

        double rate = incidence;
        String level;
        if (rate <= 5) {
            level = "轻度";
        } else if (rate <= 25) {
            level = "中度";
        } else {
            level = "重度";
        }

        // 1) 化学防治
        List<String> chemical = new ArrayList<>();
        if ("轻度".equals(level)) {
            chemical.add("建议采用复配药剂协同施用，推荐亩用标准配方：磷酸二氢钾100g、芸苔素10ml，进行叶面调理。"
                    + "");
            chemical.add("施药时需根据田间实际病情，灵活调整药剂复配方案或采用分次喷施的方式，以确保有效控制病害蔓延。"
                    + "");
        } else if ("中度".equals(level)) {
            chemical.add("建议采用复配药剂协同施用，推荐亩用标准配方（二选一）：甲霜·霜霉威25%可湿性粉剂100g；或戊唑·咪鲜胺45%水乳剂25ml，于病害发生初期均匀喷雾施药。"
                    + "");
            chemical.add("根据田间实际病情，灵活调整药剂复配方案或采用分次喷施的方式，以确保有效控制病害蔓延。"
                    + "");
        } else {
            chemical.add("甲霜灵类药剂长期单一使用易诱导病菌产生抗药性，建议采用复配药剂协同施用。"
                    + "");
            chemical.add("推荐亩用标准配方：甲霜・霜霉威100g、戊唑・咪鲜胺25mL、5%高效氯氟氰菊酯25mL、芸苔素10mL、磷酸二氢钾100g。"
                    + "");
            chemical.add("施药时需根据田间实际病情，灵活调整药剂复配方案或采取分次喷施的方式。"
                    + "");
        }
        measures.put("化学防治", chemical);

        // 2) 田间管理
        List<String> field = new ArrayList<>();
        if ("轻度".equals(level)) {
            field.add("加强田间通风排湿，应及时拔除零星病株，以切断病菌传播途径，提升整体防控效果。"
                    + "");
        } else if ("中度".equals(level)) {
            field.add("应及时拔除零星病株，以切断病菌传播途径，提升整体防控效果。"
                    + "");
        } else {
            field.add("针对病害发生严重的区域，应及时拔除零星病株，以切断病菌传播途径，提升整体防控效果。"
                    + "");
        }
        measures.put("田间管理", field);

        // 3) 抗药性管理
        measures.put("抗药性管理", List.of("注意不同作用机理药剂的轮换使用，延缓抗药性产生。"));

        return measures;
    }
}
