<template>
  <div class="content">
    <SinglePanel caption="地块信息" class="land-info">
      <el-container>
        <el-aside width="65%" v-model="form">
          <el-descriptions class="margin-top" title="地块基本信息" :column="3" :border="true">
            <el-descriptions-item v-model="land">
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  地块名称
                </div>
              </template>
              {{ land.landCode }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <iphone />
                  </el-icon>
                  灌溉能力
                </div>
              </template>
              {{ land.irrigation }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <location />
                  </el-icon>
                  面积
                </div>
              </template>
              {{ land.landArea }}<el-tag size="small" type="success">亩</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <tickets />
                  </el-icon>
                  地力等级
                </div>
              </template>
              {{ land.landLevel }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <office-building />
                  </el-icon>
                  排水能力
                </div>
              </template>
              {{ land.drainage }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <office-building />
                  </el-icon>
                  海拔
                </div>
              </template>
              {{ land.altitude }}<el-tag type="success">米</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <office-building />
                  </el-icon>
                  坡向
                </div>
              </template>
              {{ land.slopeDirection }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <office-building />
                  </el-icon>
                  耕地质地
                </div>
              </template>
              {{ land.landTexture }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <office-building />
                  </el-icon>
                  土壤容重
                </div>
              </template>
              {{ land.soilDensity }}<el-tag type="success">g/m<sup>3</sup></el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <office-building />
                  </el-icon>
                  坡度
                </div>
              </template>
              {{ land.slope }}<el-tag type="success">度</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="25%">
          <el-descriptions class="margin-top" title="地块养分信息" :column="1" :border="true">
            <el-descriptions-item width="50px">
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  氮含量
                </div>
              </template>
              <el-input v-model="form.nutrientLandN">
                <template #append>mg/kg</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  磷含量
                </div>
              </template>
              <el-input v-model="form.nutrientLandP">
                <template #append>mg/kg</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  钾含量
                </div>
              </template>
              <el-input v-model="form.nutrientLandK">
                <template #append>mg/kg</template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="10%">
          <el-button type="warning" icon="" style="margin-left: 20%; margin-top: 20%" @click="goBack()">返回</el-button>
        </el-aside>
      </el-container>
    </SinglePanel>
    <SinglePanel caption="配方参数" class="param">
      <el-container>
        <el-aside width="20%">
          <el-descriptions class="margin-top" title="目标产量" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  目标产量
                </div>
              </template>
              <el-input v-model="form.outputTarget">
                <template #append>kg/亩</template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="20%">
          <el-descriptions class="margin-top" title="每生产100kg籽粒所需NPK" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  氮
                </div>
              </template>
              <el-input v-model="form.nutrientNeedN">
                <template #append>kg</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  磷
                </div>
              </template>
              <el-input v-model="form.nutrientNeedP">
                <template #append>kg</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  钾
                </div>
              </template>
              <el-input v-model="form.nutrientNeedK">
                <template #append>kg</template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="20%">
          <el-descriptions class="margin-top" title="土壤NPK利用率" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  氮
                </div>
              </template>
              <el-input v-model="form.nutrientRateSoilN">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  磷
                </div>
              </template>
              <el-input v-model="form.nutrientRateSoilP">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  钾
                </div>
              </template>
              <el-input v-model="form.nutrientRateSoilK">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="20%">
          <el-descriptions class="margin-top" title="有机肥NPK利用率" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  氮
                </div>
              </template>
              <el-input v-model="form.nutrientRateOFertilizerN">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  磷
                </div>
              </template>
              <el-input v-model="form.nutrientRateOFertilizerP">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  钾
                </div>
              </template>
              <el-input v-model="form.nutrientRateOFertilizerK">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="20%">
          <el-descriptions class="margin-top" title="化肥NPK利用率" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  氮
                </div>
              </template>
              <el-input v-model="form.nutrientRateCFertilizerN">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  磷
                </div>
              </template>
              <el-input v-model="form.nutrientRateCFertilizerP">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <user />
                  </el-icon>
                  钾
                </div>
              </template>
              <el-input v-model="form.nutrientRateCFertilizerK">
                <template #append>%</template>
              </el-input>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
      </el-container>
    </SinglePanel>
    <SinglePanel caption="肥料选择" class="fertilization">
      <el-container>
        <el-aside width="30%">
          <el-descriptions class="margin-top" title="有机肥施肥情况" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item" style="width: 20px">添加有机肥</div>
              </template>
              <el-scrollbar class="scro_situation" height="150px">
                <el-table v :data="fertilizer_organic_data.records">
                  <el-table-column property="name" label="有机肥名称" style="width: 30%">
                    <template #default="scope">
                      <el-select placeholder="选择有机肥" size="small" v-model="scope.row.id">
                        <el-option v-for="item in fertilizer_organic_data.selectValue" :key="item.id" :label="item.name" :value="item.id" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column property="volumn" label="施肥量(kg/亩)" style="width: 30%">
                    <template #default="scope">
                      <el-input v-model="scope.row.volumn" style="height: 25px"></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column fixed="right" align="center" style="width: 30%">
                    <template #default="scope">
                      <el-button type="danger" size="small" @click="deleteLine(scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-scrollbar>
              <div>
                <el-button type="success" @click="addLineData()">添加</el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="50%">
          <el-descriptions class="margin-top" title="化肥选择 " :column="2" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">复合肥：</div>
              </template>
              <el-select v-model="form.fertilizerCompound" class="m-2" placeholder="请选择" size="small" style="width: 240px">
                <el-option v-for="item in fertilizer_option.option_compound" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">氮肥：&nbsp&nbsp&nbsp&nbsp</div>
              </template>
              <el-select v-model="form.fertilizerN" class="m-2" placeholder="请选择" size="small" style="width: 240px">
                <el-option v-for="item in fertilizer_option.option_N" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">磷肥：&nbsp&nbsp&nbsp&nbsp</div>
              </template>
              <el-select v-model="form.fertilizerP" class="m-2" placeholder="请选择" size="small" style="width: 240px">
                <el-option v-for="item in fertilizer_option.option_P" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">钾肥：&nbsp&nbsp&nbsp&nbsp</div>
              </template>
              <el-select v-model="form.fertilizerK" class="m-2" placeholder="请选择" size="small" style="width: 240px">
                <el-option v-for="item in fertilizer_option.option_K" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
        <el-aside width="20%">
          <el-descriptions class="margin-top" title="操作" :column="1" :border="true">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">生成</div>
              </template>
              <el-button type="success" round :icon="EditPen" @click="genarate()" :disabled="!flag">生成</el-button>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">调整</div>
              </template>
              <el-button class="button_control" type="warning" round :icon="Edit" @click="adjust()" :disabled="flag">调整</el-button>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">查看</div>
              </template>
              <el-button class="button_control" type="success" round :icon="View" @click="look()" :disabled="flag">查看</el-button>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">下载</div>
              </template>
              <el-button class="button_control" type="success" round :icon="Download" @click="download()" :disabled="flag">下载</el-button>
            </el-descriptions-item>
          </el-descriptions>
        </el-aside>
      </el-container>
    </SinglePanel>
    <!-- 调整施肥量 -->
    <el-dialog title="调整施肥量" v-model="openAdjust" width="500px" append-to-body>
      <el-form :model="form" label-width="200px">
        <el-form-item :label="`复合肥：${fertilizer_option.fertilizer_map.get(form.fertilizerCompound)}`">
          <el-input v-model="adjustVolumnData.fertilizerCompoundVolumnAdjust">
            <template #append>kg/亩</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="`氮肥：${fertilizer_option.fertilizer_map.get(form.fertilizerN)}`">
          <el-input v-model="adjustVolumnData.fertilizerNVolumnAdjust">
            <template #append>kg/亩</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="`磷肥：${fertilizer_option.fertilizer_map.get(form.fertilizerP)}`">
          <el-input v-model="adjustVolumnData.fertilizerPVolumnAdjust">
            <template #append>kg/亩</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="`钾肥：${fertilizer_option.fertilizer_map.get(form.fertilizerK)}`">
          <el-input v-model="adjustVolumnData.fertilizerKVolumnAdjust">
            <template #append>kg/亩</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmAdjust()">确 定</el-button>
          <el-button @click="openAdjust = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="配方单" v-model="lookPdf" append-to-body>
      <iframe :src="pdfDataUrl" width="100%" height="800px"></iframe>
    </el-dialog>
  </div>
  <div>
    <pdfTemplate v-if="onDown" ref="pdfContentRef" :info="info"></pdfTemplate>
  </div>
</template>

<script setup name="Fertilization" lang="ts">
import { getLandUnit, genarateFertilizationForm, adjustFertilizationForm } from '../api/fertilization/index';
import { LandUnitVO, FertilizationForm, FertilizerVolumn, PdfData } from '../api/fertilization/types';
import { listOrganicFertilizer } from '../api/organicFertilizer/index';
import { OrganicFertilizerVO } from '../api/organicFertilizer/types';
import { listFertilizer } from '../api/fertilizer/index';
import { FertilizerVO } from '../api/fertilizer/types';
import { computed, ref, reactive } from 'vue';
import pdfTemplate from './pdfTemplate.vue';
import { Download, EditPen, Edit, Iphone, Location, OfficeBuilding, Tickets, User, View } from '@element-plus/icons-vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const size = ref('');
const iconStyle = computed(() => {
  const marginMap = {
    large: '8px',
    default: '6px',
    small: '4px'
  };
  return {
    marginRight: marginMap[size.value] || marginMap.default
  };
});

const fertilizerList = ref<FertilizerVO[]>([]);
const organicFertilizerList = ref<OrganicFertilizerVO[]>([]);
const queryParams_f = {
  pageNum: 1,
  pageSize: 100,
  fertiName: undefined,
  fertiType: undefined,
  fertiContent: undefined,
  contentN: undefined,
  contentP: undefined,
  contentK: undefined,
  manufacturer: undefined,
  supplier: undefined,
  isValid: undefined,
  params: {}
};

const queryParams_o = {
  pageNum: 1,
  pageSize: 100,
  fertiName: undefined,
  fertiType: undefined,
  fertiContent: undefined,
  contentN: undefined,
  contentP: undefined,
  contentK: undefined,
  manufacturer: undefined,
  supplier: undefined,
  isValid: undefined,
  params: {}
};

const flag = ref(true);
const openAdjust = ref(false);
const hasAdjust = ref(false);
const onDown = ref(false);

const land = reactive<LandUnitVO>({
  // landId: undefined,
  // landCode: undefined,
  // farmerId: undefined,
  // farmerName: undefined,
  // landLevel: undefined,
  // slopeDirection: undefined,
  // irrigation: undefined,
  // drainage: undefined,
  // landTexture: undefined,
  // landArea: undefined,
  // altitude: undefined,
  // soilDensity: undefined,
  // slope: undefined,
  // rootDepth: undefined,
  landId: '1886318109041623042',
  farmerId: '1881243005897822210',
  farmerName: '张三',
  landCode: '侯家沟001',
  landLevel: 3,
  slopeDirection: '阳坡',
  irrigation: '能',
  drainage: '能',
  landTexture: '粉壤土',
  landArea: 10,
  altitude: 3000,
  soilDensity: 1.35,
  slope: 10,
  rootDepth: 20
});

const form = reactive<FertilizationForm>({
  fertilizationID: undefined,
  landId: '1886318109041623042',
  landCode: '侯家沟001',
  area: 10,
  rootDepth: 20,
  soilDensity: 1.35,
  nutrientLand: undefined,
  nutrientLandN: 171.2,
  nutrientLandP: 47.7,
  nutrientLandK: 50.5,
  outputTarget: 500,
  nutrientNeed: undefined,
  nutrientNeedN: 2.8,
  nutrientNeedP: 2.6,
  nutrientNeedK: 1.3,
  nutrientRateSoil: undefined,
  nutrientRateSoilN: 28,
  nutrientRateSoilP: 17,
  nutrientRateSoilK: 55,
  nutrientRateOFertilizer: undefined,
  nutrientRateOFertilizerN: 17,
  nutrientRateOFertilizerP: 35,
  nutrientRateOFertilizerK: 29,
  nutrientRateCFertilizer: undefined,
  nutrientRateCFertilizerN: 45,
  nutrientRateCFertilizerP: 19,
  nutrientRateCFertilizerK: 38,
  situationOFertilizer: undefined,
  fertilizerCompound: 1,
  fertilizerN: 4,
  fertilizerP: 6,
  fertilizerK: 8,
  fertilizerCompoundVolumn: 151.1,
  fertilizerNVolumn: 0,
  fertilizerPVolumn: 36.2,
  fertilizerKVolumn: 56.5,
  fertilizerCompoundVolumnAdjust: 151.1,
  fertilizerNVolumnAdjust: 0,
  fertilizerPVolumnAdjust: 36.2,
  fertilizerKVolumnAdjust: 56.5,
  yearFertilization: '2025',
  operationBy: 1,
  summary: undefined,
  situation: undefined
});

const fertilizer_organic_data = reactive({
  records: [],
  selectValue: [],
  oMap: new Map()
});

const fertilizer_option = reactive({
  option_compound: [],
  option_N: [],
  option_P: [],
  option_K: [],
  fertilizer_map: new Map()
});

const adjustVolumnData = reactive<FertilizerVolumn>({
  fertilizationId: undefined,
  fertilizerCompoundVolumnAdjust: undefined,
  fertilizerNVolumnAdjust: undefined,
  fertilizerPVolumnAdjust: undefined,
  fertilizerKVolumnAdjust: undefined
});

const data_land = reactive<LandUnitVO>({
  landId: undefined,
  landCode: undefined,
  farmerId: undefined,
  farmerName: undefined,
  landLevel: undefined,
  slopeDirection: undefined,
  irrigation: undefined,
  drainage: undefined,
  landTexture: undefined,
  landArea: undefined,
  altitude: undefined,
  soilDensity: undefined,
  slope: undefined,
  rootDepth: undefined
});

const data_form = reactive<FertilizationForm>({
  fertilizationID: undefined,
  landId: undefined,
  landCode: undefined,
  area: undefined,
  rootDepth: undefined,
  soilDensity: undefined,
  nutrientLand: undefined,
  nutrientLandN: undefined,
  nutrientLandP: undefined,
  nutrientLandK: undefined,
  outputTarget: undefined,
  nutrientNeed: undefined,
  nutrientNeedN: undefined,
  nutrientNeedP: undefined,
  nutrientNeedK: undefined,
  nutrientRateSoil: undefined,
  nutrientRateSoilN: undefined,
  nutrientRateSoilP: undefined,
  nutrientRateSoilK: undefined,
  nutrientRateOFertilizer: undefined,
  nutrientRateOFertilizerN: undefined,
  nutrientRateOFertilizerP: undefined,
  nutrientRateOFertilizerK: undefined,
  nutrientRateCFertilizer: undefined,
  nutrientRateCFertilizerN: undefined,
  nutrientRateCFertilizerP: undefined,
  nutrientRateCFertilizerK: undefined,
  situationOFertilizer: undefined,
  fertilizerCompound: undefined,
  fertilizerN: undefined,
  fertilizerP: undefined,
  fertilizerK: undefined,
  fertilizerCompoundVolumn: undefined,
  fertilizerNVolumn: undefined,
  fertilizerPVolumn: undefined,
  fertilizerKVolumn: undefined,
  fertilizerCompoundVolumnAdjust: undefined,
  fertilizerNVolumnAdjust: undefined,
  fertilizerPVolumnAdjust: undefined,
  fertilizerKVolumnAdjust: undefined,
  yearFertilization: undefined,
  operationBy: undefined,
  summary: undefined,
  situation: undefined
});
const o_situation = ref([]);
const schedule_desc = ref([]);
const adjust_desc = ref([]);

const goBack = () => {
  window.history.go(-1);
};

const addLineData = () => {
  const newData = {
    id: undefined,
    name: undefined,
    volumn: undefined
  };
  fertilizer_organic_data.records.push(newData);
};

const deleteLine = (row) => {
  ElMessageBox.confirm('确认删除该条有机肥施肥记录?', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    fertilizer_organic_data.records = fertilizer_organic_data.records.filter((ele) => ele !== row);
  });
};

const genarate = async () => {
  form.situationOFertilizer = '';
  form.situation = '';
  o_situation.value.length = 0;
  for (let ele of fertilizer_organic_data.records) {
    if (isNaN(ele.id) || isNaN(ele.volumn)) {
      alert('有机肥名称与数量不能为空！');
      return;
    }
    form.situation += fertilizer_organic_data.oMap.get(ele.id) + '：' + ele.volumn + 'kg/亩';
    o_situation.value.push(fertilizer_organic_data.oMap.get(ele.id) + '：' + ele.volumn + 'kg/亩');
    form.situationOFertilizer += ele.id + ' ' + ele.volumn + ' ';
  }
  form.yearFertilization = new Date().getFullYear();
  const res = await genarateFertilizationForm(form);

  if (res != null && !isNaN(res.code) && res.code == 200) {
    flag.value = false;
    form.fertilizationID = res.data[0];
    form.fertilizerCompoundVolumn = res.data[1];
    form.fertilizerNVolumn = res.data[2];
    form.fertilizerPVolumn = res.data[3];
    form.fertilizerKVolumn = res.data[4];
    form.fertilizerCompoundVolumnAdjust = form.fertilizerCompoundVolumn;
    form.fertilizerNVolumnAdjust = form.fertilizerNVolumn;
    form.fertilizerPVolumnAdjust = form.fertilizerPVolumn;
    form.fertilizerKVolumnAdjust = form.fertilizerKVolumn;
    flag.value = false;
    schedule_desc.value.length = 0;
    schedule_desc.value.push(
      '复合肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerCompound) + '，' + form.fertilizerCompoundVolumn + 'kg/亩'
    );
    schedule_desc.value.push('氮肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerN) + '，' + form.fertilizerNVolumn + 'kg/亩');
    schedule_desc.value.push('磷肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerP) + '，' + form.fertilizerPVolumn + 'kg/亩');
    schedule_desc.value.push('钾肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerK) + '，' + form.fertilizerKVolumn + 'kg/亩');

    alert('配方生成成功！');
  } else {
    alert('配方生成失败！');
  }
};

const adjust = () => {
  adjustVolumnData.fertilizationId = form.fertilizationID;
  adjustVolumnData.fertilizerCompoundVolumnAdjust = form.fertilizerCompoundVolumnAdjust;
  adjustVolumnData.fertilizerNVolumnAdjust = form.fertilizerNVolumnAdjust;
  adjustVolumnData.fertilizerPVolumnAdjust = form.fertilizerPVolumnAdjust;
  adjustVolumnData.fertilizerKVolumnAdjust = form.fertilizerKVolumnAdjust;
  openAdjust.value = true;
};

const confirmAdjust = async () => {
  openAdjust.value = false;
  const res = await adjustFertilizationForm(adjustVolumnData);
  if (res != null && !isNaN(res.code) && res.code === 200) {
    form.fertilizerCompoundVolumnAdjust = adjustVolumnData.fertilizerCompoundVolumnAdjust;
    form.fertilizerNVolumnAdjust = adjustVolumnData.fertilizerNVolumnAdjust;
    form.fertilizerPVolumnAdjust = adjustVolumnData.fertilizerPVolumnAdjust;
    form.fertilizerKVolumnAdjust = adjustVolumnData.fertilizerKVolumnAdjust;
    hasAdjust.value = true;
    adjust_desc.value.length = 0;
    adjust_desc.value.push(
      '复合肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerCompound) + '，' + form.fertilizerCompoundVolumnAdjust + 'kg/亩'
    );
    adjust_desc.value.push('氮肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerN) + '，' + form.fertilizerNVolumnAdjust + 'kg/亩');
    adjust_desc.value.push('磷肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerP) + '，' + form.fertilizerPVolumnAdjust + 'kg/亩');
    adjust_desc.value.push('钾肥：' + fertilizer_option.fertilizer_map.get(form.fertilizerK) + '，' + form.fertilizerKVolumnAdjust + 'kg/亩');
    alert('调整配方成功！');
  } else {
    alert('调整配方失败！');
  }
};

const info = ref<PdfData>({
  data_land: land,
  data_form: form,
  o_situation: o_situation.value,
  schedule_desc: schedule_desc.value,
  adjust_desc: adjust_desc.value,
  hasAdjust: false,
  date: new Date()
});

const pdfContentRef = ref(null);
const pdf = ref(null);
const pdfDataUrl = ref<string | null>(null);
const lookPdf = ref(false);

const look = () => {
  info.value.date = new Date();
  info.value.hasAdjust = hasAdjust.value;
  onDown.value = true;
  console.log(info.value);
  exportToPDF();
};

const download = () => {
  pdf.value.save(land.landCode + '_' + form.yearFertilization + '.pdf');
};

const exportToPDF = async () => {
  await nextTick();
  const element = pdfContentRef.value?.pdfContent;
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  pdf.value = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.value.internal.pageSize.getWidth();
  const pageHeight = pdf.value.internal.pageSize.getHeight();
  const imgProps = {
    width: canvas.width,
    height: canvas.height
  };

  // 将图片按比例缩放到 A4 纸大小
  const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
  const imgWidth = imgProps.width * ratio;
  const imgHeight = imgProps.height * ratio;

  pdf.value.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdfDataUrl.value = pdf.value.output('bloburl');
  lookPdf.value = true;
};

const getLandInfo = async (landId: number | string) => {
  Object.assign(land, (await getLandUnit(landId)).data);
};

const getFInfo = async () => {
  const res = await listFertilizer(queryParams_f);
  fertilizerList.value = res.rows;
  fertilizerList.value.forEach((element) => {
    fertilizer_option.fertilizer_map.set(element.fertilizerId, element.fertiName);
    switch (element.fertiType) {
      case '0':
        fertilizer_option.option_compound.push({ id: element.fertilizerId, name: element.fertiName });
        break;
      case '1':
        fertilizer_option.option_N.push({ id: element.fertilizerId, name: element.fertiName });
        break;
      case '2':
        fertilizer_option.option_P.push({ id: element.fertilizerId, name: element.fertiName });
        break;
      case '3':
        fertilizer_option.option_K.push({ id: element.fertilizerId, name: element.fertiName });
        break;
    }
  });
};

const getOInfo = async () => {
  const res = await listOrganicFertilizer(queryParams_o);
  organicFertilizerList.value = res.rows;
  organicFertilizerList.value.forEach((element) => {
    fertilizer_organic_data.selectValue.push({ id: element.ofId, name: element.ofName });
    fertilizer_organic_data.oMap.set(element.ofId, element.ofName);
  });
};

onMounted(() => {
  // getLandInfo("1886318109041623042");
  // getFInfo();
  // getOInfo();
  fertilizer_option.fertilizer_map.set(1, '专用高塔复合肥');
  fertilizer_option.fertilizer_map.set(2, '磷酸二铵');
  fertilizer_option.fertilizer_map.set(3, '磷酸二氢钾');
  fertilizer_option.fertilizer_map.set(4, '尿素');
  fertilizer_option.fertilizer_map.set(5, '硫酸铵');
  fertilizer_option.fertilizer_map.set(6, '过磷酸钙');
  fertilizer_option.fertilizer_map.set(7, '钙镁磷肥');
  fertilizer_option.fertilizer_map.set(8, '硫酸钾');
  fertilizer_option.fertilizer_map.set(9, '氯化钾');
  fertilizer_option.option_compound.push({ id: 1, name: '专用高塔复合肥' });
  fertilizer_option.option_compound.push({ id: 2, name: '磷酸二铵' });
  fertilizer_option.option_compound.push({ id: 3, name: '磷酸二氢钾' });
  fertilizer_option.option_N.push({ id: 4, name: '尿素' });
  fertilizer_option.option_N.push({ id: 5, name: '硫酸铵' });
  fertilizer_option.option_P.push({ id: 6, name: '过磷酸钙' });
  fertilizer_option.option_P.push({ id: 7, name: '钙镁磷肥' });
  fertilizer_option.option_K.push({ id: 8, name: '硫酸钾' });
  fertilizer_option.option_K.push({ id: 9, name: '氯化钾' });
  fertilizer_organic_data.oMap.set(1, '鸡粪');
  fertilizer_organic_data.oMap.set(2, '猪粪');
  fertilizer_organic_data.selectValue.push({ id: 1, name: '鸡粪' });
  fertilizer_organic_data.selectValue.push({ id: 2, name: '猪粪' });
});
</script>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}

.cell-item {
  display: flex;
  align-items: center;
}
.margin-top {
  margin-top: 20px;
}
</style>
