package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.config.WeatherProperties;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WeatherHistoryResponse;
import cn.edu.nwafu.mizhipestcontrol.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements IWeatherService {

    private static final List<String> DEFAULT_DAILY = List.of(
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "relative_humidity_2m_min",
        "precipitation_sum"
    );

    private final WeatherProperties weatherProperties;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public R<WeatherHistoryResponse> getHistoricalWeather(LocalDate startDate, LocalDate endDate,
                                                          Double latitude, Double longitude) {
        if (Objects.isNull(startDate) || Objects.isNull(endDate)) {
            return R.fail("开始和结束日期不能为空");
        }
        if (startDate.isAfter(endDate)) {
            return R.fail("开始日期不能晚于结束日期");
        }

        String baseUrl = weatherProperties.getBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            return R.fail("气象接口地址未配置");
        }

        double lat = latitude != null ? latitude : weatherProperties.getLatitude();
        double lon = longitude != null ? longitude : weatherProperties.getLongitude();

        List<String> dailyParams = weatherProperties.getDaily();
        if (dailyParams == null || dailyParams.isEmpty()) {
            dailyParams = DEFAULT_DAILY;
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .queryParam("latitude", lat)
            .queryParam("longitude", lon)
            .queryParam("start_date", startDate)
            .queryParam("end_date", endDate)
            .queryParam("daily", String.join(",", dailyParams))
            .queryParam("timezone", weatherProperties.getTimezone());

        try {
            ResponseEntity<WeatherHistoryResponse> response = restTemplate.exchange(
                builder.build(true).toUri(),
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {
                }
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return R.fail("气象服务调用失败");
            }

            return R.ok(response.getBody());
        } catch (RestClientException ex) {
            return R.fail("气象服务调用异常: " + ex.getMessage());
        }
    }
}
