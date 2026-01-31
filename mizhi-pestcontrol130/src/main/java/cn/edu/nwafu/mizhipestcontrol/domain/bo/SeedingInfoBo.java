package cn.edu.nwafu.mizhipestcontrol.domain.bo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SeedingInfoBo {
	private LocalDateTime dataTime;
	private String baseName;
	private String cropType;
	private String imageCategory;
	private String imageUrl;
}


