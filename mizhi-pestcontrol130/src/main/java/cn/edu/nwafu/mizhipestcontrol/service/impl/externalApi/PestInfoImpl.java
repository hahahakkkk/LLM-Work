package cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi;

import cn.edu.nwafu.mizhipestcontrol.domain.bo.FarmlandInfoBo;
import cn.edu.nwafu.mizhipestcontrol.mapper.FarmlandMapper;
import cn.edu.nwafu.mz_external_program_api.api.MzPestApi;

import cn.edu.nwafu.mz_external_program_api.vo.PestInfo;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi
 * @className: PestInfoImpl
 * @author: ljf
 * @description: 对出现病虫害的地块表进行查询，供外部数据接口使用
 */
//@RequiredArgsConstructor
@DubboService
@Service
public class PestInfoImpl implements MzPestApi {

    @Autowired
    private  FarmlandMapper farmlandMapper;

    @Override
    public List<PestInfo> getPestData() {
        List<FarmlandInfoBo> farmlandInfoBos = new ArrayList<>();
        farmlandInfoBos = farmlandMapper.selectFarmlandInfoList();
        // 拿到所有的地块bo 数据 转换为为pestInfo vo 返回
        if (farmlandInfoBos == null) return Collections.emptyList();

        return farmlandInfoBos.stream().map(bo -> {
            PestInfo pestInfo = new PestInfo();

            pestInfo.setDataTime(bo.getLandUpdateTime());
            pestInfo.setBaseName(bo.getFarmlandName());
            pestInfo.setGrowthStage("未知"); // 若无对应字段，可设默认值或从其他服务获取
            pestInfo.setPestOccurrence(bo.getPestTypes());
            pestInfo.setSpatialTemporalDistribution(bo.getProcessedImageUrl());
            return pestInfo;
        }).collect(Collectors.toList());

    }
}
