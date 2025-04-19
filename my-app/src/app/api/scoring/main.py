from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import requests
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, db, firestore
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from task1_grader import grade_task1
from task2_grader import grade_task2

# 🔹 Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# 🔹 Load environment variables
load_dotenv()

# 🔹 Initialize FastAPI
app = FastAPI()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# 🔹 CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Firebase setup
try:
    cred = credentials.Certificate("examstore-e30ac-firebase-adminsdk-fbsvc-658d92a4f0.json")
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://examstore-e30ac-default-rtdb.firebaseio.com/"
    })
    db_ref_task1 = db.reference("/exam_writing_task1")
    db_ref_task2 = db.reference("/exam_writing_task2")
    firestore_db = firestore.client()
    logger.info("✅ Kết nối Firebase và Firestore thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi kết nối Firebase: {e}")
    db_ref_task1 = None
    db_ref_task2 = None
    firestore_db = None

# 🔹 NLP model
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("✅ Mô hình NLP đã tải thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi tải mô hình NLP: {e}")
    classifier = None

# 🔹 Firestore: lấy mô tả Task 1 mới nhất
def get_latest_description_title_from_firestore(firestore_db):
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
            return data.get("description_title")
        return None
    except Exception as e:
        logger.error(f"❌ Lỗi khi lấy description_title từ Firestore: {e}")
        return None

# 🔹 Firestore: lấy prompt Task 2 mới nhất
def get_latest_task2_prompt_from_firestore(firestore_db):
    try:
        docs = firestore_db.collection("task2_exams").stream()
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
            return data.get("description_title")
        return None
    except Exception as e:
        logger.error(f"❌ Lỗi khi lấy description_title từ Firestore Task 2: {e}")
        return None

# 🔹 API: Analyze latest Task 1 exam
@app.get("/analyze_latest_exam")
async def analyze_latest_exam():
    if db_ref_task1 is None:
        raise HTTPException(status_code=500, detail="Firebase connection error")

    try:
        description_title = get_latest_description_title_from_firestore(firestore_db)
        if not description_title:
            raise HTTPException(status_code=404, detail="Không tìm thấy description_title")

        latest_data = db_ref_task1.order_by_key().limit_to_last(1).get()
        if not latest_data:
            raise HTTPException(status_code=404, detail="Không có dữ liệu Task 1")

        latest_entry = list(latest_data.values())[0]
        student_answer = latest_entry.get("content")

        if not student_answer:
            raise HTTPException(status_code=400, detail="Thiếu student_answer")

        graded_result = await grade_task1(
            expected_text=description_title,
            description=description_title,
            student_answer=student_answer
        )

        return graded_result

    except Exception as e:
        logger.error(f"❌ Lỗi xử lý Task 1: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 🔹 API: Analyze latest Task 2 exam
@app.get("/analyze_latest_task2")
async def analyze_latest_task2():
    if db_ref_task2 is None:
        raise HTTPException(status_code=500, detail="Firebase connection error")

    try:
        prompt = get_latest_task2_prompt_from_firestore(firestore_db)
        if not prompt:
            raise HTTPException(status_code=404, detail="Không tìm thấy description_title Task 2")

        latest_data = db_ref_task2.order_by_key().limit_to_last(1).get()
        if not latest_data:
            raise HTTPException(status_code=404, detail="Không có dữ liệu Task 2")

        latest_entry = list(latest_data.values())[0]
        student_answer = latest_entry.get("content")

        if not student_answer:
            raise HTTPException(status_code=400, detail="Thiếu student_answer")

        result = await grade_task2(prompt, student_answer)
        return result

    except Exception as e:
        logger.error(f"❌ Lỗi khi chấm điểm Task 2: {e}")
        raise HTTPException(status_code=500, detail=str(e))
