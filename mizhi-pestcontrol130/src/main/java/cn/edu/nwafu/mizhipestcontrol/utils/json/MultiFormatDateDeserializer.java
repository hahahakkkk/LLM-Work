package cn.edu.nwafu.mizhipestcontrol.utils.json;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.utils.json
 * @className: MultiFormatDateDeserializer
 * @author: ljf
 * @description: TODO
 */

public class MultiFormatDateDeserializer extends JsonDeserializer<Date> {
    private static final DateTimeFormatter[] LOCAL_DATE_TIME_FORMATTERS = new DateTimeFormatter[]{DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"), DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"), DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS")};
    private static final DateTimeFormatter[] LOCAL_DATE_FORMATTERS;

    public MultiFormatDateDeserializer() {
    }

    public Date deserialize(JsonParser parser, DeserializationContext ctxt) throws IOException {
        JsonToken token = parser.currentToken();
        if (token == JsonToken.VALUE_NULL) {
            return null;
        } else if (token == JsonToken.VALUE_NUMBER_INT) {
            long epochMillis = parser.getLongValue();
            return new Date(epochMillis);
        } else if (token != JsonToken.VALUE_STRING) {
            return (Date)ctxt.handleUnexpectedToken(Date.class, parser);
        } else {
            String raw = parser.getValueAsString();
            if (raw == null) {
                return null;
            } else {
                String value = raw.trim();
                if (value.isEmpty()) {
                    return null;
                } else {
                    try {
                        Instant instant = Instant.parse(value);
                        return Date.from(instant);
                    } catch (DateTimeParseException var15) {
                        try {
                            OffsetDateTime odt = OffsetDateTime.parse(value, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                            return Date.from(odt.toInstant());
                        } catch (DateTimeParseException var14) {
                            ZoneId zone = ZoneId.systemDefault();
                            DateTimeFormatter[] var7 = LOCAL_DATE_TIME_FORMATTERS;
                            int var8 = var7.length;
                            int var9 = 0;

                            DateTimeFormatter formatter;
                            while(var9 < var8) {
                                formatter = var7[var9];

                                try {
                                    LocalDateTime ldt = LocalDateTime.parse(value, formatter);
                                    return Date.from(ldt.atZone(zone).toInstant());
                                } catch (DateTimeParseException var13) {
                                    ++var9;
                                }
                            }

                            var7 = LOCAL_DATE_FORMATTERS;
                            var8 = var7.length;
                            var9 = 0;

                            while(var9 < var8) {
                                formatter = var7[var9];

                                try {
                                    LocalDate ld = LocalDate.parse(value, formatter);
                                    return Date.from(ld.atStartOfDay(zone).toInstant());
                                } catch (DateTimeParseException var12) {
                                    ++var9;
                                }
                            }

                            return (Date)ctxt.handleWeirdStringValue(Date.class, value, "无法解析日期格式", new Object[0]);
                        }
                    }
                }
            }
        }
    }

    static {
        LOCAL_DATE_FORMATTERS = new DateTimeFormatter[]{DateTimeFormatter.ISO_LOCAL_DATE, DateTimeFormatter.ofPattern("yyyy/MM/dd")};
    }
}