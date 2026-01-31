package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 植株检测记录视图对象
 *
 * 
 * 
 * 用于前台展示
 * 
 * 植株  负泥 1  白发 2
 *  负泥+白发 3
 * 
 * @author Generated
 * @date 2025-12-04
 */
@Data
public class PlantDetectionRecordVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
    /**
     * 基地ID
     */
    private Long baseId;

    /**
     * 地块ID
     */
    private Long plotId;

    /**
     * 地块编号
     */
    private String plotCode;

    /**
     * 病虫害类型（逗号分隔）
     */
    private String diseases;

    /**
     * 病害代码
     * 0: 无
     * 1: 谷子负泥虫
     * 2: 白发病
     * 3: 谷子负泥虫+白发病
     */
    private Integer diseaseCode;
}