package cn.edu.nwafu.mizhipestcontrol.utils;

import java.text.DecimalFormat;
import java.util.Objects;

/**
 * 根据病害发生率生成检测结论。
 */
public class PestAreaConclusionUtil {

    private static final DecimalFormat RATE_FORMAT = new DecimalFormat("0.0");

    private PestAreaConclusionUtil() {
        // utility class
    }

    /**
     * 构建检测结论文案。
     *
     * @param incidence 病害发生率（百分比数值，例如 20.0 表示 20%）
     * @return 结论描述
     */
    public static String buildConclusion(Double incidence) {
        if (incidence == null) {
            return "暂无发病率数据，无法生成检测结论，建议重新检测或检查任务结果。";
        }

        double rate = incidence;
        String rateText = RATE_FORMAT.format(rate) + "%";

        String level;
        String threshold;
        String suggestion;

        if (rate <= 5) {
            level = "轻度";
            threshold = "<= 5%";
            suggestion = "当前病害发生率较低，建议继续监测，保持通风透光和田间卫生，避免条件恶化。";
        } else if (rate <= 25) {
            level = "中度";
            threshold = "5% ~ 25%";
            suggestion = "已达到中度病害水平，建议及时开展局部防治（如定点喷药），并加强水肥与通风管理。";
        } else {
            level = "重度";
            threshold = "> 25%";
            suggestion = "病害发生较为严重，已超过防治阈值，需立即采取综合防治：优先化学防治控制蔓延，同时加强田间管理，防止向健康区域扩散。";
        }

        return String.format("本次检测发现病害发生率为 %s，属于%s病害等级（%s）。%s", rateText, level, threshold, suggestion);
    }
}
