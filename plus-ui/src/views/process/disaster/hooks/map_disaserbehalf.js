import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle, Fill, Stroke, Style, Text, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';

// 基地坐标数据（根据图片信息）
const baseStations = [
  { id: 1, name: '侯家沟基地', village: '侯家沟', type: '智慧引领种植基地', lng: 110.37847, lat: 37.76523 },
  { id: 2, name: '姜兴庄基地', village: '姜兴庄', type: '智慧引领种植基地', lng: 110.21509, lat: 37.87646 },
  { id: 3, name: '李家寺基地', village: '李家寺', type: '数字化种植基地', lng: 110.329098, lat: 37.719932 },
  { id: 4, name: '寺沟基地', village: '寺沟', type: '数字化种植基地', lng: 110.33521, lat: 37.743249 },
  { id: 5, name: '岳盆基地', village: '岳盆', type: '数字化种植基地', lng: 110.307453, lat: 37.75618 },
  { id: 6, name: '冯渠基地', village: '冯渠', type: '数字化种植基地', lng: 110.17825, lat: 37.8147 },
  { id: 7, name: '高检村基地', village: '高检村', type: '数字化种植基地', lng: 110.211912, lat: 37.847458 },
  { id: 8, name: '候家沟南基地', village: '候家沟', type: '数字化种植基地', lng: 110.37632, lat: 37.74972 }
];

let markerLayer;
let map, modify, draw, select;
//地图地址
// let mapURL = 'http://172.29.1.48:18080/geoserver/wms';
let mapURL = '/geoserver/mz/wms';
//图层
let layer = 'mz:mz_tile';
let selectedBlock = null; //被选择的地块
let piontSource = null; //采样点图层源
// 灾害颜色映射
const disasterColorMap = {
  '0': {
    // 旱灾
    '4': '#FFD700', // 轻旱
    '5': '#FFA500', // 中旱
    '6': '#FF6347', // 重旱
    '7': '#8B0000' // 极旱
  },
  '1': {
    // 洪涝
    '8': '#ADD8E6', // 一般
    '9': '#1E90FF', // 较大
    '10': '#0000CD', // 重大
    '11': '#000080' // 特大
  },
  '2': {
    // 冰雹
    '0': '#F0F8FF', // 轻度
    '1': '#B0C4DE', // 中度
    '2': '#4682B4', // 重度
    '3': '#191970' // 极重
  }
};

// 初始化地图
// function initMap() {
//   map = new Map({
//     target: 'map',
//     layers: [
//       new TileLayer({
//         source: new OSM()
//       })
//     ],
//     view: new View({
//       center: fromLonLat([110.3, 37.8]),
//       zoom: 10
//     })
//   });

//   // 创建标记图层
//   markerLayer = new VectorLayer({
//     source: new VectorSource(),
//     style: feature => {
//       const properties = feature.getProperties();
//       return new Style({
//         image: new Circle({
//           radius: properties.level === '无' ? 6 : 10,
//           fill: new Fill({ color: properties.color }),
//           stroke: new Stroke({ color: '#000', width: 1 })
//         }),
//         text: new Text({
//           text: properties.name,
//           offsetY: 20,
//           font: 'bold 12px 微软雅黑',
//           fill: new Fill({ color: '#333' })
//         })
//       });
//     }
//   });
//   map.addLayer(markerLayer);
//        setupPopup();

// }

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

// 更新地图标记
function updateMarkers(warnings) {
  const source = markerLayer.getSource();
  source.clear();

  baseStations.forEach((base) => {
    const warning = warnings.find((w) => w.region.includes(base.village.replace('村', '')));

    const properties = {
      name: base.name,
      village: base.village,
      type: base.type,
      level: '无',
      color: 'green',
      content: '暂无预警'
    };

    if (warning) {
      properties.level = warning.warningLevel;
      properties.color = disasterColorMap[warning.disasterType][warning.warningLevel] || 'gray';
      properties.content = warning.warningContent;
    }

    const feature = new Feature({
      geometry: new Point(fromLonLat([base.lng, base.lat])),
      ...properties
    });
    source.addFeature(feature);
  });
}

// 定位到特定基地
function focusOnBase(baseId) {
  const base = baseStations.find((b) => b.id === baseId);
  if (base) {
    map.getView().animate({
      center: fromLonLat([base.lng, base.lat]),
      zoom: 14
    });
  }
}
// 在updateMarkers函数中增强样式
// function updateMarkers(warnings) {
//   const source = markerLayer.getSource();
//   source.clear();

//   baseStations.forEach(base => {
//     const warning = warnings.find(w =>
//       w.region.includes(base.village.replace('村', ''))
//     );

//     const properties = {
//       name: base.name,
//       village: base.village,
//       type: base.type,
//       level: '无',
//       color: '#4CAF50', // 默认绿色
//       content: '暂无预警'
//     };

//     if (warning) {
//       const disasterType = warning.disasterType;
//       const warningLevel = warning.warningLevel;

//       properties.level = getWarningLevelLabel(disasterType, warningLevel);
//       properties.color = disasterColorMap[disasterType][warningLevel] || '#9E9E9E';
//       properties.content = warning.warningContent || '暂无详细内容';
//     }

//     const feature = new Feature({
//       geometry: new Point(fromLonLat([base.lng, base.lat])),
//       ...properties
//     });

//     // 设置自定义样式
//     feature.setStyle(createMarkerStyle(properties));
//     source.addFeature(feature);
//   });
// }

// 创建标记样式
function createMarkerStyle(properties) {
  return new Style({
    image: new Circle({
      radius: properties.level === '无' ? 6 : 10,
      fill: new Fill({ color: properties.color }),
      stroke: new Stroke({
        color: '#000',
        width: properties.level === '无' ? 1 : 2
      })
    }),
    text: new Text({
      text: `${properties.name} (${properties.level})`,
      offsetY: 25,
      font: 'bold 12px 微软雅黑',
      fill: new Fill({ color: '#333' }),
      stroke: new Stroke({
        color: '#fff',
        width: 2
      })
    })
  });
}

// 获取预警等级标签
function getWarningLevelLabel(disasterType, level) {
  const labels = {
    '0': ['轻旱', '中旱', '重旱', '极旱'],
    '1': ['一般洪涝', '较大洪涝', '重大洪涝', '特别重大洪涝'],
    '2': ['轻度冰雹', '中度冰雹', '重度冰雹', '特重冰雹']
  };
  return labels[disasterType][level % 4] || '未知';
}
// 在map.js中添加弹出窗口功能
function setupPopup() {
  const popup = new Overlay({
    element: document.createElement('div'),
    positioning: 'bottom-center',
    stopEvent: false
  });
  popup.getElement().className = 'ol-popup';
  map.addOverlay(popup);

  map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
      const props = feature.getProperties();
      popup.getElement().innerHTML = `
        <div class="popup-content">
          <h3>${props.name}</h3>
          <p>类型: ${props.type}</p>
          <p>灾害: ${props.level}</p>
          <p>详情: ${props.content}</p>
        </div>
      `;
      popup.setPosition(evt.coordinate);
    } else {
      popup.setPosition(undefined);
    }
  });
}

// 在initMap中调用
// function initMap() {
//   map = new Map({
//     target: 'map',
//     layers: [
//       new TileLayer({
//         source: new OSM()
//       })
//     ],
//     view: new View({
//       center: fromLonLat([110.3, 37.8]),
//       zoom: 10
//     })
//   });

//   // 创建标记图层
//   markerLayer = new VectorLayer({
//     source: new VectorSource(),
//     style: feature => {
//       const properties = feature.getProperties();
//       return new Style({
//         image: new Circle({
//           radius: properties.level === '无' ? 6 : 10,
//           fill: new Fill({ color: properties.color }),
//           stroke: new Stroke({ color: '#000', width: 1 })
//         }),
//         text: new Text({
//           text: properties.name,
//           offsetY: 20,
//           font: 'bold 12px 微软雅黑',
//           fill: new Fill({ color: '#333' })
//         })
//       });
//     }
//   });
//   map.addLayer(markerLayer);
//     setupPopup();
// }
export { initMap, updateMarkers, focusOnBase };
