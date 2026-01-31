package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.mizhipestcontrol.domain.IdentifyModel;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.IdentifyModelBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.IdentifyModelVo;
import cn.edu.nwafu.mizhipestcontrol.mapper.IdentifyModelMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IIdentifyModelService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 病虫害识别模型Service业务层处理
 *
 * @author WMX
 * @date 2025-05-01
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class IdentifyModelServiceImpl implements IIdentifyModelService {

    private final IdentifyModelMapper baseMapper;

    /**
     * 查询病虫害识别模型
     *
     * @param modelId 主键
     * @return 病虫害识别模型
     */
    @Override
    public IdentifyModelVo queryById(Long modelId){
        return baseMapper.selectVoById(modelId);
    }

    /**
     * 分页查询病虫害识别模型列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 病虫害识别模型分页列表
     */
    @Override
    public TableDataInfo<IdentifyModelVo> queryPageList(IdentifyModelBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<IdentifyModel> lqw = buildQueryWrapper(bo);
        Page<IdentifyModelVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的病虫害识别模型列表
     *
     * @param bo 查询条件
     * @return 病虫害识别模型列表
     */
    @Override
    public List<IdentifyModelVo> queryList(IdentifyModelBo bo) {
        LambdaQueryWrapper<IdentifyModel> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<IdentifyModel> buildQueryWrapper(IdentifyModelBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<IdentifyModel> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(bo.getModelName()), IdentifyModel::getModelName, bo.getModelName());
        lqw.eq(StringUtils.isNotBlank(bo.getModelType()), IdentifyModel::getModelType, bo.getModelType());
        lqw.eq(bo.getIsDefault() != null, IdentifyModel::getIsDefault, bo.getIsDefault());
        lqw.like(StringUtils.isNotBlank(bo.getDescription()), IdentifyModel::getDescription, bo.getDescription());
        return lqw;
    }

    /**
     * 新增病虫害识别模型
     *
     * @param bo 病虫害识别模型
     * @return 是否新增成功
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean insertByBo(IdentifyModelBo bo) {
        // 唯一性校验：模型名称不能重复
        LambdaQueryWrapper<IdentifyModel> nameQuery = Wrappers.lambdaQuery();
        nameQuery.eq(IdentifyModel::getModelName, bo.getModelName());
        if (baseMapper.exists(nameQuery)) {
            throw new RuntimeException("模型名称已存在");
        }

        // 默认模型处理逻辑
        if (bo.getIsDefault() != null && bo.getIsDefault() == 1L) {
            // 检查同类型是否已有默认模型
            LambdaQueryWrapper<IdentifyModel> defaultQuery = Wrappers.lambdaQuery();
            defaultQuery.eq(IdentifyModel::getModelType, bo.getModelType())
                    .eq(IdentifyModel::getIsDefault, 1L);
            IdentifyModel existingDefault = baseMapper.selectOne(defaultQuery);

            if (existingDefault != null) {
                // 原子操作：清除旧默认状态
                UpdateWrapper<IdentifyModel> updateWrapper = new UpdateWrapper<>();
                updateWrapper.set("is_default", 0L)
                        .eq("model_type", bo.getModelType())
                        .eq("is_default", 1L);
                int updated = baseMapper.update(null, updateWrapper);
                log.info("已重置{}个同类型旧默认模型", updated);
            }
        }

        // 模型地址格式校验
        if (!isValidModelUrl(bo.getModelUrl())) {
            throw new RuntimeException("模型访问地址格式不正确");
        }

        IdentifyModel add = MapstructUtils.convert(bo, IdentifyModel.class);
        validEntityBeforeSave(add);
        return baseMapper.insert(add) > 0;
    }

    // 补充模型地址校验方法
    private boolean isValidModelUrl(String url) {
        // 示例校验逻辑，根据实际需求实现
        return url.startsWith("http://") || url.startsWith("https://");
    }

    /**
     * 修改病虫害识别模型
     *
     * @param bo 病虫害识别模型
     * @return 是否修改成功
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public Boolean updateByBo(IdentifyModelBo bo) {
        // 1. 判断传入的isDefault是否为1
        if (bo.getIsDefault() != null && bo.getIsDefault() == 1L) {
            // 获取当前模型信息（确保modelType存在）
            IdentifyModel currentModel = baseMapper.selectById(bo.getModelId());
            if (currentModel == null) {
                throw new RuntimeException("模型不存在");
            }

            // 2. 原子操作：将同类型其他模型的isDefault设为0
            UpdateWrapper<IdentifyModel> updateWrapper = new UpdateWrapper<>();
            updateWrapper
                    .set("is_default", 0L)
                    .eq("model_type", currentModel.getModelType())  // 同类型
                    .ne("model_id", bo.getModelId());               // 排除自身

            int updated = baseMapper.update(null, updateWrapper);
            log.info("已重置 {} 个同类型模型的默认状态", updated);
        }

        // 3. 更新当前模型
        IdentifyModel update = MapstructUtils.convert(bo, IdentifyModel.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(IdentifyModel entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除病虫害识别模型信息
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

    @Override
    public TableDataInfo<IdentifyModelVo> listAreaModel(IdentifyModelBo bo, PageQuery pageQuery) {
        // 构建查询条件：model_type = '病虫害区域检测模型'
        LambdaQueryWrapper<IdentifyModel> lqw = buildQueryWrapper(bo);
        lqw.eq(IdentifyModel::getModelType, "病虫害区域检测模型");
        Page<IdentifyModelVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public TableDataInfo<IdentifyModelVo> listIdentifyModel(IdentifyModelBo bo, PageQuery pageQuery) {
        // 构建查询条件：model_type = '病虫害识别模型'
        LambdaQueryWrapper<IdentifyModel> lqw = buildQueryWrapper(bo);
        lqw.eq(IdentifyModel::getModelType, "病虫害识别模型");
        Page<IdentifyModelVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }
    public TableDataInfo<IdentifyModelVo> getPestModel(IdentifyModelBo bo, PageQuery pageQuery) {
        // 构建查询条件：model_type = '病虫害识别模型'
        LambdaQueryWrapper<IdentifyModel> lqw = buildQueryWrapper(bo);
        lqw.eq(IdentifyModel::getModelType, "虫害植株识别模型");
        Page<IdentifyModelVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }
    public TableDataInfo<IdentifyModelVo> getDieaseModel(IdentifyModelBo bo, PageQuery pageQuery) {
        // 构建查询条件：model_type = '病虫害识别模型'
        LambdaQueryWrapper<IdentifyModel> lqw = buildQueryWrapper(bo);
        lqw.eq(IdentifyModel::getModelType, "病害植株识别模型");
        Page<IdentifyModelVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

}
