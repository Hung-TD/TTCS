"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./header_exam.module.css";

export default function HeaderExam({ onSubmit }: { onSubmit: () => void }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 phút (tính theo giây)
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
        // Gọi API Flask để chạy FastAPI
        await fetch("http://127.0.0.1:5000/start-fastapi", { method: "GET" });
        
        // Chuyển sang trang chấm điểm
        router.push("/ScoringWritingTask1");
    } catch (error) {
        console.error("Error starting FastAPI:", error);
    }
  };


  useEffect(() => {
    if (timeLeft <= 0) return; // Dừng khi hết giờ

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup khi component bị unmount
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !autoSubmitted) {
      setAutoSubmitted(true);
      alert("⏳ Hết giờ! Bài viết sẽ được tự động nộp.");
      onSubmit(); // Tự động nộp bài khi hết giờ
    }
  }, [timeLeft, autoSubmitted, onSubmit]);

  // Format thời gian hiển thị
  const formatTime = () => {
    if (timeLeft < 60) {
      return (
        <>
          <span className={styles.number}>{timeLeft}</span>
          <span className={styles.text}> s remaining</span>
        </>
      );
    }
    const minutes = Math.floor(timeLeft / 60);
    return (
      <>
        <span className={styles.number}>{minutes}</span>
        <span className={styles.text}> min remaining</span>
      </>
    );
  };

  return (
    <header className={styles.headerExam}>
      {/* Logo bên trái */}
      <Link href="/">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={50} 
          height={50} 
          className={styles.logo}
        />
      </Link>

      {/* Tiêu đề trung tâm */}
      <h1 className={styles.heading}>IELTS Writing Exam</h1>

      {/* Đồng hồ đếm ngược */}
      <div className={styles.timer}>{formatTime()}</div>

      {/* Nút Submit bên phải */}
      <button
      className={styles.submitButton}
      onClick={handleSubmit}
      disabled={timeLeft === 0}
      >
        Submit
      </button>
    </header>
  );
}
