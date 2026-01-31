package cn.edu.nwafu.mizhipestcontrol.config;

import com.baomidou.mybatisplus.autoconfigure.ConfigurationCustomizer;
import com.baomidou.mybatisplus.autoconfigure.MybatisPlusPropertiesCustomizer;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("cn.edu.nwafu.**.mapper")
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusPropertiesCustomizer mybatisPlusPropertiesCustomizer() {
        return properties -> properties.setTypeAliasesPackage("cn.edu.nwafu.mizhipestcontrol.domain");
    }

    @Bean
    public ConfigurationCustomizer configurationCustomizer() {
        return configuration -> {
            // 关键配置：开启驼峰命名自动转换
            configuration.setMapUnderscoreToCamelCase(true);
        };
    }

    // 其他配置（如分页插件）...
}