<template>
  <div class="page-wrap fancy-bg">
    <!-- 顶部切换 -->
    <div class="toolbar">
      <el-space wrap :size="8" class="seg">
        <button v-for="tab in tabs" :key="tab.key" class="seg-item" :class="{ active: active === tab.key }" @click="active = tab.key">
          <span class="seg-dot" :style="{ background: tab.color }"></span>
          <span>{{ tab.text }}</span>
        </button>
      </el-space>
    </div>

    <el-card class="glass-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="title">
            <b>{{ current.text }}</b>
          </div>
        </div>
      </template>

      <div class="table-wrap">
        <!-- 表1：目标-准则-指标 -->
        <el-table
          v-show="active === 'sys'"
          :data="tableSys"
          border
          stripe
          size="small"
          class="compact full-table luxe-table"
          :span-method="spanMethodSys"
          :cell-style="centerStyle"
          :header-cell-style="centerHeaderStyle"
          :row-class-name="zebra"
        >
          <el-table-column prop="target" label="目标层" :width="colSys[0]" align="center" fixed="left">
            <template #default="{ row }">
              <div class="cell-chip"><span class="dot dot-green"></span>{{ row.target }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="criterion" label="准则层" :width="colSys[1]" align="center" />
          <!-- <el-table-column prop="indicators" label="指标层" :width="colSys[2]" align="center" /> -->
          <!-- 分组表头：指标层 -> 基础指标 / 区域指标 -->
          <el-table-column label="指标层" align="center">
            <el-table-column prop="baseIndicators" label="基础指标" min-width="200" align="center" />
            <el-table-column prop="regionalIndicators" label="区域指标" min-width="110" align="center" />
          </el-table-column>
        </el-table>

        <!-- 表2：指标权重 -->
        <el-table
          v-show="active === 'weight'"
          :data="tableWeight"
          border
          stripe
          size="small"
          class="compact full-table luxe-table"
          :cell-style="centerStyle"
          :header-cell-style="centerHeaderStyle"
          :row-class-name="zebra"
        >
          <el-table-column label="序号" width="100" align="center">
            <template #default="{ $index }">
              <span class="index-pill">{{ $index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="name" label="指标名称" :width="colWeight[0]" align="center">
            <template #default="{ row }">
              <div class="cell-chip"><span class="dot"></span>{{ row.name }}</div>
            </template>
          </el-table-column>

          <el-table-column label="权重条（可视化）" :width="colWeight[1]" align="center">
            <template #default="{ row }">
              <div class="bar-row">
                <div class="bar-bg glossy">
                  <div class="bar-fill" :style="{ width: (row.weight / maxWeight) * 100 + '%' }" :title="row.weight.toFixed(4)" />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="weight" label="权重数值" :width="colWeight[2]" align="center">
            <template #default="{ row }">
              <span class="w-num strong tone-blue">{{ row.weight.toFixed(4) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 表3：概念型隶属度 -->
        <div v-show="active === 'concept'" class="stack">
          <section class="subcard">
            <div class="sub-title">（1）地形部位 <span class="sub-tag">概念型</span></div>
            <el-table
              :data="tableTopo"
              border
              stripe
              size="small"
              class="compact full-table luxe-table"
              :cell-style="centerStyle"
              :header-cell-style="centerHeaderStyle"
              :row-class-name="zebra"
            >
              <el-table-column prop="category" label="地形部位" :width="colConcept[0]" align="center">
                <template #default="{ row }">
                  <div class="cell-chip"><span class="dot"></span>{{ row.category }}</div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度（可视化）" :width="colConcept[1]" align="center">
                <template #default="{ row }">
                  <div class="bar-row">
                    <div class="bar-bg glossy">
                      <div class="bar-fill bar-blue" :style="{ width: row.membership * 100 + '%' }" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度数值" :width="colConcept[2]" align="center">
                <template #default="{ row }">
                  <span class="w-num strong tone-blue">{{ (row.membership * 100).toFixed(0) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section class="subcard">
            <div class="sub-title">（2）耕层质地 <span class="sub-tag">概念型</span></div>
            <el-table
              :data="tableTexture"
              border
              stripe
              size="small"
              class="compact full-table luxe-table"
              :cell-style="centerStyle"
              :header-cell-style="centerHeaderStyle"
              :row-class-name="zebra"
            >
              <el-table-column prop="category" label="耕层质地" :width="colConcept[0]" align="center">
                <template #default="{ row }">
                  <div class="cell-chip"><span class="dot"></span>{{ row.category }}</div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度（可视化）" :width="colConcept[1]" align="center">
                <template #default="{ row }">
                  <div class="bar-row">
                    <div class="bar-bg glossy">
                      <div class="bar-fill bar-blue" :style="{ width: row.membership * 100 + '%' }" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度数值" :width="colConcept[2]" align="center">
                <template #default="{ row }">
                  <span class="w-num strong tone-blue">{{ (row.membership * 100).toFixed(0) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section class="subcard">
            <div class="sub-title">（3）质地构型 <span class="sub-tag">概念型</span></div>
            <el-table
              :data="tableStructure"
              border
              stripe
              size="small"
              class="compact full-table luxe-table"
              :cell-style="centerStyle"
              :header-cell-style="centerHeaderStyle"
              :row-class-name="zebra"
            >
              <el-table-column prop="category" label="质地构型" :width="colConcept[0]" align="center">
                <template #default="{ row }">
                  <div class="cell-chip"><span class="dot"></span>{{ row.category }}</div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度（可视化）" :width="colConcept[1]" align="center">
                <template #default="{ row }">
                  <div class="bar-row">
                    <div class="bar-bg glossy">
                      <div class="bar-fill bar-blue" :style="{ width: row.membership * 100 + '%' }" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度数值" :width="colConcept[2]" align="center">
                <template #default="{ row }">
                  <span class="w-num strong tone-blue">{{ (row.membership * 100).toFixed(0) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section class="subcard">
            <div class="sub-title">（4）水资源条件 <span class="sub-tag">概念型</span></div>
            <el-table
              :data="tableWater"
              border
              stripe
              size="small"
              class="compact full-table luxe-table"
              :cell-style="centerStyle"
              :header-cell-style="centerHeaderStyle"
              :row-class-name="zebra"
            >
              <el-table-column prop="category" label="水资源条件" :width="colConcept[0]" align="center">
                <template #default="{ row }">
                  <div class="cell-chip"><span class="dot"></span>{{ row.category }}</div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度（可视化）" :width="colConcept[1]" align="center">
                <template #default="{ row }">
                  <div class="bar-row">
                    <div class="bar-bg glossy">
                      <div class="bar-fill bar-blue" :style="{ width: row.membership * 100 + '%' }" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度数值" :width="colConcept[2]" align="center">
                <template #default="{ row }">
                  <span class="w-num strong tone-blue">{{ (row.membership * 100).toFixed(0) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section class="subcard">
            <div class="sub-title">（5）排水能力 <span class="sub-tag">概念型</span></div>
            <el-table
              :data="tableDrain"
              border
              stripe
              size="small"
              class="compact full-table luxe-table"
              :cell-style="centerStyle"
              :header-cell-style="centerHeaderStyle"
              :row-class-name="zebra"
            >
              <el-table-column prop="category" label="排水能力" :width="colConcept[0]" align="center">
                <template #default="{ row }">
                  <div class="cell-chip"><span class="dot"></span>{{ row.category }}</div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度（可视化）" :width="colConcept[1]" align="center">
                <template #default="{ row }">
                  <div class="bar-row">
                    <div class="bar-bg glossy">
                      <div class="bar-fill bar-blue" :style="{ width: row.membership * 100 + '%' }" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度数值" :width="colConcept[2]" align="center">
                <template #default="{ row }">
                  <span class="w-num strong tone-blue">{{ (row.membership * 100).toFixed(0) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </section>

          <section class="subcard">
            <div class="sub-title">（6）农田林网化程度 <span class="sub-tag">概念型</span></div>
            <el-table
              :data="tableNetwork"
              border
              stripe
              size="small"
              class="compact full-table luxe-table"
              :cell-style="centerStyle"
              :header-cell-style="centerHeaderStyle"
              :row-class-name="zebra"
            >
              <el-table-column prop="category" label="农田林网化程度" :width="colConcept[0]" align="center">
                <template #default="{ row }">
                  <div class="cell-chip"><span class="dot"></span>{{ row.category }}</div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度（可视化）" :width="colConcept[1]" align="center">
                <template #default="{ row }">
                  <div class="bar-row">
                    <div class="bar-bg glossy">
                      <div class="bar-fill bar-blue" :style="{ width: row.membership * 100 + '%' }" />
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="隶属度数值" :width="colConcept[2]" align="center">
                <template #default="{ row }">
                  <span class="w-num strong tone-blue">{{ (row.membership * 100).toFixed(0) }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>

        <!-- 表4：数值型参数 -->
        <el-table
          v-show="active === 'numeric'"
          :data="tableNumeric"
          border
          stripe
          size="small"
          class="compact full-table luxe-table"
          :header-cell-style="numericHeaderStyle"
          :cell-style="centerStyle"
          :row-class-name="zebra"
        >
          <el-table-column label="序号" width="100" align="center">
            <template #default="{ $index }">
              <span class="index-pill">{{ $index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="name" label="指标名称" :width="colNumeric[0]" align="center" />
          <el-table-column prop="funcType" label="函数类型" :width="colNumeric[1]" align="center" />
          <el-table-column label="函数表达" :width="colNumeric[2]" align="center">
            <template #default>
              <div class="math-only">
                <math display="inline">
                  <mi>y</mi>
                  <mo>=</mo>
                  <mfrac>
                    <mn>1</mn>
                    <mrow>
                      <mn>1</mn>
                      <mo>+</mo>
                      <mi>a</mi>
                      <mo>·</mo>
                      <msup>
                        <mrow>
                          <mo>(</mo>
                          <mi>u</mi>
                          <mo>−</mo>
                          <mi>c</mi>
                          <mo>)</mo>
                        </mrow>
                        <mn>2</mn>
                      </msup>
                    </mrow>
                  </mfrac>
                </math>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="a" label="a" :width="colNumeric[3]" align="center" />
          <el-table-column prop="c" label="c" :width="colNumeric[4]" align="center" />
          <el-table-column prop="umin" label="uₘᵢₙ" :width="colNumeric[5]" align="center" />
          <el-table-column prop="umax" label="uₘₐₓ" :width="colNumeric[6]" align="center" />
        </el-table>

        <!-- 新页：地力综合指数（IFI） -->
        <div v-show="active === 'ifi'" class="ifi-wrap">
          <!-- <h3 class="ifi-title">（四）计算耕地地力综合指数（IFI）</h3> -->
          <p class="ifi-text">利用加法模型计算耕地地力综合指数（IFI），公式如下：</p>

          <div class="formula-card">
            <div class="formula">
              <math display="block">
                <mrow>
                  <mi>IFI</mi>
                  <mo>=</mo>
                  <mrow>
                    <mo>∑</mo>
                    <msub>
                      <mi>F</mi>
                      <mi>i</mi>
                    </msub>
                    <mo>×</mo>
                    <msub>
                      <mi>C</mi>
                      <mi>i</mi>
                    </msub>
                  </mrow>
                </mrow>
              </math>
            </div>
            <div class="idx-note">（<span>i = 1, 2, 3, …, n</span>）</div>
          </div>

          <dl class="ifi-dl">
            <dt><b>IFI</b></dt>
            <dd>（Integrated Fertility Index）耕地地力指数。</dd>
            <dt>
              <b>F<sub>i</sub></b>
            </dt>
            <dd>第 <i>i</i> 个因素的评价评语（或隶属度）。</dd>
            <dt>
              <b>C<sub>i</sub></b>
            </dt>
            <dd>第 <i>i</i> 个因素的组合权重。</dd>
          </dl>

          <p class="ifi-foot">应用耕地资源管理信息系统中的模块计算，得出耕地地力综合指数 <b>IFI</b>。</p>
        </div>
      </div>

      <div v-show="active === 'level'">
        <el-table :data="levelData">
          <el-table-column prop="label1" label="耕地地力等级"></el-table-column>
          <el-table-column prop="ifi1" label="综合指数范围"></el-table-column>
          <el-table-column prop="label2" label="耕地地力等级"></el-table-column>
          <el-table-column prop="ifi2" label="综合指数范围"></el-table-column>
        </el-table>
        <div style="font-size: small; padding: 5px">注：评价因素及等级划分依据《第三次全国土壤普查耕地质量等级评价技术规范》</div>
      </div>

      <div v-if="active === 'numeric'" class="note">
        注：y为隶属度；a为系数；u为实测值；c为标准指标。当函数类型为戒上型，u小于等于下限值时， y
        为0；u大于等于上限值时，y为1；当函数类型为戒下型，u小于等于下限值时，y为1；u大于等于上
        限值时，y为0；当函数类型为峰型，u小于等于下限值或u大于等于上限值时，y为0。
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type TabKey = 'sys' | 'weight' | 'concept' | 'numeric' | 'ifi';

const tabs = [
  { key: 'sys', text: '耕地质量评价指标体系', color: '#0ea5e9' },
  { key: 'weight', text: '指标权重', color: '#22c55e' },
  { key: 'concept', text: '概念型指标', color: '#3b82f6' },
  { key: 'numeric', text: '数值型指标', color: '#8b5cf6' },
  { key: 'ifi', text: '地力综合指数 IFI', color: '#f59e0b' },
  { key: 'level', text: '陕西省地力等级划分指数', color: '#f59e0b' }
] as const;

const active = ref<TabKey>('sys');
const current = computed(() => tabs.find((t) => t.key === active.value)!);

/** 表1 */
// const tableSys = [
//   { target: '耕地质量', criterion: '立地条件', indicators: '地形部位、有效土层厚度、质地构造、海拔高度' },
//   { target: '耕地质量', criterion: '理化性状', indicators: '耕层质地、土壤容重、酸碱度' },
//   { target: '耕地质量', criterion: '养分状况', indicators: '有机质、有效磷、速效钾' },
//   { target: '耕地质量', criterion: '农田管理', indicators: '水资源条件、排水能力、农田林网化程度' }
// ]
// const colSys = [300, 340, 0]
const tableSys = [
  { target: '耕地质量', criterion: '立地条件', baseIndicators: '地形部位、有效土层厚度、质地构造', regionalIndicators: '海拔高度' },
  { target: '耕地质量', criterion: '理化性状', baseIndicators: '耕层质地、土壤容重', regionalIndicators: '酸碱度' },
  { target: '耕地质量', criterion: '养分状况', baseIndicators: '有机质、有效磷、速效钾', regionalIndicators: '-' },
  { target: '耕地质量', criterion: '农田管理', baseIndicators: '水资源条件、排水能力', regionalIndicators: '农田林网化程度' }
];
const colSys = [300, 200]; // 仅前两列的宽度，子列单独设置

const spanMethodSys = ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => {
  if (columnIndex === 0) return rowIndex === 0 ? { rowspan: tableSys.length, colspan: 1 } : { rowspan: 0, colspan: 0 };
};

/** 表2 */
const tableWeight = [
  { name: '水资源条件', weight: 0.1679 },
  { name: '地形部位', weight: 0.1564 },
  { name: '有机质', weight: 0.1097 },
  { name: '耕层质地', weight: 0.0778 },
  { name: '有效磷', weight: 0.074 },
  { name: '海拔高度', weight: 0.0734 },
  { name: '质地构造', weight: 0.0704 },
  { name: '有效土层厚度', weight: 0.0614 },
  { name: '速效钾', weight: 0.0604 },
  { name: '土壤容重', weight: 0.0428 },
  { name: '酸碱度', weight: 0.0385 },
  { name: '排水能力', weight: 0.0379 },
  { name: '农田林网化程度', weight: 0.0379 }
];
const maxWeight = Math.max(...tableWeight.map((v) => v.weight));
const colWeight = [280, 0, 170];

/** 表3：概念性指标 —— 按图重做 */
const tableTopo = [
  { category: '山间盆地', membership: 0.9 },
  { category: '富谷盆地', membership: 0.9 },
  { category: '低阶地', membership: 0.85 },
  { category: '中阶地', membership: 1.0 },
  { category: '高阶地', membership: 0.9 },
  { category: '丘陵上部', membership: 0.7 },
  { category: '丘陵中部', membership: 0.75 },
  { category: '丘陵下部', membership: 0.85 },
  { category: '山地坡上', membership: 0.6 },
  { category: '山地坡中', membership: 0.7 },
  { category: '山地坡下', membership: 0.8 },
  { category: '塬', membership: 0.8 }
];

/* 耕层质地（按图；你原来“粉(砂)质壤土=0.9”改成 1.0，其他按图常见口径）*/
const tableTexture = [
  { category: '壤土', membership: 1.0 },
  { category: '粉(砂)质壤土', membership: 1.0 }, // 图中标黄=1.0
  { category: '黏壤土', membership: 0.8 },
  { category: '粉(砂)质黏壤土', membership: 0.85 },
  { category: '粉(砂)质黏土', membership: 0.65 },
  { category: '砂质黏壤土', membership: 0.9 },
  { category: '砂质壤土', membership: 0.65 },
  { category: '壤质黏土', membership: 0.65 },
  { category: '黏土', membership: 0.6 },
  { category: '砂质黏土', membership: 0.7 },
  { category: '重黏土', membership: 0.5 },
  { category: '砂土及壤质砂土', membership: 0.4 }
];

/* 质地构型（图中一行） */
const tableStructure = [
  { category: '上松下紧型', membership: 1.0 },
  { category: '海绵型', membership: 0.9 }, // 图中标黄=0.9
  { category: '夹层型', membership: 0.6 },
  { category: '紧实型', membership: 0.65 },
  { category: '上紧下松型', membership: 0.7 },
  { category: '松散型', membership: 0.5 },
  { category: '薄层型', membership: 0.4 }
];

/* 水资源条件（图中一行） */
const tableWater = [
  { category: '充分满足', membership: 1.0 },
  { category: '满足', membership: 0.7 },
  { category: '基本满足', membership: 0.5 },
  { category: '不满足', membership: 0.3 }
];

/* 排水能力（图中一行） */
const tableDrain = [
  { category: '充分满足', membership: 1.0 },
  { category: '满足', membership: 0.7 },
  { category: '基本满足', membership: 0.5 },
  { category: '不满足', membership: 0.3 }
];

/* 农田林网化程度（图中一行） */
const tableNetwork = [
  { category: '高', membership: 1.0 },
  { category: '中', membership: 0.7 },
  { category: '低', membership: 0.4 } // 图中标黄=0.4
];

/* 列宽保持不变 */
const colConcept = [380, 0, 160];

/** 表4 */
const tableNumeric = [
  { name: '酸碱度', funcType: '峰型', a: 0.225097, c: 6.685037, umin: 0.4, umax: 13.0 },
  { name: '有机质', funcType: '戒上型', a: 0.006107, c: 27.680348, umin: 0, umax: 27.7 },
  { name: '速效钾', funcType: '戒上型', a: 0.000026, c: 293.758384, umin: 0, umax: 294 },
  { name: '有效磷', funcType: '戒上型', a: 0.001821, c: 38.076968, umin: 0, umax: 38.1 },
  { name: '土壤容重', funcType: '峰型', a: 13.854674, c: 1.250789, umin: 0.44, umax: 2.05 },
  { name: '有效土层厚度', funcType: '戒上型', a: 0.000232, c: 131.349274, umin: 0, umax: 131 },
  { name: '海拔高度', funcType: '戒下型', a: 0.000001, c: 649.407006, umin: 649.5, umax: 3649.4 }
];
const colNumeric = [240, 200, 360, 180, 180, 180, 220];

const levelData = [
  { label1: '一等', ifi1: '>= 0.8970', label2: '二等', ifi2: '0.8565 ～ 0.8970' },
  { label1: '三等', ifi1: '0.8160 ～ 0.8565', label2: '四等', ifi2: '0.7755 ～ 0.8160' },
  { label1: '五等', ifi1: '0.7350 ～ 0.7755', label2: '六等', ifi2: '0.6945 ～ 0.7350' },
  { label1: '七等', ifi1: '0.6540 ～ 0.6945', label2: '八等', ifi2: '0.6135 ～ 0.6540' },
  { label1: '九等', ifi1: '0.5730 ～ 0.6135', label2: '十等', ifi2: '< 0.5730' }
];

/** 样式辅助 */
const centerStyle = () => ({ textAlign: 'center' });
const centerHeaderStyle = () => ({ textAlign: 'center', fontWeight: 700 });
const numericHeaderStyle = () => ({ textAlign: 'center', fontWeight: 800, fontSize: '14px' });
const zebra = ({ rowIndex }: { rowIndex: number }) => (rowIndex % 2 === 0 ? 'row-even' : 'row-odd');
</script>

<style scoped>
/* ===== 背景与卡片 ===== */
.fancy-bg {
  background:
    radial-gradient(600px 200px at 10% -10%, rgba(99, 102, 241, 0.08), transparent 60%),
    radial-gradient(500px 260px at 90% 0%, rgba(16, 185, 129, 0.08), transparent 60%), linear-gradient(160deg, #f7f9fe 0%, #eef3ff 100%);
}

.page-wrap {
  padding: 12px;
  min-height: 100%;
}

.toolbar {
  margin: 2px 0 12px;
}

.seg {
  background: #ffffffc9;
  backdrop-filter: saturate(160%) blur(8px);
  border: 1px solid #e8eef7;
  border-radius: 999px;
  padding: 6px;
  box-shadow:
    0 6px 18px rgba(15, 23, 42, 0.06) inset,
    0 8px 18px rgba(15, 23, 42, 0.06);
}

.seg-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.seg-item:hover {
  background: #fff;
}

.seg-item.active {
  background: var(--el-color-primary);
  color: #fff;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

.seg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.glass-card {
  border: 1px solid #eaf0f7;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 10px 24px rgba(16, 24, 40, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-image: linear-gradient(90deg, #60a5fa 0, #22c55e 50%, #f59e0b 100%) 1;
  border-bottom: 2px solid transparent;
  padding-bottom: 6px;
}

.card-header .title {
  color: #0f172a;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 表格 ===== */
.table-wrap {
  max-height: 66vh;
  overflow: auto;
  border-radius: 12px;
}

.full-table {
  width: 100%;
}

:deep(.el-table.luxe-table) {
  --tbl-head-size: 15px;
  --tbl-body-size: 14.5px;
  --tbl-text: #0e1726;
  --tbl-head-text: #0b1220;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:deep(.el-table.luxe-table .el-table__header .cell) {
  font-size: var(--tbl-head-size) !important;
  color: var(--tbl-head-text);
  letter-spacing: 0.2px;
}

:deep(.el-table.luxe-table .el-table__header-wrapper th) {
  background: linear-gradient(180deg, #f9fbff 0%, #eef3ff 100%);
  border-bottom: 1px solid #e3e8f0;
  position: sticky;
  top: 0;
  z-index: 2;
}

:deep(.el-table.luxe-table .el-table__cell) {
  padding: 10px 12px !important;
}

:deep(.el-table.luxe-table .row-even td) {
  background: #fcfdff;
}

:deep(.el-table.luxe-table .row-odd td) {
  background: #ffffff;
}

:deep(.el-table.luxe-table .el-table__body tr:hover > td) {
  background: #f7fbff !important;
  box-shadow:
    inset 0 1px 0 #eef2ff,
    inset 0 -1px 0 #eef2ff;
}

:deep(.el-table.luxe-table .row-even td),
:deep(.el-table.luxe-table .row-odd td) {
  font-weight: 900;
  font-size: 13px;
}

/* 首列小徽章 */
.cell-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
  font-size: var(--tbl-body-size);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #93c5fd;
  box-shadow: 0 0 0 4px rgba(147, 197, 253, 0.2);
}

.dot-green {
  background: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.18);
}

/* 行号胶囊 & 数字 pill */
.index-pill {
  display: inline-block;
  min-width: 28px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 999px;
  background: #f3f6ff;
  color: #1e40af;
  font-weight: 700;
  box-shadow: inset 0 1px 0 #fff;
  font-size: 14px;
}

.w-num {
  display: inline-block;
  min-width: 74px;
  padding: 3px 10px;
  border-radius: 10px;
  background: #f1f5ff;
  font-weight: 800;
  letter-spacing: 0.2px;
  font-size: 14px;
}

.w-num.strong {
  background: #eef2ff;
}

.tone-blue {
  color: #1e3a8a;
}

.tone-green {
  color: #065f46;
}

/* ===== 柔和进度条 ===== */
.bar-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-bg {
  width: 96%;
  height: 10px;
  background: #e9eef5;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  box-shadow:
    inset 0 1px 2px rgba(15, 23, 42, 0.06),
    0 0 0 1px rgba(15, 23, 42, 0.03);
}

.bar-bg.glossy:after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.bar-fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #b8c7e6 0%, #7f95c7 100%);
  box-shadow: inset 0 1px 2px rgba(30, 58, 138, 0.16);
}

.bar-blue {
  background: linear-gradient(90deg, #b6d0f2 0%, #7ea2d6 100%);
}

@keyframes shimmer {
  0% {
    left: -45%;
  }

  100% {
    left: 105%;
  }
}

/* 子卡片 */
.stack {
  display: grid;
  gap: 14px;
}

.subcard {
  padding: 10px 12px;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.sub-title {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-tag {
  font-size: 12px;
  color: #2563eb;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 999px;
}

/* 数学公式 */
.math-only {
  display: flex;
  align-items: center;
  justify-content: center;
}

.math-only math {
  font-size: 18px;
}

/* IFI 页面样式 */
.ifi-wrap {
  padding: 12px;
}

.ifi-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}

.ifi-text {
  color: #334155;
  margin: 6px 0 10px;
}

.formula-card {
  background: #ffffff;
  border: 1px sol id #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04) inset;
  display: grid;
  gap: 0px;
  justify-items: center;
  margin-bottom: 12px;
}

.formula math {
  font-size: 18px;
}

.idx-note {
  color: #64748b;
  font-size: 13px;
}

.ifi-dl {
  margin: 6px 0 10px;
  display: grid;
  grid-template-columns: 100px 1fr;
  row-gap: 8px;
  column-gap: 8px;
  align-items: center;
}

.ifi-dl dt {
  text-align: right;
  color: #0f172a;
}

.ifi-dl dd {
  margin: 0;
  color: #1f2937;
}

.ifi-foot {
  color: #0f172a;
  margin-top: 8px;
}

/* 备注 */
.note {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
}

/* 响应式 */
@media (max-width: 768px) {
  .table-wrap {
    max-height: 62vh;
  }

  :deep(.el-table.luxe-table .el-table__cell) {
    padding: 8px 8px !important;
  }

  .math-only math {
    font-size: 16px;
  }

  .formula math {
    font-size: 28px;
  }

  .ifi-dl {
    grid-template-columns: 80px 1fr;
  }
}
</style>
