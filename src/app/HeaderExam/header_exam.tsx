"use client";

import React, { useState, useEffect } from "react";
import styles from "./header_exam.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header({ 
  onSubmit, 
  imageUrl 
}: { 
  onSubmit: () => Promise<void>; 
  imageUrl: string | null;
}) {
  const router = useRouter();
  const [timerOn, setTimerOn] = useState(true);
  const [time, setTime] = useState(20 * 60); // 20 phút (tính bằng giây)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerOn) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval!);
            handleSubmit(); // Hết giờ thì tự động submit
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } 

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerOn]);

  const handleSubmit = async () => {
    try {
      await onSubmit();
      router.push(`/ScoringWritingTask1?image=${encodeURIComponent(imageUrl || "")}`);
    } catch (error) {
      console.error("❌ Lỗi khi gửi bài:", error);
    }
  };

  const formattedTime = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;

  return (
    <div className={styles.header}>
      <Image src="/logo.png" alt="Logo" width={50} height={50} className={styles.logo} />
      <div className={styles.timercontainer}>
        <label className={styles.timerlabel}>
          <strong>Timer:</strong>
          <div className={styles.switch}>
            <input
              type="checkbox"
              checked={timerOn}
              onChange={() => setTimerOn(!timerOn)}
            />
            <span className={`${styles.slider} ${timerOn ? styles.green : styles.red}`} />
          </div>
        </label>
        <span className={`${styles.timer} ${time === 0 ? styles.hidden : ""}`}>
          {time > 0 ? formattedTime : "Time's up!"}
        </span>
      </div>
      <button 
        className={styles.submitbtn}
        onClick={handleSubmit}
        disabled={time === 0}
      >
        Submit
      </button>
    </div>
  );
}
