"use client";

import { useState } from "react";
import Image from "next/image";
import HeaderExam from "@/components/HeaderPrac/header_exam";
import styles from "./exampage.module.css";
import { useParams } from "next/navigation";
import { getDatabase, ref, set, push } from "firebase/database";
import { app } from "@/app/firebaseConfig";
import { useExamData } from "@/hooks/useExamData";

const db = getDatabase(app);

export default function ExamPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const { examData, loading, imageUrl, error } = useExamData(id ? Number(id) : "", "task1");

  const [panelWidth, setPanelWidth] = useState(50);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);

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
    const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSubmit = async () => {
    if (text.trim() === "") {
      alert("❌ Bài viết không được để trống!");
      return;
    }
    if (!db) {
      alert("❌ Lỗi hệ thống, vui lòng thử lại sau!");
      return;
    }
    try {
      const newTextRef = push(ref(db, "exam_writing_task1"));
      await set(newTextRef, {
        content: text,
        wordCount: wordCount,
        timestamp: new Date().toISOString(),
        imageUrl: imageUrl || "",
        issue: examData?.issue || ""
      });
      alert("✅ Bài viết đã được lưu thành công!");
      setText("");
      setWordCount(0);
    } catch (error) {
      alert("❌ Lưu bài viết thất bại!");
    }
  };

  return (
    <>
      <HeaderExam onSubmit={handleSubmit} taskType="task1" />
      <div className={styles.container}>
        <div className={styles.leftPanel} style={{ flex: panelWidth }}>
          <div className={styles.instructionText}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <h3>Đang tải đề thi...</h3>
              </div>
            ) : (
              <>
                <h3 className={styles.examTitle}>{examData?.title || "Không tìm thấy đề"}</h3>
                <p className={styles.examDescription}>{examData?.description || "Không có mô tả."}</p>
                <div className={styles.issueContainer}>
                  <h4 className={styles.issueTitle}>Task:</h4>
                  <p className={styles.issueText}>{examData?.issue || "Không có mô tả."}</p>
                </div>
                <div className={styles.imgContainer}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Đề thi IELTS"
                      width={500}
                      height={500}
                      className={styles.imageTest}
                    />
                  ) : (
                    <p>🔄 Đang tải đề thi...</p>
                  )}
                </div>
                {examData?.rules && (
                  <p className={styles.examRules}>{examData.rules}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className={styles.divider} onMouseDown={handleMouseDown}></div>
        <div className={styles.rightPanel} style={{ flex: 100 - panelWidth }}>
          <div className={styles.textContainer}>
            <textarea
              className={styles.inputText}
              placeholder="Enter your writing here..."
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
