package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.dev33.satoken.sign.SaSignUtil;
import cn.edu.nwafu.four.api.RpcRemoteSenseService;
import cn.edu.nwafu.four.api.domain.RpcRemoteSenseBo;
import cn.edu.nwafu.four.api.domain.RpcRemoteSenseVo;
import com.esotericsoftware.minlog.Log;
import org.apache.dubbo.config.annotation.DubboReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/proxy")
public class RemoteSenseProxyController {

    private final String apiBaseUrl = "http://172.25.23.186:8080";

//    private final RestTemplate restTemplate = new RestTemplate();

    @DubboReference
    private RpcRemoteSenseService rpcRemoteSenseService;


//    @GetMapping("/remote-sense/list")
//    public ResponseEntity<?> getRemoteSenseData(
//            @RequestParam(required = false) String baseId,
//            @RequestParam(required = false) String fourId,
//            @RequestParam(required = false) String plotId,
//            @RequestParam(required = false) String beginCollectTime,
//            @RequestParam(required = false) String endCollectTime,
//            @RequestParam(required = false, defaultValue = "1") Integer pageNum,
//            @RequestParam(required = false, defaultValue = "10") Integer pageSize
//    ) {
////        Log.warn("getRemoteSenseData");
//        try {
//            // 1. 构建业务参数Map
////            Map<String, Object> params = new HashMap<>();
////            if (baseId != null) params.put("baseId", baseId);
////            if (fourId != null) params.put("fourId", fourId);
////            if (plotId != null) params.put("plotId", plotId);
////            if (beginCollectTime != null) params.put("params[beginCollectTime]", beginCollectTime);
////            if (endCollectTime != null) params.put("params[endCollectTime]", endCollectTime);
////            params.put("pageNum", pageNum);
////            params.put("pageSize", pageSize);
//
//            RpcRemoteSenseBo BO = new RpcRemoteSenseBo();
////            BO.setParams(params);
//            if (baseId != null)  BO.setBaseId(baseId);
//            if (fourId != null) BO.setFourId(Long.valueOf(fourId));
//            if (plotId != null) BO.setPlotId(Long.valueOf(plotId)); ;
////            if (beginCollectTime != null) BO.setCollectTime(beginCollectTime);
////            if (endCollectTime != null) BO.set(endCollectTime);
////            params.put("pageNum", pageNum);
////            params.put("pageSize", pageSize);
//
//            // 4. 转发请求到目标API
//            List <RpcRemoteSenseVo> response = rpcRemoteSenseService.queryList(BO);
//
//            // 5. 返回目标API的响应
////            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
////            Log.warn("getRemoteSenseData response: " + response);
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("请求转发失败: " + e.getMessage());
//        }
//    }
@GetMapping("/remote-sense/list")
public ResponseEntity<?> getRemoteSenseData(
        @RequestParam(required = false) String baseId,
        @RequestParam(required = false) String fourId,      // ⚠️ 注意：fourId 不再传给 BO
        @RequestParam(required = false) String plotId,
        @RequestParam(required = false) String beginCollectTime,
        @RequestParam(required = false) String endCollectTime,
        @RequestParam(required = false, defaultValue = "1") Integer pageNum,
        @RequestParam(required = false, defaultValue = "10") Integer pageSize
) {
    try {
        RpcRemoteSenseBo bo = new RpcRemoteSenseBo();

        // 设置 RpcRemoteSenseBo 支持的字段（均为 String 或 Long）
        if (baseId != null) {
            bo.setBaseId(baseId);
        }
        if (plotId != null) {
            bo.setPlotId(Long.valueOf(plotId));
        }
        if (beginCollectTime != null) {
            bo.setBeginCollectTime(beginCollectTime); // 注意：字段名是 beginCollectTime
        }
//        if(fourId!=null){
//            bo.setFourId(Long.valueOf(fourId));
//        }
        if (endCollectTime != null) {
            bo.setEndCollectTime(endCollectTime);     // 注意：字段名是 endCollectTime
        }

        // 调用 service，将分页参数单独传入（假设 service 支持）
        List<RpcRemoteSenseVo> response = rpcRemoteSenseService.queryList(bo);

        return ResponseEntity.ok(response);
    } catch (NumberFormatException e) {
        return ResponseEntity.badRequest().body("参数格式错误: " + e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("请求转发失败: " + e.getMessage());
    }
}
}