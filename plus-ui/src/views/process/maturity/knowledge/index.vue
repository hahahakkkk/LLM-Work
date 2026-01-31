<script setup lang="ts">
import { ref } from 'vue';

// 定义阶段类型
type GrowthStage = {
  title: string;
  definition: string;
  features: string[];
  phenotypicData: Record<string, string>;
  // 新增图片URL字段
  imageUrl: string;
};

// 各阶段数据 - 添加图片URL
const stages: GrowthStage[] = [
  {
    title: '乳熟期',
    definition:
      ' 乳熟期是指谷子籽粒开始进入成熟阶段，谷子籽粒中的乳状物质开始逐渐凝固，籽粒逐渐变硬，颜色也由绿色逐渐变为黄色，但尚未完全成熟的时期。',
    features: [
      '谷粒特征：谷粒开始灌浆，内容物呈乳白色浆状，淀粉不断积累，干重和鲜重持续增加。颖壳可能开始变色，但还未完全变黄，谷穗部分断青，籽粒较软，未达到完全的硬度。',
      '含水量：谷粒含水量约为18%-25%，相对较高。',
      '植株特征：谷穗可能部分变黄，但整体颜色还不均匀，茎秆和叶片的含水量较高，尚未完全脱水。',
      '收获效果：由于谷粒含水量较高，籽粒较软，因此这一阶段通常不适合收获。'
    ],
    phenotypicData: {
      '谷粒含水率': '高于16%',
      '谷粒硬度': '硬度增加，挤压变形',
      '糖分': '淀粉约20%，可溶性糖约10%',
      '谷穗形态特征': '谷粒呈乳白色，未完全饱满',
      '叶绿素（SPAD值）': '> 40（高）',
      '植株形态特征': '茎叶绿色，植株健壮'
    },
    // 新增图片URL - 实际路径请替换为您的图片路径
    imageUrl: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507032000863.png'
  },
  {
    title: '蜡熟期',
    definition:
      '蜡熟期是指谷子籽粒内部的乳状物质已经基本凝固，但籽粒尚未完全硬化，呈现出一种蜡质状的外观和质地的时期。此时，谷子的生理成熟过程仍在继续，籽粒内部的物质仍在进行转化和积累的时期。',
    features: [
      '谷粒特征：谷子的颖壳开始变黄，谷穗断青，籽粒变硬，子粒背面颖壳呈现灰白色，即所谓的"挂灰"。',
      '含水量：谷粒含水量约为13%-16%。',
      '植株特征：谷穗基本完全变黄，茎秆和叶片大部分脱水，含水率降低。',
      '收获效果：此时机械收获的总损失率最小（4.81%），破碎率较低（0.67%），适合机械化收获。'
    ],
    phenotypicData: {
      '谷粒含水率': '13%-16%',
      '谷粒硬度': '籽粒坚硬且不易捏碎',
      '糖分': '淀粉约40%，可溶性糖约5%',
      '谷穗形态特征': '谷粒饱满，谷壳逐渐变黄',
      '叶绿素（SPAD值）': '15-40（中等）',
      '植株形态特征': '茎叶黄色，植株开始枯萎'
    },
    // 新增图片URL
    imageUrl: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507032004095.png'
  },
  {
    title: '完熟期',
    definition:
      ' 完熟期是指谷子籽粒的生理成熟过程已经完成，籽粒内部的物质积累达到最大值，谷粒的干物质含量达到最高，谷粒的质地完全硬化，谷壳也完全变干的时期。',
    features: [
      '谷粒特征：颖壳完全变黄，谷穗完全断青，籽粒更加坚硬，含水量进一步降低。',
      '含水量：谷粒含水量通常低于13%，适合长期储存。',
      '植株特征：茎秆和叶片逐渐干枯，谷穗完全成熟。',
      '收获效果：完熟期的谷子破碎率最低，但总损失率和含杂率较高，因为穗粒含水量过低，容易落粒，导致机械收获时损失增加。'
    ],
    phenotypicData: {
      '谷粒含水率': '低于13%',
      '谷粒硬度': '过硬籽粒开裂',
      '糖分': '淀粉约60%，可溶性糖约2%',
      '谷穗形态特征': '谷壳完全变黄，谷粒干硬',
      '叶绿素（SPAD值）': '< 15（低）',
      '植株形态特征': '茎叶枯黄，植株完全枯萎'
    },
    // 新增图片URL
    imageUrl: 'https://xxs-img.oss-cn-hangzhou.aliyuncs.com/img202507032004083.png'
  }
];

const currentStage = ref<GrowthStage>(stages[0]);
</script>

<template>
  <div class="growth-stage-container">
    <!-- 导航区域 -->
    <div class="stage-nav">
      <button v-for="stage in stages" :key="stage.title" :class="{ active: currentStage.title === stage.title }" @click="currentStage = stage">
        {{ stage.title }}
      </button>
    </div>

    <!-- 内容展示区域 -->
    <div class="stage-content">
      <h2>{{ currentStage.title }}</h2>

      <!-- 修改为两栏布局 -->
      <div class="content-grid">
        <!-- 左侧：定义和特征 -->
        <div class="text-content">
          <div class="definition-section">
            <h3>定义</h3>
            <p>{{ currentStage.definition }}</p>
          </div>

          <div class="features-section">
            <h3>特征</h3>
            <ul>
              <li v-for="(feature, index) in currentStage.features" :key="index">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 右侧：图片 -->
        <div class="image-section">
          <h3>图示</h3>
          <div class="image-container">
            <!-- 使用动态图片路径 -->
            <img :src="currentStage.imageUrl" :alt="`${currentStage.title}示意图`" />
            <p class="image-caption">{{ currentStage.title }}植株形态示意图</p>
          </div>
        </div>
      </div>

      <!-- 表型数据保持原位置 -->
      <div class="data-section">
        <h3>植株表型数据</h3>
        <table>
          <thead>
            <tr>
              <th>项目</th>
              <th>数据</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in currentStage.phenotypicData" :key="key">
              <td>{{ key }}</td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.growth-stage-container {
  max-width: 80%;
  margin: 0 auto;
  padding: 20px;
}

.stage-nav {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;

  button {
    padding: 10px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f5f5f5;
    }

    &.active {
      border-bottom: 3px solid #4caf50;
      font-weight: bold;
      color: #4caf50;
    }
  }
}

.stage-content {
  h2 {
    color: #2c3e50;
    margin-bottom: 20px;
  }

  // 新增网格布局
  .content-grid {
    display: grid;
    grid-template-columns: 60% 40%;
    gap: 20px;
    margin-bottom: 5px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .text-content {
    .definition-section,
    .features-section {
      margin-bottom: 25px;

      h3 {
        color: #34495e;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
      }
    }

    ul {
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }
  }

  .image-section {
    h3 {
      color: #34495e;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }

    .image-container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 5px;
      text-align: center;

      img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 4px;
      }

      .image-caption {
        margin-top: 5px;
        font-size: 14px;
        color: #666;
        font-style: italic;
      }
    }
  }

  .data-section {
    margin-bottom: 25px;

    h3 {
      color: #34495e;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;

      th,
      td {
        padding: 10px 15px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      th {
        background-color: #f8f9fa;
        font-weight: 600;
      }

      tr:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
