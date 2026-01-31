import MzMapBase, { StyleProfile } from './MzMapBase';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Text } from 'ol/style';
// import { Translate } from 'ol/interaction';
import { unByKey } from 'ol/Observable';

//继续导出，方便后续使用
export { Style, Fill, Stroke, Text } from 'ol/style';
export { StyleProfile } from './MzMapBase';

// GeoJSON数据类型接口
export interface GeoData {
  id: string;
  name: string;
  type: string;
  data: any; // GeoJSON格式数据
  visible: boolean;
  zIndex?: number; // Z方向显示顺序值，可选
  minDisplayZoom?: number; //显未图层内容的最小zoom
  emitEvent?: boolean; // 是否发射点击事件，可选，默认为false
  emitRightClickEvent?: boolean; //是否发射右单击事件，可选，默认为false
  customStyle?: (feature: any) => Style; // 自定义渲染样式函数，可选
  updateWhileAnimating?: boolean; // 动画期间是否更新，可选，默认为false
  updateWhileInteracting?: boolean; // 交互期间是否更新，可选，默认为false
}

class MzMap extends MzMapBase {
  private geoLayers: Map<string, VectorLayer>;
  private geoSources: Map<string, VectorSource>;
  private clickListenerKey: any;
  constructor(container: HTMLElement | string | any, callback: (() => void) | null, styleProfile: StyleProfile | null = null) {
    super(container, callback, styleProfile);

    // 初始化图层和数据源映射
    this.geoLayers = new Map<string, VectorLayer>();
    this.geoSources = new Map<string, VectorSource>();

    // 默认不添加点击监听
    this.clickListenerKey = null;

    // 添加缩放级别变化监听，用于控制点图层的显示
    this.view.on('change:resolution', () => {
      // 获取当前缩放级别
      const zoom = this.view.getZoom();
      this.jd_layer.setVisible(zoom < 15);

      // 遍历所有图层
      this.geoLayers.forEach((layer) => {
        const minDisplayZoom = layer.get('minDisplayZoom');

        // 如果设置了最小显示缩放级别，则根据当前缩放级别决定是否刷新图层
        if (minDisplayZoom !== undefined) {
          // 强制刷新图层，使样式函数重新计算
          layer.changed();
        }
      });
      /*
            this.geoLayers.forEach((layer, id) => {
                // 只对点类型图层进行处理
                if (layer.get('type') === 'point') {
                    // 强制刷新图层，使样式函数重新计算
                    layer.changed();
                }
            });
            */
    });
  }

  /**
   * 加载GeoJSON数据数组
   * @param geoDataArray GeoJSON数据数组
   */
  loadGeoData(geoDataArray: GeoData[]) {
    if (!geoDataArray || geoDataArray.length === 0) {
      return;
    }

    // 移除现有图层
    this.clearAllLayers();

    // 加载新图层
    geoDataArray.forEach((geoData) => {
      this.addGeoLayer(geoData);
    });
  }

  /**
   * 添加单个GeoJSON图层
   * @param geoData GeoJSON数据对象
   */
  addGeoLayer(geoData: GeoData) {
    if (!geoData || !geoData.data) return;

    // 创建数据源
    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geoData.data, {
        featureProjection: 'EPSG:4326'
      })
    });

    // 使用自定义样式函数（如果提供）或默认样式
    const style = geoData.customStyle || this.getStyleForType(geoData.type);

    // 如果是点类型，我们需要根据缩放级别控制样式
    let finalStyle: any;
    if (geoData.minDisplayZoom) {
      //&& geoData.type === 'point'
      // 获取当前缩放级别
      // const currentZoom = this.view.getZoom();

      // 创建一个基于缩放级别的样式函数
      finalStyle = (feature: any) => {
        const zoom = this.view.getZoom();
        // 缩放级别小于16时不显示图标
        if (zoom < geoData.minDisplayZoom) {
          return null; // 返回null表示不显示
        }
        // 否则使用原来的样式
        return typeof style === 'function' ? style(feature) : style;
      };
    } else {
      finalStyle = style;
    }

    // 创建图层
    const layer = new VectorLayer({
      source: source,
      style: finalStyle,
      visible: geoData.visible,
      zIndex: geoData.zIndex !== undefined ? geoData.zIndex : 0, // 设置zIndex
      updateWhileAnimating: geoData.updateWhileAnimating !== undefined ? geoData.updateWhileAnimating : false, // 动画期间不更新
      updateWhileInteracting: geoData.updateWhileInteracting !== undefined ? geoData.updateWhileInteracting : false, // 交互期间不更新
      renderBuffer: 100 // 渲染缓冲区大小
    });

    // 存储图层和数据源引用
    this.geoLayers.set(geoData.id, layer);
    this.geoSources.set(geoData.id, source);

    // 设置图层属性
    layer.set('id', geoData.id);
    layer.set('name', geoData.name);
    layer.set('type', geoData.type);
    layer.set('zIndex', geoData.zIndex);
    layer.set('emitEvent', geoData.emitEvent || false); // 设置是否发射事件，默认为false
    layer.set('emitRightClickEvent', geoData.emitRightClickEvent || false); // 设置是否发射事件，默认为false
    layer.set('minDisplayZoom', geoData.minDisplayZoom);
    // 添加图层到地图
    this.map.addLayer(layer);
  }

  /**
   * 根据数据类型获取相应的样式
   * @param type 数据类型
   * @returns 样式对象
   */
  private getStyleForType(type: string): Style | ((feature: any) => Style) {
    // 根据类型返回不同的样式
    switch (type) {
      case 'polygon':
        return (feature: any) =>
          new Style({
            fill: new Fill({
              color: 'rgba(100, 150, 200, 0.4)'
            }),
            stroke: new Stroke({
              color: 'rgba(0, 100, 180, 0.8)',
              width: 2
            }),
            text: new Text({
              font: '14px 微软雅黑,Calibri,sans-serif',
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 3
              }),
              text: feature.get('NAME') || ''
            })
          });
      case 'line':
        return new Style({
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, 0.8)',
            width: 3
          })
        });
      case 'point':
        return new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: 'rgba(0,255,0, 0.6)'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2
            })
          })
        });
      default:
        // 默认样式
        return (feature: any) =>
          new Style({
            fill: new Fill({
              color: 'rgba(200, 200, 200, 0.3)'
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              width: 1.5
            }),
            text: new Text({
              font: '12px 微软雅黑,Calibri,sans-serif',
              fill: new Fill({
                color: '#333'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 2
              }),
              text: feature.get('NAME') || ''
            })
          });
    }
  }

  /**
   * 更新图层可见性
   * @param id 图层ID
   * @param visible 是否可见
   */
  updateLayerVisibility(id: string, visible: boolean) {
    const layer = this.geoLayers.get(id);
    if (layer) {
      layer.setVisible(visible);
    }
  }

  /**
   * 更新所有图层可见性
   * @param geoDataArray GeoJSON数据数组
   */
  updateLayersVisibility(geoDataArray: GeoData[]) {
    geoDataArray.forEach((geoData) => {
      this.updateLayerVisibility(geoData.id, geoData.visible);
    });
  }

  /**
   * 更新图层zIndex显示顺序
   * @param id 图层ID
   * @param zIndex 新的zIndex值
   */
  updateLayerZIndex(id: string, zIndex: number) {
    const layer = this.geoLayers.get(id);
    if (layer) {
      layer.setZIndex(zIndex);
      layer.set('zIndex', zIndex);
    }
  }

  /**
   * 更新所有图层zIndex
   * @param geoDataArray GeoJSON数据数组
   */
  updateLayersZIndex(geoDataArray: GeoData[]) {
    geoDataArray.forEach((geoData) => {
      if (geoData.zIndex !== undefined) {
        this.updateLayerZIndex(geoData.id, geoData.zIndex);
      }
    });
  }

  /**
   * 更新图层是否发射事件
   * @param id 图层ID
   * @param emitEvent 是否发射事件
   */
  updateLayerEmitEvent(id: string, emitEvent: boolean) {
    const layer = this.geoLayers.get(id);
    if (layer) {
      layer.set('emitEvent', emitEvent);
    }
  }

  /**
   * 更新所有图层是否发射事件
   * @param geoDataArray GeoJSON数据数组
   */
  updateLayersEmitEvent(geoDataArray: GeoData[]) {
    geoDataArray.forEach((geoData) => {
      this.updateLayerEmitEvent(geoData.id, geoData.emitEvent || false);
    });
  }

  /**
   * 设置点击监听
   * @param callback 回调函数
   */
  setClickListener(callback: (feature: any) => void) {
    // 先移除已有的监听
    this.removeClickListener();

    // 添加新的点击监听
    this.clickListenerKey = this.map.on('click', (evt) => {
      let clickedFeature = null;
      let clickedLayer = null;

      this.map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (!clickedFeature) {
            clickedFeature = feature;
            clickedLayer = layer;
            return true;
          }
          return false;
        },
        {
          hitTolerance: 5, // 添加命中容差，提高性能并增强用户体验
          layerFilter: (layer) => layer.get('emitEvent') === true || layer.get('emitRightClickEvent') === true // 只检查可发射事件的图层
        }
      );

      if (clickedFeature && clickedLayer) {
        // 获取图层信息
        const layerId = clickedLayer.get('id') || '';
        const layerName = clickedLayer.get('name') || '';
        const layerType = clickedLayer.get('type') || '';

        // 构建事件数据
        const eventData = {
          feature: clickedFeature,
          properties: clickedFeature.getProperties(),
          layerId: layerId,
          layerName: layerName,
          layerType: layerType
        };

        callback(eventData);
      }
    });
  }

  /**
   * 移除点击监听
   */
  removeClickListener() {
    if (this.clickListenerKey) {
      unByKey(this.clickListenerKey);
      this.clickListenerKey = null;
    }
  }

  /**
   * 清除所有GeoJSON图层
   */
  clearAllLayers() {
    // 移除所有添加的图层
    this.geoLayers.forEach((layer, id) => {
      this.map.removeLayer(layer);
    });

    // 清空映射
    this.geoLayers.clear();
    this.geoSources.clear();
  }

  /**
   * 根据ID获取图层
   * @param id 图层ID
   * @returns 图层对象
   */
  getLayerById(id: string) {
    return this.geoLayers.get(id);
  }

  /**
   * 定位到指定图层
   * @param id 图层ID
   */
  zoomToLayer(id: string) {
    const source = this.geoSources.get(id);
    if (source) {
      const extent = source.getExtent();
      this.view.fit(extent, {
        duration: 1000,
        maxZoom: 19,
        padding: [50, 50, 50, 50]
      });
    }
  }

  /**
   * 设置右单击
   * @param callback 回调
   */
  private rightClickListenerKey: any;
  setRightClickListener(callback: (feature: any) => void) {
    this.removeRightClickListener();
    this.rightClickListenerKey = this.map.getViewport().addEventListener('contextmenu', (evt) => {
      evt.preventDefault(); // 阻止默认的上下文菜单显示

      let clickedFeature: any = null;
      let clickedLayer: any = null;

      this.map.forEachFeatureAtPixel(
        this.map.getEventPixel(evt),
        (feature, layer) => {
          if (!clickedFeature) {
            clickedFeature = feature;
            clickedLayer = layer;
            return true;
          }
          return false;
        },
        {
          hitTolerance: 5, // 添加命中容差，提高性能并增强用户体验
          layerFilter: (layer) => layer.get('emitRightClickEvent') === true // 只检查可发射右键事件的图层
        }
      );

      if (clickedFeature && clickedLayer) {
        // 构建事件数据
        const eventData = {
          layerId: clickedLayer.get('id') || '',
          layerName: clickedLayer.get('name') || '',
          features: clickedFeature.getProperties()
        };

        callback(eventData);
      }
    });
  }
  /**
   * 移除右单击监听器
   */
  removeRightClickListener() {
    if (this.rightClickListenerKey) {
      this.map.getViewport().removeEventListener('contextmenu', this.rightClickListenerKey);
    }
    this.rightClickListenerKey = null;
  }
}

// 导出Circle类型，修复上面的引用错误
import { Circle } from 'ol/style';

export function useMzMap(container: string | HTMLElement | any, callback: (() => void) | null, styleProfile: StyleProfile | null = null) {
  const mzMap = new MzMap(container, callback, styleProfile);
  return mzMap;
}

export default MzMap;
