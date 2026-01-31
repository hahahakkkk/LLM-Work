<template>
  <div class="pest-disease-display-container">
    <div class="pest-disease-display-content">
      <!-- 病虫害选择按钮 -->
      <div class="pest-buttons-section">
        <div class="buttons-grid">
          <!-- 粟灰螟 -->
          <div class="button-wrapper">
            <el-button :type="selectedPest === '粟灰螟' ? 'primary' : 'default'" size="small" @click="selectPest('粟灰螟')"> 粟灰螟 </el-button>
            <!-- 粟灰螟二级按钮 -->
            <div class="sub-buttons">
              <el-button
                v-for="symptom in ['叶片症状', '虫子症状']"
                :key="symptom"
                type="warning"
                size="small"
                @click="selectCornBorerSymptom(symptom)"
              >
                {{ symptom }}
              </el-button>
            </div>
          </div>

          <!-- 白发病 -->
          <div class="button-wrapper">
            <el-button :type="selectedPest === '白发病' ? 'primary' : 'default'" size="small" @click="selectPest('白发病')"> 白发病 </el-button>
            <!-- 白发病二级按钮 -->
            <div class="sub-buttons">
              <el-button
                v-for="stage in ['水渍', '灰背', '枪杆', '刺头']"
                :key="stage"
                type="warning"
                size="small"
                @click="selectWhiteBlightStage(stage)"
              >
                {{ stage }}
              </el-button>
            </div>
          </div>

          <!-- 负泥虫 -->
          <div class="button-wrapper">
            <el-button :type="selectedPest === '负泥虫' ? 'primary' : 'default'" size="small" @click="selectPest('负泥虫')"> 负泥虫 </el-button>
            <!-- 负泥虫二级按钮 -->
            <div class="sub-buttons">
              <el-button
                v-for="symptom in ['叶片症状', '虫子症状']"
                :key="symptom"
                type="warning"
                size="small"
                @click="selectMudBeetleSymptom(symptom)"
              >
                {{ symptom }}
              </el-button>
            </div>
          </div>

          <!-- 叶斑病 -->
          <el-button :type="selectedPest === '叶斑病' ? 'primary' : 'default'" size="small" @click="selectPest('叶斑病')"> 叶斑病 </el-button>
        </div>
      </div>

      <!-- 病虫害详情展示 -->
      <div v-if="shouldShowDetails" class="pest-detail-section">
        <div class="detail-card">
          <!-- 轮播图区域 -->
          <div class="carousel-section">
            <el-carousel :height="carouselHeight" indicator-position="outside" :autoplay="true" :interval="1500" @change="handleCarouselChange">
              <el-carousel-item v-for="(item, index) in currentImages" :key="index">
                <div class="carousel-image">
                  <img v-if="item.image" :src="item.image" :alt="`${selectedPest}-${item.stageName}`" />
                  <div v-else class="image-placeholder">
                    <el-icon class="placeholder-icon"><Warning /></el-icon>
                    <div class="stage-info">
                      <span class="stage-name">{{ item.stageName }}</span>
                      <span class="placeholder-text">图片待更新</span>
                    </div>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>

          <!-- 精简信息 -->
          <div v-if="currentStage" class="info-section">
            <div class="pest-header">
              <span class="pest-name">
                {{ selectedPest }}
                <span v-if="selectedPest === '白发病' && selectedWhiteBlightStage">·{{ currentStage.stageName }}</span>
                <span v-else-if="selectedPest === '粟灰螟' && selectedCornBorerSymptom">·{{ currentStage.stageName }}</span>
                <span v-else-if="selectedPest === '负泥虫' && selectedMudBeetleSymptom">·{{ currentStage.stageName }}</span>
              </span>
              <el-tag :type="getPestTypeTagType()" size="small">{{ getPestTypeLabel() }}</el-tag>
              <el-tag v-if="isPestWithPeriod" type="success" size="small">{{ currentPeriod }}</el-tag>
            </div>

            <!-- New section for Description and Characteristics for '粟灰螟' and '负泥虫' -->
            <div v-if="(selectedPest === '粟灰螟' || selectedPest === '负泥虫') && currentStage" class="additional-info-section">
              <div v-if="currentStage.description" class="description-block">
                <h5 class="info-title">描述:</h5>
                <p class="info-content">{{ currentStage.description }}</p>
              </div>
              <div v-if="currentStage.characteristics && currentStage.characteristics.length > 0" class="characteristics-block">
                <h5 class="info-title">特征:</h5>
                <ul class="info-list">
                  <li v-for="(char, charIndex) in currentStage.characteristics" :key="charIndex">{{ char }}</li>
                </ul>
              </div>
            </div>
            <!-- End of new section -->

            <div class="prevention-methods">
              <!-- 白发病和叶斑病的分级防治 -->
              <div
                v-if="
                  (selectedPest === '白发病' && selectedWhiteBlightStage && typeof currentStage.preventionMethods === 'object') ||
                  (selectedPest === '叶斑病' && typeof currentStage.preventionMethods === 'object')
                "
              >
                <div v-for="(methods, severity) in currentStage.preventionMethods" :key="severity" class="severity-item">
                  <span class="severity-badge" :class="getSeverityClass(String(severity))">{{ severity }}</span>
                  <p>{{ (methods as string[])[0] }}</p>
                </div>
              </div>
              <!-- 其他病虫害的防治 -->
              <div v-else-if="Array.isArray(currentStage.preventionMethods)" class="simple-methods-list">
                <h5 class="info-title">防治方法:</h5>
                <ul class="info-list">
                  <li v-for="(method, methodIndex) in currentStage.preventionMethods" :key="methodIndex">{{ method }}</li>
                </ul>
              </div>
              <p v-else-if="typeof currentStage.preventionMethods === 'string'" class="simple-method">{{ currentStage.preventionMethods }}</p>
              <p v-else class="simple-method"></p>
              <!-- Fallback for unexpected types -->
            </div>
          </div>
        </div>
      </div>

      <!-- 未选择时的提示 -->
      <div v-else class="no-selection">
        <el-icon class="hint-icon"><InfoFilled /></el-icon>
        <p>请选择一种病虫害查看详细信息</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Warning, InfoFilled } from '@element-plus/icons-vue';

// 病虫害数据结构
interface PestStage {
  stageName: string;
  description: string;
  characteristics: string[];
  preventionMethods: string[] | { [key: string]: string[] };
  image?: string;
  images?: string[];
  period?: string; // 添加生育期字段
}

interface WhiteBlightStage {
  stageName: string;
  period: string;
  description: string;
  characteristics: string[];
  preventionMethods: { [key: string]: string[] };
  images: string[];
}

interface SymptomStage {
  stageName: string;
  description: string;
  characteristics: string[];
  preventionMethods: string[];
  images: string[];
}

interface PestDiseaseData {
  type: 'pest' | 'disease';
  overview: string;
  stages: PestStage[];
}

// 病虫害详细数据
const pestData: Record<string, PestDiseaseData> = {
  '粟灰螟': {
    type: 'pest',
    overview: '粟灰螟是一种重要的禾谷类作物害虫，主要危害玉米、高粱等作物。',
    stages: [
      {
        stageName: '卵期',
        description: '成虫产卵在叶片背面，卵期约5-7天',
        characteristics: ['卵呈椭圆形，初产时为白色', '后期变为淡黄色', '卵块排列整齐'],
        preventionMethods: ['人工摘除卵块', '释放卵寄生蜂', '喷施生物制剂']
      },
      {
        stageName: '幼虫期',
        description: '幼虫钻蛀茎秆，是危害最严重的阶段',
        characteristics: ['初龄幼虫群集危害', '老龄幼虫钻蛀茎秆', '造成枯心或折断'],
        preventionMethods: ['化学防治喷洒杀虫剂', '生物防治释放天敌', '物理防治诱虫灯']
      },
      {
        stageName: '蛹期',
        description: '幼虫老熟后在茎秆内化蛹',
        characteristics: ['蛹呈褐色', '蛹期约10-15天', '在茎秆内越冬'],
        preventionMethods: ['冬季清除残茬', '深翻土壤', '破坏越冬场所']
      }
    ]
  },
  '白发病': {
    type: 'disease',
    overview: '白发病是一种真菌性病害，主要在高温高湿环境下发生。',
    stages: [
      {
        stageName: '灰背期',
        description: '病害初期，叶片背面出现灰白色霉层',
        characteristics: ['叶片背面有灰白色霉状物', '叶片正面出现黄色斑点', '湿度大时霉层明显'],
        preventionMethods: ['及时摘除病叶', '增强通风透光', '喷施保护性杀菌剂']
      },
      {
        stageName: '枪杆期',
        description: '病害发展期，茎秆受到感染',
        characteristics: ['茎秆出现白色霉层', '节间变短变粗', '植株矮化明显'],
        preventionMethods: ['化学防治杀菌剂', '调节田间湿度', '加强肥水管理']
      },
      {
        stageName: '刺头期',
        description: '病害严重期，穗部严重受害',
        characteristics: ['穗部完全被白色霉层覆盖', '不能正常抽穗', '严重影响产量'],
        preventionMethods: ['及时拔除病株', '土壤消毒处理', '选用抗病品种']
      }
    ]
  },
  '负泥虫': {
    type: 'pest',
    overview: '负泥虫是一种叶食性害虫，成虫和幼虫均可危害作物叶片。',
    stages: [
      {
        stageName: '成虫期',
        description: '成虫取食叶片，造成孔洞',
        characteristics: ['成虫体长约5-8mm', '取食叶片造成孔洞', '活动能力强'],
        preventionMethods: ['人工捕捉', '震落收集', '喷施杀虫剂']
      },
      {
        stageName: '幼虫期',
        description: '幼虫群集危害，食量大',
        characteristics: ['幼虫群集取食', '背负分泌物', '食量大危害重'],
        preventionMethods: ['生物农药防治', '保护天敌', '适时用药']
      },
      {
        stageName: '蛹期',
        description: '在土壤中化蛹',
        characteristics: ['在土壤中化蛹', '蛹期约7-10天', '对环境要求高'],
        preventionMethods: ['土壤处理', '深翻晒土', '破坏蛹室']
      }
    ]
  },
  '叶斑病': {
    type: 'disease',
    overview: '叶斑病是常见的叶部病害，主要在出苗期和拔节期发生。',
    stages: [
      {
        stageName: '叶斑病症状',
        period: '出苗期至拔节期',
        description: '叶片出现圆形或椭圆形病斑，初期小型，后期扩大连片',
        characteristics: ['叶片出现圆形小斑点', '病斑边缘清晰褐色', '中央灰白色', '严重时病斑连片'],
        preventionMethods: {
          '轻度（少量斑点）': ['施用充分腐熟有机肥、改善田间条件', '如需药剂，初期可用 36% 甲基硫菌灵 500–600 倍液 点喷'],
          '中度（多片叶有斑、扩展）': [
            '选用 36% 甲基硫菌灵 500–600 倍 做全株喷雾',
            '或 50% 苯菌灵 1500 倍 做全株喷雾',
            '或 60% 防霉宝 800 倍 做全株喷雾'
          ],
          '重度（叶部大片病变）': [
            '50% 琥胶肥酸铜 500 倍，隔 ~10 天喷 1 次，连续 2–3 次',
            '30% 碱式硫酸铜 400 倍，隔 ~10 天喷 1 次，连续 2–3 次',
            '47% 加瑞农 700 倍，隔 ~10 天喷 1 次，连续 2–3 次',
            '12% 绿乳铜 600 倍，隔 ~10 天喷 1 次，连续 2–3 次'
          ]
        },
        images: [
          'http://172.25.23.186:9000/know-bkt/2025/pest-disease/leaf-spot/image1.jpg',
          'http://172.25.23.186:9000/know-bkt/2025/pest-disease/leaf-spot/image2.jpg',
          'http://172.25.23.186:9000/know-bkt/2025/pest-disease/leaf-spot/image3.jpg',
          'http://172.25.23.186:9000/know-bkt/2025/pest-disease/leaf-spot/image4.jpg',
          'http://172.25.23.186:9000/know-bkt/2025/pest-disease/leaf-spot/image5.jpg'
        ]
      }
    ]
  }
};

// 白发病的四个具体阶段数据
const whiteBlightStages: Record<string, WhiteBlightStage> = {
  '水渍': {
    stageName: '水渍',
    period: '出苗期',
    description: '水渍状病斑出现在叶片上',
    characteristics: ['叶片出现水渍状病斑', '病斑透明发亮', '湿度大时明显'],
    preventionMethods: {
      '轻度': ['进行种子处理：用50%苯来特或50%多菌灵可湿性粉剂，按种子重量的0.3%拌种', '拔除病株，烧毁或深埋，防止病菌继续浸染为害'],
      '中度': ['甲霜·霜霉威 25% 可湿性粉剂 100g/亩，兑水30-40kg全田或病区喷雾'],
      '重度': [
        '选用甲霜霜霉威25％可湿性粉剂100g/亩',
        '45%戊唑·咪鲜胺水乳剂25ml/亩',
        '5%高效氯氟氰菊酯微乳剂25ml/亩',
        '0.01%芸苔素内酯可溶液剂10ml/亩',
        '98%磷酸二氢钾100g/亩作为应急防控药剂组合',
        '严重病株建议整株拔除并烧毁或深埋'
      ]
    },
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/water-stain/image1.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/water-stain/image2.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/water-stain/image3.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/water-stain/image4.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/water-stain/image5.JPG'
    ]
  },
  '灰背': {
    stageName: '灰背',
    period: '拔节期至抽穗期',
    description: '叶片背面出现灰白色霉层',
    characteristics: ['叶片背面有灰白色霉状物', '叶片正面出现黄色斑点', '湿度大时霉层明显'],
    preventionMethods: {
      '轻度': ['以磷酸二氢钾 + 芸苔素做叶面调理', '加强田间通风排水', '拔除零星病株'],
      '中度': ['甲霜·霜霉威 25% 100g/亩 做叶面防治', '或 戊唑·咪鲜胺 45% 25ml/亩 做叶面防治'],
      '重度': [
        '应急组合：甲霜·霜霉威100g/亩、戊唑·咪鲜胺25ml/亩',
        '5%高效氯氟氰菊酯25ml/亩、芸苔素10ml/亩',
        '磷酸二氢钾100g/亩 视情复配或分次喷施',
        '对严重病区拔除病穗或整株以阻断传播',
        '注意：甲霜灵类长期单剂易诱抗性，要注意与其他作用机制药轮换'
      ]
    },
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gray-back/image1.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gray-back/image2.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gray-back/image3.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gray-back/image4.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gray-back/image5.JPG'
    ]
  },
  '枪杆': {
    stageName: '枪杆',
    period: '抽穗期',
    description: '茎秆受到感染，出现白色霉层',
    characteristics: ['茎秆出现白色霉层', '节间变短变粗', '植株矮化明显'],
    preventionMethods: {
      '轻度': ['以磷酸二氢钾 + 芸苔素做叶面调理', '加强田间通风排水', '拔除零星病株'],
      '中度': ['甲霜·霜霉威 25% 100g/亩 做叶面防治', '或 戊唑·咪鲜胺 45% 25ml/亩 做叶面防治'],
      '重度': [
        '应急组合：甲霜·霜霉威100g/亩、戊唑·咪鲜胺25ml/亩',
        '5%高效氯氟氰菊酯25ml/亩、芸苔素10ml/亩',
        '磷酸二氢钾100g/亩 视情复配或分次喷施',
        '对严重病区拔除病穗或整株以阻断传播',
        '注意：甲霜灵类长期单剂易诱抗性，要注意与其他作用机制药轮换'
      ]
    },
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gun-rod/image1.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gun-rod/image2.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gun-rod/image3.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gun-rod/image4.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/gun-rod/image5.jpg'
    ]
  },
  '刺头': {
    stageName: '刺头',
    period: '灌浆期至成熟期',
    description: '穗部严重受害，完全被霉层覆盖',
    characteristics: ['穗部完全被白色霉层覆盖', '不能正常抽穗', '严重影响产量'],
    preventionMethods: {
      '轻度': ['以磷酸二氢钾 + 芸苔素做叶面调理', '加强田间通风排水', '拔除零星病株'],
      '中度': ['甲霜·霜霉威 25% 100g/亩 做叶面防治', '或 戊唑·咪鲜胺 45% 25ml/亩 做叶面防治'],
      '重度': [
        '应急组合：甲霜·霜霉威100g/亩、戊唑·咪鲜胺25ml/亩',
        '5%高效氯氟氰菊酯25ml/亩、芸苔素10ml/亩',
        '磷酸二氢钾100g/亩 视情复配或分次喷施',
        '对严重病区拔除病穗或整株以阻断传播',
        '注意：甲霜灵类长期单剂易诱抗性，要注意与其他作用机制药轮换'
      ]
    },
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/thorn-head/image1.jpeg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/thorn-head/image2.jpeg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/thorn-head/image3.jpeg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/thorn-head/image4.jpeg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/white-blight/thorn-head/image5.jpeg'
    ]
  }
};

// 粟灰螟症状数据
const cornBorerSymptoms: Record<string, SymptomStage> = {
  '叶片症状': {
    stageName: '叶片症状',
    description: '粟灰螟危害导致的叶片症状表现',
    characteristics: ['叶片出现虫孔', '边缘不规则缺刻', '被害叶片枯黄'],
    preventionMethods: ['及时清除被害叶片', '喷施杀虫剂防治', '加强田间管理'],
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/leaf-symptoms/image1.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/leaf-symptoms/image2.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/leaf-symptoms/image3.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/leaf-symptoms/image4.jpg'
    ]
  },
  '虫子症状': {
    stageName: '虫子症状',
    description: '粟灰螟虫体特征和危害行为',
    characteristics: ['幼虫呈灰褐色', '头部黑色明显', '钻蛀茎秆内部'],
    preventionMethods: ['生物防治释放天敌', '化学防治药剂喷施', '物理防治诱虫灯'],
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/insect-symptoms/image1.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/insect-symptoms/image2.JPG',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/insect-symptoms/image3.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/insect-symptoms/image4.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/corn-borer/insect-symptoms/image5.jpg'
    ]
  }
};

// 负泥虫症状数据
const mudBeetleSymptoms: Record<string, SymptomStage> = {
  '叶片症状': {
    stageName: '叶片症状',
    description: '负泥虫取食造成的叶片损伤',
    characteristics: ['叶片出现圆形孔洞', '取食痕迹明显', '严重时叶片网状'],
    preventionMethods: ['人工捕捉成虫', '药剂防治幼虫', '清理田间杂草'],
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/leaf-symptoms/image1.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/leaf-symptoms/image2.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/leaf-symptoms/image3.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/leaf-symptoms/image4.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/leaf-symptoms/image5.jpg'
    ]
  },
  '虫子症状': {
    stageName: '虫子症状',
    description: '负泥虫成虫和幼虫的形态特征',
    characteristics: ['成虫椭圆形黑色', '幼虫背负分泌物', '群集危害明显'],
    preventionMethods: ['震落捕捉成虫', '保护天敌昆虫', '适时药剂防治'],
    images: [
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/insect-symptoms/image1.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/insect-symptoms/image2.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/insect-symptoms/image3.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/insect-symptoms/image4.jpg',
      'http://172.25.23.186:9000/know-bkt/2025/pest-disease/mud-beetle/insect-symptoms/image5.jpg'
    ]
  }
};

// 当前选中的病虫害（默认选择白发病）
const selectedPest = ref('白发病');

// 当前选中的白发病阶段（默认选择水渍）
const selectedWhiteBlightStage = ref('水渍');

// 当前选中的粟灰螟症状类型
const selectedCornBorerSymptom = ref('');

// 当前选中的负泥虫症状类型
const selectedMudBeetleSymptom = ref('');

// 当前选中的阶段索引
const currentStageIndex = ref(0);

// 轮播图高度（放大）
const carouselHeight = ref('320px');

// 当前病虫害数据
const currentPestData = computed(() => {
  return selectedPest.value ? pestData[selectedPest.value as keyof typeof pestData] : null;
});

// 是否显示详情
const shouldShowDetails = computed(() => {
  if (selectedPest.value === '白发病') {
    return selectedWhiteBlightStage.value !== '';
  }
  if (selectedPest.value === '粟灰螟') {
    return selectedCornBorerSymptom.value !== '';
  }
  if (selectedPest.value === '负泥虫') {
    return selectedMudBeetleSymptom.value !== '';
  }
  if (selectedPest.value === '叶斑病') {
    return true; // 叶斑病直接显示
  }
  return false;
});

// 当前阶段数据
const currentStage = computed((): WhiteBlightStage | SymptomStage | PestStage | null => {
  // 如果是白发病且选择了具体阶段，返回白发病阶段数据
  if (selectedPest.value === '白发病' && selectedWhiteBlightStage.value) {
    return whiteBlightStages[selectedWhiteBlightStage.value as keyof typeof whiteBlightStages];
  }

  // 如果是粟灰螟且选择了症状类型
  if (selectedPest.value === '粟灰螟' && selectedCornBorerSymptom.value) {
    return cornBorerSymptoms[selectedCornBorerSymptom.value as keyof typeof cornBorerSymptoms];
  }

  // 如果是负泥虫且选择了症状类型
  if (selectedPest.value === '负泥虫' && selectedMudBeetleSymptom.value) {
    return mudBeetleSymptoms[selectedMudBeetleSymptom.value as keyof typeof mudBeetleSymptoms];
  }

  // 叶斑病的正常逻辑
  if (!currentPestData.value || !currentPestData.value.stages[currentStageIndex.value]) {
    return null;
  }
  return currentPestData.value.stages[currentStageIndex.value];
});

// 当前轮播图片
const currentImages = computed(() => {
  // 如果是白发病且选择了具体阶段
  if (selectedPest.value === '白发病' && selectedWhiteBlightStage.value) {
    const stageData = whiteBlightStages[selectedWhiteBlightStage.value as keyof typeof whiteBlightStages];
    return stageData.images.length > 0
      ? stageData.images.map((img, index) => ({ image: img, stageName: stageData.stageName, index }))
      : [
          { image: null, stageName: stageData.stageName, index: 0 },
          { image: null, stageName: stageData.stageName, index: 1 },
          { image: null, stageName: stageData.stageName, index: 2 }
        ];
  }

  // 如果是粟灰螟且选择了症状类型
  if (selectedPest.value === '粟灰螟' && selectedCornBorerSymptom.value) {
    const symptomData = cornBorerSymptoms[selectedCornBorerSymptom.value as keyof typeof cornBorerSymptoms];
    return symptomData.images.length > 0
      ? symptomData.images.map((img, index) => ({ image: img, stageName: symptomData.stageName, index }))
      : [{ image: null, stageName: symptomData.stageName, index: 0 }];
  }

  // 如果是负泥虫且选择了症状类型
  if (selectedPest.value === '负泥虫' && selectedMudBeetleSymptom.value) {
    const symptomData = mudBeetleSymptoms[selectedMudBeetleSymptom.value as keyof typeof mudBeetleSymptoms];
    return symptomData.images.length > 0
      ? symptomData.images.map((img, index) => ({ image: img, stageName: symptomData.stageName, index }))
      : [{ image: null, stageName: symptomData.stageName, index: 0 }];
  }

  // 叶斑病的正常逻辑
  if (!currentPestData.value) return [];

  // 如果当前阶段有 images 数组（如叶斑病），使用 images 数组
  const currentStage = currentPestData.value.stages[currentStageIndex.value];
  if (currentStage && currentStage.images && currentStage.images.length > 0) {
    return currentStage.images.map((img, index) => ({
      image: img,
      stageName: currentStage.stageName,
      index
    }));
  }

  // 否则使用原有逻辑（单张图片）
  return currentPestData.value.stages.map((stage, index) => ({
    image: stage.image || null,
    stageName: stage.stageName,
    index
  }));
});

// 选择病虫害
const selectPest = (pestName: string) => {
  selectedPest.value = pestName;
  selectedWhiteBlightStage.value = ''; // 重置白发病阶段选择
  selectedCornBorerSymptom.value = ''; // 重置粟灰螟症状选择
  selectedMudBeetleSymptom.value = ''; // 重置负泥虫症状选择
  currentStageIndex.value = 0;
};

// 选择白发病阶段
const selectWhiteBlightStage = (stageName: string) => {
  selectedPest.value = '白发病'; // 确保设置主病虫害
  selectedWhiteBlightStage.value = stageName;
  currentStageIndex.value = 0;
};

// 选择粟灰螟症状类型
const selectCornBorerSymptom = (symptomType: string) => {
  selectedPest.value = '粟灰螟'; // 确保设置主病虫害
  selectedCornBorerSymptom.value = symptomType;
  currentStageIndex.value = 0;
};

// 选择负泥虫症状类型
const selectMudBeetleSymptom = (symptomType: string) => {
  selectedPest.value = '负泥虫'; // 确保设置主病虫害
  selectedMudBeetleSymptom.value = symptomType;
  currentStageIndex.value = 0;
};

// 轮播图切换事件
const handleCarouselChange = (index: number) => {
  // 对于叶斑病，轮播图切换的是图片索引，不需要改变 currentStageIndex
  // 对于其他病虫害，轮播图切换的是阶段索引
  if (selectedPest.value === '叶斑病') {
    // 叶斑病只有一个阶段，轮播图显示的是不同图片，不需要改变阶段索引
    return;
  }

  // 其他病虫害的轮播图对应不同阶段
  currentStageIndex.value = index;
};

// 获取严重程度样式类
const getSeverityClass = (severity: string) => {
  if (severity.includes('轻度')) return 'severity-light';
  if (severity.includes('中度')) return 'severity-medium';
  if (severity.includes('重度')) return 'severity-heavy';
  return '';
};

// 获取病虫害类型标签样式
const getPestTypeTagType = () => {
  if (selectedPest.value === '粟灰螟' || selectedPest.value === '负泥虫') {
    return 'warning'; // 虫害用警告色
  }
  return 'info'; // 病害用信息色
};

// 获取病虫害类型标签文本
const getPestTypeLabel = () => {
  if (selectedPest.value === '粟灰螟' || selectedPest.value === '负泥虫') {
    return '虫害';
  }
  return '病害';
};

// 判断当前病虫害是否有生育期信息
const isPestWithPeriod = computed(() => {
  return (
    ((selectedPest.value === '白发病' && selectedWhiteBlightStage.value) || selectedPest.value === '叶斑病') &&
    currentStage.value &&
    'period' in currentStage.value
  );
});

// 获取当前病虫害的生育期
const currentPeriod = computed(() => {
  if (isPestWithPeriod.value && currentStage.value && 'period' in currentStage.value) {
    return (currentStage.value as WhiteBlightStage | PestStage).period;
  }
  return '';
});
</script>

<style scoped lang="scss">
.pest-disease-display-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .pest-disease-display-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;

    .pest-buttons-section {
      display: flex;
      justify-content: center;

      .buttons-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        width: 100%;
        max-width: 100%;

        .button-wrapper {
          position: relative;
          min-width: 0;

          .el-button {
            width: 100%;
            height: 36px;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-size: 13px;
          }

          .sub-buttons {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            z-index: 100;
            background: transparent;
            display: none; // 默认隐藏
            flex-direction: column;
            gap: 4px;
            padding: 0;
            margin: 0;

            // 保持悬浮状态的关键：添加连接区域
            &::before {
              content: '';
              position: absolute;
              top: -8px;
              left: 0;
              right: 0;
              height: 8px;
              background: transparent;
            }

            :deep(.el-button) {
              width: 100% !important;
              height: 32px;
              font-size: 12px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              margin: 0 !important;
              padding: 0 12px !important;
            }
          }

          // 当悬浮在wrapper上时，显示sub-buttons并添加动画
          &:hover .sub-buttons {
            display: flex;
            animation: slideDown 0.2s ease;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        > .el-button {
          min-width: 0;
          height: 36px;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-size: 13px;
        }
      }
    }

    .pest-detail-section {
      flex: 1;
      overflow-y: auto;

      &::-webkit-scrollbar {
        display: none;
      }
      -ms-overflow-style: none;
      scrollbar-width: none;

      .detail-card {
        background: var(--el-bg-color);
        border-radius: 8px;
        border: 1px solid var(--el-border-color-light);
        padding: 8px;
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .carousel-section {
          flex: 1;
          max-height: 380px;

          .carousel-image {
            width: 100%;
            height: 320px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .image-placeholder {
              width: 100%;
              height: 100%;
              background: var(--el-fill-color-light);
              border: 2px dashed var(--el-border-color);
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 8px;

              .placeholder-icon {
                font-size: 36px;
                color: var(--el-text-color-placeholder);
                margin-bottom: 12px;
              }

              .stage-info {
                text-align: center;

                .stage-name {
                  display: block;
                  color: var(--el-text-color-primary);
                  font-size: 16px;
                  font-weight: 600;
                  margin-bottom: 6px;
                }

                .placeholder-text {
                  color: var(--el-text-color-secondary);
                  font-size: 13px;
                }
              }
            }
          }

          // 轮播图指示器样式优化
          :deep(.el-carousel__indicators) {
            margin-top: 8px;

            .el-carousel__indicator {
              .el-carousel__button {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: var(--el-text-color-placeholder);

                &.is-active {
                  background-color: var(--el-color-primary);
                }
              }
            }
          }
        }

        .info-section {
          flex-shrink: 0;
          max-height: 180px;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: var(--el-border-color);
            border-radius: 2px;
          }

          .pest-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            .pest-name {
              flex: 1;
              color: var(--el-text-color-primary);
              font-size: 14px;
              font-weight: 600;
            }

            .el-tag {
              font-size: 11px;
            }
          }

          .additional-info-section {
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            .description-block,
            .characteristics-block {
              margin-bottom: 8px;
              &:last-child {
                margin-bottom: 0;
              }
            }

            .info-title {
              margin: 0 0 4px 0;
              color: var(--el-text-color-primary);
              font-size: 13px;
              font-weight: 600;
            }

            .info-content {
              margin: 0;
              color: var(--el-text-color-regular);
              line-height: 1.5;
              font-size: 12px;
              background: var(--el-fill-color-light);
              padding: 8px;
              border-radius: 4px;
            }

            .info-list {
              margin: 0;
              padding: 0 0 0 16px; // Adjust left padding for bullet points
              list-style-type: disc; // Use disc for bullet points
              color: var(--el-text-color-regular);
              font-size: 12px;

              li {
                margin-bottom: 4px;
                line-height: 1.4;
                &:last-child {
                  margin-bottom: 0;
                }
              }
            }
          }

          .prevention-methods {
            .severity-item {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .severity-badge {
                flex-shrink: 0;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: 500;

                &.severity-light {
                  background-color: #e1f3f8;
                  color: #0ea5e9;
                }

                &.severity-medium {
                  background-color: #fef9e7;
                  color: #ca8a04;
                }

                &.severity-heavy {
                  background-color: #fde8e8;
                  color: #dc2626;
                }
              }

              p {
                flex: 1;
                margin: 0;
                color: var(--el-text-color-regular);
                line-height: 1.4;
                font-size: 12px;
              }
            }

            .simple-method {
              margin: 0;
              color: var(--el-text-color-regular);
              line-height: 1.5;
              font-size: 12px;
              padding: 8px;
              background: var(--el-fill-color-light);
              border-radius: 4px;
            }

            .simple-methods-list {
              .info-title {
                // Reusing info-title style
                margin: 0 0 4px 0;
                color: var(--el-text-color-primary);
                font-size: 13px;
                font-weight: 600;
              }
              .info-list {
                // Reusing info-list style
                margin: 0;
                padding: 0 0 0 16px;
                list-style-type: disc;
                color: var(--el-text-color-regular);
                font-size: 12px;
                background: var(--el-fill-color-light);
                padding: 8px 8px 8px 24px; // Adjust padding for list items
                border-radius: 4px;

                li {
                  margin-bottom: 4px;
                  line-height: 1.4;
                  &:last-child {
                    margin-bottom: 0;
                  }
                }
              }
            }
          }
        }
      }
    }

    .no-selection {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .hint-icon {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .pest-disease-display-container {
    .pest-disease-display-content {
      gap: 8px;

      .pest-buttons-section {
        .buttons-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
      }

      .pest-detail-section {
        .detail-card {
          padding: 12px;
          gap: 12px;

          .carousel-section {
            .carousel-image {
              height: 130px;

              .image-placeholder {
                .placeholder-icon {
                  font-size: 28px;
                }

                .stage-info {
                  .stage-name {
                    font-size: 14px;
                  }

                  .placeholder-text {
                    font-size: 11px;
                  }
                }
              }
            }
          }

          .info-section {
            .pest-title h4 {
              font-size: 14px;
            }

            .description p {
              font-size: 13px;
            }

            .prevention-methods {
              h5 {
                font-size: 13px;
              }

              ul li {
                font-size: 12px;
                margin-bottom: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
