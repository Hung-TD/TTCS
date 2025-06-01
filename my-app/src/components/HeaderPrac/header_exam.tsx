"use client";

import React, { useState, useEffect } from "react";
import styles from "./header_exam.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "../../app/globals.css";

export default function Header({
  onSubmit,
  taskType = "task1", // mặc định là task1 nếu không truyền vào
}: {
  onSubmit: () => Promise<void>;
  taskType?: "task1" | "task2";
}) {
  const router = useRouter();
  const [timerOn, setTimerOn] = useState(true);
  const [time, setTime] = useState(20 * 60); // 20 phút

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
      const taskNum = taskType === "task2" ? "2" : "1";
      router.push(`/Scoring?task=${taskNum}`);

    } catch (error) {
      console.error("❌ Lỗi khi gửi bài:", error);
    }
  };
  

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className={styles.header}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={50}
        height={50}
        className={styles.logo}
      />
      <div className={styles.timercontainer}>
        <label className={styles.timerlabel}>
          <strong>Timer:</strong>
          <div className={styles.switch}>
            <input
              type="checkbox"
              checked={timerOn}
              onChange={() => setTimerOn(!timerOn)}
            />
            <span
              className={`${styles.slider} ${timerOn ? styles.green : styles.red}`}
            />
          </div>
        </label>
        <span className={`${styles.timer} ${time === 0 ? styles.hidden : ""}`}>
          {time >= 60 ? (
            <>
              <span className={styles.orange}>{minutes}</span> minute
              {minutes > 1 ? "s" : ""}
            </>
          ) : (
            <>
              <span className={styles.red}>{seconds}</span> second
              {seconds > 1 ? "s" : ""}
            </>
          )}
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
