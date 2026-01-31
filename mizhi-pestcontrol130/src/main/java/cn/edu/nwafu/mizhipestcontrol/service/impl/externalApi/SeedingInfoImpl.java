package cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi;

import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.mapper.GuziEmergenceHistoryMapper;
import cn.edu.nwafu.mz_external_program_api.api.MzSeedingApi;
import cn.edu.nwafu.mz_external_program_api.vo.SeedingInfo;

import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NavigableMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi
 * @className: SeedingInfoImpl
 * @author: ljf
 * @description:
 */

@DubboService
@Service
public class SeedingInfoImpl implements MzSeedingApi {

    @Autowired
    private GuziEmergenceHistoryMapper guziEmergenceHistoryMapper;

    private static final NavigableMap<Double, String> EMERATE_LEVEL_MAP = new TreeMap<>();
    static {
        EMERATE_LEVEL_MAP.put(0.0, "高度缺苗");
        EMERATE_LEVEL_MAP.put(50.0, "中度缺苗");
        EMERATE_LEVEL_MAP.put(65.0, "低度缺苗");
        EMERATE_LEVEL_MAP.put(80.0, "正常");
    }

    @Override
    public List<SeedingInfo> getSeedingData(Long baseId) {
        // 查询数据库中的出苗历史记录
        List<GuziEmergenceHistory> emergenceHistories = guziEmergenceHistoryMapper.getSeedingData(baseId);

        // 转换为外部API的VO对象
        return emergenceHistories.stream().map(history -> {
            SeedingInfo seedingInfo = new SeedingInfo();
            seedingInfo.setBaseName(history.getBaseName());
            seedingInfo.setPlotName(history.getPlotName());
            seedingInfo.setBaseId(history.getBaseId());
            seedingInfo.setPlotId(history.getPlotId());
            seedingInfo.setEmergenceRate(history.getEmergenceRate());
            
            if (history.getEmergenceRate() != null) {
                seedingInfo.setEmergenceGrade(EMERATE_LEVEL_MAP.floorEntry(history.getEmergenceRate()).getValue());
            }

            seedingInfo.setTotalSeedlings(history.getTotalSeedlings());
            seedingInfo.setCreateTime(history.getCreateTime());
            return seedingInfo;
        }).collect(Collectors.toList());
    }
}
