<template>
  <div id="content">
    <table border="1" align="center" width="1500px">
      <caption>
        配方施肥单
      </caption>
      <!-- 第一行 -->
      <tr>
        <th width="15%">农户</th>
        <td width="25%">{{ data_land.farmerName }}</td>
        <th width="15%">地块名称</th>
        <td width="20%">{{ data_land.landCode }}</td>
        <th width="10%">面积</th>
        <td width="15%">{{ data_land.landArea }}亩</td>
      </tr>
      <!-- 第二行 -->
      <tr>
        <th width="15%">地块土壤养分</th>
        <td width="85%">
          氮含量：{{ data_form.nutrientLandN }}mg/kg；磷含量：{{ data_form.nutrientLandP }}mg/kg；钾含量：{{ data_form.nutrientLandK }}mg/kg
        </td>
      </tr>
      <!-- 第三行 -->
      <tr>
        <th width="15%">根须深度</th>
        <td width="25%">{{ data_land.rootDepth }}cm</td>
        <th width="15%">土壤容重</th>
        <td width="45%%">{{ data_land.soilDensity }}g/cm<sup>3</sup></td>
      </tr>
      <!-- 第四行 -->
      <tr>
        <th width="15%">目标产量</th>
        <td width="25%">{{ data_form.outputTarget }}kg/亩</td>
        <th width="15%">养分需求量</th>
        <td width="45%%">氮：{{ data_form.nutrientNeedN }}kg/亩；磷：{{ data_form.nutrientNeedP }}kg/亩；钾：{{ data_form.nutrientNeedK }}kg/亩</td>
      </tr>
      <!-- 第五行 -->
      <tr>
        <th width="15%" rowspan="3">养分利用率</th>
        <th width="25%">土壤养分利用率</th>
        <td width="60%">
          氮：{{ data_form.nutrientRateSoilN }}%；磷：{{ data_form.nutrientRateSoilP }}%；钾：{{ data_form.nutrientRateSoilK }}kg/亩
        </td>
      </tr>
      <!-- 第六行 -->
      <tr>
        <th width="25%">有机肥料利用率</th>
        <td width="60%">
          氮：{{ data_form.nutrientRateOFertilizerN }}%；磷：{{ data_form.nutrientRateOFertilizerP }}%；钾：{{
            data_form.nutrientRateOFertilizerK
          }}kg/亩
        </td>
      </tr>
      <!-- 第七行 -->
      <tr>
        <th width="25%">化肥利用率</th>
        <td width="60%">
          氮：{{ data_form.nutrientRateCFertilizerN }}%；磷：{{ data_form.nutrientRateCFertilizerP }}%；钾：{{
            data_form.nutrientRateCFertilizerK
          }}kg/亩
        </td>
      </tr>
      <!-- 第八行 -->
      <tr>
        <th width="15%">有机肥施肥情况</th>
        <td width="85%">{{ o_situation }}</td>
      </tr>
      <!-- 第九行 -->
      <tr>
        <th width="15%">施肥建议</th>
        <td width="85%">{{ schedule_desc }}</td>
      </tr>
      <!-- 第十行 -->
      <tr>
        <th width="15%">调整后施肥量</th>
        <td width="85%">{{ adjust_desc }}</td>
      </tr>
      <!-- 第十一行 -->
      <tr></tr>
    </table>
    <div>
      生成日期：{{ date.getFullYear }}年{{ date.getMonth() + 1 }}月{{ date.getDate() }}日 &nbsp;&nbsp; 操作人： {{ info.data_form.operationByName }}
    </div>
  </div>
</template>

<script setup name="Fertilization" lang="ts">
import html2Canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FertilizationForm, LandUnitVO } from '../api/fertilization/types';
import { List } from 'vxe-table';

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
  summary: undefined
});
const o_situation = ref('');
const schedule_desc = ref('');
const adjust_desc = ref('');
const date = ref(new Date());

const htmlToPdf = {
  getPdf(title, form: FertilizationForm, land: LandUnitVO, om: Map<Number, String>, cm: Map<Number, String>, hasAdjust: Boolean): jsPDF {
    let jspdf = null;
    Object.assign(data_land, land);
    Object.assign(data_form, form);
    const o_desc = form.situationOFertilizer.split(' ');
    for (let i = 0; i < o_desc.length; i += 2) {
      o_situation.value += om.get(Number(o_desc[i])) + '：' + o_desc[i + 1] + 'kg/亩；';
    }
    if (o_situation.value.length > 0) o_situation.value = o_situation.value.substring(0, o_situation.value.length - 1);
    schedule_desc.value += '复合肥：' + cm.get(Number(form.fertilizerCompound)) + '，' + form.fertilizerCompoundVolumn + 'kg/亩&#10';
    schedule_desc.value += '氮肥：' + cm.get(Number(form.fertilizerN)) + '，' + form.fertilizerNVolumn + 'kg/亩&#10';
    schedule_desc.value += '磷肥：' + cm.get(Number(form.fertilizerP)) + '，' + form.fertilizerPVolumn + 'kg/亩&#10';
    schedule_desc.value += '钾肥：' + cm.get(Number(form.fertilizerK)) + '，' + form.fertilizerKVolumn + 'kg/亩';

    if (hasAdjust) {
      adjust_desc.value += '复合肥：' + cm.get(Number(form.fertilizerCompound)) + '，' + form.fertilizerCompoundVolumnAdjust + 'kg/亩&#10';
      adjust_desc.value += '氮肥：' + cm.get(Number(form.fertilizerN)) + '，' + form.fertilizerNVolumnAdjust + 'kg/亩&#10';
      adjust_desc.value += '磷肥：' + cm.get(Number(form.fertilizerP)) + '，' + form.fertilizerPVolumnAdjust + 'kg/亩&#10';
      adjust_desc.value += '钾肥：' + cm.get(Number(form.fertilizerK)) + '，' + form.fertilizerKVolumnAdjust + 'kg/亩';
    }
    date.value = new Date();
    html2Canvas(document.querySelector('content'), {
      allowTaint: false,
      // taintTest: false,
      logging: false,
      useCORS: true,
      // dpi: window.devicePixelRatio * 4, //将分辨率提高到特定的DPI 提高四倍
      scale: 4 //按比例增加分辨率
    }).then((canvas) => {
      var pdf = new jsPDF('p', 'mm', 'a4'); //A4纸，纵向
      var ctx = canvas.getContext('2d'),
        a4w = 190,
        a4h = 272, //A4大小，210mm x 297mm，四边各保留10mm的边距，显示区域190x277
        imgHeight = Math.floor((a4h * canvas.width) / a4w), //按A4显示比例换算一页图像的像素高度
        renderedHeight = 0;

      while (renderedHeight < canvas.height) {
        var page = document.createElement('canvas');
        page.width = canvas.width;
        page.height = Math.min(imgHeight, canvas.height - renderedHeight); //可能内容不足一页

        //用getImageData剪裁指定区域，并画到前面创建的canvas对象中
        page
          .getContext('2d')
          .putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0);
        pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, a4w, Math.min(a4h, (a4w * page.height) / page.width)); //添加图像到页面，保留10mm边距

        renderedHeight += imgHeight;
        if (renderedHeight < canvas.height) {
          pdf.addPage(); //如果后面还有内容，添加一个空页
        }
        // delete page;
      }
      pdf.save(title + '.pdf');
      jspdf = pdf;
    });
    return jspdf;
  }
};
</script>
