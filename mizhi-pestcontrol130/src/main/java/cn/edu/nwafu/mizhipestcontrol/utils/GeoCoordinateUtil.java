package cn.edu.nwafu.mizhipestcontrol.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 经纬度格式化工具（十进制度 <-> 度分秒）
 */
public final class GeoCoordinateUtil {

    private GeoCoordinateUtil() {
    }

    /**
     * 十进制度（纬度）转度分秒，如：34.1234 -> 34°7′24.24″N
     */
    public static String latitudeToDms(Double latitude) {
        return decimalToDms(latitude, true);
    }

    /**
     * 十进制度（经度）转度分秒，如：108.1234 -> 108°7′24.24″E
     */
    public static String longitudeToDms(Double longitude) {
        return decimalToDms(longitude, false);
    }

    /**
     * 十进制度转度分秒格式
     *
     * @param decimalDegrees 十进制度数值
     * @param isLatitude     true=纬度(N/S)，false=经度(E/W)
     * @return 度分秒字符串，输入为空则返回 "-"
     */
    public static String decimalToDms(Double decimalDegrees, boolean isLatitude) {
        if (decimalDegrees == null) {
            return "-";
        }

        double value = decimalDegrees;
        String direction;
        if (isLatitude) {
            direction = value >= 0 ? "N" : "S";
        } else {
            direction = value >= 0 ? "E" : "W";
        }

        double abs = Math.abs(value);
        int degrees = (int) abs;
        double minutesFull = (abs - degrees) * 60.0;
        int minutes = (int) minutesFull;
        double secondsRaw = (minutesFull - minutes) * 60.0;

        // 四舍五入到 2 位小数
        double seconds = BigDecimal.valueOf(secondsRaw)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        // 处理进位：59.999 -> 60.00
        if (seconds >= 60.0) {
            seconds = 0.0;
            minutes += 1;
        }
        if (minutes >= 60) {
            minutes = 0;
            degrees += 1;
        }

        // 统一输出两位小数
        String secondsStr = BigDecimal.valueOf(seconds)
                .setScale(2, RoundingMode.HALF_UP)
                .toPlainString();

        return degrees + "°" + minutes + "′" + secondsStr + "″" + direction;
    }
}
