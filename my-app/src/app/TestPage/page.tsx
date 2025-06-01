"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import HeaderExam from "@/components/HeaderPrac/header_exam";
import styles from "./exampage.module.css";
import { db } from "@/app/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from "@/app/firebaseConfig";  // Import Firebase app instance

// Kiểm tra biến môi trường trước khi kết nối Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Missing Supabase environment variables!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default function ExamPage() {
  const [panelWidth, setPanelWidth] = useState(50);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [examData, setExamData] = useState<any>(null);

  // Add saveExamToFirestore function inside the component
  const saveExamToFirestore = async (examData: any) => {
    try {
      const firestore = getFirestore(app); // <-- dùng app được import từ firebaseConfig
      const examRef = doc(firestore, "task1_exams", examData.id.toString());
  
      const examDoc = await getDoc(examRef);
  
      const examPayload = {
        exam_id: examData.id,
        image_url: examData.image_url,
        title: examData.title,
        description: examData.description,
        description_title: examData.description_title,
        updated_at: new Date().toISOString(),
      };
  
      if (!examDoc.exists()) {
        await setDoc(examRef, {
          ...examPayload,
          created_at: new Date().toISOString(),
          status: "active",
          type: "task1",
        });
        console.log("✅ Đề thi mới đã được lưu vào Firestore");
      } else {
        await updateDoc(examRef, examPayload);
        console.log("✅ Đề thi đã được cập nhật trong Firestore");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lưu đề thi vào Firestore:", error);
    }
  };
  

  // Replace the existing useEffect
  useEffect(() => {
    const fetchExamData = async () => {
      const { data, error } = await supabase
        .from("task1")
        .select("*")
        .limit(1)
        .maybeSingle();
  
      if (error) {
        console.error("❌ Lỗi khi lấy đề thi:", error.message);
      } else if (data) {
        console.log("📥 Dữ liệu lấy từ Supabase:", data); // Debug
        setExamData(data);
        await saveExamToFirestore(data);
      }
    };
  
    fetchExamData();
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
      const newTextRef = push(ref(db, "exam_writing_task1"));
      await set(newTextRef, {
        content: text,
        wordCount: wordCount,
        timestamp: new Date().toISOString(),
        imageUrl: examData?.image_url || "" , // 👉 Lưu URL ảnh vào Firebase
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
      <HeaderExam onSubmit={handleSubmit} imageUrl={examData?.image_url || ""} />
      <div className={styles.container}>
        {/* Panel bên trái */}
        <div className={styles.leftPanel} style={{ flex: panelWidth }}>
          <div className={styles.instructionText}>
            <h3>{examData?.title || "Loading..."}</h3>
            <p>{examData?.description || "Đang tải đề thi..."}</p>
          </div>
          <div className={styles.imgContainer}>
            {examData?.image_url ? (
              <Image
                src={examData.image_url}
                alt="Đề thi IELTS"
                width={500}
                height={500}
                className={styles.imageTest}
                unoptimized // Bỏ nếu ảnh từ domain hợp lệ
              />
            ) : (
              <p>Đang tải đề thi...</p>
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
