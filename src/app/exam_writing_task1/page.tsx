"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HeaderExam from "@/app/header_exam";
import { db } from "@/app/SaveExamText/firebase";
import { ref, set, push } from "firebase/database"; // Import Firebase Database
import styles from "./page.module.css";

export default function ExamPage() {
  
  const [imageSrc, setImageSrc] = useState("");
  const [panelWidth, setPanelWidth] = useState(50);
  const [text, setText] = useState(""); // Nội dung bài viết
  const [wordCount, setWordCount] = useState(0); // Số từ

  useEffect(() => {
    fetch("/api/random-image")
      .then((res) => res.json())
      .then((data) => setImageSrc(data.image));
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    
    const startX = event.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(20, Math.min(80, startWidth + (deltaX / window.innerWidth) * 100));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    
    // Đếm số từ (loại bỏ khoảng trắng thừa)
    const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };
  
  const handleSubmit = async () => {
    if (text.trim() === "") {
      alert("❌ Bài viết không được để trống!");
      return;
    }

    try {
      const newTextRef = push(ref(db, "exam_writing_task1")); // Tạo ID ngẫu nhiên
      await set(newTextRef, {
        content: text,
        wordCount: wordCount,
        timestamp: new Date().toISOString(),
      });

      alert("✅ Bài viết đã được lưu thành công!");
      setText(""); // Reset textarea sau khi lưu
      setWordCount(0);
    } catch (error) {
      console.error("❌ Lỗi khi lưu:", error);
      alert("❌ Lưu bài viết thất bại!");
    }
  };

  return (
    <>
      {/* Thêm Header */}
      <HeaderExam onSubmit={handleSubmit} />
      <div className={styles.headerSpacing}></div> {/* Tạo khoảng trống tránh header đè nội dung */}

      <div className={styles.container}>
        <div className={styles.leftPanel} style={{ flex: panelWidth }}>
          <div className={styles.instructionText}>
            <h3>Writing Task 1</h3>
            <p>You should spend about 20 minutes on this task.</p>
            <p>The graph below shows the production levels of the main kinds of fuel in the UK between 1981 and 2000.</p>
            <p>Summarize the information by selecting and reporting the main features and making comparisons where relevant.</p>
            <p><strong>You should write at least 150 words.</strong></p>
          </div>
          <div className={styles.imgContainer}>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt="Đề thi IELTS"
                width={500}
                height={500}
                className={styles.imageTest}
              />
            ) : (
              <p>Đang tải đề thi...</p>
            )}
          </div>
        </div>
    
        {/* Thanh dọc chia đôi màn hình */}
        <div className={styles.divider} onMouseDown={handleMouseDown}></div>

        <div className={styles.rightPanel} style={{ flex: 100 - panelWidth }}>
          <div className={styles.textContainer}>
            <textarea 
              className={styles.inputText} 
              placeholder="Nhập bài viết của bạn..." 
              value={text}
              onChange={handleTextChange}
            />
            <p className={styles.wordCount}>Words Count: {wordCount}</p>
          </div>
        </div>
      </div>
    </>
  );  
}
