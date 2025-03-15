# 📘 IELTS Writing Task 1 Scoring Web App  

## 📌 Giới thiệu  
**IELTS Writing Task 1 Scoring Web App** là một ứng dụng giúp **random đề bài IELTS Writing Task 1** và **chấm điểm tự động** bằng AI. Ứng dụng sử dụng **FastAPI** làm backend, **Next.js** làm frontend và **Firebase** để lưu trữ dữ liệu bài viết.  

---

## 🚀 Tính năng chính  
✅ **Random đề bài IELTS Writing Task 1**  
✅ **Nhập bài viết trực tiếp trên web**  
✅ **Chấm điểm tự động bằng AI** theo các tiêu chí IELTS:  
   - 🏆 **Grammatical Range & Accuracy**  
   - 🔗 **Coherence & Cohesion**  
   - 📖 **Lexical Resource**  
   - 📝 **Task Achievement**  
✅ **Hiển thị điểm số & gợi ý cải thiện**  
✅ **Lưu bài viết vào Firebase để phân tích sau này**  
✅ **Tự động khởi động FastAPI khi người dùng truy cập**  

---

## 🛠 Công nghệ sử dụng  
### **Frontend**  
- ⚛️ [Next.js](https://nextjs.org/) (React)  
- 🎨 [Tailwind CSS](https://tailwindcss.com/)  

### **Backend**  
- 🚀 [FastAPI](https://fastapi.tiangolo.com/) (Python)  
- 🤖 [Hugging Face Transformers](https://huggingface.co/facebook/bart-large-mnli) (`facebook/bart-large-mnli`)  

### **Database & Storage**  
- 🔥 [Firebase Realtime Database](https://firebase.google.com/)  
- 🗄 PostgreSQL (tùy chọn)  

### **Triển khai**  
- 🖥 **Backend:** VPS với **Gunicorn + Uvicorn** (FastAPI)  
- 🌍 **Frontend:** Vercel (Next.js)  
