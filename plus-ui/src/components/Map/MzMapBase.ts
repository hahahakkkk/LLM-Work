import { Map, View } from 'ol';
import { Projection } from 'ol/proj';
import { TileWMS } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ.js';
import { getCenter } from 'ol/extent';
import { defaults, ScaleLine, FullScreen } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Text } from 'ol/style';
import Feature from 'ol/Feature';

import 'ol/ol.css';
// import { callback } from "@/api/login";

const mapURL = '/geoserver/mz/wms';
const baseLayerName = 'mz:mz_tile';

/**
 * 行政区划式样
 * @param {*} f
 * @returns
 */
function xzqhStyle(f: any) {
  return new Style({
    fill: new Fill({
      color: 'rgba(255,255,255,0.2)'
    }),
    stroke: new Stroke({
      color: 'rgba( 0, 0, 255, 0.9)',
      width: 2
    }),
    text: new Text({
      font: '18px 微软雅黑,黑体,Calibri,sans-serif',
      fill: new Fill({
        color: '#00f'
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3
      }),
      text: f.get('NAME')
    })
  });
}

export class StyleProfile {
  public mzBaseStroke: Stroke = new Stroke({
    color: 'rgba(255,0,0,0.9)', // 目前，地图在低缩放下的红色边界导致了广泛的困惑，某些情况改为透明绿色边界，避免与预警颜色冲突
    width: 1
  });
}

class MzMapBase {
  protected map: Map;
  protected view: View;
  protected jd_layer: VectorLayer; //基地图层
  protected callback: (() => void) | null;
  protected styleProfile: StyleProfile;

  constructor(container: HTMLElement | string | any, callback: (() => void) | null = null, styleProfile: StyleProfile | null = null) {
    const pro = new Projection({
      code: 'EPSG:4326',
      units: 'degrees',
      axisOrientation: 'neu'
    });

    this.styleProfile = styleProfile || new StyleProfile();
    styleProfile = this.styleProfile;

    const ext = [109.6875, 37.6171875, 110.56640625, 38.14453125];
    /**
     * 底图
     */
    const baseLayer = new TileLayer({
      extent: ext,
      // source: new TileWMS({
      //     url: mapURL,
      //     params: {
      //         'LAYERS': baseLayerName,
      //         'TILED': false
      //     },
      //     serverType: 'geoserver'
      // })
      //更换为吉林一号, 2025-7-30
      source: new XYZ({
        projection: 'EPSG:3857',
        url: 'https://api.jl1mall.com/getMap/{z}/{x}/{-y}?mk=73ad26c4aa6957eef051ecc5a15308b4&tk=7cda6357553bcfe9117eb962d391ca80',
        maxZoom: 18,
        minZoom: 0
      })
    });

    //镇行政区划
    const xzqh_layer = new VectorLayer({
      source: new VectorSource({
        // url: '/map-json/town_boundary.geojson',
        url: '/map-json/mz-all.geojson',
        format: new GeoJSON()
      }),
      style: xzqhStyle
    });

    this.callback = callback;

    this.jd_layer = new VectorLayer({
      source: new VectorSource({
        url: '/map-json/mz-base.geojson',
        format: new GeoJSON()
      }),
      zIndex: 1000,
      style: function (f) {
        return new Style({
          stroke: styleProfile!.mzBaseStroke,
          fill: new Fill({
            color: 'rgba(0, 0, 0, 0)' // 完全透明的填充
          }),
          text: new Text({
            font: '18px 微软雅黑,Calibri,sans-serif',
            fill: new Fill({
              color: '#0000ff'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 3
            }),
            text: f.get('NAME')
          })
        });
      }
    });

    this.view = new View({
      extent: ext,
      center: getCenter(ext),
      zoom: 13,
      maxZoom: 20,
      minZoom: 11,
      projection: pro
    });

    this.map = new Map({
      target: container,
      layers: [baseLayer, xzqh_layer, this.jd_layer],
      view: this.view,
      controls: defaults({ attribution: false }).extend([
        new FullScreen(),
        new ScaleLine({
          units: 'metric'
        })
      ]),
      pixelRatio: window.devicePixelRatio || 1
    });

    this.map.once('rendercomplete', () => {
      // console.log('Map has finished loading.');
      if (this.callback) {
        // console.log(this.callback)
        this.callback();
      }
    });
  }

  /**
   * 地图视图移动到 f 点
   * @param f
   */
  viewMoveTo(f: Feature) {
    const extent = f.getGeometry().getExtent();
    this.view.fit(extent, {
      duration: 1000, //动画的持续时间,
      maxZoom: 19
    });
  }

  /**
   * 基地定位
   * @param name
   */
  basePointLocate(name: string) {
    const features = this.jd_layer.getSource()?.getFeatures();

    let feature;
    for (let i = 0; i < features.length; i++) {
      if (features[i].get('NAME') == name) {
        feature = features[i];
        break;
      }
    }
    if (feature) {
      this.viewMoveTo(feature);
    }
  }

  /**
   * 获取地图实例
   */
  getMap() {
    return this.map;
  }

  /**
   * 获取视图实例
   */
  getView() {
    return this.view;
  }
}

export function useMzMapBase(container: string | HTMLElement | any, callback: (() => void) | null) {
  const mzMapBase = new MzMapBase(container, callback);
  return mzMapBase;
}

export default MzMapBase;
