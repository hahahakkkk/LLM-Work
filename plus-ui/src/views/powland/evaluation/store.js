import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const usePowlandStore = defineStore('powland', () => {
    const matrix = ref({
        topic: '耕地地力(A)',
        id: 'A',
        judgMatrix :[],
        eig: [], //特征向量
        totalEig: [], //总特征向量（权重）
        weight: {},
        children: [
            {
                topic: '立地条件(B1)',
                id: 'B1',
                judgMatrix :[],
                eig: [],
                children:[
                    {
                        topic: '坡度(C1)',
                        id: 'C1'
                    },
                    {
                        topic: '坡向(C2)',
                        id: 'C2'
                    },
                    {
                        topic: '海拔(C3)',
                        id: 'C3'
                    },
                    {
                        topic: '地貌类型(C4)',
                        id: 'C4'
                    },
                ] 
            },
            {
                topic: '土壤性质(B2)',
                id: 'B2',
                judgMatrix :[],
                eig: [],
                children:[
                    {
                        topic: '质地(C5)',
                        id: 'C5',
                        weight: 0
                    },
                    {
                        topic: '土壤结构(C6)',
                        id: 'C6',
                        weight: 0
                    },
                    {
                        topic: '剖面构型(C7)',
                        id: 'C7',
                        weight: 0
                    }
                ] 
            },
            {
                topic: '肥力状况(B3)',
                id: 'B3',
                judgMatrix :[],
                eig: [],
                children:[
                    {
                        topic: '有机质(C8)',
                        id: 'C8',
                        weight: 0
                    },
                    {
                        topic: '碱解氮(C9)',
                        id: 'C9',
                        weight: 0
                    },
                    {
                        topic: '有效磷(C10)',
                        id: 'C10',
                        weight: 0
                    },
                    {
                        topic: '速效钾(C11)',
                        id: 'C11',
                        weight: 0
                    }
                ] 
            },
            {
                topic: '土壤管理(B4)',
                id: 'B4',
                judgMatrix :[],
                eig: [],
                children:[
                    {
                        topic: '灌溉能力(C12)',
                        id: 'C12',
                        weight: 0
                    },
                    {
                        topic: '农田基础设施(C13)',
                        id: 'C13',
                        weight: 0
                    }
                ] 
            }
        ]
    });

    //当前判断矩阵
    let curJudgMatrix = ref([]);
    let keys = ref([]);
    let labels = ref([]);

    /**
     * 获取指定节点
     * @param {*} key 
     */
    function getNode(key){
        if(matrix.value.id === key){
            return matrix.value;
        }

        const stack = [...matrix.value.children];
        while(stack.length){
            const node = stack.pop();
            if(node.id === key){
                return node;
            }
            if(node.children){
                stack.push(...node.children);
            }
        }

    }

    /**
     * 查询子节点的key和label列表
     * @param {*} key 
     * @param {*} nodes 
     */
    function getKeysAndLabels(key){
        keys.value = [];
        labels.value = [];
        const node = getNode(key);
        
        if(node.children){
            for(let n of node.children){
                keys.value.push(n.id);
                labels.value.push(n.topic);
            }
        }
    }

    /**
     * 获取第一层及第二层的key
     */
    function getALlKeys(){
        const allKeys = [];
        allKeys.push(matrix.value.id);
        for(const node of matrix.value.children){
            allKeys.push(node.id);
        }
        return allKeys;
    }

    /**
     * 更新指定节点的判决矩阵
     * @param {*} key 
     * @param {*} judgMatrix 
     */
    function updateJudgeMatrix(key,judgMatrix){
        const node = getNode(key);
        
        if(node){
            if(judgMatrix){
                node.judgMatrix = judgMatrix;
            }
            else if(node.judgMatrix.length === 0){
                const n = node.children.length;
                let a = Array.from({length: n }, () => Array(n).fill(undefined));
                for(let idx = 0;idx < n; idx++){
                    a[idx][idx] = 1;
                }
                node.judgMatrix = a;
            }
            curJudgMatrix.value = node.judgMatrix;
            
            getKeysAndLabels(key);
        }
    }


    /**
     * 向量归一化处理
     * @param {*} max_vector 
     * @returns 
     */
    // function normalize_vector(max_vector=[]) {
    //     // normalize the vector, the sum of elements is 1.0
    //     // :param max_vector: a eigenvector
    //     // :return: normalized eigenvector

    //     const vector = []
    //     const vector_after_normalization=[]
    //     let sum0=0
    //     for(let i=0;i<max_vector.length;i++){
    //         vector.push(max_vector[i])
    //         sum0+=max_vector[i]
    //     }
    //     for(let i=0;i<max_vector.length;i++){
    //         vector_after_normalization.push(vector[i] / sum0)
    //     }
    //     return vector_after_normalization
    // }



    /**
     * 计算权重
     * @param {*} matrix n阶正反矩阵
     * @returns 最大特征值，特征向量（权重）
     */
     function eigen(matrix = []) {
        var row = matrix.length;
        var column = matrix.length;
        var i, j;
        var sumColumn = [];
        var w = [];

        for (let i = 0; i < column; i++) {
            sumColumn[i] = 0;
            for (j = 0; j < row; j++) {
                sumColumn[i] += matrix[j][i];
            }
        }

        let max_eig = 0;
        for (i = 0; i < row; i++) {
            w[i] = 0;
            for (j = 0; j < column; j++) {
                w[i] += matrix[i][j] / sumColumn[j];
            }
            w[i] /= row;
            if(max_eig < w[i]){
                max_eig = w[i];
            }
        }
        return [max_eig,w];
    }
    
    /**
     * 矩阵一致性检验
     * @param {*} max_eig 最大特征值
     * @param {*} n 矩阵阶数
     * @return 返回 Boolean
     */ 
    function consistency_check(max_eig,n){
        const RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.52, 1.54, 1.56, 1.58, 1.59];
        const ri = RI[n];
        if(ri === 0){
            return true;
        }
        const ci =  (max_eig - n) / (n - 1);
        const cr = ci / ri;
        
        return cr < 0.1;
    }

    /**
     * 对节点的判断矩阵计算特征向量，并做一致性检查
     * @param {*} key 
     */
    function check_node_eig(key){
        const node = getNode(key);
        //将数组值转换为数值
        const tmpM = node.judgMatrix.map(x=> x.map(y => eval(y)));

        const [max_eig,matrix] = eigen(tmpM);
        
        const res = consistency_check(max_eig, matrix.length);
        if(res){
            node.eig = matrix;
        }
        return res;
    }

    /**
     * 评价因素组合权重计算
     */
    function total_weight(){
        const tw = [];
        let max_eig = 0;

        let idx = 0;
        for(let eig of matrix.value.eig){
            let node = matrix.value.children[idx++];
            for(let ceig of node.eig){
                let c = eig * ceig;
                tw.push(c);
                if(max_eig < c){
                    max_eig = c;
                }
            }
        }
        
        const res = consistency_check(max_eig, tw.length);
        if(res){
            matrix.value.totalEig = tw;
        }
        return res;
    }

    /**
     * 检查当前判断矩阵输入完成
     */
    function matrixInputFinish(){
      for(let row of curJudgMatrix.value){
        for(let col of row){
          if(!col){
            return false;
          }
        }
      }
      return true;
    }

    return {
            matrix,
            curJudgMatrix, 
            keys,
            labels,
            getNode, 
            updateJudgeMatrix, 
            check_node_eig,
            total_weight,
            getALlKeys,
            matrixInputFinish
        };
})

