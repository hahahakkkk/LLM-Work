package cn.edu.nwafu.mizhipestcontrol;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableDubbo
@SpringBootApplication
@MapperScan("cn.edu.nwafu.mizhipestcontrol.mapper")
@EnableDiscoveryClient
@EnableFeignClients  // 启用 Feign
@EnableScheduling    // 能启用定时任务
public class MizhiPestcontrolApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(MizhiPestcontrolApplication.class);
        application.setApplicationStartup(new BufferingApplicationStartup(2048));
        application.run(args);
        System.out.println("(♥◠‿◠)ﾉﾞ  病虫害识别服务启动成功   ლ(´ڡ`ლ)ﾞ  ");
    }

}
