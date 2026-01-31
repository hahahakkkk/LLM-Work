package cn.edu.nwafu.mizhipestcontrol.service;

import cn.edu.nwafu.mizhipestcontrol.component.TempFileStateCache;
import cn.edu.nwafu.mizhipestcontrol.utils.ImagesStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 文件监控
 * 如果图像地址不及时保存到minio中，则会自动删除minio中的图像
 */
@Service
@RequiredArgsConstructor
@Slf4j // 添加Lombok日志注解
public class ImageMonitorService {
    private final RedisTemplate<String, String> redisTemplate;
    private final TempFileStateCache tempFileStateCache;

    // 正确获取配置项（注意占位符格式）
    @Value("${temp.image.expire-seconds:600}")
    private int expireSeconds;

    /**
     * 文件监控方案二
     * 涉及TempFileStateCache类
     */
    /**
     * 添加监控（Redis + 本地缓存）
     */
    public void monitorImages(List<String> imageUrls) {
        imageUrls.forEach(url -> {
            // 记录本地状态
            tempFileStateCache.addFile(url, expireSeconds);
            log.info("监控图像地址: {}, 有效期: {}秒", url, expireSeconds);
        });
    }

    /**
     * 确认保存（移除监控）
     */
    public void confirmSaved(List<String> imageUrls) {
        imageUrls.forEach(url -> {
            // 移除本地状态
            tempFileStateCache.removeFile(url);
            log.info("确认保存图像: {}", url);
        });
    }
    /**
     * 定时清理任务
     */
    @Scheduled(fixedRate = 300_000) // 每5分钟执行一次
    public void cleanupExpiredFiles() {
        log.info("定时清理任务执行......");
        // 清理本地缓存中的过期文件
        List<String> expiredUrls = tempFileStateCache.getExpiredFiles();
        if (!CollectionUtils.isEmpty(expiredUrls)) {
            ImagesStorageUtil.deleteFiles(expiredUrls);
            expiredUrls.forEach(tempFileStateCache::removeFile);
            log.info("兜底清理完成，删除文件数: {}", expiredUrls.size());
        }
    }
}