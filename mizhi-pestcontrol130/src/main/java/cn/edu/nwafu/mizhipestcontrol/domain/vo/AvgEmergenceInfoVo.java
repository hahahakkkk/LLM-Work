package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.vo
 * @className: AvgEmergenceInfoVo
 * @author: ljf
 * @description: TODO
 */


//后端前台出苗率信息展示视图对象
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = AvgEmergenceInfoVo.class)
public class AvgEmergenceInfoVo {

//    平均出苗率
    private  Double avgEmergence;

 //   异常地块 数(出苗率小于良好的)
    private  Integer abnormalBlock;

//    今日检测地块
    private  Integer todayDetection;

//    出苗达标率（已检测地块良好以上占所有的比例）
    private  Double emergenceStandard;


//    public Double getQualifiedRate() {
//        if (totalPlotsToday == null || todayDetection == 0) {
//            return 0.0;
//        }
//        return qualifiedPlots * 100.0 / totalPlotsToday;
//    }
}
