package cn.edu.nwafu.mizhipestcontrol.utils;

import java.io.File;

public class DirectoryDeleteUtil {
    public static boolean deleteDirectory(String dirPath) {
        // 处理空路径或null输入
        if (dirPath == null || dirPath.trim().isEmpty()) {
            return false;
        }

        File directory = new File(dirPath);

        // 验证目标是否存在且是目录
        if (!directory.exists() || !directory.isDirectory()) {
            return false;
        }

        // 获取目录内容（处理访问权限异常）
        File[] files;
        try {
            files = directory.listFiles();
        } catch (SecurityException e) {
            return false;
        }

        // 处理无法访问目录内容的情况
        if (files == null) {
            return false;
        }

        // 递归删除子内容
        for (File file : files) {
            try {
                if (file.isDirectory()) {
                    // 递归删除子目录
                    if (!deleteDirectory(file.getAbsolutePath())) {
                        return false;
                    }
                } else {
                    // 删除文件（处理删除失败和权限异常）
                    if (!file.delete()) {
                        return false;
                    }
                }
            } catch (SecurityException e) {
                return false;
            }
        }

        // 删除空目录（处理最终删除操作）
        try {
            return directory.delete();
        } catch (SecurityException e) {
            return false;
        }
    }
}
