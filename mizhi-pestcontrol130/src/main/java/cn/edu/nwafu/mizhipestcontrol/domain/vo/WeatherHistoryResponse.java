package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherHistoryResponse {

    private double latitude;
    private double longitude;
    private double elevation;

    @JsonProperty("generationtime_ms")
    private double generationTimeMs;

    @JsonProperty("utc_offset_seconds")
    private int utcOffsetSeconds;

    private String timezone;

    @JsonProperty("timezone_abbreviation")
    private String timezoneAbbreviation;

    @JsonProperty("daily_units")
    private DailyUnits dailyUnits;

    private Daily daily;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DailyUnits {
        private String time;

        @JsonProperty("temperature_2m_max")
        private String temperature2mMax;

        @JsonProperty("temperature_2m_min")
        private String temperature2mMin;

        @JsonProperty("temperature_2m_mean")
        private String temperature2mMean;

        @JsonProperty("relative_humidity_2m_mean")
        private String relativeHumidity2mMean;

        @JsonProperty("relative_humidity_2m_min")
        private String relativeHumidity2mMin;

        @JsonProperty("precipitation_sum")
        private String precipitationSum;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Daily {
        private List<String> time;

        @JsonProperty("temperature_2m_max")
        private List<Double> temperature2mMax;

        @JsonProperty("temperature_2m_min")
        private List<Double> temperature2mMin;

        @JsonProperty("temperature_2m_mean")
        private List<Double> temperature2mMean;

        @JsonProperty("relative_humidity_2m_mean")
        private List<Double> relativeHumidity2mMean;

        @JsonProperty("relative_humidity_2m_min")
        private List<Double> relativeHumidity2mMin;

        @JsonProperty("precipitation_sum")
        private List<Double> precipitationSum;
    }
}
