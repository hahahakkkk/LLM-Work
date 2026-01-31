package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WeatherHistoryResponse;
import cn.edu.nwafu.mizhipestcontrol.service.IWeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/weather")
public class WeatherController {

    private final IWeatherService weatherService;

    /**
     * 获取米脂县气象历史数据，默认坐标来自配置，可通过参数覆盖。
     */
    @GetMapping("/history")
    public R<WeatherHistoryResponse> getHistory(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude
    ) {
        return weatherService.getHistoricalWeather(startDate, endDate, latitude, longitude);
    }
}
