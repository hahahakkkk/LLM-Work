<template>
  <div class="layer-control-container">
    <div class="layer-control-header">
      <h3>图层控制</h3>
    </div>
    <div class="layer-list">
      <div v-for="layer in layers" :key="layer.id" class="layer-item">
        <div class="layer-header">
          <el-checkbox v-model="layer.visible" @change="(val) => toggleLayerVisibility(layer.id, val)">
            {{ layer.name }}
          </el-checkbox>
          <div class="layer-actions">
            <el-tooltip content="图层信息">
              <el-button type="primary" circle size="small" @click="showLayerInfo(layer)">
                <i class="el-icon-info"></i>
              </el-button>
            </el-tooltip>
            <!--
            <el-tooltip content="定位到图层">
              <el-button 
                type="primary" 
                circle 
                size="small"
                @click="zoomToLayer(layer.id)"
              >
                <i class="el-icon-position"></i>
              </el-button>
            </el-tooltip>
            -->
          </div>
        </div>
        <div class="layer-body">
          <div class="z-index-control">
            <span>显示层级:</span>
            <el-slider v-model="layer.zIndex" :min="0" :max="100" @change="(val) => updateLayerZIndex(layer.id, val)"></el-slider>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="layerInfoDialogVisible" :title="`图层信息 - ${currentLayerInfo?.name || ''}`" width="30%">
      <div v-if="currentLayerInfo">
        <p><strong>ID:</strong> {{ currentLayerInfo.id }}</p>
        <p><strong>名称:</strong> {{ currentLayerInfo.name }}</p>
        <p><strong>类型:</strong> {{ currentLayerInfo.type }}</p>
        <p><strong>可见性:</strong> {{ currentLayerInfo.visible ? '显示' : '隐藏' }}</p>
        <p><strong>显示层级:</strong> {{ currentLayerInfo.zIndex }}</p>
        <p><strong>要素数量:</strong> {{ currentLayerInfo.featureCount }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import type { GeoData } from './MzMap';

const props = defineProps<{
  geodata: GeoData[] | null;
}>();

const emit = defineEmits(['toggle-visibility', 'zoom-to-layer', 'update-z-index']);

// 图层数据，添加了featureCount属性
const layers = ref<(GeoData & { featureCount?: number })[]>([]);

// 图层信息弹窗
const layerInfoDialogVisible = ref(false);
const currentLayerInfo = ref<(GeoData & { featureCount?: number }) | null>(null);

// 监听geodata变化
watch(
  () => props.geodata,
  (newGeodata) => {
    if (newGeodata) {
      // 计算每个图层的要素数量
      const layersWithCount = newGeodata.map((layer) => {
        const featureCount = layer.data?.features?.length || 0;
        return { ...layer, featureCount };
      });
      layers.value = layersWithCount;
    } else {
      layers.value = [];
    }
  },
  { deep: true, immediate: true }
);

// 显示/隐藏图层
function toggleLayerVisibility(id: string, visible: boolean) {
  emit('toggle-visibility', { id, visible });
  // 更新本地状态
  const layer = layers.value.find((l) => l.id === id);
  if (layer) {
    layer.visible = visible;
  }
}

// 更新图层Z轴顺序
function updateLayerZIndex(id: string, zIndex: number) {
  emit('update-z-index', { id, zIndex });
  // 更新本地状态
  const layer = layers.value.find((l) => l.id === id);
  if (layer) {
    layer.zIndex = zIndex;
  }
}

// 定位到图层
function zoomToLayer(id: string) {
  emit('zoom-to-layer', id);
}

// 显示图层信息
function showLayerInfo(layer: GeoData & { featureCount?: number }) {
  currentLayerInfo.value = layer;
  layerInfoDialogVisible.value = true;
}
</script>

<style scoped>
.layer-control-container {
  box-sizing: border-box;
  background: white;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
}

.layer-control-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.layer-control-header h3 {
  margin: 0;
  font-size: 16px;
  color: #000;
}

.layer-list {
  padding: 10px;
}

.layer-item {
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.layer-actions {
  display: flex;
  gap: 5px;
}

.layer-body {
  padding-left: 24px;
}

.z-index-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.z-index-control span {
  width: 70px;
  font-size: 12px;
}

.z-index-control .el-slider {
  flex: 1;
}
</style>
