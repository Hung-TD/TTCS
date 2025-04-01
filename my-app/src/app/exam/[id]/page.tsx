"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import HeaderExam from "@/app/HeaderPrac/header_exam";
import styles from "./exampage.module.css";
import { useParams } from "next/navigation";
import { db } from "@/app/firebaseConfig";
import { ref, set, push } from "firebase/database";

// Kết nối Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ExamPage() {
  const { id } = useParams(); // ✅ Lấy ID từ URL
  const [panelWidth, setPanelWidth] = useState(50);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(false); // ✅ Thêm loading state
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // ✅ Gọi API lấy đề từ Supabase theo ID
  useEffect(() => {
    if (!id) return; // 🔹 Kiểm tra ID hợp lệ trước khi truy vấn

    const fetchExamData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("task1")
        .select("*")
        .eq("id", Number(id)) // ✅ Truy vấn đề theo ID
        .single();

      if (error) {
        console.error("Lỗi khi lấy đề thi:", error.message);
      } else {
        setExamData(data);
        setImageUrl(data?.image_url || null); // ✅ Cập nhật URL ảnh
      }
      setLoading(false);
    };

    fetchExamData();
  }, [id]); // 🔹 useEffect chạy lại khi ID thay đổi

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
      console.error("❌ Firebase chưa được khởi tạo!");
      alert("❌ Lỗi hệ thống, vui lòng thử lại sau!");
      return;
    }

    try {
      const newTextRef = push(ref(db, "exam_writing_task1")); // Tạo ID ngẫu nhiên
      await set(newTextRef, {
        content: text,
        wordCount: wordCount,
        timestamp: new Date().toISOString(),
        imageUrl: imageUrl || "", // ✅ Lưu URL ảnh vào Firebase
        issue: examData?.issue || "",
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
      <HeaderExam onSubmit={handleSubmit} imageUrl={imageUrl} />
      <div className={styles.container}>
        {/* Panel bên trái */}
        <div className={styles.leftPanel} style={{ flex: panelWidth }}>
          <div className={styles.instructionText}>
            {loading ? (
              <h3>🔄 Đang tải đề thi...</h3>
            ) : (
              <>
                <h3>{examData?.title || "Không tìm thấy đề"}</h3>
                <p>{examData?.description || "Không có mô tả."}</p>
                <p>{examData?.issue || "Không có mô tả."}</p>
                <p>{examData?.rules || "Không có mô tả."}</p>

              </>
            )}
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
        </div>

        {/* Thanh chia đôi màn hình */}
        <div className={styles.divider} onMouseDown={handleMouseDown}></div>

        {/* Panel bên phải */}
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
