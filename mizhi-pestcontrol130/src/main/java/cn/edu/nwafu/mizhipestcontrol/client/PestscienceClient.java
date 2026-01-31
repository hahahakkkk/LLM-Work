package cn.edu.nwafu.mizhipestcontrol.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


/**
 * 用于服务调用
 */
@FeignClient(name = "mizhi-gateway")  // 目标服务名
public interface PestscienceClient {

    /**
     * 调用接口：/pestscience/classify/getStrategy
     * 注意：
     * 1. 路径必须包含服务配置的上下文路径 `/pestscience`
     * 2. 使用 @RequestParam 明确参数名
     */
    @GetMapping("/pestscience/classify/getStrategy")
    String getStrategy(@RequestParam("pestJson") String pestJson);
}
