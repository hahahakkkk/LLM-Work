import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import TileWMS from 'ol/source/TileWMS.js';
import { Projection } from 'ol/proj';
import { defaults, FullScreen, ScaleLine } from 'ol/control';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Draw, Snap, Modify, Select } from 'ol/interaction';
import { Style, Stroke, Fill, Text, Icon } from 'ol/style';
import { Point } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import { getArea } from 'ol/sphere';
import { getCenter } from 'ol/extent';
import { pointerMove } from 'ol/events/condition';
import exported from 'gcoord';

import 'ol/ol.css';
import locateIcon from '../commponents/locate.svg';
import Feature from 'ol/Feature';

import { updateLandUnit } from '../api/landUnit';

let map, modify, draw, select;
//地图地址
// let mapURL = 'http://172.29.1.48:18080/geoserver/wms';
let mapURL = '/geoserver/mz/wms';
//图层
let layer = 'mz:mz_tile';
let selectedBlock = null; //被选择的地块
let piontSource = null; //采样点图层源

/**
 * 火星坐标转WGS84（EPSG:4326）
 * @param {String|GeoJSON|projection} gcj
 * @returns
 */
function gcj02ToG84(gcj) {
  return exported.transform(gcj, exported.GCJ02, exported.WGS84);
}

/**
 * 行政区划式样
 * @param {*} f
 * @returns
 */
function textStyle(f) {
  return new Style({
    fill: new Fill({
      color: 'rgba(255,255,255,0.2)'
    }),
    stroke: new Stroke({
      color: 'rgba( 0, 0, 255, 0.9)',
      width: 2
    }),
    text: new Text({
      font: '18px 微软雅黑,Calibri,sans-serif',
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

/**
 * 地块管理
 *
 */
const landUnit = {
  drawing: false, //正在绘制
  modifying: false, //正在修改
  drawSource: null, //地块图层源
  draw: null, //绘图对象
  modify: null,
  /**
   * 计算面积，单位：亩。
   * @param {*} feature
   */
  areaCal: function (feature) {
    const area = getArea(feature.getGeometry(), {
      projection: 'EPSG:4326'
    });
    return Math.round((area / 666.67) * 100) / 100;
  },

  //获取元素的坐标集合
  featurePoint: function (feature) {
    const points = feature.getGeometry().getCoordinates()[0];
    const str = [];
    points.forEach(function (v, k) {
      str.push(v[0] + ' ' + v[1]);
    });
    return 'POLYGON((' + str.join(',') + '))';
  },

  /**
   * 放弃绘制
   * @param {*} e
   */
  drawAbort: function (e) {
    if (e.key === 'Escape') {
      if (landUnit.draw) {
        landUnit.draw.abortDrawing();
      }
    }
  },
  /**
   * 添加地块
   * @param {*} landUnits 地块GeoJSON数据
   */
  addLandUnit: (landUnits) => {
    landUnit.drawSource.clear(true);
    landUnit.drawSource.addFeatures(new GeoJSON().readFeatures(landUnits));
  },
  /**
   * 删除地块
   * @param {*} fe
   */
  removeLandUnit: (fe) => {
    landUnit.drawSource.removeFeature(fe);
  },

  //地块图层初始化
  init: function () {
    this.drawSource = new VectorSource({ wrapX: false });
    const drawLayer = new VectorLayer({
      source: this.drawSource,
      style: (f) => {
        return new Style({
          fill: new Fill({
            color: 'rgba(255,255,255,0.2)'
          }),
          stroke: new Stroke({
            color: 'rgba( 255, 255, 0, 0.9)',
            width: 2
          }),
          text: new Text({
            font: '10pt 微软雅黑,Calibri,sans-serif',
            fill: new Fill({
              color: '#f00'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2
            }),
            text: f.get('landCode')
          })
        });
      }
    });
    map.addLayer(drawLayer);

    //绘图对象
    this.draw = new Draw({
      source: this.drawSource,
      type: 'Polygon',
      snapTolerance: 10
    });

    //修改
    this.modify = new Modify({ source: this.drawSource });

    //吸附
    const snap = new Snap({
      source: this.drawSource
    });
    map.addInteraction(snap);
  },
  //绘制开始
  drawBegin: function (cb) {
    //按ESC时取消绘制
    window.addEventListener('keydown', this.drawAbort);
    //触发绘制事件
    this.draw.on('drawstart', () => {
      this.drawing = true;
    });
    //触发绘制结束事件
    this.draw.on('drawend', (e) => {
      e.feature.set('landCode', '未命名');
      this.drawing = false;
      let a = this.areaCal(e.feature);
      let b = this.featurePoint(e.feature);
      cb({
        feature: e.feature,
        landArea: a,
        geomText: b
      });
    });
    //添加绘制交互
    map.addInteraction(this.draw);
  },
  //退出绘制
  drawEnd: function () {
    //去除绘制交互
    map.removeInteraction(this.draw);
    //取消esc监听
    window.removeEventListener('keydown', this.drawAbort);
  },

  //修改开始
  modiBegin: function () {
    //修改开始
    this.modify.on('modifystart', () => {
      this.modifying = true;
    });
    //修改结束
    this.modify.on('modifyend', (e) => {
      const that = this;
      e.features.forEach(async function (feature) {
        const geom = that.featurePoint(feature);
        const id = feature.get('landId');
        const area = that.areaCal(feature);
        await updateLandUnit({
          geomText: geom,
          landId: id,
          landArea: area
        });
      });
      this.modifying = false;
    });
    map.addInteraction(this.modify);
  },

  modiEnd: () => {
    //去除绘制交互
    map.removeInteraction(landUnit.modify);
  }
};

/**
 * 被选择地块样式
 */
const selectStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 0, 0, 0.2)'
  }),
  stroke: new Stroke({
    color: 'rgba(255, 0, 0, 0.7)',
    width: 2
  })
});

/**
 * 采样点管理
 */
/**
 *
 * @returns 采样点样式
 */
function locationStyle(f) {
  return new Style({
    image: new Icon({
      src: locateIcon
    }),
    text: new Text({
      font: '12px 微软雅黑,Calibri,sans-serif',
      fill: new Fill({
        color: '#00f'
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3
      }),
      offsetY: -23,
      text: f.get('pointCode')
    })
  });
}
const collectPoint = {
  pointLayer: null,

  /**
   * 添加采样点层
   * @param {*} json
   */
  addPointLayer: (json) => {
    piontSource = new VectorSource({
      features: new GeoJSON().readFeatures(json),
      wrapX: false
    });
    collectPoint.pointLayer = new VectorLayer({
      source: piontSource,
      style: locationStyle
    });
    map.addLayer(collectPoint.pointLayer);
    // piontSource.addFeatures(new GeoJSON().readFeatures(json));
  },

  /**
   * 添加采样点
   * @param {*} loc //经纬度坐标
   */
  addPoint: (loc, id, code) => {
    const geom = new Point(loc);
    const feature = new Feature({
      geometry: geom,
      id: id,
      code: code
    });

    collectPoint.pointLayer.getSource().addFeature(feature);
    //移动到新增点
    map.getView().fit(geom.getExtent(), {
      duration: 1000, //动画的持续时间,
      maxZoom: 19
    });
  },
  /**
   * 删除采样点
   * @param {*} id
   */
  removePoint: (id) => {
    const feature = getFeatureById(id, 'point');
    collectPoint.pointLayer.getSource().removeFeature(feature);
  },
  /**
   * 修改采样点
   * @param {*} id
   * @param {*} loc
   */
  modiPoint: (id, loc) => {
    const feature = collectPoint.pointLayer.getSource().getFeatureById(id);
    feature.setGeometry(new Point(loc));
  }
};

/**
 * 地图初始化
 */
function initMap() {
  const pro = new Projection({
    code: 'EPSG:4326',
    units: 'degrees',
    axisOrientation: 'neu'
  });

  const ext = [109.6875, 37.6171875, 110.56640625, 38.14453125];
  const layers = [
    new TileLayer({
      extent: ext,
      source: new TileWMS({
        url: mapURL,
        params: {
          'LAYERS': layer,
          'TILED': true
        },
        ratio: 1,
        serverType: 'geoserver'
      })
    })
  ];

  map = new Map({
    layers: layers,
    controls: defaults().extend([
      new FullScreen(),
      new ScaleLine({
        units: 'metric'
      })
    ]),
    target: 'map',
    view: new View({
      extent: ext,
      center: getCenter(ext),
      zoom: 11,
      maxZoom: 20,
      minZoom: 11,
      projection: pro
    })
  });

  const xzqh_layer = new VectorLayer({
    source: new VectorSource({
      url: '/map-json/mz-all.geojson',
      format: new GeoJSON()
    }),
    style: textStyle
  });
  map.addLayer(xzqh_layer);

  //移动鼠标选择地块
  // const selectPointerMove = new Select({
  //     condition: pointerMove,
  //     style: selectStyle,
  // });
  // map.addInteraction(selectPointerMove);
}

/**
 * 地图移动、放大到目标点
 * @param {*} id 目标ID
 * @param {*} fe 目标类型：point(采样点)，block(地块)
 */
function locate(id, fe = 'block') {
  const view = map.getView();
  const feature = getFeatureById(id, fe);

  const extent = feature.getGeometry().getExtent();
  view.fit(extent, {
    duration: 1000, //动画的持续时间,
    maxZoom: 19
  });
}

/**
 * 通过ID查询Feature
 * @param {*} id
 * @param {*} fe
 * @returns
 */
function getFeatureById(id, fe = 'block') {
  let allFeature;
  let t = '';
  if (fe === 'block') {
    allFeature = landUnit.drawSource.getFeatures();
    t = 'landId';
  } else {
    allFeature = piontSource.getFeatures();
    t = 'pointId';
  }
  for (var i = 0; i < allFeature.length; i++) {
    if (allFeature[i].get(t) == id) {
      return allFeature[i];
    }
  }
}

export function useMap() {
  return { initMap, landUnit, locate, collectPoint, gcj02ToG84 };
}
