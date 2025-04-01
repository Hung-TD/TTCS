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
from sentence_transformers import SentenceTransformer, util
import re

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Cấu hình OCR (đường dẫn Tesseract)
pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

app = FastAPI()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kết nối Firebase
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
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("✅ Mô hình NLP đã tải thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi tải mô hình NLP: {e}")
    classifier = None

# 🔹 Tiền xử lý ảnh để tăng độ chính xác OCR
def preprocess_image(image: np.array):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY, 11, 2)
    return gray

# 🔹 Trích xuất dữ liệu từ biểu đồ
def extract_chart_data(image: np.array):
    try:
        edges = cv2.Canny(image, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        num_contours = len(contours)

        if num_contours > 30:
            chart_type = "Map Chart"
        elif num_contours > 20:
            chart_type = "Bar Chart"
        elif num_contours > 10:
            chart_type = "Line Graph"
        else:
            chart_type = "Pie Chart"
        
        hough_lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50, minLineLength=30, maxLineGap=10)
        if hough_lines is not None and len(hough_lines) > 5:
            chart_type = "Process Diagram"

        # OCR trích xuất văn bản từ biểu đồ
        text_in_image = pytesseract.image_to_string(image, config='--psm 6').strip()
        numbers_in_image = re.findall(r'\d+', text_in_image)  # Lấy số từ ảnh
        keywords = [word for word in text_in_image.split() if word.isalpha()]  # Lấy từ khóa

        return {
            "chart_type": chart_type,
            "num_contours": num_contours,
            "num_lines": len(hough_lines) if hough_lines is not None else 0,
            "numbers": numbers_in_image,
            "keywords": keywords,
            "extracted_text": text_in_image
        }
    except Exception as e:
        logger.error(f"❌ Lỗi phân tích biểu đồ: {e}")
        return {"chart_type": "Unknown", "num_contours": 0, "num_lines": 0, "numbers": [], "keywords": [], "extracted_text": ""}
    
# 🔹 So sánh văn bản OCR với văn bản gốc
def compare_texts(extracted_text: str, expected_text: str) -> float:
    first_sentence = extracted_text.split(".")[0].strip()
    similarity_ratio = SequenceMatcher(None, first_sentence.lower(), expected_text.lower()).ratio()
    return round(similarity_ratio * 10, 1)

# 🔹 Đánh giá độ chính xác của dữ liệu
def evaluate_data_accuracy(extracted_text: str, chart_data: dict) -> float:
    extracted_numbers = re.findall(r'\d+', extracted_text)
    extracted_keywords = [word for word in extracted_text.split() if word.isalpha()]

    number_match_ratio = len(set(extracted_numbers) & set(chart_data["numbers"])) / max(1, len(chart_data["numbers"]))
    keyword_match_ratio = len(set(extracted_keywords) & set(chart_data["keywords"])) / max(1, len(chart_data["keywords"]))
    
    return round((number_match_ratio + keyword_match_ratio) / 2 * 10, 1)

# 🔹 Đánh giá độ tương đồng ngữ nghĩa
def semantic_similarity(expected_issue: str, extracted_text: str) -> float:
    try:
        first_sentence = extracted_text.split(".")[0].strip()
        emb1 = embedding_model.encode(expected_issue, convert_to_tensor=True)
        emb2 = embedding_model.encode(first_sentence, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(emb1, emb2).item()
        return round(similarity * 10, 1)
    except Exception as e:
        logger.error(f"❌ Lỗi khi tính toán độ tương đồng ngữ nghĩa: {e}")
        return 0.0

# 🔹 API lấy dữ liệu từ Firebase và chấm điểm
@app.get("/analyze_latest_exam")
async def analyze_latest_exam():
    if db_ref is None:
        raise HTTPException(status_code=500, detail="Lỗi kết nối Firebase!")

    try:
        latest_data = db_ref.order_by_key().limit_to_last(1).get()
        if not latest_data:
            raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu!")

        latest_entry = list(latest_data.values())[0]
        image_url = latest_entry.get("imageUrl", "")
        expected_text = latest_entry.get("content", "")
        expected_issue = latest_entry.get("issue", "")

        response = requests.get(image_url)
        img_pil = Image.open(BytesIO(response.content)).convert("RGB")
        img_np = np.array(img_pil)
        processed_img = preprocess_image(img_np)

        extracted_text = pytesseract.image_to_string(processed_img, config='--psm 6').strip()
        chart_data = extract_chart_data(processed_img)

        similarity_score_content = compare_texts(extracted_text, expected_text)
        similarity_score_issue = semantic_similarity(extracted_text, expected_issue)
        data_accuracy = evaluate_data_accuracy(extracted_text, chart_data)

        # 🔹 Gọi `grade_text` để lấy điểm đầy đủ
        graded_result = await grade_text(
            expected_text, expected_issue, extracted_text, chart_data,
            similarity_score_content, similarity_score_issue
        )

        return graded_result  # Trả về kết quả đầy đủ từ `grade_text`

    except Exception as e:
        logger.error(f"❌ Lỗi xử lý bài thi: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")

async def grade_text(expected_text: str, expected_issue: str, extracted_text: str, chart_data: dict, similarity_score_content: float, similarity_score_issue: float):
    try:
        labels = [
            "Task Achievement",
            "Coherence & Cohesion",
            "Lexical Resource",
            "Grammatical Range & Accuracy"
        ]

        if classifier is None:
            raise HTTPException(status_code=500, detail="Mô hình NLP chưa sẵn sàng")

        # 🔹 Chấm điểm dựa trên nội dung bài viết
        results_content = classifier(expected_text, labels, multi_label=True)
        scores_content = {label: round(score * 9, 1) for label, score in zip(results_content["labels"], results_content["scores"])}

        # 🔹 Chấm điểm dựa trên đề bài
        results_issue = classifier(expected_issue, labels, multi_label=True)
        scores_issue = {label + " (Issue)": round(score * 9, 1) for label, score in zip(results_issue["labels"], results_issue["scores"])}

        # 🔹 So sánh ngữ nghĩa giữa bài viết và đề bài
        embedding_issue = embedding_model.encode(expected_issue, convert_to_tensor=True)
        embedding_exam = embedding_model.encode(extracted_text, convert_to_tensor=True)
        semantic_similarity = util.pytorch_cos_sim(embedding_exam, embedding_issue).item()
        semantic_score = round(semantic_similarity * 10, 1)  # Thang điểm 10

        # 🔹 Đánh giá độ chính xác dữ liệu dựa trên biểu đồ
        data_accuracy = evaluate_data_accuracy(extracted_text, chart_data)  # Thang điểm 10

        # 🔹 Điều chỉnh điểm dựa trên độ tương đồng ngữ nghĩa
        if semantic_similarity < 0.5:
            penalty_factor = (0.5 - semantic_similarity) * 2  # Nếu lệch chủ đề, giảm tối đa 50%
        else:
            penalty_factor = 0  # Không giảm điểm nếu đủ tương đồng

        for key in scores_content:
            scores_content[key] *= (1 - penalty_factor)

        # 🔹 Điều chỉnh thang điểm của `Data Accuracy`
        data_accuracy_scaled = round(data_accuracy * 9 / 10, 1)  # Quy đổi về thang 9

        # 🔹 Tính điểm tổng hợp
        final_score = round((similarity_score_content + similarity_score_issue + data_accuracy_scaled) / 3, 1)

        # 🔹 Xếp loại bài viết
        if final_score >= 8.5:
            grade = "Xuất sắc"
        elif final_score >= 7:
            grade = "Tốt"
        elif final_score >= 5:
            grade = "Đạt yêu cầu"
        else:
            grade = "Cần cải thiện"

        final_scores = {**scores_content, **scores_issue}
        final_scores["Text Similarity (Content)"] = similarity_score_content
        final_scores["Text Similarity (Issue)"] = similarity_score_issue
        final_scores["Semantic Similarity (Issue)"] = semantic_score
        final_scores["Data Accuracy"] = data_accuracy
        final_scores["Chart Type"] = chart_data["chart_type"]
        final_scores["Number of Elements in Chart"] = chart_data["num_contours"]
        final_scores["Final Score"] = final_score
        final_scores["Grade"] = grade

        return {
            "expected_text": expected_text,
            "expected_issue": expected_issue,
            "exam_text": extracted_text,
            "chart_analysis": chart_data,
            "score": final_scores
        }
    except Exception as e:
        logger.error(f"❌ Lỗi chấm điểm bài thi: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi chấm điểm: {str(e)}")
