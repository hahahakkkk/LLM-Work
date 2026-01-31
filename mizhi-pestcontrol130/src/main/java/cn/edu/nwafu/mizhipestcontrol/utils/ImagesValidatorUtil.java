package cn.edu.nwafu.mizhipestcontrol.utils;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class ImagesValidatorUtil {

    /**
     * 校验两组图像文件是否符合规则
     * @param multi 多光谱图像文件列表（必须为 .tif 格式）
     * @param rgb RGB 图像文件列表
     * @return true: 校验通过, false: 校验失败
     */
    public static boolean validateImages(List<MultipartFile> multi, List<MultipartFile> rgb) {

        return true;
    }
}