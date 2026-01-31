package cn.edu.nwafu.mizhipestcontrol.component;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 文件监控方案二
 * 临时文件状态记录（内存存储）
 */
@Component
public class TempFileStateCache {
    // 记录文件URL和过期时间（内存缓存）
    private final Map<String, Long> fileExpireMap = new ConcurrentHashMap<>();

    public void addFile(String url, long expireSeconds) {
        long expireTime = System.currentTimeMillis() + expireSeconds * 1000;
        fileExpireMap.put(url, expireTime);
    }

    public void removeFile(String url) {
        fileExpireMap.remove(url);
    }

    public List<String> getExpiredFiles() {
        long now = System.currentTimeMillis();
        return fileExpireMap.entrySet().stream()
                .filter(entry -> entry.getValue() <= now)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}