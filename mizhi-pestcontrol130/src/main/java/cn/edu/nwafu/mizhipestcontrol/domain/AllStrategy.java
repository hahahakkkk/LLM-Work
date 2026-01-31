package cn.edu.nwafu.mizhipestcontrol.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AllStrategy {
    @JsonProperty("class")  // 映射 JSON 中的 "class" 字段
    private String clazz;

    @JsonProperty("average_occurrence_rate")
    private double occurrenceRate;

    private Object strategy;  // 可以是 String 或嵌套对象
}
