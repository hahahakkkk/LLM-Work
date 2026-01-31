<script setup lang="js">
  import info from '../commponents/info.svg';
</script>

<template>
  <div class="tip-box">
    <el-popover :width="500">
      <template #reference>
        <el-avatar :src="info"/>
      </template>
      <template #default>
        <dl style="line-height: 2;font-size: large;">
          <dt style="font-weight: bolder;color: red;">分值填写说明：</dt>
          <dd>使用数字1-9以及其倒数作为标度。</dd>
          <dd>1：表示两个因素相比，具有相同重要性</dd>
          <dd>3：表示两个因素相比，前者比后者稍为重要</dd>
          <dd>5：表示两个因素相比，前者比后者明显重要</dd>
          <dd>7：表示两个因素相比，前者比后者强烈重要</dd>
          <dd>9：表示两个因素相比，前者比后者极端重要</dd>
          <dd>2、4、6、8：表示上述相邻判断的中间值</dd>
          <dd>倒数：若因素i与因素j的重要性之比为a<sub>ij</sub>，那么因素j与因素i重要性之比为a<sub>ji</sub>=1/a<sub>ij</sub></dd>
        </dl>
      </template>
    </el-popover>
  </div>
</template>
<style lang="css" scoped>
  .tip-box{
    position: absolute;
    top: 50px;
    right: 50px;
  }
  .el-avatar{
    background-color: rgb(252, 207, 200);
  }
</style>