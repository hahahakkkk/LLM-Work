package cn.edu.nwafu.mizhipestcontrol.domain;

import lombok.Data;

import java.io.File;

@Data
public class ModelResult {
    public File originalImage;
    public File processedImage;
    public File levelImage;
    public String pestJson;

    public ModelResult(File originalImage, File processedImage, File levelImage, String pestJson) {
        this.originalImage = originalImage;
        this.processedImage = processedImage;
        this.levelImage = levelImage;
        this.pestJson = pestJson;
    }

    public ModelResult() {

    }

    public File getLevelImage() {
        return levelImage;
    }

    public void setLevelImage(File levelImage) {
        this.levelImage = levelImage;
    }

    public File getOriginalImage() {
        return originalImage;
    }

    public void setOriginalImage(File originalImage) {
        this.originalImage = originalImage;
    }

    public File getProcessedImage() {
        return processedImage;
    }

    public void setProcessedImage(File processedImage) {
        this.processedImage = processedImage;
    }

    public String getPestJson() {
        return pestJson;
    }

    public void setPestJson(String pestJson) {
        this.pestJson = pestJson;
    }
}
