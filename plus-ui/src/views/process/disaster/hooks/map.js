import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { defaults, FullScreen, ScaleLine } from 'ol/control';

// 基地数据（根据图片信息）
const baseStations = [
  { id: 1, name: '侯家沟基地', village: '侯家沟', type: '智慧引领种植基地', lng: 110.37847, lat: 37.76523 },
  { id: 2, name: '姜兴庄基地', village: '姜兴庄', type: '智慧引领种植基地', lng: 110.21509, lat: 37.87646 }
  // 其他6个基地...
];

let map;
let markerLayer;

// 灾害颜色映射
const disasterColorMap = {
  '0': {
    // 旱灾
    '4': '#FFD700',
    '5': '#FFA500',
    '6': '#FF6347',
    '7': '#8B0000'
  },
  '1': {
    // 洪涝
    '8': '#ADD8E6',
    '9': '#1E90FF',
    '10': '#0000CD',
    '11': '#000080'
  },
  '2': {
    // 冰雹
    '0': '#F0F8FF',
    '1': '#B0C4DE',
    '2': '#4682B4',
    '3': '#191970'
  }
};

// 初始化地图
function initMap() {
  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat([110.3, 37.8]),
      zoom: 10
    }),
    controls: defaults().extend([new FullScreen(), new ScaleLine()])
  });

  // 创建标记图层
  markerLayer = new VectorLayer({
    source: new VectorSource(),
    style: (feature) => {
      const props = feature.getProperties();
      return new Style({
        image: new Circle({
          radius: props.level === '无' ? 8 : 12,
          fill: new Fill({ color: props.color }),
          stroke: new Stroke({ color: '#000', width: 2 })
        }),
        text: new Text({
          text: props.name,
          offsetY: 25,
          font: 'bold 12px 微软雅黑',
          fill: new Fill({ color: '#333' }),
          stroke: new Stroke({ color: '#fff', width: 3 })
        })
      });
    }
  });
  map.addLayer(markerLayer);

  setupPopup();
}

// 设置弹窗
function setupPopup() {
  const popup = new Overlay({
    element: document.getElementById('popup') || createPopupElement(),
    positioning: 'bottom-center',
    stopEvent: false
  });
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

function createPopupElement() {
  const popup = document.createElement('div');
  popup.id = 'popup';
  popup.className = 'ol-popup';
  document.body.appendChild(popup);
  return popup;
}

// 更新地图标记
function updateMarkers(warnings) {
  const source = markerLayer.getSource();
  source.clear();

  baseStations.forEach((base) => {
    const warning = warnings.find((w) => w.region.includes(base.village.replace('村', '')));

    const props = {
      name: base.name,
      village: base.village,
      type: base.type,
      level: '无',
      color: '#4CAF50',
      content: '暂无预警'
    };

    if (warning) {
      props.level = getWarningLevelLabel(warning.disasterType, warning.warningLevel);
      props.color = disasterColorMap[warning.disasterType][warning.warningLevel] || '#9E9E9E';
      props.content = warning.warningContent || '暂无详细内容';
    }

    const feature = new Feature({
      geometry: new Point(fromLonLat([base.lng, base.lat])),
      ...props
    });
    source.addFeature(feature);
  });
}

// 定位到基地
function focusOnBase(baseId) {
  const base = baseStations.find((b) => b.id === baseId);
  if (base) {
    map.getView().animate({
      center: fromLonLat([base.lng, base.lat]),
      zoom: 14,
      duration: 1000
    });
  }
}

// 获取预警等级标签
function getWarningLevelLabel(type, level) {
  const labels = {
    '0': ['轻旱', '中旱', '重旱', '极旱'],
    '1': ['一般洪涝', '较大洪涝', '重大洪涝', '特别重大洪涝'],
    '2': ['轻度冰雹', '中度冰雹', '重度冰雹', '特重冰雹']
  };
  return labels[type][level % 4] || '未知';
}

export { initMap, updateMarkers, focusOnBase };
