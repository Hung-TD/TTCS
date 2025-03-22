from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import logging
from transformers import pipeline

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Middleware (để frontend có thể gọi API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình đường dẫn Tesseract (chỉnh lại nếu cần)
pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

# Load model chấm điểm NLP
logger.info("Đang tải mô hình NLP...")
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("✅ Mô hình NLP đã tải thành công!")
except Exception as e:
    logger.error(f"❌ Lỗi tải mô hình NLP: {e}")
    classifier = None


# 🟢 Endpoint nhận ảnh, trích xuất văn bản, và chấm điểm
@app.post("/grade_image")
async def grade_image(file: UploadFile = File(...)):
    try:
        logger.info(f"📥 Nhận ảnh: {file.filename} ({file.content_type})")
        
        # 🖼️ Đọc ảnh từ file và chuyển sang numpy array
        image = Image.open(BytesIO(await file.read()))
        image_np = np.array(image)

        # 🔍 Tiền xử lý ảnh với OpenCV
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

        # 📜 Nhận diện văn bản bằng Tesseract OCR
        extracted_text = pytesseract.image_to_string(thresh, lang="eng")
        logger.info(f"🔍 Văn bản trích xuất: {extracted_text}")

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Không thể trích xuất văn bản từ ảnh!")

        # ✍️ Chấm điểm theo tiêu chí IELTS
        labels = [
            "Task Achievement",
            "Coherence & Cohesion",
            "Lexical Resource",
            "Grammatical Range & Accuracy"
        ]
        
        if classifier is None:
            raise HTTPException(status_code=500, detail="Mô hình NLP chưa sẵn sàng")
        
        results = classifier(extracted_text, labels, multi_label=True)
        logger.info(f"📊 Kết quả chấm điểm: {results}")

        # 🔢 Chuyển đổi điểm từ 0-9
        scores = {label: round(score * 9, 1) for label, score in zip(results["labels"], results["scores"])}

        return {
            "extracted_text": extracted_text,
            "score": scores
        }
    except Exception as e:
        logger.error(f"❌ Lỗi xử lý ảnh: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý ảnh: {str(e)}")
