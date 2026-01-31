<template>
  <div class="title">评价因素重要性打分：</div>
  <div class="model-box">
    <table>
      <tbody>
        <tr>
          <th style="background-color:aquamarine;">
            {{ parent }}
          </th>
          <th v-for="c in props.child">
            {{ c }}
          </th>
        </tr>
        <tr v-for="i in powland.curJudgMatrix.length">
          <th>{{ props.child[i - 1] }}</th>
          <td v-for="j in powland.curJudgMatrix.length " :class="{'td-backcolor': i >= j}">
            <input v-if="i > 0 && j > 0 && i < j" v-model="powland.curJudgMatrix[i - 1][j - 1]" @blur="reverse(i - 1,j - 1)" :class="{'no-input': !powland.curJudgMatrix[i - 1][j - 1]}" @keydown="filterIinput" @input="powland.curJudgMatrix[i - 1][j - 1] = inputHandle(powland.curJudgMatrix[i - 1][j - 1])">
            <template v-else>{{ powland.curJudgMatrix[i - 1][j - 1] }}</template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="js">
import { usePowlandStore } from './store';
  
  const props = defineProps(['parent','child']);
  const powland = usePowlandStore();

  const emit = defineEmits([
    'inputFinished'  //输入完成事件
  ]);

  /**
   * 
   * @param r 设置反矩阵元素
   * @param c 
   */
  const reverse = function(r,c){
    const matrix = powland.curJudgMatrix;
    if( matrix[r][c]){
      if(matrix[r][c].indexOf("/") > 0){
        if(matrix[r][c][0] === '1'){
          matrix[c][r] = matrix[r][c][2];
        }
        else{
          matrix[c][r] = matrix[r][c][2] + "/" + matrix[r][c][0];
        }
      }
      else if(matrix[r][c] === "1"){
        matrix[c][r] = "1";
      }
      else{
        matrix[c][r] = "1/" + matrix[r][c];
      }
    }

    //检查所有的输入都已经完成
    for(let row of matrix){
      for(let col of row){
        if(!col){
          emit("inputFinished",false);
          return;
        }
      }
    }
    emit("inputFinished",true);
  }

  /**
   * 限制只输入1-9
   * @param ch 
   */
  const filterIinput = (e) => {
    if('123456789/'.indexOf(e.key) < 0 && e.key != 'Backspace' && e.key != 'Tab' ){
      e.preventDefault();
    }
  }
  /**
   * 
   * @param c 只能输入一个数或一个分数：如：1/2或3
   */
  const inputHandle = (c) => {
    if(c.indexOf("/") === 0){
      return '';
    }
    else if(c.length > 1 && c.indexOf("/") === -1){
      return c.slice(0,1);
    }
    else if(c.indexOf("//") === 1){
      return c.slice(0,2);
    }
    else if(c.indexOf("/") === 1){
      return c.slice(0,3);
    }
    else {
      return c;
    }
    
  } 

</script>
<style lang="css" scoped>
  .model-box{
    width: 100%;
    height: calc(100% - 80px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  table{
    border: 2px solid silver;
    border-collapse: collapse;
  }
  td,input,.reserve{
    width: 100px;
    height: 80px;
    font-size: 14pt;
    line-height: 80px;
    text-align: center;
  }
  td{
    border: 1px solid rgb(228, 228, 228);
  }
  th{
    background-color: azure;
    padding: 15px;
    border: 1px solid rgb(228, 228, 228);
  }
  .td-backcolor {
    background-color: rgb(244, 242, 242);
  }
  input{
    max-width: 100px;
    max-height: 80px;
    border: none;
    text-align: center;
  }
  .no-input{
    background-color: rgb(254, 195, 195);
  }
  th,td{
    user-select: none;
  }
  .title{
    height: 80px;
    padding: 10px;
    font-size: larger;
    color: rgb(255, 51, 0);
  }
</style>