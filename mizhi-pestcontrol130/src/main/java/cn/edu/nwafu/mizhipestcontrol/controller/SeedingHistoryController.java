package cn.edu.nwafu.mizhipestcontrol.controller;

import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.log.annotation.Log;
import cn.edu.nwafu.common.log.enums.BusinessType;
import cn.edu.nwafu.common.web.core.BaseController;
import cn.edu.nwafu.mizhipestcontrol.domain.SeedingHistory;
import cn.edu.nwafu.mizhipestcontrol.mapper.SeedingHistoryMapper;
import cn.edu.nwafu.mizhipestcontrol.service.impl.externalApi.SeedingInfoImpl;

import cn.edu.nwafu.mz_external_program_api.vo.SeedingInfo;

import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

/**
 * 出苗率检测历史结果 控制器
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/seeding")
public class SeedingHistoryController extends BaseController {

	private final SeedingHistoryMapper seedingHistoryMapper;
	private final SeedingInfoImpl seedingInfoImpl;

	/** 新增 */
	@Log(title = "出苗率历史", businessType = BusinessType.INSERT)
	@PostMapping
	public R<Void> add(@RequestBody SeedingHistory entity) {
		return toAjax(seedingHistoryMapper.insert(entity));
	}

	/** 修改 */
	@Log(title = "出苗率历史", businessType = BusinessType.UPDATE)
	@PutMapping
	public R<Void> edit(@RequestBody SeedingHistory entity) {
		return toAjax(seedingHistoryMapper.updateById(entity));
	}

	/** 按ID查询 */
	@GetMapping("/{id}")
	public R<SeedingHistory> get(@PathVariable Long id) {
		return R.ok(seedingHistoryMapper.selectById(id));
	}

	/** 条件列表 */
	@GetMapping("/list")
	public R<List<SeedingHistory>> list(SeedingHistory query) {
		return R.ok(seedingHistoryMapper.selectList(query));
	}

	/** 单个删除 */
	@Log(title = "出苗率历史", businessType = BusinessType.DELETE)
	@DeleteMapping("/{id}")
	public R<Void> remove(@PathVariable Long id) {
		return toAjax(seedingHistoryMapper.deleteById(id));
	}

	/** 批量删除 */
	@Log(title = "出苗率历史", businessType = BusinessType.DELETE)
	@DeleteMapping("/batch")
	public R<Void> removeBatch(@RequestBody Collection<Long> ids) {
		return toAjax(seedingHistoryMapper.deleteByIds(ids));
	}


	/** 测试对外接口：苗情数据 */
//	@GetMapping("/external/test")
//	public List<SeedingInfo> testExternal() {
//		return seedingInfoImpl.getSeedingData(Long baseId);
//	}
}


