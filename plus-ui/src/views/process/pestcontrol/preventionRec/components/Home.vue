<template>
  <div class="home">
    <template v-if="props.row.name === '病虫害定义'">
      <h2>病虫害定义</h2>
      <p>
        <span>植物病虫害</span
        >是指植物在生长过程中受到病原微生物（如细菌、真菌、病毒等）或害虫（如昆虫、螨类等）的侵害，导致植物生长发育异常、产量减少甚至死亡的现象。植物病虫害是我国的主要农业灾害之一，它具有种类多、影响大、并时常暴发成灾的特点，其发生范围和严重程度对我国国民经济、特别是农业生产常造成重大损失。我国农作物常见的有以下种类的病虫害：稻飞虱、白粉病、玉米螟、棉铃虫、小麦锈病、棉蚜、稻纹枯病、稻瘟病、麦蚜、麦红蜘蛛、蝗虫、麦类赤霉病等，已成为严重影响我国农业生产的重大病虫害。
      </p>
      <p>由于有害生物的种类繁多，形态各异，发生规律各有不同，因此，认识有害生物，掌握有害生物的习性、特点，对防控有害生物极其重要。</p>
    </template>
    <template v-else-if="props.row.name === '病虫害分类'">
      <h2>病虫害分类</h2>
      <h3>病害</h3>
      <el-card>
        <p><b>植物病害可分为几个主要类别，包括真菌病害、卵菌病害、细菌病害、病毒病害以及线虫病害</b></p>
        <el-card>
          <el-carousel height="150px">
            <el-carousel-item>
              <p>
                <span>真菌病害</span
                >是指由真菌引起的植物疾病问题。真菌性病害通常会导致植物叶片、茎、果实等部位出现斑点、腐烂、枯萎等症状，严重影响植物的生长和产量。真菌侵染部位在潮湿的条件下都有菌丝和孢子产生，产生出白色棉絮状物、丝状物，不同颜色的粉状物，雾状物或颗粒状物。这是判断真菌性病害的主要依据。
              </p>
            </el-carousel-item>
            <el-carousel-item>
              <p><span>卵菌病害</span>是指由卵菌引起的植物疾病问题。具有发病迅速、传播快、危害重等特点。随着湿度增大，卵菌病害的发生会逐渐加重。</p>
            </el-carousel-item>
            <el-carousel-item>
              <p>
                <span>细菌病害</span
                >是指由细菌病菌侵染所致的病害，如软腐病、溃疡病、青枯病等。可通过自然孔口（气孔、皮孔、水孔等）和伤口侵入，借流水、雨水、昆虫等传播，在病残体、种子、土壤中过冬，在高温、高湿条件下容易发病。
              </p>
            </el-carousel-item>
            <el-carousel-item>
              <p>
                <span>病毒病害</span
                >是指由植物病毒寄生引起的病害。病毒病害通常通过昆虫、真菌或接种工具传播。植物病毒必须在寄主细胞内寄生生活，专一性强，某一种病毒只能侵染某一种或某些植物。但也有少数为害广泛；如烟草花叶病毒和黄瓜花叶病毒。一般植物病毒只有在寄主活体内才具有活性；仅少数植物病毒可在病株残体中保持活性几天、几个月、甚至几年，也有少数植物病毒可在昆虫活体内存活或增殖。
              </p>
            </el-carousel-item>
            <el-carousel-item>
              <p>
                <span>线虫病害</span
                >是指由植物寄生线虫侵袭和寄生引起的植物病害。受害植物可因侵入线虫吸收体内营养而影响正常的生长发育；线虫代谢过程中的分泌物还会刺激寄主植物的细胞和组织，导致植株畸形，以及利用天敌控制等。使农产品减产和质量下降。
              </p>
            </el-carousel-item>
          </el-carousel>
        </el-card>
        <div class="album" style="margin-top: 20px">
          <img src="../assets/plant1.jpg" alt="plant1" />
          <img src="../assets/plant2.png" alt="plant2" />
        </div>
      </el-card>
      <h3>虫害</h3>
      <el-card>
        <p>人们通常把危害各种植物的昆虫和螨类等称为害虫，把由它们引起的各种植物伤害称为虫害。</p>
        <p>植物害虫可大致分为食叶害虫、刺吸害虫、肉食性害虫、地下害虫、仓储害虫等</p>
        <el-card>
          <el-carousel height="150px">
            <el-carousel-item>
              <p>
                <span>食叶害虫</span
                >是以叶片为食的害虫。主要危害健康植物，以幼虫取食叶片，常咬成缺口或仅留叶脉，甚至全吃光。少数种群潜入叶内，取食叶肉组织，或在叶面形成虫瘿，如粘虫、叶蜂、松毛虫等。由于多营裸露生活，其数量的消长常受气候与天敌等因素直接制约。这类害虫的真成虫多数不需补充营养，寿命也短，幼虫期成为它主要摄取养分和造成危害的虫期，一旦发生危害则虫口密度大而集中。又因真成虫能做远距离飞迁，故也是这类害虫经常猖獗为害的主因之一。幼虫也有短距离主动迁移危害的能力。某些种类常呈周期性大发生。
              </p>
            </el-carousel-item>
            <el-carousel-item>
              <p>
                <span>刺吸害虫</span
                >是园林植物害虫中较大的一个类群。它们个体小，发生初期往往受害状不明显，易被人们忽视，但数量极多，常群居于嫩枝、叶、芽、花蕾、果上，汲取植物汁液，掠夺其营养，造成枝叶及花卷曲，甚至整株枯萎或死亡。同时诱发煤污病，有时害虫本身是病毒病的传播媒介。
              </p>
            </el-carousel-item>
            <el-carousel-item>
              <p><span>肉食性害虫</span>是一类以动物组织为食的害虫，它们会对农作物、家畜和人类造成危害。</p>
            </el-carousel-item>
            <el-carousel-item>
              <p><span>地下害虫</span>指的是一生或一生中某个阶段生活在土壤中危害植物地下部分、种子、幼苗或近土表主茎的杂食性昆虫。</p>
            </el-carousel-item>
            <el-carousel-item>
              <p><span>仓储害虫</span>是指破坏仓储粮食、物品的害虫 。</p>
            </el-carousel-item>
          </el-carousel>
        </el-card>
        <div class="album" style="margin-top: 20px">
          <img src="../assets/insect1.png" alt="insect1" />
          <img src="../assets/insect2.jpg" alt="insect2" />
        </div>
      </el-card>
    </template>
    <template v-else-if="props.row.name === '病虫害危害'">
      <h2>病虫害危害</h2>
      <el-card>
        <p>植物病虫害对农作物和植物群落造成的危害是多方面的，具体包括：</p>
        <p><span>减产减收：</span></p>
        <p>病虫害的侵袭会直接影响植物的生长发育，导致作物产量显著下降，严重时甚至会导致整个作物歉收或绝收。</p>
        <p><span>降低品质：</span></p>
        <p>受病虫害影响的农作物，其果实、叶片等部位往往会出现斑点、腐烂、变形等现象，直接影响产品的外观和品质，减少市场价值。</p>
        <p><span>增加成本：</span></p>
        <p>为了控制病虫害，农户需要增加在农药、肥料等方面的投入，这不仅增加了生产成本，而且可能因为使用不当而引发环境污染和生态平衡的破坏。</p>
        <p><span>传播速度快，难以控制：</span></p>
        <p>某些病虫害具有极强的传染性和蔓延性，一旦发生可能会快速扩散到大面积的作物中，给防控工作带来极大的困难。</p>
        <p><span>影响食品安全：</span></p>
        <p>使用化学农药等方法控制病虫害，如果处理不当，会导致农产品中残留有害物质，影响食品安全和人体健康。</p>
        <p><span>生态环境破坏：</span></p>
        <p>过度使用化学农药不仅会导致病虫害抗药性增强，还可能破坏周边的生态环境，影响土壤健康和生物多样性。</p>
        <p>因此，病虫害的有效防控对于保障农业生产、维护生态平衡和保障食品安全都具有重要意义。</p>
      </el-card>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { SidebarItem } from '../types';

const props = defineProps<{
  row: SidebarItem;
}>();
</script>

<style scoped>
h2,
h3 {
  width: fit-content;
  border-bottom: 2px solid var(--el-menu-active-color);
  margin-bottom: 20px;
}

p::before {
  display: inline-block;
  content: '';
  width: 2rem;
  height: 1px;
}

p > span {
  color: var(--el-menu-active-color);
  font-weight: bold;
}

.album {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  overflow: hidden;
}

.album img {
  width: 48%;
  min-width: 256px;
  max-width: 512px;
  border-radius: 8px;
}
</style>
