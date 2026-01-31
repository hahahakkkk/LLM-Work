package cn.edu.nwafu.mizhipestcontrol.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "weather")
public class WeatherProperties {

    /**
     * Base URL for the Open-Meteo archive API.
     */
    private String baseUrl;

    /**
     * Default latitude when request does not provide one.
     */
    private double latitude;

    /**
     * Default longitude when request does not provide one.
     */
    private double longitude;

    /**
     * Timezone passed to Open-Meteo.
     */
    private String timezone = "Asia/Shanghai";

    /**
     * Daily metrics requested from Open-Meteo.
     */
    private List<String> daily = new ArrayList<>();
}
