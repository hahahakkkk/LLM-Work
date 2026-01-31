package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import lombok.Data;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.bo
 * @className: PestAreaDetectResultBo
 * @author: ljf
 * @description: TODO
 */
@Data
public class PestAreaDetectResultBo {
    private String resultImgUrl ;
    private  Double incidence ;//病害发生率
}
