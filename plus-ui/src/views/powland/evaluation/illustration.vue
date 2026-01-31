<!-- 层次分析法-图示 -->
 <script setup lang="js">
    import 'jsmind/style/jsmind.css';
    import jsMind from 'jsmind';
    import { usePowlandStore } from './store';
    import { onMounted } from 'vue';

    let jm ;
    const powland = usePowlandStore();

    /**
     * 
     * @param key 设置节点及子节点主题
     */
    function setNodeColor(key){
        const  allKeys = powland.getALlKeys();
        jm.enable_edit();
        for(let key of allKeys){
            setColor(key,'#000','#fff');
        }
        setColor(key,'#ffffff','#009900');
        jm.disable_edit();
    }   
    
    function setColor(key,fg,bg){
        jm.set_node_color(key,bg,fg); 
        const node = jm.get_node(key);       
        for(let n of node.children){
            jm.set_node_color(n.id,bg,fg);
        }
    }
    
    onMounted(() => {
        const mind_data = {
            "meta": {
                "name": "层次分析法--判断矩阵",
                "author": "zq",
                "version": "1.0"
            },
            format: 'node_tree',
            data: {
                ...powland.matrix
            }
        }
        jm = new jsMind({
            container: 'jsmind_container',
           
        });
        jm.show(mind_data);
    })

    defineExpose({
        setNodeColor
    })
</script>

<template>
    <div class="title">地块地力评价因素：</div>
    <div id="jsmind_container"></div>
</template>

<style lang="css" scoped>
    #jsmind_container{
        width: 100%;
        height:calc(100% - 50px);
    }
    .title{
      padding: 10px;
      font-size: larger;
      color: rgb(255, 51, 0);
    }
</style>