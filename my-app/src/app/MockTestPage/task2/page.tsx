"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import styles from "./mocktest2.module.css";
import { db } from "@/app/firebaseConfig";
import { ref, set, push } from "firebase/database";
import HeaderExamSimple from "@/components/HeaderPrac/header_exam_simple";
import FooterExam from "@/components/HeaderPrac/footer_exam";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MockTask2() {
  const [panelWidth, setPanelWidth] = useState(50);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  

  useEffect(() => {
    // Lấy bài viết đang viết dở từ localStorage
    const savedText = localStorage.getItem("mock_task2_text");
    if (savedText) {
      setText(savedText);
      setWordCount(savedText.trim().split(/\s+/).filter(Boolean).length);
    }
  
    setLoading(true);
    supabase
      .from("task2")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setData(data[randomIndex]);
        }
        setLoading(false);
      });
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    setWordCount(val.trim().split(/\s+/).filter(Boolean).length);
  
    localStorage.setItem("mock_task2_text", val);
  };
  

  const handleSubmit = async () => {
    if (text.trim() === "") {
      alert("❌ The essay cannot be empty!");
      return;
    }
    try {
      // Lưu bài viết vào localStorage
      localStorage.setItem("mocktask2-response", text);
  
      // Lưu bài viết vào Firebase Realtime Database
      const newTextRef = push(ref(db, "exam_writing_task2"));
      await set(newTextRef, {
        content: text,
        wordCount: wordCount,
        timestamp: new Date().toISOString(),
        imageUrl: data?.image_url || "",
        issue: data?.issue || ""
      });
  
      alert("✅ Your Task 2 essay has been saved!");
  
      // ✅ Reset nội dung bài viết & localStorage
      setText("");
      setWordCount(0);
      localStorage.removeItem("mock_task2_text");
  
      // ✅ Điều hướng tới trang chấm điểm
      router.push("/exam-result?task=task2");
  
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Failed to save your Task 2 essay!");
    }
  };
  

  return (
    <>
      <HeaderExamSimple onSubmit={handleSubmit} />
      <div className={styles.container}>
        {/* Left Panel */}
        <div className={styles.leftPanel} style={{ flex: panelWidth }}>
          <div className={styles.instructionText}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <h3>Loading Task 2...</h3>
              </div>
            ) : (
              <>
                <h3 className={styles.examTitle}>{data?.title || "No title found"}</h3>
                <p className={styles.examDescription}>{data?.description || "No description."}</p>
                <div className={styles.issueContainer}>
                  <h4 className={styles.issueTitle}>Task:</h4>
                  <p className={styles.issueText}>{data?.issue || "No task description."}</p>
                </div>
                {data?.image_url && (
                  <div className={styles.imgContainer}>
                    <Image
                      src={data.image_url}
                      alt="Mock Test Task 2"
                      width={500}
                      height={500}
                      className={styles.imageTest}
                    />
                  </div>
                )}
                {data?.rules && (
                  <p className={styles.examRules}>{data.rules}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} onMouseDown={handleMouseDown}></div>

        {/* Right Panel */}
        <div className={styles.rightPanel} style={{ flex: 100 - panelWidth }}>
          <div className={styles.textContainer}>
            <textarea
              className={styles.inputText}
              placeholder="Enter your Task 2 essay..."
              value={text}
              onChange={handleTextChange}
            />
            <p className={styles.wordCount}>Words Count: {wordCount}</p>
          </div>
        </div>
      </div>
      <FooterExam />
    </>
  );
}
