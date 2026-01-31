package cn.edu.nwafu.mizhipestcontrol.service.impl;

import cn.edu.nwafu.common.core.utils.MapstructUtils;
import cn.edu.nwafu.common.core.utils.StringUtils;
import cn.edu.nwafu.common.mybatis.core.page.TableDataInfo;
import cn.edu.nwafu.common.mybatis.core.page.PageQuery;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.AvgEmergenceInfoVo;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import cn.edu.nwafu.mizhipestcontrol.domain.bo.GuziEmergenceHistoryBo;
import cn.edu.nwafu.mizhipestcontrol.domain.vo.GuziEmergenceHistoryVo;
import cn.edu.nwafu.mizhipestcontrol.domain.GuziEmergenceHistory;
import cn.edu.nwafu.mizhipestcontrol.mapper.GuziEmergenceHistoryMapper;
import cn.edu.nwafu.mizhipestcontrol.service.IGuziEmergenceHistoryService;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.text.DecimalFormat;
import java.util.*;

/**
 * 谷子出苗率历史记录Service业务层处理
 *
 * @author LJF
 * @date 2025-10-29
 */
@RequiredArgsConstructor
@Service
public class GuziEmergenceHistoryServiceImpl implements IGuziEmergenceHistoryService {

    private static final NavigableMap<Double, String> EMERATE_MAP_int = new TreeMap<>();
    static {
        EMERATE_MAP_int.put(0.0, "3");
        EMERATE_MAP_int.put(50.0, "2");
        EMERATE_MAP_int.put(65.0, "1");
        EMERATE_MAP_int.put(80.0, "0");
    }
    public static String GetEmrateLevel(Double rate) {
        if (rate == null) return "未知";
        // 找到小于等于 rate 的最大 key 对应的等级
        Map.Entry<Double, String> entry = EMERATE_MAP_int.floorEntry(rate);
        return entry != null ? entry.getValue() : "未知";
    }

    private final GuziEmergenceHistoryMapper baseMapper;
    private final IPdfReportServiceImpl pdfReportService;

    /**
     * 查询谷子出苗率历史记录
     *
     * @param id 主键
     * @return 谷子出苗率历史记录
     */
    @Override
    public GuziEmergenceHistoryVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询谷子出苗率历史记录列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 谷子出苗率历史记录分页列表
     */
    @Override
    public TableDataInfo<GuziEmergenceHistoryVo> queryPageList(GuziEmergenceHistoryBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<GuziEmergenceHistory> lqw = buildQueryWrapper(bo);
        Page<GuziEmergenceHistoryVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的谷子出苗率历史记录列表
     *
     * @param bo 查询条件
     * @return 谷子出苗率历史记录列表
     */
    @Override
    public List<GuziEmergenceHistoryVo> queryList(GuziEmergenceHistoryBo bo) {
        LambdaQueryWrapper<GuziEmergenceHistory> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    private LambdaQueryWrapper<GuziEmergenceHistory> buildQueryWrapper(GuziEmergenceHistoryBo bo) {
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<GuziEmergenceHistory> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getId() != null, GuziEmergenceHistory::getId, bo.getId());
        lqw.like(StringUtils.isNotBlank(bo.getBaseName()), GuziEmergenceHistory::getBaseName, bo.getBaseName());
        lqw.eq(StringUtils.isNotBlank(bo.getInspectorUser()), GuziEmergenceHistory::getInspectorUser, bo.getInspectorUser());
        lqw.like(StringUtils.isNotBlank(bo.getPlotName()), GuziEmergenceHistory::getPlotName, bo.getPlotName());
        lqw.eq(bo.getLongitude() != null, GuziEmergenceHistory::getLongitude, bo.getLongitude());
        lqw.eq(bo.getLatitude() != null, GuziEmergenceHistory::getLatitude, bo.getLatitude());
        lqw.eq(bo.getEmergenceRate() != null, GuziEmergenceHistory::getEmergenceRate, bo.getEmergenceRate());
        lqw.eq(bo.getTotalSeedlings() != null, GuziEmergenceHistory::getTotalSeedlings, bo.getTotalSeedlings());
        lqw.eq(bo.getPlotArea() != null, GuziEmergenceHistory::getPlotArea, bo.getPlotArea());
        lqw.eq(bo.getSeedlingDensity() != null, GuziEmergenceHistory::getSeedlingDensity, bo.getSeedlingDensity());
        lqw.eq(StringUtils.isNotBlank(bo.getOriginImage()), GuziEmergenceHistory::getOriginImage, bo.getOriginImage());
        lqw.eq(StringUtils.isNotBlank(bo.getResultImage()), GuziEmergenceHistory::getResultImage, bo.getResultImage());
        lqw.eq(bo.getCreateTime() != null, GuziEmergenceHistory::getCreateTime, bo.getCreateTime());
        lqw.eq(bo.getBaseId() != null, GuziEmergenceHistory::getBaseId, bo.getBaseId());
        lqw.eq(bo.getPlotId() != null, GuziEmergenceHistory::getPlotId, bo.getPlotId());
        return lqw;
    }

    /**
     * 新增谷子出苗率历史记录
     *
     * @param bo 谷子出苗率历史记录
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(GuziEmergenceHistoryBo bo) {
        GuziEmergenceHistory add = MapstructUtils.convert(bo, GuziEmergenceHistory.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    /**
     * 修改谷子出苗率历史记录
     *
     * @param bo 谷子出苗率历史记录
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(GuziEmergenceHistoryBo bo) {
        GuziEmergenceHistory update = MapstructUtils.convert(bo, GuziEmergenceHistory.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(GuziEmergenceHistory entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除谷子出苗率历史记录信息
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


    //大屏获取出苗显示信息
    @Override
    public AvgEmergenceInfoVo getAvgEmergenceInfo() {
        AvgEmergenceInfoVo vo = new AvgEmergenceInfoVo();

        Double avg = baseMapper.getAverageEmergenceRate();
        Integer todayCount = baseMapper.getTodayPlotCount();
        Integer abnormalCount = baseMapper.getAbnormalPlotCount(80.0);
        Integer totalCount = baseMapper.getTotalPlotCount();

        double qualifiedRate = 0.0;
        if (totalCount != null && totalCount > 0) {
            DecimalFormat df = new DecimalFormat("#0.0");
            qualifiedRate = ((double)(totalCount - abnormalCount) / totalCount) * 100.0;
            qualifiedRate = Double.parseDouble(df.format(qualifiedRate));
        }


        if (avg != null) {
            DecimalFormat df = new DecimalFormat("#0.0");
            avg = Double.valueOf(df.format(avg));
        }
        vo.setAvgEmergence(avg);
        vo.setTodayDetection(todayCount);
        vo.setAbnormalBlock(abnormalCount);
        vo.setEmergenceStandard(qualifiedRate);

        return vo;
    }

//    @Override
//    public byte[] generateSeedingReportById(Long id, OutputStream outputStream){
//        GuziEmergenceHistory emergenceHistory = baseMapper.selectById(id);
//        if (emergenceHistory == null) {
//            throw new RuntimeException("未找到该记录");
//        }else {
//            return pdfReportService.generateSeedingReport(emergenceHistory, outputStream);
//        }
//    }
    @Override
    public void generateSeedingReportById(Long id, OutputStream outputStream) {
        GuziEmergenceHistory emergenceHistory = baseMapper.selectById(id);
        if (emergenceHistory == null) {
            throw new RuntimeException("未找到该记录");
        }

        // 直接写入 outputStream，不返回 byte[]
        pdfReportService.generateSeedingReport(emergenceHistory, outputStream);
    }

//    @Override
//    public byte[] generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory) {
//        return new byte[0];
//    }
    @Override
    public byte[] generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] var3;
            try {
                this.generateSeedingReportDirectly(emergenceHistory, baos);
                var3 = baos.toByteArray();
            } catch (Throwable var6) {
                try {
                    baos.close();
                } catch (Throwable var5) {
                    var6.addSuppressed(var5);
                }

                throw var6;
            }

            baos.close();
            return var3;
        } catch (Exception var7) {
            Exception e = var7;
            throw new RuntimeException("报告生成失败", e);
        }
    }

    @Override
    public void generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory, OutputStream outputStream) {
        if (emergenceHistory == null) {
            throw new IllegalArgumentException("emergenceHistory 不能为空");
        } else if (outputStream == null) {
            throw new IllegalArgumentException("outputStream 不能为空");
        } else {
            this.pdfReportService.generateSeedingReport(emergenceHistory, outputStream);
        }
    }
//    @Override
////    public byte[] generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory){
//public void generateSeedingReportDirectly(GuziEmergenceHistory emergenceHistory,OutputStream outputStream){
//        return pdfReportService.generateSeedingReport(emergenceHistory,outputStream);
//    }

    @Override
     public List<GuziEmergenceHistory> queryGuziEmergenceHistoryList(GuziEmergenceHistoryBo bo){
        return baseMapper.selectList(buildQueryWrapper(bo));
    }


}
