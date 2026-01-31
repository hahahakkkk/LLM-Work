package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantResultsVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PestAreaDetectionVo;


import java.io.OutputStream;

/*
    created by lijinfu on 2019/5/31
    报告生成接口规范
 */
public interface IPdfReportService {
    // 出苗率检测报告生成接口
//    byte[] generateSeedingReport();

    // 虫情监测报告生成接口
//    byte[] generatePestReport();


    //苗情检测报告生成接口
//    byte[] generateMorphologyReport();
    void generateSeedingReport(GuziEmergenceHistory emergenceHistory, OutputStream outputStream) ;

    //病害区域检测报告


    // 病害区域检查报告
    void generatePestAreaReport(PestAreaDetectionVo  p, OutputStream outputStream) throws Exception;


    // 病虫情植株监测报告生成接口
    void generatePestAreaReport(PlantResultsVo  p, OutputStream outputStream) throws Exception;

}
