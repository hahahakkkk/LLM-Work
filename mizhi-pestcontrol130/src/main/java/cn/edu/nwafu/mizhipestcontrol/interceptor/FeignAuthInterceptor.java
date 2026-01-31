package cn.edu.nwafu.mizhipestcontrol.interceptor;

import cn.dev33.satoken.stp.StpUtil;
import cn.edu.nwafu.common.satoken.utils.LoginHelper;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        String tokenValue = StpUtil.getTokenValue();
        if (tokenValue != null) {
            System.out.println("Token值为:"+tokenValue);
            template.header("Authorization", "Bearer " + tokenValue);
        }

        String clientIdValue = StpUtil.getExtra(LoginHelper.CLIENT_KEY).toString();
        System.out.println("Client值为:"+clientIdValue);
        template.header("clientid", clientIdValue);
    }
}