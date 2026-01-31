package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @package: cn.edu.nwafu.mizhipestcontrol.domain.bo
 * @className: AreaDetectRequestBo
 * @author: ljf
 * @description: TODO
 */


// 病害区域检测 请求 flask类

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AreaDetectRequestBo {
    @JsonProperty("base_name")
    @JsonAlias({"baseName", "base_name"})
    private String baseName;

    @JsonProperty("plot_name")
    @JsonAlias({"plotName", "plot_name"})
    private String plotName;


    @NotBlank(message = "RGB image URL is required")
    @JsonProperty("rgb_url")
    @JsonAlias({"rgbUrl", "rgb_url"})
    private String rgbUrl;

    @NotBlank(message = "TIF image URL is required")
    @JsonProperty("tif_url")
    @JsonAlias({"tifUrl", "tif_url"})
    private String tifUrl;

    @NotBlank(message = "Model URL is required")
    @JsonProperty("model_url")
    @JsonAlias({"modelUrl", "model_url"})
    private String modelUrl;
}

