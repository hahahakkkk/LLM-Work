from flask import Flask, request, jsonify, send_file, after_this_request
from werkzeug.utils import secure_filename
import os
import tempfile
import uuid
import io
import json
import time
import cv2
import numpy as np
import torch
from PIL import Image, ImageDraw
import rasterio
from pyproj import Transformer
import zipfile
import base64
import requests
from tqdm import tqdm

# ====== 关键修改：优先使用本地自定义 Ultralytics ======
import sys
custom_path = r"/home/rui/newwork/seedingApi/ultralytics"
if custom_path not in sys.path:
    sys.path.insert(0, custom_path)
# =====================================================

from ultralytics import YOLO

app = Flask(__name__)

# 设置上传文件大小限制（例如100MB）
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

# API健康检查
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'success',
        'message': '谷苗检测API服务运行正常',
        'version': '1.0.0'
    })


# 添加全局变量存储临时文件路径
import threading
zip_files_cache = {}
lock = threading.Lock()

# ====== 任务队列与进度跟踪 ======
task_lock = threading.Lock()
tasks = {}

def _make_workdir():
    base = os.path.join(os.getcwd(), "temp")
    os.makedirs(base, exist_ok=True)
    workdir = os.path.join(base, f"task_{int(time.time())}_{uuid.uuid4().hex[:8]}")
    os.makedirs(workdir, exist_ok=True)
    return workdir

def _update_task(task_id, **kwargs):
    with task_lock:
        if task_id in tasks:
            tasks[task_id].update(kwargs)

def _process_task(task_id, params):
    try:
        _update_task(task_id, status="running", stage="downloading", progress=5)
        base_name = params["base_name"]
        base_id = params["base_id"]
        plot_name = params["plot_name"]
        plot_id = params["plot_id"]
        tif_url = params["tif_url"]

        workdir = _make_workdir()
        _update_task(task_id, workdir=workdir)

        response = requests.get(tif_url, stream=True)
        response.raise_for_status()
        filename = os.path.basename(tif_url)
        temp_file_path = os.path.join(workdir, secure_filename(filename))

        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        with open(temp_file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if not chunk:
                    continue
                size = f.write(chunk)
                downloaded += size
                if total_size > 0:
                    pct = 5 + int(15 * downloaded / total_size)
                    _update_task(task_id, progress=min(pct, 20))

        _update_task(task_id, stage="processing", progress=25)
        zip_filepath, _ = perform_seeding_detection(
            temp_file_path,
            base_name, base_id, plot_name, plot_id, tif_url,
            task_id=task_id
        )

        if not zip_filepath or not os.path.exists(zip_filepath):
            raise RuntimeError("检测失败，结果文件不存在")

        _update_task(task_id, status="done", stage="done", progress=100, result_zip=zip_filepath)

    except Exception as e:
        _update_task(task_id, status="error", stage="error", progress=100, error=str(e))



@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """
    下载检测结果压缩包
    """
    try:
        with lock:
            filepath = zip_files_cache.get(filename)
        
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': '文件不存在或已过期'}), 404
        
        # 发送文件
        response = send_file(filepath, as_attachment=True, download_name=filename)
        
        # 删除临时文件
        try:
            os.remove(filepath)
            temp_dir = os.path.dirname(filepath)
            os.rmdir(temp_dir)  # 尝试删除临时目录
        except:
            pass  # 忽略删除临时文件的错误
        
        with lock:
            if filename in zip_files_cache:
                del zip_files_cache[filename]
        
        return response
    
    except Exception as e:
        return jsonify({'error': f'下载失败: {str(e)}'}), 500


@app.route('/api/seeding-detection/submit', methods=['POST'])
def seeding_detection_submit():
    """提交检测任务，返回task_id"""
    data = request.form
    base_name = data.get('base_name')
    base_id = data.get('base_id')
    plot_name = data.get('plot_name')
    plot_id = data.get('plot_id')
    tif_url = data.get('tif_url')

    if not all([base_name, base_id, plot_name, plot_id, tif_url]):
        return jsonify({'success': False, 'message': '缺少必需参数'}), 400

    if not tif_url.lower().endswith(('.tif', '.tiff')):
        return jsonify({'success': False, 'message': '文件格式不正确，请提供.tif或.tiff格式的文件链接'}), 400

    task_id = uuid.uuid4().hex
    with task_lock:
        tasks[task_id] = {
            'task_id': task_id,
            'status': 'queued',
            'stage': 'queued',
            'progress': 0,
            'error': None,
            'result_zip': None,
            'workdir': None,
            'created_at': time.time()
        }

    params = {
        'base_name': base_name,
        'base_id': base_id,
        'plot_name': plot_name,
        'plot_id': plot_id,
        'tif_url': tif_url
    }
    t = threading.Thread(target=_process_task, args=(task_id, params), daemon=True)
    t.start()

    return jsonify({'success': True, 'task_id': task_id})


@app.route('/api/seeding-detection/status/<task_id>', methods=['GET'])
def seeding_detection_status(task_id):
    """查询任务状态与进度"""
    with task_lock:
        task = tasks.get(task_id)
    if not task:
        return jsonify({'success': False, 'message': '任务不存在'}), 404
    return jsonify({'success': True, 'data': {
        'task_id': task['task_id'],
        'status': task['status'],
        'stage': task['stage'],
        'progress': task['progress'],
        'error': task['error']
    }})


@app.route('/api/seeding-detection/result/<task_id>', methods=['GET'])
def seeding_detection_result(task_id):
    """下载结果zip"""
    with task_lock:
        task = tasks.get(task_id)
    if not task:
        return jsonify({'success': False, 'message': '任务不存在'}), 404
    if task['status'] != 'done' or not task['result_zip'] or not os.path.exists(task['result_zip']):
        return jsonify({'success': False, 'message': '任务未完成或结果不存在'}), 400

    zip_path = task['result_zip']

    @after_this_request
    def _cleanup(response):
        try:
            # 保留工作目录，便于排查；如需清理可改为删除workdir
            pass
        except Exception:
            pass
        return response

    return send_file(zip_path, as_attachment=True, download_name=os.path.basename(zip_path))


@app.route('/api/seeding-detection', methods=['POST'])
def seeding_detection():
    """
    谷苗检测API接口
    输入参数：
    - base_name: 基地名
    - base_id: 基地id
    - plot_name: 地块名
    - plot_id: 地块id
    - tif_url: 对应的tif图片地址
    
    输出：
    - tif_url: 对应的tif图片地址
    - base_name: 基地名
    - base_id: 基地id
    - plot_name: 地块名
    - plot_id: 地块id
    - total_seedlings: 出苗总数
    - plot_coordinates: 地块坐标
    - plot_area: 地块面积
    - seedling_density: 苗密度
    - result_zip_url: 包含检测结果图像和详细数据的压缩包下载链接
    """
    try:
        print("DEBUG: 开始处理请求")
        # 获取请求参数
        data = request.form
        
        base_name = data.get('base_name')
        base_id = data.get('base_id')
        plot_name = data.get('plot_name')
        plot_id = data.get('plot_id')
        tif_url = data.get('tif_url')
        
        print(f"DEBUG: 接收的参数 - base_name: {base_name}, base_id: {base_id}, plot_name: {plot_name}, plot_id: {plot_id}")
        print(f"DEBUG: tif_url: {tif_url}")
        
        # 验证必需参数
        if not all([base_name, base_id, plot_name, plot_id, tif_url]):
            print("DEBUG: 缺少必需参数")
            return jsonify({
                'success': False,
                'message': '缺少必需参数'
            }), 400
        
        print("DEBUG: 参数验证通过")
        
        # 从链接下载TIF文件
        # 验证tif_url是否有效
        if not tif_url:
            print("DEBUG: 缺少tif文件链接")
            return jsonify({
                'success': False,
                'message': '缺少tif文件链接'
            }), 400
        
        # 验证URL扩展名
        if not tif_url.lower().endswith(('.tif', '.tiff')):
            print("DEBUG: 文件格式不正确")
            return jsonify({
                'success': False,
                'message': '文件格式不正确，请提供.tif或.tiff格式的文件链接'
            }), 400
        
        print("DEBUG: 开始下载TIF文件")
        
        # 保持原同步接口：不再执行，提示改用任务模式
        return jsonify({
            'success': False,
            'message': '当前接口已改为任务提交模式，请调用 /api/seeding-detection/submit'
        }), 400
        
    except Exception as e:
        print(f"DEBUG: 服务器内部错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'服务器内部错误: {str(e)}'
        }), 500


def convert_to_serializable(obj):
    """将numpy类型转换为JSON可序列化类型"""
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    return obj

def predict_yolo_obb_batch(images, model):
    """YOLO-OBB模型批量预测出苗数"""
    # 转换为PIL图像列表（这一步如果是CPU密集型，可考虑优化）
    pil_images = [Image.fromarray(img) if not isinstance(img, Image.Image) else img for img in images]
    
    # 显式指定device和half精度（如果支持）
    device = "cuda" if torch.cuda.is_available() else "cpu"
    # 注意：部分模型或输入会导致 half 精度不兼容错误，默认关闭
    # 如需启用，可设置环境变量 HALF_PRECISION=1
    half = os.getenv("HALF_PRECISION", "0") == "1" and device == "cuda"
    
    # 批量推理
    # optimize: half=True, augment=False, verbose=False
    results = model(pil_images, verbose=False, stream=False, device=device, half=half)
    
    counts = []
    for result in results:
        count = 0
        obbs = result.obb
        if obbs is not None:
            confidences = obbs.conf.cpu().numpy()
            count = np.sum(confidences > 0.35)  # 置信度阈值0.35
        counts.append(int(count))
    return counts

def split_image(img, tile_width=640, tile_height=640, overlap=0.2):
    """带重叠分割小块（用于检测，避免边缘漏检）"""
    height, width = img.shape[:2]
    stride_w = int(tile_width * (1 - overlap))
    stride_h = int(tile_height * (1 - overlap))
    if stride_w <= 0 or stride_h <= 0:
        raise ValueError("重叠比例过大，步长必须为正数")
    grid_x = max(1, (width - tile_width + stride_w - 1) // stride_w)
    grid_y = max(1, (height - tile_height + stride_h - 1) // stride_h)
    tiles, positions, black_ratios = [], [], []
    for j in range(grid_y):
        for i in range(grid_x):
            x1, y1 = i * stride_w, j * stride_h
            x2, y2 = min(x1 + tile_width, width), min(y1 + tile_height, height)
            if x2 - x1 < tile_width:
                x1 = max(0, x2 - tile_width)
            if y2 - y1 < tile_height:
                y1 = max(0, y2 - tile_height)
            tile = img[y1:y2, x1:x2]
            tiles.append(tile)
            # 计算黑色像素比例（过滤背景）
            # 仅当像素3通道全为0时计为黑色，避免单通道误判
            if tile.ndim == 3:
                black_pixels = np.sum(np.all(tile == 0, axis=2))
                total_pixels = tile.shape[0] * tile.shape[1]
            else:
                black_pixels = np.sum(tile == 0)
                total_pixels = tile.size
            black_ratio = black_pixels / total_pixels if total_pixels > 0 else 0
            positions.append({
                "row": j, "col": i, "x1": int(x1), "y1": int(y1),
                "x2": int(x2), "y2": int(y2), "black_ratio": black_ratio,
                "tile_width": tile_width, "tile_height": tile_height
            })
            black_ratios.append(black_ratio)
    return tiles, positions, black_ratios

def split_image_no_overlap(img, tile_width=640, tile_height=640):
    """无重叠分割小块（用于面积统计，避免重复计算）"""
    height, width = img.shape[:2]
    stride_w = tile_width  # 无重叠，步长=小块宽度
    stride_h = tile_height  # 无重叠，步长=小块高度
    grid_x = (width + stride_w - 1) // stride_w  # 计算列数
    grid_y = (height + stride_h - 1) // stride_h  # 计算行数
    tiles, positions, black_ratios = [], [], []
    for j in range(grid_y):
        for i in range(grid_x):
            x1, y1 = i * stride_w, j * stride_h
            x2, y2 = min(x1 + tile_width, width), min(y1 + tile_height, height)
            tile = img[y1:y2, x1:x2]
            tiles.append(tile)
            # 计算黑色像素比例
            if tile.ndim == 3:
                black_pixels = np.sum(np.all(tile == 0, axis=2))
                total_pixels = tile.shape[0] * tile.shape[1]
            else:
                black_pixels = np.sum(tile == 0)
                total_pixels = tile.size
            black_ratio = black_pixels / total_pixels if total_pixels > 0 else 0
            positions.append({
                "row": j, "col": i, "x1": int(x1), "y1": int(y1),
                "x2": int(x2), "y2": int(y2), "black_ratio": black_ratio,
                "tile_width": tile_width, "tile_height": tile_height,
                "tile_id": i + j * grid_x  # 无重叠小块唯一ID
            })
            black_ratios.append(black_ratio)
    return tiles, positions, black_ratios

def get_color(seedling_count):
    """根据出苗数确定区块颜色（渲染用）"""
    if seedling_count > 5:
        return (100, 255, 100)
    elif seedling_count > 3 and seedling_count <= 5:
        return (255, 255, 100)
    elif seedling_count > 1 and seedling_count <= 3:
        return (255, 80, 0)
    else:
        return (255, 0, 0)

def render_colored_overlay(original_img, results, alpha=80, black_threshold=0.3, output_max_size=None):
    """渲染带颜色叠加的检测结果图（过滤黑色背景）"""
    img = original_img.convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for result in results:
        position = result["position"]
        seedling_count = result["seedling_count"]
        if position["black_ratio"] > black_threshold:
            continue  # 跳过黑色背景块
        color = get_color(seedling_count)
        x1, y1, x2, y2 = position["x1"], position["y1"], position["x2"], position["y2"]
        draw.rectangle([(x1, y1), (x2, y2)], fill=color + (alpha,))
    composite = Image.alpha_composite(img, overlay)
    output_img = composite.convert("RGB")
    # 输出图像降分辨率以减少体积与编码时间
    if output_max_size and output_img.size[0] > output_max_size:
        ratio = output_max_size / output_img.size[0]
        new_size = (output_max_size, int(output_img.size[1] * ratio))
        output_img = output_img.resize(new_size, Image.BILINEAR)
    return output_img

def decimal_to_dms(decimal_degrees, is_latitude=True):
    """十进制经纬度转度分秒格式"""
    direction = "N" if (is_latitude and decimal_degrees >= 0) else "S" if is_latitude else "E" if decimal_degrees >= 0 else "W"
    abs_deg = abs(decimal_degrees)
    degrees = int(abs_deg)
    minutes = int((abs_deg - degrees) * 60)
    seconds = round((abs_deg - degrees - minutes / 60) * 3600, 2)
    return f"{degrees}°{minutes}′{seconds}″{direction}"

def get_tiff_geo_info(tiff_data):
    """读取TIFF图片的地理信息"""
    try:
        with rasterio.open(io.BytesIO(tiff_data)) as src:
            return {
                "transform": src.transform,
                "crs": src.crs,
                "width": src.width,
                "height": src.height
            }, None
    except Exception as e:
        return None, f"TIFF地理信息读取失败：{str(e)}"

def pixel_to_latlon(center_x, center_y, transform, crs):
    """像素坐标转度分秒经纬度"""
    try:
        if transform is None or crs is None:
            return "无法获取", "无法获取"
        proj_x, proj_y = transform * (center_x, center_y)
        transformer = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)
        lon, lat = transformer.transform(proj_x, proj_y)
        lat_dms = decimal_to_dms(lat, is_latitude=True)
        lon_dms = decimal_to_dms(lon, is_latitude=False)
        return lat_dms, lon_dms
    except Exception as e:
        print(f"经纬度转换失败：{str(e)}")
        return "无法获取", "无法获取"

def split_into_6_blocks(img_shape, geo_info=None):
    """划分3×2区块并计算中心经纬度"""
    height, width = img_shape[:2]
    block_width = width // 3
    block_height = height // 2
    blocks = []
    for row in range(2):
        for col in range(3):
            x1, y1 = col * block_width, row * block_height
            x2 = (col + 1) * block_width if col < 2 else width
            y2 = (row + 1) * block_height if row < 1 else height
            if x2 <= x1:
                x2 = x1 + 1
            if y2 <= y1:
                y2 = y1 + 1
            center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
            block_info = {
                "block_id": row * 3 + col + 1,
                "row": row, "col": col,
                "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                "center_x": center_x, "center_y": center_y,
                "seedling_count": 0,  # 初始化实际出苗数
                "valid_tile_count": 0  # 初始化有效小块数
            }
            # 若有地理信息，补充经纬度
            if geo_info and geo_info.get("transform") is not None and geo_info.get("crs") is not None:
                lat_dms, lon_dms = pixel_to_latlon(center_x, center_y, geo_info["transform"], geo_info["crs"])
                block_info["latitude"] = lat_dms
                block_info["longitude"] = lon_dms
            blocks.append(block_info)
    return blocks

def get_seedling_status(count):
    """根据出苗数判断缺苗状态"""
    if count > 1000:
        return "正常"
    elif 700 < count <= 1000:
        return "轻度缺苗"
    elif 500 < count <= 700:
        return "中度缺苗"
    else:
        return "重度缺苗"

def get_emergence_level(rate):
    """根据出苗率判定缺苗等级"""
    if rate >= 80:
        return "正常"
    elif rate >= 65:
        return "低度缺苗"
    elif rate >= 50:
        return "中度缺苗"
    else:
        return "高度缺苗"

def get_suggestion_by_level(level):
    """根据缺苗等级给出建议措施"""
    if level == "正常":
        return "苗情正常，建议保持常规水肥管理，持续观察。"
    if level == "低度缺苗":
        return "存在轻度缺苗，建议适当补苗并加强水肥管理。"
    if level == "中度缺苗":
        return "缺苗较明显，建议尽快补苗并排查缺苗原因（如病虫害、干旱）。"
    return "缺苗严重，建议尽快补苗或重播，并进行土壤与病虫害综合治理。"

def perform_seeding_detection(tif_path, base_name, base_id, plot_name, plot_id, tif_url, task_id=None):
    """
    执行谷苗检测的核心逻辑
    """
    # 初始化模型（使用默认模型路径，也可以通过环境变量指定）
    model_path = os.getenv('MODEL_PATH', 'best-obb-efc-multiseam.pt')  # 可以通过环境变量指定模型路径
    if not os.path.exists(model_path):
        print(f"错误：模型文件不存在 - {model_path}")
        # 尝试使用相对路径或其他常见路径
        possible_paths = [
            './best-obb-efc-multiseam.pt',
            '../best-obb-efc-multiseam.pt',
            '../../best-obb-efc-multiseam.pt'
        ]
        model_path = None
        for path in possible_paths:
            if os.path.exists(path):
                model_path = path
                print(f"找到模型文件: {path}")
                break
        
        if model_path is None:
            print("错误：未找到模型文件")
            return None
        
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n======== 设备检查 ========")
    print(f"PyTorch 版本: {torch.__version__}")
    print(f"CUDA 是否可用: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"当前显卡: {torch.cuda.get_device_name(0)}")
    print(f"使用设备进行推理: {device}")
    print(f"==========================\n")

    try:
        # 强制加载到指定设备
        model = YOLO(model_path)
        # 预热一次 (可选，避免首次推理慢)
        # model(np.zeros((640, 640, 3), dtype=np.uint8), device=device, verbose=False)
    except Exception as e:
        print(f"模型加载失败：{str(e)}")
        return None
    
    # 读取图片
    filename = os.path.basename(tif_path)
    img, geo_info = None, None
    
    try:
        # 处理TIFF图片（含地理信息）
        with open(tif_path, "rb") as f:
            tiff_data = f.read()
        geo_info, geo_err = get_tiff_geo_info(tiff_data)
        if geo_err:
            print(f"警告：{geo_err}")
        # 读取TIFF像素数据并转3通道
        with rasterio.open(io.BytesIO(tiff_data)) as src:
            if src.count >= 3:
                tiff_np = src.read([1, 2, 3])  # 3通道图
            else:
                tiff_np = src.read(1)
                tiff_np = np.stack([tiff_np, tiff_np, tiff_np], axis=0)  # 单通道转3通道
            tiff_np = tiff_np.astype(np.uint8)
            img = np.transpose(tiff_np, (1, 2, 0))  # 格式从(C,H,W)转为(H,W,C)
        original_img = Image.fromarray(img)
        # 地块中心点经纬度（如无地理信息则为“无法获取”）
        plot_latitude, plot_longitude = "无法获取", "无法获取"
        if geo_info and geo_info.get("transform") is not None and geo_info.get("crs") is not None:
            center_x = img.shape[1] // 2
            center_y = img.shape[0] // 2
            plot_latitude, plot_longitude = pixel_to_latlon(center_x, center_y, geo_info["transform"], geo_info["crs"])
    except Exception as e:
        print(f"图片读取失败：{str(e)}")
        return None
    
    # 带重叠分割小块，用于检测出苗数
    try:
        detect_tiles, detect_positions, _ = split_image(img, 640, 640, 0.2)
        small_tile_results = []
        total_count = 0
        
        # 批量推理 (Batch Size 动态调整：GPU=64/128, CPU=8/16)
        if torch.cuda.is_available():
            batch_size = 64  # 有显卡时加大Batch Size
        else:
            batch_size = 8  # CPU时减小Batch Size防止内存爆炸
            
        print(f"DEBUG: 开始批量推理，设备={device}，Batch Size={batch_size}，共 {len(detect_tiles)} 个切片")
        if task_id:
            _update_task(task_id, stage="inferencing", progress=30)
        
        # 使用tqdm显示进度条
        total_batches = max(1, (len(detect_tiles) + batch_size - 1) // batch_size)
        for idx, i in enumerate(tqdm(range(0, len(detect_tiles), batch_size), desc="Inferencing")):
            batch_tiles = detect_tiles[i : i + batch_size]
            batch_counts = predict_yolo_obb_batch(batch_tiles, model)
            
            for j, tile_count in enumerate(batch_counts):
                global_idx = i + j
                small_tile_results.append({
                    "tile_id": global_idx, 
                    "position": detect_positions[global_idx], 
                    "seedling_count": tile_count
                })
                # 统计有效小块的总出苗数（最终汇总用）
                if detect_positions[global_idx]["black_ratio"] <= 0.3:
                    total_count += tile_count
            if task_id:
                pct = 30 + int(40 * (idx + 1) / total_batches)
                _update_task(task_id, progress=min(pct, 70))
                    
    except Exception as e:
        print(f"检测小块分割或预测失败：{str(e)}")
        return None
    
    # 无重叠分割小块，用于面积统计
    area_tiles, area_positions, _ = split_image_no_overlap(img, 640, 640)
    
    # 映射出苗数：将重叠检测结果汇总到无重叠面积小块
    area_seedling_counts = {tile["tile_id"]: 0 for tile in area_positions}
    
    # 优化：建立索引 (row, col) -> tile_id，避免嵌套循环
    area_map = {(tile["row"], tile["col"]): tile["tile_id"] for tile in area_positions}
    area_tile_w = 640
    area_tile_h = 640
    
    print("DEBUG: 开始映射检测结果...")
    if task_id:
        _update_task(task_id, stage="mapping", progress=75)
    total_map = max(1, len(small_tile_results))
    for idx, detect_tile in enumerate(tqdm(small_tile_results, desc="Mapping Results")):
        detect_pos = detect_tile["position"]
        if detect_pos["black_ratio"] > 0.3:
            continue
            
        # 计算检测小块的中心坐标
        cx = (detect_pos["x1"] + detect_pos["x2"]) // 2
        cy = (detect_pos["y1"] + detect_pos["y2"]) // 2
        
        # 计算对应的面积小块行列 (无重叠切片 stride = size)
        col = cx // area_tile_w
        row = cy // area_tile_h
        
        target_id = area_map.get((row, col))
        if target_id is not None:
             area_seedling_counts[target_id] += detect_tile["seedling_count"]
        if task_id and (idx % 50 == 0 or idx == total_map - 1):
            pct = 75 + int(10 * (idx + 1) / total_map)
            _update_task(task_id, progress=min(pct, 85))
             
        # 边缘情况忽略
    
    # 划分3×2区块，统计有效小块数和出苗数
    six_blocks = split_into_6_blocks(img.shape, geo_info)
    # 初始化区块的有效小块数和出苗数
    for block in six_blocks:
        block["valid_tile_count"] = 0
        block["seedling_count"] = 0
    # 遍历无重叠小块，统计到对应区块
    for area_tile in area_positions:
        if area_tile["black_ratio"] > 0.3:
            continue  # 跳过黑色背景的面积小块
        # 计算面积小块的中心坐标
        area_center_x = (area_tile["x1"] + area_tile["x2"]) // 2
        area_center_y = (area_tile["y1"] + area_tile["y2"]) // 2
        # 匹配到3×2区块
        for block in six_blocks:
            if (block["x1"] <= area_center_x < block["x2"] and
                    block["y1"] <= area_center_y < block["y2"]):
                block["valid_tile_count"] += 1  # 统计有效小块数
                block["seedling_count"] += area_seedling_counts[area_tile["tile_id"]]  # 汇总出苗数
                break
    
    # 计算区块面积、理论苗数、出苗率
    for block in six_blocks:
        # 单块实际面积：640像素对应1.28米 → 1.28m × 1.28m = 1.6384㎡
        single_tile_actual_area = 1.28 * 1.28
        # 区块面积 = 有效小块数 × 单块实际面积
        block["area_sqm"] = round(block["valid_tile_count"] * single_tile_actual_area, 4)
        # 单位面积理论苗数：1㎡约23.8株（由行距0.6m、株距0.07m推导）
        unit_theoretical_count = 23.8
        # 区块理论苗数 = 区块面积 × 单位面积理论苗数（取整）
        block["theoretical_count"] = round(block["area_sqm"] * unit_theoretical_count)
        # 出苗率 = （实际出苗数 / 理论苗数）× 100%（避免除零）
        actual_count = block["seedling_count"]
        if block["theoretical_count"] > 0:
            block["emergence_rate"] = round((actual_count / block["theoretical_count"]) * 100, 2)
        else:
            block["emergence_rate"] = 0
    
    # 渲染检测结果图（用带重叠的检测结果，颜色更细致）
    try:
        # 降低输出图像分辨率（默认最大宽度 2048，可通过环境变量控制）
        output_max_size = int(os.getenv("OUTPUT_MAX_SIZE", "2048"))
        rendered_img = render_colored_overlay(original_img, small_tile_results, 80, 0.3, output_max_size)
    except Exception as e:
        print(f"渲染图片失败：{str(e)}")
        rendered_img = None
    
    # 计算总体统计信息
    total_area = sum(block["area_sqm"] for block in six_blocks)
    total_theoretical_count = sum(block["theoretical_count"] for block in six_blocks)
    overall_emergence_rate = 0
    if total_theoretical_count > 0:
        overall_emergence_rate = round((total_count / total_theoretical_count) * 100, 2)
    # 苗密度（株/亩） 1亩=666.6667㎡
    seedling_density_mu = 0
    if total_area > 0:
        seedling_density_mu = round((total_count / total_area) * 666.6667, 2)
    emergence_level = get_emergence_level(overall_emergence_rate)
    suggestion = get_suggestion_by_level(emergence_level)
    detect_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    conclusion = (
        f"本次检测共识别{int(total_count)}株幼苗，出苗率为{overall_emergence_rate}%，"
        f"处于{emergence_level}水平。平均苗密度为{seedling_density_mu}株/亩，"
        f"{suggestion}"
    )
    
    # 创建临时目录用于存储结果文件
    output_temp_dir = tempfile.mkdtemp()
    zip_filename = f"detection_results_{int(time.time())}.zip"
    zip_filepath = os.path.join(output_temp_dir, zip_filename)
    
    # 创建ZIP压缩包
    with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 保存检测图像到压缩包 result/ 目录
        if rendered_img:
            img_io = io.BytesIO()
            rendered_img.save(img_io, 'JPEG', quality=95)
            img_io.seek(0)
            zipf.writestr('result/detection_result.jpg', img_io.getvalue())
        
        # 保存详细结果JSON到压缩包 result/ 目录
        result_json = {
            "baseName": base_name,
            "baseId": base_id,
            "plotName": plot_name,
            "plotId": plot_id,
            "totalSeedlings": int(total_count),
            "detectTime": detect_time,
            "plotLongitude": plot_longitude,
            "plotLatitude": plot_latitude,
            "emergenceRate": float(overall_emergence_rate),
            "seedlingDensity": float(seedling_density_mu),
            "resultImage": "result/detection_result.jpg" if rendered_img else None,
            "tifUrl": tif_url,
            "conclusion": conclusion,
            "suggestion": suggestion,
            "emergenceLevel": emergence_level
        }
        zipf.writestr('result/result.json', json.dumps(convert_to_serializable(result_json), ensure_ascii=False, indent=2))
    
    if task_id:
        _update_task(task_id, stage="packaging", progress=95)
    return zip_filepath, output_temp_dir


if __name__ == '__main__':
    # 启动Flask应用，监听端口25570
    app.run(host='0.0.0.0', port=25570, debug=False)



