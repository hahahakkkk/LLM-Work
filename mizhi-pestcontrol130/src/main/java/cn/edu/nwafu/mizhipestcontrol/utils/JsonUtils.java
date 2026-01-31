package cn.edu.nwafu.mizhipestcontrol.utils;

import cn.edu.nwafu.mizhipestcontrol.domain.AllStrategy;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;

public class JsonUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<AllStrategy> parseStrategyList(String json) throws IOException {
        return objectMapper.readValue(json, new TypeReference<List<AllStrategy>>() {});
    }
}