package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WeatherHistoryResponse;

import java.time.LocalDate;

public interface IWeatherService {

    /**
     * Fetch historical weather data from Open-Meteo archive.
     *
     * @param startDate inclusive start date
     * @param endDate   inclusive end date
     * @param latitude  optional latitude override; defaults to properties when null
     * @param longitude optional longitude override; defaults to properties when null
     * @return wrapped weather response
     */
    R<WeatherHistoryResponse> getHistoricalWeather(LocalDate startDate, LocalDate endDate,
                                                   Double latitude, Double longitude);
}
