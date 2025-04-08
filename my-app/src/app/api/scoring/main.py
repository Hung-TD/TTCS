from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import cv2
import numpy as np
import pytesseract
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, db, firestore
from io import BytesIO
from PIL import Image
import requests
from difflib import SequenceMatcher
from sentence_transformers import SentenceTransformer, util
import re
import os
from dotenv import load_dotenv

# 🔹 Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# 🔹 Cấu hình OCR
pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

# 🔹 Load biến môi trường
load_dotenv()

# 🔹 Khởi tạo FastAPI
app = FastAPI()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# 🔹 CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Kết nối Firebase
try:
    cred = credentials.Certificate("examstore-e30ac-firebase-adminsdk-fbsvc-658d92a4f0.json")
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://examstore-e30ac-default-rtdb.firebaseio.com/"
    })
    db_ref = db.reference("/exam_writing_task1")
    firestore_db = firestore.client()
    logger.info("✅ Kết nối Firebase và Firestore thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi kết nối Firebase: {e}")
    db_ref = None
    firestore_db = None

# 🔹 Load mô hình NLP
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("✅ Mô hình NLP đã tải thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi tải mô hình NLP: {e}")
    classifier = None

# 🔹 Tiền xử lý ảnh
def preprocess_image(image: np.array):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY, 11, 2)
    return gray

# 🔹 Phân tích biểu đồ
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

        text_in_image = pytesseract.image_to_string(image, config='--psm 6').strip()
        numbers_in_image = re.findall(r'\d+', text_in_image)
        keywords = [word for word in text_in_image.split() if word.isalpha()]

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

# 🔹 Lấy description_title từ Firestore
def get_latest_description_title_from_firestore():
    try:
        docs = firestore_db.collection("task1_exams").stream()
        latest_doc = None
        latest_id = -1

        for doc in docs:
            try:
                doc_id = int(doc.id)
                if doc_id > latest_id:
                    latest_id = doc_id
                    latest_doc = doc
            except ValueError:
                continue

        if latest_doc:
            data = latest_doc.to_dict()
            return data.get("description_title", None)

        return None
    except Exception as e:
        logger.error(f"❌ Lỗi khi lấy description_title từ Firestore: {e}")
        return None

# 🔹 API chính
@app.get("/analyze_latest_exam")
async def analyze_latest_exam():
    if db_ref is None:
        logger.error("❌ Firebase connection not available")
        raise HTTPException(status_code=500, detail="Firebase connection error")

    try:
        description_title = get_latest_description_title_from_firestore()
        logger.info(f"✅ Description Title from Firestore: {description_title}")

        latest_data = db_ref.order_by_key().limit_to_last(1).get()
        if not latest_data:
            logger.error("❌ No data found in Firebase")
            raise HTTPException(status_code=404, detail="No data found")

        latest_entry = list(latest_data.values())[0]
        image_url = latest_entry.get("imageUrl")
        student_answer = latest_entry.get("content")

        if not all([image_url, student_answer, description_title]):
            missing_fields = []
            if not image_url: missing_fields.append("imageUrl")
            if not student_answer: missing_fields.append("content")
            if not description_title: missing_fields.append("description_title")
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )

        response = requests.get(image_url)
        img_pil = Image.open(BytesIO(response.content)).convert("RGB")
        img_np = np.array(img_pil)
        processed_img = preprocess_image(img_np)
        chart_data = extract_chart_data(processed_img)

        graded_result = await grade_text(
            expected_text=description_title,
            description=description_title,
            student_answer=student_answer
        )

        graded_result["chart_analysis"] = chart_data
        return graded_result

    except Exception as e:
        logger.error(f"❌ Error processing exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 So sánh ngữ nghĩa & phân tích
def semantic_similarity(text1: str, text2: str) -> dict:
    try:
        emb1 = embedding_model.encode(text1, convert_to_tensor=True)
        emb2 = embedding_model.encode(text2, convert_to_tensor=True)
        overall_similarity = util.pytorch_cos_sim(emb1, emb2).item()

        aspects = {
            "temporal_comparison": "compares employment data between 1993 and 2003",
            "gender_distribution": "analyzes employment by gender in different sectors",
            "sector_changes": "identifies which sectors increased or decreased",
            "overall_trends": "summarizes general workforce trends across all sectors",
            "structure": "has a clear structure with introduction, body and conclusion"
        }


        aspect_scores = {}
        for aspect, description in aspects.items():
            score = classifier(text2, [description], multi_label=False)
            aspect_scores[aspect] = round(score['scores'][0] * 10, 1)

        return {
            "overall": round(overall_similarity * 10, 1),
            "aspects": aspect_scores
        }
    except Exception as e:
        logger.error(f"❌ Error calculating semantic similarity: {e}")
        return {"overall": 0.0, "aspects": {}}

# 🔹 Chấm điểm
async def grade_text(expected_text: str, description: str, student_answer: str):
    try:
        labels = [
            "Task Achievement",
            "Coherence & Cohesion",
            "Lexical Resource",
            "Grammatical Range & Accuracy"
        ]

        if classifier is None:
            raise HTTPException(status_code=500, detail="NLP model not ready")

        similarity_results = semantic_similarity(description, student_answer)
        results = classifier(student_answer, labels, multi_label=True)
        base_scores = {label: round(score * 9, 1) for label, score in zip(results["labels"], results["scores"])}

        aspect_weights = {
            "temporal_comparison": 0.25,
            "gender_distribution": 0.25,
            "sector_changes": 0.2,
            "overall_trends": 0.2,
            "structure": 0.1
        }


        aspect_score = sum(
            similarity_results["aspects"].get(aspect, 0) * weight 
            for aspect, weight in aspect_weights.items()
        )

        final_scores = base_scores.copy()
        final_scores["Task Achievement"] = round((base_scores["Task Achievement"] + aspect_score) / 2, 1)

        final_score = round(sum(final_scores.values()) / len(final_scores), 1)

        if final_score >= 8.5:
            grade = "Excellent"
        elif final_score >= 7:
            grade = "Good"
        elif final_score >= 5:
            grade = "Satisfactory"
        else:
            grade = "Needs Improvement"

        final_scores["Content Similarity"] = similarity_results["overall"]
        final_scores["Temporal Comparison"] = similarity_results["aspects"].get("temporal_comparison", 0)
        final_scores["Gender Distribution"] = similarity_results["aspects"].get("gender_distribution", 0)
        final_scores["Sector Changes"] = similarity_results["aspects"].get("sector_changes", 0)
        final_scores["Overall Trends"] = similarity_results["aspects"].get("overall_trends", 0)
        final_scores["Structure Quality"] = similarity_results["aspects"].get("structure", 0)
        final_scores["Final Score"] = final_score
        final_scores["Grade"] = grade

        return {
            "description": description,
            "student_answer": student_answer,
            "score": final_scores
        }
    except Exception as e:
        logger.error(f"❌ Error grading text: {e}")
        raise HTTPException(status_code=500, detail=f"Grading error: {str(e)}")
