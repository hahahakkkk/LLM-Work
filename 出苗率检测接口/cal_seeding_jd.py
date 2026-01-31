import os
import io
import zipfile
import json
import time
import argparse
import cv2
import numpy as np
import torch
from PIL import Image, ImageDraw

# ====== 关键修改：优先使用本地自定义 Ultralytics ======
import sys
custom_path = r"D:\wy\出苗率\new\ultralytics"
if custom_path not in sys.path:
    sys.path.insert(0, custom_path)
# =====================================================

from ultralytics import YOLO


import rasterio
from pyproj import Transformer
# -------------------------- 核心工具函数 --------------------------
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


def predict_yolo_obb(image, model):
    """YOLO-OBB模型预测出苗数（置信度阈值0.5）"""
    pil_image = Image.fromarray(image)
    results = model(pil_image, verbose=False)
    count = 0
    for result in results:
        obbs = result.obb
        if obbs is not None:
            confidences = obbs.conf.cpu().numpy()
            count += np.sum(confidences > 0.5)
    return int(count)


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


# def get_color(seedling_count):
#     """根据出苗数确定区块颜色（渲染用）"""
#     if seedling_count > 9:
#         return (100, 255, 100)
#     elif seedling_count > 5 and seedling_count <= 9:
#         return (255, 255, 100)
#     elif seedling_count > 1 and seedling_count <= 5:
#         return (255, 80, 0)
#     else:
#         return (255, 0, 0)

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


def render_colored_overlay(original_img, results, alpha=80, black_threshold=0.3):
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
    return composite.convert("RGB")


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
            if geo_info and "transform" in geo_info and "crs" in geo_info:
                lat_dms, lon_dms = pixel_to_latlon(center_x, center_y, geo_info["transform"], geo_info["crs"])
                block_info["latitude"] = lat_dms
                block_info["longitude"] = lon_dms
            blocks.append(block_info)
    return blocks


# -------------------------- 结果处理函数 --------------------------
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


# -------------------------- 整合主函数 --------------------------
def main():
    # 1. 解析命令行参数
    parser = argparse.ArgumentParser(description="谷苗检测（检测重叠0.2，面积无重叠）")
    parser.add_argument("image_path", help="待检测图像路径（支持JPG/PNG/TIFF）")
    parser.add_argument("--model-path", default="best-obb-efc-multiseam.pt", help="YOLO-OBB模型路径")
    parser.add_argument("--tile-width", type=int, default=640, help="小块宽度（固定640像素）")
    parser.add_argument("--tile-height", type=int, default=640, help="小块高度（固定640像素）")
    parser.add_argument("--overlap", type=float, default=0.2, help="检测用小块重叠比例（0-1）")
    parser.add_argument("--alpha", type=int, default=80, help="渲染图颜色透明度（0-255）")
    parser.add_argument("--black-threshold", type=float, default=0.3, help="黑色背景过滤阈值（0-1）")
    parser.add_argument("--output-dir", default=r"D:\wy\seeding_jd\detection_results", help="结果输出目录")
    args = parser.parse_args()

    # 2. 基础校验
    if not os.path.exists(args.image_path):
        print(f"错误：图像文件不存在 - {args.image_path}")
        return
    if not os.path.exists(args.model_path):
        print(f"错误：YOLO模型文件不存在 - {args.model_path}")
        return
    os.makedirs(args.output_dir, exist_ok=True)  # 自动创建输出目录

    # 3. 初始化YOLO模型（GPU优先）
    print(f"加载YOLO模型：{args.model_path}")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    try:
        model = YOLO(args.model_path).to(device)
        model.eval()
    except Exception as e:
        print(f"模型加载失败：{str(e)}")
        return
    print(f"模型加载完成，运行设备：{device}")

    # 4. 读取图片（支持普通格式与TIFF）
    print(f"读取图片：{args.image_path}")
    filename = os.path.basename(args.image_path)
    is_tiff = filename.lower().endswith(('.tif', '.tiff'))
    img, geo_info = None, None

    try:
        if is_tiff:
            # 处理TIFF图片（含地理信息）
            with open(args.image_path, "rb") as f:
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
        else:
            # 处理普通图片（JPG/PNG）
            img = cv2.imread(args.image_path)
            if img is None:
                raise ValueError("无法解码图片（格式不支持或文件损坏）")
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # BGR转RGB（适配PIL）
        original_img = Image.fromarray(img)
        print(f"图片读取完成，尺寸：{img.shape[0]}×{img.shape[1]}像素")
    except Exception as e:
        print(f"图片读取失败：{str(e)}")
        return

    # 5. 带重叠分割小块，用于检测出苗数
    print(f"分割检测用小块（尺寸：640×640，重叠比例：{args.overlap}）")
    try:
        detect_tiles, detect_positions, _ = split_image(img, args.tile_width, args.tile_height, args.overlap)
        small_tile_results = []
        total_count = 0
        # 遍历每个检测小块，预测出苗数
        for i, tile in enumerate(detect_tiles):
            tile_count = predict_yolo_obb(tile, model)
            small_tile_results.append({
                "tile_id": i, "position": detect_positions[i], "seedling_count": tile_count
            })
            # 统计有效小块的总出苗数（最终汇总用）
            if detect_positions[i]["black_ratio"] <= args.black_threshold:
                total_count += tile_count
    except Exception as e:
        print(f"检测小块分割或预测失败：{str(e)}")
        return

    # 6. 无重叠分割小块，用于面积统计
    print("分割面积统计用无重叠小块...")
    area_tiles, area_positions, _ = split_image_no_overlap(img, args.tile_width, args.tile_height)

    # 7. 映射出苗数：将重叠检测结果汇总到无重叠面积小块
    area_seedling_counts = {tile["tile_id"]: 0 for tile in area_positions}  # 无重叠小块的出苗数
    for detect_tile in small_tile_results:
        detect_pos = detect_tile["position"]
        if detect_pos["black_ratio"] > args.black_threshold:
            continue  # 跳过黑色背景的检测小块
        # 计算检测小块的中心坐标
        detect_center_x = (detect_pos["x1"] + detect_pos["x2"]) // 2
        detect_center_y = (detect_pos["y1"] + detect_pos["y2"]) // 2
        # 找到对应的无重叠小块
        matched = False
        for area_tile in area_positions:
            if (area_tile["x1"] <= detect_center_x < area_tile["x2"] and
                    area_tile["y1"] <= detect_center_y < area_tile["y2"]):
                area_seedling_counts[area_tile["tile_id"]] += detect_tile["seedling_count"]
                matched = True
                break
        if not matched:
            # 边缘情况，若未匹配到则忽略（或按需处理）
            pass

    # 8. 划分3×2区块，统计有效小块数和出苗数
    six_blocks = split_into_6_blocks(img.shape, geo_info)
    # 初始化区块的有效小块数和出苗数
    for block in six_blocks:
        block["valid_tile_count"] = 0
        block["seedling_count"] = 0
    # 遍历无重叠小块，统计到对应区块
    for area_tile in area_positions:
        if area_tile["black_ratio"] > args.black_threshold:
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

    # 9. 计算区块面积、理论苗数、出苗率
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
            block["emergence_rate"] = "无数据"

    # 10. 渲染检测结果图（用带重叠的检测结果，颜色更细致）
    print("渲染带颜色叠加的结果图...")
    try:
        rendered_img = render_colored_overlay(original_img, small_tile_results, args.alpha, args.black_threshold)
    except Exception as e:
        print(f"渲染图片失败：{str(e)}")
        rendered_img = None

    # 11. 保存结果文件
    print("保存结果文件...")
    input_filename = os.path.splitext(filename)[0]
    timestamp = time.strftime("%Y%m%d_%H%M%S", time.localtime())
    model_basename = os.path.basename(args.model_path)
    model_name = os.path.splitext(model_basename)[0]

    # 保存TXT区块详情
    txt_path = os.path.join(args.output_dir, f"{input_filename}_{model_name}_{timestamp}_blocks.txt")
    try:
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(f"谷苗检测3×2区块结果（检测重叠{args.overlap}，面积无重叠）\n")
            f.write(f"输入图片：{args.image_path}\n")
            f.write(f"检测时间：{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}\n")
            f.write(f"总实际出苗数：{total_count}株\n")
            f.write(f"黑色背景过滤阈值：{args.black_threshold}\n")
            f.write("=" * 140 + "\n")
            f.write(
                f"{'区块ID':<8} {'行列位置':<12} {'有效小块数':<10} {'实际出苗数':<10} "
                f"{'区块面积(㎡)':<12} {'理论苗数':<10} {'出苗率(%)':<12} {'中心像素':<16} {'经纬度':<30} {'缺苗状态':<10}\n"
            )
            f.write("-" * 140 + "\n")
            for block in sorted(six_blocks, key=lambda x: x["block_id"]):
                status = get_seedling_status(block["seedling_count"])
                f.write(
                    f"{block['block_id']:<8} ({block['row']},{block['col']})  {block['valid_tile_count']:<10} "
                    f"{block['seedling_count']:<10} {block['area_sqm']:<12} {block['theoretical_count']:<10} "
                    f"{block['emergence_rate']:<12} ({block['center_x']},{block['center_y']})  "
                    f"({block.get('latitude', '无法获取')},{block.get('longitude', '无法获取')}) {status:<10}\n"
                )
            f.write("=" * 140 + "\n")
            f.write("计算规则说明：\n")
            f.write("1. 检测用小块重叠比例：{args.overlap}（确保边缘目标检测）；\n")
            f.write("2. 面积统计用小块无重叠（避免面积重复计算）；\n")
            f.write("3. 640像素对应实际长度1.28米，单块面积1.6384㎡；\n")
            f.write("4. 单位面积理论苗数15867株/亩（由行距0.6m、株距0.07m推导）；\n")
            f.write("5. 出苗率 = 实际出苗数 / 理论苗数 × 100%。")
        print(f"TXT区块详情已保存：{txt_path}")
    except Exception as e:
        print(f"保存TXT失败：{str(e)}")

    # 保存渲染图
    if rendered_img:
        img_path = os.path.join(args.output_dir, f"{input_filename}_{model_name}_{timestamp}_rendered.jpg")
        try:
            rendered_img.save(img_path, format="JPEG", quality=95)
            print(f"渲染图已保存：{img_path}")
        except Exception as e:
            print(f"保存渲染图失败：{str(e)}")
            import traceback
            traceback.print_exc()  # 打印完整堆栈

    # 12. 打印最终汇总
    print("\n" + "=" * 80)
    print("检测完成！汇总结果：")
    print(f"输入图片：{args.image_path}")
    print(f"图片尺寸：{img.shape[0]}×{img.shape[1]}像素")
    print(f"总实际出苗数：{total_count}株")
    print(f"3×2区块数量：{len(six_blocks)}个")
    print(f"结果输出目录：{args.output_dir}")
    print("=" * 80)


if __name__ == "__main__":
    main()