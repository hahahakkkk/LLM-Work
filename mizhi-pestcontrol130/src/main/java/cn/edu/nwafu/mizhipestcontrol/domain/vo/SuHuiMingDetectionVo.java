package cn.edu.nwafu.mizhipestcontrol.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 粟灰螟检测记录视图对象
 *
 * @author Generated
 * @date 2025-12-04
 */
@Data
public class SuHuiMingDetectionVo implements Serializable {

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
}