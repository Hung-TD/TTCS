from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import cv2
import numpy as np
import pytesseract
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, db
from io import BytesIO
from PIL import Image
import requests
from difflib import SequenceMatcher

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kết nối Firebase Realtime Database
try:
    cred = credentials.Certificate("examstore-e30ac-firebase-adminsdk-fbsvc-658d92a4f0.json")
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://examstore-e30ac-default-rtdb.firebaseio.com/"
    })
    db_ref = db.reference("/exam_writing_task1")
    logger.info("✅ Kết nối Firebase thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi kết nối Firebase: {e}")
    db_ref = None

# Load mô hình NLP
logger.info("Đang tải mô hình NLP...")
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("✅ Mô hình NLP đã tải thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi tải mô hình NLP: {e}")
    classifier = None

# Tiền xử lý ảnh với OpenCV để tăng độ chính xác OCR
def preprocess_image(image: np.array):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY, 11, 2)
    return gray

# Phân tích chi tiết biểu đồ cột
def analyze_bar_chart(contours):
    bar_heights = [cv2.boundingRect(cnt)[3] for cnt in contours]
    avg_height = np.mean(bar_heights) if bar_heights else 0
    return {"chart_type": "Bar Chart", "num_bars": len(contours), "avg_bar_height": avg_height}

# Phân tích chi tiết biểu đồ đường
def analyze_line_graph(lines):
    num_lines = len(lines) if lines is not None else 0
    return {"chart_type": "Line Graph", "num_lines": num_lines}

# Phân tích chi tiết biểu đồ tròn
def analyze_pie_chart(circles):
    num_segments = len(circles[0]) if circles is not None else 0
    return {"chart_type": "Pie Chart", "num_segments": num_segments}

# Phân tích chi tiết bảng số liệu
def analyze_table(horizontal_lines, vertical_lines):
    return {"chart_type": "Table", "num_rows": horizontal_lines, "num_columns": vertical_lines}

# Phân tích chi tiết biểu đồ bản đồ
def analyze_map_chart(num_contours):
    return {"chart_type": "Map", "num_contours": num_contours}

# Phân tích chi tiết biểu đồ kết hợp
def analyze_multiple_chart(bar_count, line_count):
    return {"chart_type": "Multiple Chart", "num_bars": bar_count, "num_lines": line_count}

# Phân tích biểu đồ
def extract_chart_data(image: np.array):
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        num_contours = len(contours)

        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=30, maxRadius=300)
        if circles is not None:
            return analyze_pie_chart(circles)

        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50, minLineLength=50, maxLineGap=10)
        if lines is not None and len(lines) > 10:
            return analyze_line_graph(lines)

        horizontal_lines = sum(1 for line in lines if abs(line[0][1] - line[0][3]) < 5) if lines is not None else 0
        vertical_lines = sum(1 for line in lines if abs(line[0][0] - line[0][2]) < 5) if lines is not None else 0
        if horizontal_lines > 3 and vertical_lines > 3:
            return analyze_table(horizontal_lines, vertical_lines)

        rect_contours = [cnt for cnt in contours if cv2.boundingRect(cnt)[2] > 20 and cv2.boundingRect(cnt)[3] > 50]
        if len(rect_contours) > 5:
            return analyze_bar_chart(rect_contours)

        if num_contours > 50:
            return analyze_map_chart(num_contours)

        if len(rect_contours) > 5 and lines is not None and len(lines) > 10:
            return analyze_multiple_chart(len(rect_contours), len(lines))

        return {"chart_type": "Unknown", "num_contours": num_contours}

    except Exception as e:
        print(f"❌ Lỗi phân tích biểu đồ: {e}")
        return {"chart_type": "Unknown", "num_contours": 0}
