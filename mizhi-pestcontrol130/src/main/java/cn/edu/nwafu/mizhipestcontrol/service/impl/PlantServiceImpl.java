package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.satoken.utils.LoginHelper;
import cn.edu.nwafu.mizhipestcontrol.domain.Plant;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.PlantBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.PlantVo;
import cn.edu.nwafu.mizhipestcontrol.mapper.PlantMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IPlantService;
import cn.edu.nwafu.mizhipestcontrol.service.ImageMonitorService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 病虫害植株Service业务层处理
 *
 * @author WMX
 * @date 2025-05-01
 */
@RequiredArgsConstructor
@Service
public class PlantServiceImpl implements IPlantService {

    private final PlantMapper baseMapper;
    private final ImageMonitorService imageMonitorService;

    /**
     * 新增病虫害植株
     *
     * @param bo 病虫害植株
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(PlantBo bo) {
        String userIdStr = StpUtil.getExtra(LoginHelper.USER_KEY).toString();
        Plant add = MapstructUtils.convert(bo, Plant.class);
        add.setUserId(Long.parseLong(userIdStr));
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;

        if (flag){
            // 移除监控地址
            List<String> urls = new ArrayList<>();
            urls.add(bo.getImageUrl());
            imageMonitorService.confirmSaved(urls);
        }

        return flag;
    }

    /**
     * 查询病虫害植株
     *
     * @param id 主键
     * @return 病虫害植株
     */
    @Override
    public PlantVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询病虫害植株列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害植株分页列表
     */
    @Override
    public TableDataInfo<PlantVo> queryPageList(PlantBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<Plant> lqw = buildQueryWrapper(bo);
        Page<PlantVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的病虫害植株列表
     *
     * @param bo 查询条件
     * @return 病虫害植株列表
     */
    @Override
    public List<PlantVo> queryList(PlantBo bo) {
        LambdaQueryWrapper<Plant> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<Plant> buildQueryWrapper(PlantBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<Plant> lqw = Wrappers.lambdaQuery();

        lqw.like(bo.getDetectPointName() != null, Plant::getDetectPointName, bo.getDetectPointName());
        lqw.like(StringUtils.isNotBlank(bo.getPestTypes()), Plant::getPestTypes, bo.getPestTypes());
        return lqw;
    }



    /**
     * 修改病虫害植株
     *
     * @param bo 病虫害植株
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(PlantBo bo) {
        Plant update = MapstructUtils.convert(bo, Plant.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(Plant entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除病虫害植株信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if(isValid){
            //TODO 做一些业务上的校验,判断是否需要校验
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
