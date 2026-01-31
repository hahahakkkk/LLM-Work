package cn.edu.nwafu.mizhipestcontrol.utils;

import cn.edu.nwafu.common.oss.core.OssClient;
import cn.edu.nwafu.common.oss.entity.UploadResult;
import cn.edu.nwafu.common.oss.factory.OssFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * author WMX
 * 图像存储工具类，将图像上传至MINIO
 */
public class ImagesStorageUtil {
    private static final Logger log = LoggerFactory.getLogger(ImagesStorageUtil.class);

    /**
     * 上传单个文件到MINIO，获取图像的 URL
     * @param image 需要上传的图像文件
     * @return 上传后的图像 URL
     */
    public static String uploadFile(File image) throws IOException {
        OssClient ossClient = OssFactory.instance();
        String originalFilename = image.getName();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        UploadResult uploadResult = ossClient.uploadSuffix(image, suffix);
        return uploadResult.getUrl();
    }



    /**
     * 删除文件方法
     */
    public static void deleteFiles(List<String> urls) {
        if (urls == null || urls.isEmpty()) return;

        OssClient ossClient = OssFactory.instance();
        urls.forEach(url -> {
            try {
                ossClient.delete(url);
                log.info("Deleted: {}", url);
            } catch (Exception e) {
                log.error("Delete failed: {}", url, e);
            }
        });
    }
}
