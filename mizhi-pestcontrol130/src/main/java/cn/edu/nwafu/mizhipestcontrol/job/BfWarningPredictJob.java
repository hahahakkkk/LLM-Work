package cn.edu.nwafu.mizhipestcontrol.job;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.BfWarningBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.WhiteheadDetectVo;
import cn.edu.nwafu.mizhipestcontrol.service.IBfWarningService;
import cn.edu.nwafu.mizhipestcontrol.service.IIdentifyService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;

import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.BfWarningPredictJob
 * @className: BfWarningPredictJob
 * @author: ljf
 * @description: TODO
 */
@Data
@Slf4j
public class BfWarningPredictJob {
    private final IIdentifyService identifyService;
    private final IBfWarningService bfWarningService;
    @Value("${bf-warning.schedule.enabled:true}")
    private boolean enabled;
    @Value("${bf-warning.schedule.days-offset:1}")
    private int daysOffset;
    @Value("${bf-warning.schedule.zone:Asia/Shanghai}")
    private String zone;

    @Scheduled(
            cron = "${bf-warning.schedule.cron:0 0 3 * * ?}",
            zone = "${bf-warning.schedule.zone:Asia/Shanghai}"
    )
    public void runDailyPredict() {
        if (this.enabled) {
            ZoneId zoneId;
            LocalDate targetDate;
            String dateStr;
            try {
                zoneId = ZoneId.of(this.zone);
                targetDate = LocalDate.now(zoneId).minusDays((long) Math.max(this.daysOffset, 0));
                dateStr = targetDate.toString();
            } catch (Exception e) {
                log.warn("[BfWarning] 定时预测失败：时区/日期计算异常 - zone: {}", this.zone, e);
                return;
            }

            log.info("[BfWarning] 定时预测开始 - date: {}", dateStr);
            try {
                R<WhiteheadDetectVo> resp = this.identifyService.detectWhiteheadLevel(dateStr);
                if (resp != null && resp.getData() != null) {
                    WhiteheadDetectVo vo = resp.getData();
                    Map<String, Object> raw = vo.getRaw();
                    if (raw != null && !raw.isEmpty()) {
                        Object featuresObj = raw.get("features");
                        Object predictionObj = raw.get("prediction");
                        Map<?, ?> features = featuresObj instanceof Map ? (Map<?, ?>) featuresObj : null;
                        Map<?, ?> prediction = predictionObj instanceof Map ? (Map<?, ?>) predictionObj : null;
                        String warningLevel = prediction == null ? null : asString(prediction.get("level"));
                        String recommendation = asString(raw.get("strategy"));
                        BfWarningBo bo = new BfWarningBo();
                        bo.setWarningLevel(warningLevel);
                        bo.setPredictionDate(Date.valueOf(targetDate));
                        bo.setRecommendation(recommendation);
                        if (features != null) {
                            bo.setTMean(asDouble(features.get("T_Mean")));
                            bo.setRhMean(asDouble(features.get("RH_mean")));
                            Double ssdHours = asDouble(features.get("SSD_hours"));
                            Double ssd = ssdHours != null ? ssdHours : asDouble(features.get("SSD"));
                            bo.setSSD(ssd == null ? null : Math.round(ssd));
                            bo.setRF(asDouble(features.get("RF")));
                            bo.setET0(asDouble(features.get("ET0")));
                        }

                        Boolean ok = this.bfWarningService.saveOrUpdateByPredictionDate(bo);
                        if (Boolean.TRUE.equals(ok)) {
                            log.info("[BfWarning] 定时预测入库成功 - date: {}, level: {}", dateStr, warningLevel);
                        } else {
                            log.warn("[BfWarning] 定时预测入库失败 - date: {}, level: {}", dateStr, warningLevel);
                        }

                    } else {
                        log.warn("[BfWarning] 定时预测失败：模型未返回 raw - date: {}", dateStr);
                    }
                } else {
                    log.warn("[BfWarning] 定时预测失败：响应为空 - date: {}", dateStr);
                }
            } catch (Exception e) {
                log.warn("[BfWarning] 定时预测异常 - date: {}", dateStr, e);
            }
        }
    }

    private static String asString(Object value) {
        if (value == null) {
            return null;
        } else {
            String s = String.valueOf(value);
            return StringUtils.isBlank(s) ? null : s;
        }
    }

    private static Double asDouble(Object value) {
        if (value == null) {
            return null;
        } else if (value instanceof Number) {
            Number n = (Number)value;
            return n.doubleValue();
        } else {
            String s = String.valueOf(value);
            if (StringUtils.isBlank(s)) {
                return null;
            } else {
                try {
                    return Double.parseDouble(s);
                } catch (Exception var3) {
                    return null;
                }
            }
        }
    }
}
