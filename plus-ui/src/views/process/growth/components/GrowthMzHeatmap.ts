import MzMapBase, { StyleProfile } from '@/components/Map/MzMapBase';
import { Heatmap as HeatmapLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Text } from 'ol/style'; // 添加 Text 导入

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
  showLabels?: boolean; // 是否显示地块标签
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

    // 监听地图视图变化，动态调整热力图点半径
    this.view.on('change:resolution', () => {
      this.updateHeatmapRadius();
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
   * 根据地图缩放级别更新热力图点半径
   */
  private updateHeatmapRadius(): void {
    if (!this.heatmapLayer || !this.view) return;

    // 获取当前缩放级别
    const zoom = this.view.getZoom();
    if (zoom === undefined) return;

    // 基础半径（在缩放级别为13时的半径）
    const baseRadius = this.heatmapConfig.radius || 15;
    const baseZoom = 13;

    // 计算新的半径，随着缩放级别增加而增加
    // 使用指数函数使变化更加平滑
    const newRadius = baseRadius * Math.pow(1.25, zoom - baseZoom);

    // 设置新的半径
    this.heatmapLayer.setRadius(newRadius);
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

    // 数据更新后重新计算热力图半径
    this.updateHeatmapRadius();

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
      style: (feature) => {
        // 基础样式
        const style = new Style({
          fill: new Fill({
            color: boundaryData.fillColor || 'rgba(0, 0, 0, 0)' // 默认透明填充
          }),
          stroke: new Stroke({
            color: boundaryData.strokeColor || '#ffffff',
            width: boundaryData.strokeWidth || 1
          })
        });

        // 如果需要显示标签
        if (boundaryData.showLabels) {
          const landCode = feature.get('landCode') || '';
          style.setText(
            new Text({
              text: landCode,
              font: '12px 微软雅黑',
              fill: new Fill({
                color: '#ffffff'
              }),
              stroke: new Stroke({
                color: '#000000',
                width: 2
              })
            })
          );
        }

        return style;
      },
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
          this.heatmapConfig.radius = config.radius;
          // 当基础半径改变时，重新计算当前缩放级别下的半径
          this.updateHeatmapRadius();
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
   * 添加点击事件处理
   */
  public addClickListener(callback: (heatPoint: HeatPoint | null, coordinate: [number, number]) => void): void {
    if (!this.map) return;

    this.map.on('click', (event) => {
      // 将点击坐标转换为经纬度坐标
      const coordinate = event.coordinate as [number, number];

      // 查找点击位置附近的热力点
      const nearbyPoints = this.getHeatInfoAtCoordinate(coordinate, 0.001);

      if (nearbyPoints.length > 0) {
        // 如果有多个点，选择最近的一个
        let closestPoint = nearbyPoints[0];
        let minDistance = Math.sqrt(
          Math.pow(closestPoint.coordinate[0] - coordinate[0], 2) + Math.pow(closestPoint.coordinate[1] - coordinate[1], 2)
        );

        for (let i = 1; i < nearbyPoints.length; i++) {
          const point = nearbyPoints[i];
          const distance = Math.sqrt(Math.pow(point.coordinate[0] - coordinate[0], 2) + Math.pow(point.coordinate[1] - coordinate[1], 2));

          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }

        // 调用回调函数，传递找到的热力点信息
        callback(closestPoint, coordinate);
      } else {
        // 如果没有找到附近的热力点，也调用回调函数，但传入null
        callback(null, coordinate);
      }
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
