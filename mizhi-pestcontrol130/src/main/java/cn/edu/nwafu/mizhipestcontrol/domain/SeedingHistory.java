package cn.edu.nwafu.mizhipestcontrol.domain;

import cn.edu.nwafu.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 出苗率检测历史结果表 seeding_history
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("seeding_history")
public class SeedingHistory extends TenantEntity {

	@Serial
	private static final long serialVersionUID = 1L;

	/** 主键ID */
	@TableId(type = IdType.AUTO)
	private Long id;

	/** 检测编号，按业务规则生成 */
	private String detectionCode;

	/** 地块名称（实际地块编号） */
	private String plotName;

	/** 出苗率，百分比 */
	private BigDecimal emergenceRate;

	/** 地块面积(亩) */
	private BigDecimal plotArea;

	/** 苗情等级 */
	private String seedlingLevel;

	/** 经度 */
	private BigDecimal locationLng;

	/** 纬度 */
	private BigDecimal locationLat;

	/** 总体补苗数量 */
	private Integer totalResupply;

	/** 数据时间 */
	private LocalDateTime dataTime;

	/** 归属基地 */
	private String baseName;

	/** 作物类别，默认谷子 */
	private String cropType;

	/** 图像类别 */
	private String imageType;

	/** 图像文件路径 */
	private String imageFile;
}


