<template>
  <SplitBox aside-width="750px">
    <template #aside>
      <Illustration ref="illRef" />
    </template>
    <template #main>
      <div class="main-box">
        <div class="top-box">
          <Model :parent="parent" :child="powland.keys" @inputFinished="finishInputHandler" />
          <Tip />
        </div>
        <div class="nav-box">
          <el-button-group>
            <el-button  size="large" type="primary" @click="stepHandler(-1)" :icon="ArrowLeft" :disabled="keyIdx === 0">上一步</el-button>
            <el-button size="large" type="primary" :icon="View" :disabled="checkBtnDisabled" @click="fsckHandler">一致性检验</el-button>
            <el-button size="large" type="primary" @click="stepHandler(1)" :disabled="nextBtnDisabled">下一步<el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button>
          </el-button-group>
        </div>
      </div>
    </template>
  </SplitBox>
</template>
<script setup lang="js">
  import SplitBox from '../commponents/SplitBox.vue';
  import Illustration from './illustration.vue';
  import Model from './model.vue';
  import Tip from './tip.vue';
  import { usePowlandStore } from './store';
  import { ref } from 'vue';
  import { ArrowLeft,ArrowRight, View } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const powland = usePowlandStore();
  const illRef = ref();
  const keyIdx = ref(0);
  const checkBtnDisabled = ref(true);
  const nextBtnDisabled = ref(true);

  //所有一、二层ID
  const allKeys = ref(powland.getALlKeys());
  const parent = ref('');

  /**
   * 
   * @param key 设置当前正在处理的节点
   */
  function setKey(key){
    parent.value = key;
    powland.updateJudgeMatrix(key);
    illRef.value.setNodeColor(key);
  }

  /**
   * 判断矩阵是否输入完成
   * @param flag true/false
   */
  function finishInputHandler(flag){
    checkBtnDisabled.value = !flag;
  }

  /**
   * 一致性检查
   */
  function fsckHandler(){
    const result = powland.check_node_eig(allKeys.value[keyIdx.value]);
    if(result){
      nextBtnDisabled.value = !result;
    }
    else{
      ElMessage.error('输入分值存在冲突...');
    }
    
  }

  function stepHandler(step){
    keyIdx.value += step;
    if(keyIdx.value < allKeys.value.length){
      setKey(allKeys.value[keyIdx.value]);
      checkBtnDisabled.value = !powland.matrixInputFinish();
      nextBtnDisabled.value = true;
    }
    
  }

  onMounted(() => {
    setKey(allKeys.value[0]);
    checkBtnDisabled.value = !powland.matrixInputFinish();
  })

</script>
<style lang="css" scoped>
  .main-box{
    display: flex;
    height: 100%;
    flex-direction: column;
  }
  .nav-box{
    height: 200px;
    display: flex;
    justify-content: center;
  }
  .top-box{
    flex-grow: 1;
    
  }
</style>