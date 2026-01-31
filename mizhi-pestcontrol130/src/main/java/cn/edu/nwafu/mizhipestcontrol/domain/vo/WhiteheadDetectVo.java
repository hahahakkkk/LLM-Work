package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

import java.util.Map;

@Data
public class WhiteheadDetectVo {
    private Integer code;
    private String msg;
    private boolean ok;
    private Input input;
    private Features features;
    private Prediction prediction;
    /**
     * 兼容旧实现：保留模型原始返回内容（BfWarningPredictJob 中仍在使用 getRaw()）。
     */
    private Map<String, Object> raw;

    @Data
    public static class Input {
        private String date;
        private boolean includeTargetDay;
        private double latitude;
        private double longitude;
    }

    @Data
    public static class Features {
        private double tMeanAvg7;
        private double rhMeanAvg7;
        private double rainSum7;
        private String windowStart;
        private String windowEnd;
    }

    @Data
    public static class Prediction {
        private int level;
        private Map<String, Double> probabilities;
        private Map<String, String> labelMap;
    }
}
