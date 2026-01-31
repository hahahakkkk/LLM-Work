package cn.edu.nwafu.mizhipestcontrol.utils;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;


//对数值类型显示为四位小数
public class FourDecimalSerializer extends JsonSerializer<Double> {
    @Override
    public void serialize(Double value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value == null) {
            gen.writeNull();
            return;
        }
        BigDecimal scaled = BigDecimal.valueOf(value).setScale(4, RoundingMode.HALF_UP);
        gen.writeNumber(scaled);
    }
}
