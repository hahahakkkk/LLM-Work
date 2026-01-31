package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.edu.nwafu.common.core.domain.R;
import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.satoken.utils.LoginHelper;
import cn.edu.nwafu.mizhipestcontrol.domain.AllStrategy;
import cn.edu.nwafu.mizhipestcontrol.domain.Farmland;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.FarmlandBo;
import cn.edu.nwafu.mizhipestcontrol.domain.dao.FarmlandDao;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.FarmlandVo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.StatisticsDataVO;
import cn.edu.nwafu.mizhipestcontrol.mapper.FarmlandMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IFarmlandService;
import cn.edu.nwafu.mizhipestcontrol.service.ImageMonitorService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.apache.dubbo.common.utils.JsonUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 农田表增删改查Service业务层处理
 *
 * @author WMX
 * @date 2025-04-14
 */
@RequiredArgsConstructor
@Service
public class FarmlandServiceImpl implements IFarmlandService {

    private static final Logger log = LoggerFactory.getLogger(FarmlandServiceImpl.class);
    private final FarmlandMapper baseMapper;
    // 新增注入监控服务
    private final ImageMonitorService imageMonitorService;

    // 1. 数据概览1
    @Override
    public R<StatisticsDataVO> fetchStatistics() {
        // 1.查询区域总数和数量变化
        // 1.1 以farmland_name字段分组，查询近三个月的记录总数，为当前季度的totalAreas
        // 1.2 以farmland_name字段分组，查询过去的四到六共三个月的记录总数，为上个季度的lastTotalAreas
        // 1.3 用totalAreas减掉lastTotalAreas，为totalAreasChange


        // 2. 查询病虫害区域数量
        // 2.1 查询近三个月的内的，以farmland_name字段分组，每一组中相同中version为最大值的记录的pest_types字段，如果该字段不为空，则infectedAreas加1
        // 2.2 查询过去四到六月内的，以farmland_name字段分组，每一组中相同中version为最大值的记录的pest_types字段，如果该字段不为空，则lastInfectedAreas加1
        // 2.3 用totalAreas减掉lastTotalAreas，为totalAreasChange

        return null;
    }

    /**
     * 新增农田表增删改查
     */
    @Override
    public Boolean insertByDao(FarmlandDao dao) {
        String userIdStr = StpUtil.getExtra(LoginHelper.USER_KEY).toString();
        Long userId = Long.parseLong(userIdStr);

        // 1. 查询当前用户同名农田的最大版本号（无记录时返回0）
        Long maxVersion = baseMapper.selectMaxVersion(dao.getFarmlandName(), userId);
        Long newVersion = maxVersion + 1;  // 自动从0开始递增

        // 2. 设置实体属性并插入
        // 2.1 把DAO中的pestTactics转换为JSON字符串
        String pestTacticsJson = JsonUtils.toJson(dao.getPestTactics());

        // 2.2 使用构建器模式创建Farmland实体
        // 生成pest_type字段的值
        // 2. 生成 pestTypes 字段值
        String pestTypes = dao.getPestTactics().stream()
                .filter(tactic -> tactic != null && tactic.getClass() != null) // 空值过滤
                .map(AllStrategy::getClazz) // 获取类名
                .filter(clazz -> clazz != null && !clazz.contains("健康")) // 过滤健康类
                .collect(Collectors.joining(", ")); // 用逗号连接

        Farmland add = new Farmland();
        add.setUserId(userId);
        add.setFarmlandName(dao.getFarmlandName());
        add.setVersion(newVersion);
        add.setPestTypes(pestTypes);
        add.setPestTactics(pestTacticsJson);
        add.setOriginImageUrl(dao.getOriginImageUrl());
        add.setProcessedImageUrl(dao.getProcessedImageUrl());
        // 执行插入前校验
        validEntityBeforeSave(add);

        // 2.3 执行插入操作
        boolean flag = baseMapper.insert(add) > 0;

        // 3. 移除监控地址
        if (flag) {
            List<String> urls = new ArrayList<>();
            urls.add(dao.getOriginImageUrl());
            urls.add(dao.getProcessedImageUrl());
            System.out.println(urls);
            imageMonitorService.confirmSaved(urls);
        }

        return flag;
    }


    /**
     * 查询区域信息
     *
     * @param farmlandId 主键
     * @return 区域信息
     */
    @Override
    public FarmlandVo queryById(Long farmlandId){
        return baseMapper.selectVoById(farmlandId);
    }

    /**
     * 分页查询区域信息列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 区域信息分页列表
     */
    @Override
    public TableDataInfo<FarmlandVo> queryPageList(FarmlandBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<Farmland> lqw = buildQueryWrapper(bo);
        Page<FarmlandVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的区域信息列表
     *
     * @param bo 查询条件
     * @return 区域信息列表
     */
    @Override
    public List<FarmlandVo> queryList(FarmlandBo bo) {
        LambdaQueryWrapper<Farmland> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<Farmland> buildQueryWrapper(FarmlandBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<Farmland> lqw = Wrappers.lambdaQuery();

        lqw.like(StringUtils.isNotBlank(bo.getFarmlandName()), Farmland::getFarmlandName, bo.getFarmlandName());
        lqw.like(StringUtils.isNotBlank(bo.getPestTypes()), Farmland::getPestTypes, bo.getPestTypes());
        return lqw;
    }


    /**
     * 修改区域信息
     *
     * @param bo 区域信息
     * @return 是否修改成功
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateByBo(FarmlandBo bo) {
        // 1. 转换BO为实体
        Farmland update = MapstructUtils.convert(bo, Farmland.class);
        log.info("待更新的记录值"+update);

        // 2. 获取原始记录
        Farmland original = baseMapper.selectById(update.getFarmlandId());
        if (original == null) {
            throw new RuntimeException("记录不存在，更新失败");
        }

        // 3. 校验名称是否变化
        String newName = update.getFarmlandName();
        String oldName = original.getFarmlandName();
        Long userId = original.getUserId();

        // 4. 如果名称发生变化，更新所有同名记录
        if (!newName.equals(oldName)) {
            // 4.1 构建更新条件：相同用户+旧名称
            LambdaQueryWrapper<Farmland> wrapper = Wrappers.lambdaQuery();
            wrapper.eq(Farmland::getFarmlandName, oldName)
                    .eq(Farmland::getUserId, userId);

            // 4.2 创建更新实体
            Farmland nameUpdate = new Farmland();
            nameUpdate.setFarmlandName(newName);

            // 4.3 执行批量更新
            int updateCount = baseMapper.update(nameUpdate, wrapper);
            if (updateCount == 0) {
                throw new RuntimeException("名称更新失败");
            }
        }

        // 5. 执行当前记录更新（此时名称已统一）
        validEntityBeforeSave(update);
        int result = baseMapper.updateById(update);

        // 6. 返回结果
        if (result <= 0) {
            throw new RuntimeException("记录更新失败");
        }
        return true;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(Farmland entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除区域信息信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (CollectionUtils.isEmpty(ids)) {
            return false;
        }
        if (isValid) {
            //TODO 业务校验逻辑
        }
        try {
            // 调用自定义删除方法
            int affectedRows = baseMapper.deleteByIds(ids);
            return affectedRows > 0;
        } catch (Exception e) {
            throw new RuntimeException("批量删除失败", e);
        }
    }
}
