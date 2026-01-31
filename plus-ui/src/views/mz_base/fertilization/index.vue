<template>
  <div class="p-2">
    <el-container>
      <el-aside width="65%" v-model="form">
        <el-descriptions class="margin-top" title="地块基本信息" :column="3" :border="true">
          <el-descriptions-item v-model="data">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <user />
                </el-icon>
                地块名称
              </div>
            </template>
            {{ data.landCode }}
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
            <template #default="scope">
              <span class="dictType">
                <dict-tag :options="irrigation_capacity" :value="data.irrigation" />
              </span>
            </template>
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
            {{ data.landArea }}<el-tag size="small" type="success">亩</el-tag>
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
            {{ data.landLevel }}
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
            <template #default="scope">
              <span class="dictType">
                <dict-tag :options="drainage_capacity" :value="data.drainage" />
              </span>
            </template>
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
            {{ data.altitude }}<el-tag type="success">米</el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <office-building />
                </el-icon>
                坡向
              </div>
            </template>
            {{ data.slopeDirection }} -->
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <office-building />
                </el-icon>
                地形部位
              </div>
            </template>
            {{
              data.topographicFeature == 0
                ? '丘陵上部'
                : data.topographicFeature == 1
                  ? '丘陵中部'
                  : data.topographicFeature == 2
                    ? '丘陵下部'
                    : data.topographicFeature
            }}
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
            {{ data.landTexture }}
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
            {{ data.soilDensity }}<el-tag type="success">g/cm<sup>3</sup></el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <!-- <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <office-building />
                </el-icon>
                坡度
              </div>
            </template>
            {{ data.slope }}<el-tag type="success">度</el-tag> -->
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <office-building />
                </el-icon>
                有效土层厚度
              </div>
            </template>
            {{ data.effectiveSoilLayer }}
            <el-tag type="success">cm</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-aside>
      <el-aside width="25%">
        <el-descriptions class="margin-top" title="土壤养分信息" :column="1" :border="true">
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
        <!-- <el-button type="warning" icon="" style="margin-left: 20%;margin-top: 20%;" @click="goBack()">返回</el-button> -->
      </el-aside>
    </el-container>
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
              <template #append>公斤/亩</template>
            </el-input>
          </el-descriptions-item>
        </el-descriptions>
      </el-aside>
      <el-aside width="20%">
        <el-descriptions class="margin-top" title="每生产100kg籽粒所需氮磷钾" :column="1" :border="true">
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
        <el-descriptions class="margin-top" title="土壤氮磷钾利用率" :column="1" :border="true">
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
        <el-descriptions class="margin-top" title="有机肥氮磷钾利用率" :column="1" :border="true">
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
        <el-descriptions class="margin-top" title="化肥氮磷钾利用率" :column="1" :border="true">
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
    <el-container>
      <el-aside width="30%">
        <el-descriptions class="margin-top" title="有机肥施肥情况" :column="1" :border="true">
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" style="width: 20px">添加有机肥</div>
            </template>
            <el-scrollbar class="scro_situation" height="150px">
              <el-table v :data="fertilizer_organic_data.baseForm.records">
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

<script setup lang="ts">
import { getLandUnit, genarateFertilizationForm, adjustFertilizationForm } from '../api/fertilization/index';
import { LandUnitVO, FertilizationForm, FertilizerVolumn, PdfData } from '../api/fertilization/types';
import { computed, ref } from 'vue';
import pdfTemplate from './pdfTemplate.vue';
import { Download, EditPen, Edit, Iphone, Location, OfficeBuilding, Tickets, User, View } from '@element-plus/icons-vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import router from '@/router';
import { pointInLand } from '@/views/powland/api/point';
import { fertDictQuery, organicDictQuery } from '../api/tableDict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { irrigation_capacity } = toRefs<any>(proxy?.useDict('irrigation_capacity'));
const { drainage_capacity } = toRefs<any>(proxy?.useDict('drainage_capacity'));

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

const flag = ref(true);
const openAdjust = ref(false);
const hasAdjust = ref(false);
const onDown = ref(false);

const data = reactive<LandUnitVO>({
  landId: '1886318109041623042',
  farmerId: '1881243005897822210',
  farmerName: '张三',
  landCode: '侯家沟001',
  landLevel: 3,
  slopeDirection: '阳坡',
  irrigation: 2,
  drainage: 3,
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
  outputTarget: 200,
  nutrientNeed: undefined,
  nutrientNeedN: 3.0,
  nutrientNeedP: 1.4,
  nutrientNeedK: 3.8,
  nutrientRateSoil: undefined,
  nutrientRateSoilN: 32,
  nutrientRateSoilP: 17,
  nutrientRateSoilK: 50,
  nutrientRateOFertilizer: undefined,
  nutrientRateOFertilizerN: 17,
  nutrientRateOFertilizerP: 35,
  nutrientRateOFertilizerK: 29,
  nutrientRateCFertilizer: undefined,
  nutrientRateCFertilizerN: 20,
  nutrientRateCFertilizerP: 19,
  nutrientRateCFertilizerK: 40,
  situationOFertilizer: undefined,
  fertilizerCompound: undefined,
  fertilizerN: undefined,
  fertilizerP: undefined,
  fertilizerK: undefined,
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
  baseForm: {
    records: [
      {
        id: '3',
        volumn: 120
      }
    ]
  },
  selectValue: [],
  oMap: new Map<number | string, string>([]),
  rules: {
    id: [
      {
        required: true,
        message: '有机肥不能为空',
        trigger: 'blur'
      }
    ],
    name: [
      {
        required: true,
        message: '有机肥名称不能为空',
        trigger: 'blur'
      }
    ],
    volumn: [
      {
        required: true,
        message: '有机肥施肥量不能为空',
        trigger: 'blur'
      }
    ]
  }
});

const fertilizer_option = reactive({
  option_compound: [],
  option_N: [],
  option_P: [],
  option_K: [],
  fertilizer_map: new Map([])
});

const adjustVolumnData = reactive<FertilizerVolumn>({
  fertilizationId: undefined,
  fertilizerCompoundVolumnAdjust: undefined,
  fertilizerNVolumnAdjust: undefined,
  fertilizerPVolumnAdjust: undefined,
  fertilizerKVolumnAdjust: undefined
});

const o_situation = ref([]);
const schedule_desc = ref([]);
const adjust_desc = ref([]);

const getLandInfo = async (landId: number | string) => {
  Object.assign(data, (await getLandUnit(landId)).data);
};

const goBack = () => {
  router.back();
};

const addLineData = () => {
  const newData = {
    id: undefined,
    name: undefined,
    volumn: undefined
  };
  fertilizer_organic_data.baseForm.records.push(newData);
};

const deleteLine = (row) => {
  ElMessageBox.confirm('确认删除该条有机肥施肥记录?', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    fertilizer_organic_data.baseForm.records = fertilizer_organic_data.baseForm.records.filter((ele) => ele !== row);
  });
};

const genarate = async () => {
  form.situationOFertilizer = '';
  form.situation = '';
  o_situation.value.length = 0;
  for (let ele of fertilizer_organic_data.baseForm.records) {
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
  data_land: data,
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
  pdf.value.save(data.landCode + '_' + form.yearFertilization + '.pdf');
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

const getFInfo = async () => {
  const res = await fertDictQuery();
  res.rows.forEach((e) => {
    fertilizer_option.fertilizer_map.set(e.value, e.label);
    switch (e.ext) {
      case '0':
        fertilizer_option.option_compound.push({ id: e.value, name: e.label });
        break;
      case '1':
        fertilizer_option.option_N.push({ id: e.value, name: e.label });
        break;
      case '2':
        fertilizer_option.option_P.push({ id: e.value, name: e.label });
        break;
      case '3':
        fertilizer_option.option_K.push({ id: e.value, name: e.label });
        break;
    }
  });
};

const getOInfo = async () => {
  const res = await organicDictQuery();
  res.rows.forEach((e) => {
    fertilizer_organic_data.selectValue.push({ id: e.value, name: e.label });
    fertilizer_organic_data.oMap.set(e.value, e.label);
  });
};

const loadData = async (landId) => {
  if (landId != null && landId != undefined) {
    if (typeof landId == 'string') {
      const landData = (await getLandUnit(landId)).data;
      Object.assign(data, landData);
      Object.assign(form, landData);
      console.log(form);

      data.drainage = landData.drainageCapacity;
      data.irrigation = landData.irrigationCapacity;
    } else {
      const landData = getLandInfo(landId[0]);
      Object.assign(data, landData);
      data.drainage = landData.drainageCapacity;
      data.irrigation = landData.irrigationCapacity;
    }
  } else {
    alert('地块不存在！');
  }
};

/**
 * 地块中的采样点
 */
async function getPointInLand(landId) {
  const res = (await pointInLand(landId)).data;
  form.nutrientLandN = parseFloat((res.tn * 0.118).toFixed(2));
  form.nutrientLandP = res.ap;
  form.nutrientLandK = res.ak;
  data.altitude = res.altitude;
}

function getAllBaseData(landId) {
  loadData(landId);
  getFInfo();
  getOInfo();
  getPointInLand(landId);
}

//向外暴露方法
defineExpose({ getAllBaseData });
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
