import os
import time
import threading
import requests
import json
import socket
from http.server import SimpleHTTPRequestHandler, HTTPServer
import shutil

# 配置
API_URL = "http://127.0.0.1:25570/api/seeding-detection"
FILE_SERVER_PORT = 9000
# 用户指定的本地TIFF文件路径
LOCAL_TIF_PATH = r"C:\Users\li\Desktop\11\best-obb-efc-multiseam.pt" # 这里暂时需要替换为真实存在的TIF文件路径，或者使用上面的路径
# 修正：根据用户请求，这里应该指向 TIF 文件，但用户给出的是Linux路径
# 假设用户想测试的文件在 Windows下的某个位置，或者就是想测上面的那个Linux路径的文件（如果在WSL里）
# 为了脚本的通用性，我们这里定义一个变量，如果文件不存在则自动生成一个

TARGET_TIF_PATH = r"C:\Users\li\Desktop\11\test_image.tif" # 脚本运行时将把目标文件复制到这里

def get_ip_address():
    """获取本机IP地址"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def start_file_server():
    """启动文件服务器"""
    class CORSRequestHandler(SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            super().end_headers()
            
    # 切换到脚本所在目录，确保能通过URL访问到同目录的文件
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server = HTTPServer(('0.0.0.0', FILE_SERVER_PORT), CORSRequestHandler)
    print(f"本地文件服务器运行在: http://0.0.0.0:{FILE_SERVER_PORT}")
    server.serve_forever()

def run_test():
    # 1. 确定要测试的文件
    # 如果用户指定的路径存在，就用用户的；否则查看当前目录下有没有tif
    # 注意：Windows下无法直接读取Linux路径 /tmp/...，这里需要用户手动指定一个有效的Windows路径
    # 为了演示，我们检查当前目录下是否有 test_image.tif，如果没有则报错提醒用户
    
    tif_filename = "test_image.tif"
    if not os.path.exists(tif_filename):
        # 尝试复制一个现有的（如果有的话），或者生成一个假的
        # 这里为了稳健，直接提醒用户
        print(f"提示：请确保当前目录下存在名为 {tif_filename} 的文件")
        print("或者修改本脚本中的 LOCAL_TIF_PATH 变量")
        # 尝试创建一个假的用于连通性测试
        try:
            from PIL import Image
            import numpy as np
            img = Image.fromarray(np.random.randint(0, 255, (1000, 1000, 3), dtype=np.uint8))
            img.save(tif_filename)
            print("已自动生成模拟测试文件: test_image.tif")
        except:
             return

    # 2. 启动文件服务
    server_thread = threading.Thread(target=start_file_server, daemon=True)
    server_thread.start()
    time.sleep(1)
    
    # 3. 构造URL
    # 注意：API容器或进程如果不通 localhost，可以用本机局域网IP
    local_ip = get_ip_address()
    # 优先尝试用 127.0.0.1，如果API在Docker里可能需要用 local_ip
    file_url = f"http://127.0.0.1:{FILE_SERVER_PORT}/{tif_filename}"
    
    print(f"\nAPI地址: {API_URL}")
    print(f"文件URL: {file_url}")
    
    payload = {
        'base_name': '本地测试',
        'base_id': 'local_001',
        'plot_name': '测试地块',
        'plot_id': 'plot_001',
        'tif_url': file_url
    }
    
    try:
        print("正在发送请求... (请观察API终端的进度条)")
        start_time = time.time()
        
        response = requests.post(API_URL, data=payload)
        
        duration = time.time() - start_time
        print(f"\n请求耗时: {duration:.2f} 秒")
        
        if response.status_code == 200:
            print("\n✅ 测试成功！")
            data = response.json()
            if 'data' in data:
                print(f"出苗总数: {data['data'].get('total_seedlings')}")
                print(f"地块面积: {data['data'].get('plot_area')}")
                print(f"下载链接: {data['data'].get('result_zip_url')}")
            else:
                print(data)
        else:
            print("\n❌ 测试失败")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")

if __name__ == "__main__":
    run_test()
