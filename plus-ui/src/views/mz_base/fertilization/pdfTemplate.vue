<template>
  <div class="box" ref="pdfContent">
    <h2 style="text-align: center">配方施肥单</h2>
    <table style="border-collapse: collapse; border: 2px solid black; margin: 10px auto" border="1">
      <tr>
        <th>地块名称</th>
        <td>{{ info.data_land.landCode }}</td>
        <!-- <th>农户</th>
        <td>{{info.data_land.farmerName}}</td> -->
        <th>面积</th>
        <td>{{ info.data_land.landArea }}亩</td>
      </tr>
      <tr>
        <th>地块基础养分</th>
        <td colspan="5">
          氮含量：{{ info.data_form.nutrientLandN }}mg/kg； 磷含量：{{ info.data_form.nutrientLandP }}mg/kg； 钾含量：{{
            info.data_form.nutrientLandK
          }}mg/kg
        </td>
      </tr>
      <tr>
        <th>根须深度</th>
        <td>{{ info.data_land.rootDepth }}cm</td>
        <th>土壤容重</th>
        <td colspan="3">{{ info.data_land.soilDensity }}g/cm<sup>3</sup></td>
      </tr>
      <tr>
        <th>目标产量</th>
        <td>{{ info.data_form.outputTarget }}kg/亩</td>
        <th>营养需求量</th>
        <td colspan="3">
          氮：{{ info.data_form.nutrientNeedN }}kg/亩；磷：{{ info.data_form.nutrientNeedP }}kg/亩；钾：{{ info.data_form.nutrientNeedK }}kg/亩
        </td>
      </tr>
      <tr>
        <th rowspan="3">养分利用率</th>
        <th colspan="2">土壤养分利用率</th>
        <td colspan="3">
          氮：{{ info.data_form.nutrientRateSoilN }}%； 磷：{{ info.data_form.nutrientRateSoilP }}%； 钾：{{ info.data_form.nutrientRateSoilK }}%
        </td>
      </tr>
      <tr>
        <th colspan="2">有机肥养分利用率</th>
        <td colspan="3">
          氮：{{ info.data_form.nutrientRateOFertilizerN }}%； 磷：{{ info.data_form.nutrientRateOFertilizerP }}%； 钾：{{
            info.data_form.nutrientRateOFertilizerK
          }}%
        </td>
      </tr>
      <tr>
        <th colspan="2">化肥养分利用率</th>
        <td colspan="3">
          氮：{{ info.data_form.nutrientRateCFertilizerN }}%； 磷：{{ info.data_form.nutrientRateCFertilizerP }}%； 钾：{{
            info.data_form.nutrientRateCFertilizerK
          }}%
        </td>
      </tr>
      <tr>
        <th>有机肥施肥信息</th>
        <td colspan="5">
          <span v-for="f in info.o_situation"> {{ f }}<br /> </span>
        </td>
      </tr>
      <tr>
        <th>施肥建议</th>
        <td colspan="5">
          <span v-for="f in info.schedule_desc"> {{ f }}<br /> </span>
        </td>
      </tr>
      <tr v-if="info.hasAdjust">
        <th>调整后施肥量</th>
        <td colspan="5">
          <span v-for="f in info.adjust_desc"> {{ f }}<br /> </span>
        </td>
      </tr>
      <tr></tr>
    </table>
    生成日期：{{ info.date.getFullYear() }}年{{ info.date.getMonth() + 1 }}月{{ info.date.getDate() }}日 &nbsp;&nbsp;
    <!-- 操作人： {{info.data_form.operationByName}} -->
  </div>
</template>

<script setup name="pdfTemplate" lang="ts">
import { ref } from 'vue';
import { PdfData } from '../api/fertilization/types';
interface Props {
  info: PdfData;
}
const props = defineProps<Props>();
const pdfContent = ref<HTMLElement | null>(null);
defineExpose({ pdfContent });
</script>

<style scoped>
.box {
  width: 210mm;
  height: 297mm;
  box-sizing: border-box;
  padding: 0 1cm;
  position: absolute;
  top: -1000mm;
}
table {
  width: 100%;
  line-height: 35px;
  font-size: 15px;
}
th,
td {
  padding: 5px;
  text-align: left;
  width: 16%;
}
</style>
