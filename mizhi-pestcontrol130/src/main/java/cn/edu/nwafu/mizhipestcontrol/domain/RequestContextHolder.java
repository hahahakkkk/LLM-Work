package cn.edu.nwafu.mizhipestcontrol.domain;



public class RequestContextHolder {
    // ThreadLocal 保证每个线程独立
    private static final ThreadLocal<String> originMultiPathThreadLocal = new ThreadLocal<>();
    private static final ThreadLocal<String> originRgbPathThreadLocal = new ThreadLocal<>();
    private static final ThreadLocal<String> resultDirPathThreadLocal = new ThreadLocal<>();

    // 设置 originMultiPath
    public static void setOriginMultiPath(String originMultiPath) {
        originMultiPathThreadLocal.set(originMultiPath);
    }

    // 获取 originMultiPath
    public static String getOriginMultiPath() {
        return originMultiPathThreadLocal.get();
    }

    // 设置 originRgbPath
    public static void setOriginRgbPath(String originRgbPath) {
        originRgbPathThreadLocal.set(originRgbPath);
    }

    // 获取 originRgbPath
    public static String getOriginRgbPath() {
        return originRgbPathThreadLocal.get();
    }

    // 设置 resultDirPath
    public static void setResultDirPath(String resultDirPath) {
        resultDirPathThreadLocal.set(resultDirPath);
    }

    // 获取 resultDirPath
    public static String getResultDirPath() {
        return resultDirPathThreadLocal.get();
    }

    // 清除 ThreadLocal 中的内容
    public static void clear() {
        originMultiPathThreadLocal.remove();
        originRgbPathThreadLocal.remove();
        resultDirPathThreadLocal.remove();
    }
}
