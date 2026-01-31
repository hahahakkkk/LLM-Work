// ================= 业务实体类型 =================
export interface TraceInfo {
  traceCode: string;
  plantingBo: PlantingBo;
  fertilizationBoList: FertilizationBo[];
  pesticideBoList: PesticideBo[];
  irrigationBoList: IrrigationBo[];
  agriculturalActivities: AgriculturalActivityVo[];
  harvestBo: HarvestBo;
}

// ================ 各子模块类型定义 ================
// 种植信息
export interface PlantingBo {
  traceCode: string;
  seedInfo: string;
  plotInfo: string;
  sowingTime: string;
  operator: string;
}

// 施肥信息
export interface FertilizationBo {
  id: string;
  traceCode: string;
  plotInfo: string;
  fertilizerName: string;
  fertilizationTime: string;
  fertilizerDosage: string;
  fertilizationMethod: string;
  operator: string;
}

// 农药信息
export interface PesticideBo {
  id: string;
  traceCode: string;
  plotInfo: string;
  pesticideName: string;
  pesticideTime: string;
  pesticideDosage: string;
  operator: string;
}

// 灌溉信息
export interface IrrigationBo {
  id: string;
  traceCode: string;
  plotInfo: string;
  irrigationMethod: string;
  irrigationDate: string;
  operator: string;
}

// 收获信息
export interface HarvestBo {
  traceCode: string;
  plotInfo: string;
  harvestTime: string;
  operator: string;
}

// 农事活动
export interface AgriculturalActivityVo {
  id: string | null;
  traceCode: string;
  name: string;
  activityType: 'fertilizer' | 'pesticide' | 'irrigation';
  time: string;
  remark: string | null;
  operator: string;
}

// ================= 前后端交互类型 =================
export interface TraceabilityInfoForm extends BaseEntity {
  traceabilityInfoId?: string | number;
  traceCode?: string;
  // 其他表单字段根据实际需求补充
}

export interface TraceabilityInfoQuery extends PageQuery {
  traceCode?: string;
  // 其他查询字段根据实际需求补充
}
