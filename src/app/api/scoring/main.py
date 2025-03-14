from fastapi import FastAPI, HTTPException
import firebase_admin
from firebase_admin import credentials, db
from pydantic import BaseModel
from transformers import pipeline
import os
from fastapi.middleware.cors import CORSMiddleware

# 🔹 Đảm bảo đường dẫn Firebase Credential là chính xác
cred_path = os.getenv("FIREBASE_CREDENTIALS", os.path.abspath("examstore-e30ac-firebase-adminsdk-fbsvc-658d92a4f0.json"))

# 🔹 Khởi tạo Firebase nếu chưa có
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://examstore-e30ac-default-rtdb.firebaseio.com/'
        })
    except Exception as e:
        print(f"⚠️ Lỗi khởi tạo Firebase: {e}")

# 🔹 Khởi tạo FastAPI
app = FastAPI()

# 🔹 Thêm Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Có thể thay "*" bằng domain cụ thể nếu cần bảo mật hơn
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các method (GET, POST, ...)
    allow_headers=["*"],  # Cho phép tất cả các headers
)

# 🔹 Load mô hình Hugging Face
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
except Exception as e:
    print(f"⚠️ Lỗi tải mô hình: {e}")
    classifier = None  # Tránh lỗi nếu model không tải được

class GradeRequest(BaseModel):
    text: str

# 🔹 Thêm endpoint kiểm tra server hoạt động
@app.get("/")
async def root():
    return {"message": "API đang chạy"}

@app.post("/grade_text")
async def grade_text():
    try:
        # 🔹 Lấy bài viết mới nhất từ Firebase
        ref = db.reference("exam_writing_task1")
        data = ref.get()

        if not data:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài viết trong Firebase")

        # 🔹 Tìm bài viết có timestamp mới nhất
        latest_entry = max(data.values(), key=lambda x: x["timestamp"])

        text = latest_entry.get("content", "").strip()
        if not text:
            raise HTTPException(status_code=400, detail="Nội dung bài viết trống")

        if classifier is None:
            raise HTTPException(status_code=500, detail="Lỗi khi tải mô hình NLP")

        # 🔹 Tiêu chí IELTS
        labels = [
            "Task Achievement",
            "Coherence & Cohesion",
            "Lexical Resource",
            "Grammatical Range & Accuracy"
        ]

        # 🔹 Phân loại văn bản
        results = classifier(text, labels, multi_label=True)

        # 🔹 Chuyển kết quả thành điểm từ 0-9
        scores = {label: round(score * 9, 1) for label, score in zip(results["labels"], results["scores"])}

        return {
            "text": text,  # Gửi lại nội dung bài viết để kiểm tra
            "score": scores
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý văn bản: {str(e)}")
