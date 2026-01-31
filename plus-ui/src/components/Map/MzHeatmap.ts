import MzMapBase, { StyleProfile } from './MzMapBase';
import { Heatmap as HeatmapLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';

// 热力数据点接口定义
export interface HeatPoint {
  id: string;
  coordinate: [number, number]; // 经纬度坐标
  value: number; // 热力值 (0-1之间)
  weight?: number; // 权重，如果不提供则使用value
  metadata?: any; // 额外的元数据
}

// 热力图配置接口
export interface HeatmapConfig {
  radius?: number; // 热力点半径，默认15
  blur?: number; // 模糊程度，默认15
  opacity?: number; // 透明度，默认0.7
  gradient?: string[]; // 颜色渐变，默认蓝到红
  minOpacity?: number; // 最小透明度
  maxOpacity?: number; // 最大透明度
}

// 边界数据接口
export interface BoundaryData {
  data: any; // GeoJSON格式数据
  visible?: boolean; // 是否显示边界
  strokeColor?: string; // 边界颜色
  strokeWidth?: number; // 边界宽度
  fillColor?: string; // 填充颜色
}

/**
 * 热力图组件类
 * 基于MzMapBase扩展热力图功能
 */
class MzHeatmap extends MzMapBase {
  private heatmapLayer: any = null;
  private boundaryLayer: any = null;
  private heatmapConfig: HeatmapConfig;
  private currentHeatPoints: HeatPoint[] = [];

  constructor(container: HTMLElement | string, callback?: (() => void) | null, styleProfile?: StyleProfile | null, config?: HeatmapConfig) {
    super(container, callback, styleProfile);

    // 默认热力图配置
    this.heatmapConfig = {
      radius: 15,
      blur: 15,
      opacity: 0.7,
      gradient: [
        '#000428', // 深蓝色
        '#004e92', // 蓝色
        '#009ffd', // 浅蓝色
        '#00d2ff', // 青色
        '#7be495', // 绿色
        '#ffcc02', // 黄色
        '#ff6b35', // 橙色
        '#f7931e', // 橙红色
        '#dc2430' // 红色
      ],
      minOpacity: 0.1,
      maxOpacity: 1.0,
      ...config
    };

    this.initializeHeatmapLayer();
  }

  /**
   * 初始化热力图图层
   */
  private initializeHeatmapLayer(): void {
    const vectorSource = new VectorSource<Point>();

    // 确保gradient是有效的
    const validGradient =
      Array.isArray(this.heatmapConfig.gradient) && this.heatmapConfig.gradient.length > 0
        ? this.heatmapConfig.gradient
        : [
            '#000428', // 深蓝色
            '#004e92', // 蓝色
            '#009ffd', // 浅蓝色
            '#00d2ff', // 青色
            '#7be495', // 绿色
            '#ffcc02', // 黄色
            '#ff6b35', // 橙色
            '#f7931e', // 橙红色
            '#dc2430' // 红色
          ];

    this.heatmapLayer = new HeatmapLayer({
      source: vectorSource,
      blur: this.heatmapConfig.blur || 15,
      radius: this.heatmapConfig.radius || 15,
      opacity: this.heatmapConfig.opacity || 0.7,
      gradient: validGradient,
      weight: function (feature: Feature) {
        return feature.get('weight') || 0;
      }
    });

    console.log('热力图层初始化完成，配置:', {
      blur: this.heatmapConfig.blur,
      radius: this.heatmapConfig.radius,
      opacity: this.heatmapConfig.opacity,
      gradient: validGradient
    });

    this.map.addLayer(this.heatmapLayer);
  }

  /**
   * 设置热力数据点
   */
  public setHeatData(heatPoints: HeatPoint[]): void {
    this.currentHeatPoints = heatPoints;

    const features: Feature[] = heatPoints.map((point) => {
      // 由于MzMapBase使用EPSG:4326，直接使用原始坐标
      const feature = new Feature({
        geometry: new Point(point.coordinate),
        weight: point.weight || point.value,
        value: point.value,
        id: point.id,
        metadata: point.metadata
      });

      return feature;
    });

    const source = this.heatmapLayer.getSource();
    source.clear();
    source.addFeatures(features);

    console.log(`热力图数据更新完成，共 ${features.length} 个热力点`);
  }

  /**
   * 添加边界图层
   */
  public setBoundaryData(boundaryData: BoundaryData): void {
    // 移除现有边界图层
    if (this.boundaryLayer) {
      this.map.removeLayer(this.boundaryLayer);
    }

    if (!boundaryData.data) return;

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(boundaryData.data, {
        featureProjection: 'EPSG:4326'
      })
    });

    this.boundaryLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: boundaryData.fillColor || 'rgba(0, 0, 0, 0)' // 默认透明填充
        }),
        stroke: new Stroke({
          color: boundaryData.strokeColor || '#ffffff',
          width: boundaryData.strokeWidth || 1
        })
      }),
      visible: boundaryData.visible !== false, // 默认显示
      zIndex: 999 // 确保在热力图之上
    });

    this.map.addLayer(this.boundaryLayer);

    // 缩放到边界范围
    const extent = vectorSource.getExtent();
    this.view.fit(extent, { padding: [50, 50, 50, 50] });
  }

  /**
   * 更新热力图配置
   */
  public updateHeatmapConfig(config: Partial<HeatmapConfig>): void {
    this.heatmapConfig = { ...this.heatmapConfig, ...config };

    if (this.heatmapLayer) {
      try {
        if (config.radius !== undefined) {
          this.heatmapLayer.setRadius(config.radius);
          console.log(`热力图半径更新为: ${config.radius}`);
        }
        if (config.blur !== undefined) {
          this.heatmapLayer.setBlur(config.blur);
          console.log(`热力图模糊更新为: ${config.blur}`);
        }
        if (config.opacity !== undefined) {
          this.heatmapLayer.setOpacity(config.opacity);
          console.log(`热力图透明度更新为: ${config.opacity}`);
        }
        if (config.gradient !== undefined && Array.isArray(config.gradient) && config.gradient.length > 0) {
          this.heatmapLayer.setGradient(config.gradient);
          console.log('热力图渐变色更新为:', config.gradient);
        }

        // 强制重新渲染
        this.heatmapLayer.getSource().changed();

        // 如果有地图实例，也触发重新渲染
        if (this.map) {
          this.map.render();
        }
      } catch (error) {
        console.error('更新热力图配置时出错:', error);
      }
    }
  }

  /**
   * 切换边界显示
   */
  public toggleBoundaryVisibility(visible: boolean): void {
    if (this.boundaryLayer) {
      this.boundaryLayer.setVisible(visible);
    }
  }

  /**
   * 获取当前热力数据
   */
  public getCurrentHeatData(): HeatPoint[] {
    return this.currentHeatPoints;
  }

  /**
   * 获取热力图配置
   */
  public getHeatmapConfig(): HeatmapConfig {
    return { ...this.heatmapConfig };
  }

  /**
   * 清除所有热力数据
   */
  public clearHeatData(): void {
    if (this.heatmapLayer) {
      const source = this.heatmapLayer.getSource();
      source.clear();
    }
    this.currentHeatPoints = [];
  }

  /**
   * 清除边界图层
   */
  public clearBoundary(): void {
    if (this.boundaryLayer) {
      this.map.removeLayer(this.boundaryLayer);
      this.boundaryLayer = null;
    }
  }

  /**
   * 获取指定位置附近的热力点信息
   */
  public getHeatInfoAtCoordinate(coordinate: [number, number], tolerance: number = 0.01): HeatPoint[] {
    return this.currentHeatPoints.filter((point) => {
      const distance = Math.sqrt(Math.pow(point.coordinate[0] - coordinate[0], 2) + Math.pow(point.coordinate[1] - coordinate[1], 2));
      return distance <= tolerance;
    });
  }

  /**
   * 销毁组件，清理资源
   */
  public destroy(): void {
    this.clearHeatData();
    this.clearBoundary();
    // 这里可以添加更多清理逻辑
  }
}

export default MzHeatmap;
