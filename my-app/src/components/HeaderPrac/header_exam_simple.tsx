"use client";

import React, { useEffect, useState } from "react";
import styles from "./header_exam.module.css";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import "../../app/globals.css";

export default function HeaderExamSimple({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const taskKey = "mocktest-exam-timer";
  const answerKey = "studentAnswer";
  const resetFlag = "mocktest-reset";
  const defaultTime = 60 * 60; // 60 minutes

  const router = useRouter();
  const pathname = usePathname();

  const [time, setTime] = useState<number>(defaultTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMockTestPage = pathname.includes("/MockTestPage/task1") || pathname.includes("/MockTestPage/task2");

  // Load time from localStorage or reset if needed
  useEffect(() => {
    if (typeof window !== "undefined" && isMockTestPage) {
      const shouldReset = localStorage.getItem(resetFlag) === "true";

      if (shouldReset) {
        localStorage.removeItem(taskKey);
        sessionStorage.removeItem(answerKey);
        localStorage.removeItem(resetFlag);
        setTime(defaultTime);
        localStorage.setItem(taskKey, defaultTime.toString());
      } else {
        const savedTime = localStorage.getItem(taskKey);
        if (savedTime !== null && !isNaN(Number(savedTime))) {
          setTime(parseInt(savedTime, 10));
        } else {
          setTime(defaultTime);
          localStorage.setItem(taskKey, defaultTime.toString());
        }
      }
    }
  }, [pathname, isMockTestPage]);

  // Countdown timer
  useEffect(() => {
    if (!isMockTestPage) return;

    const interval = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        localStorage.setItem(taskKey, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMockTestPage]);

  // Auto submit when time runs out
  useEffect(() => {
    if (time === 0) {
      handleSubmit();
    }
  }, [time]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmSubmit = window.confirm("Are you sure you want to submit your answer?");
    if (!confirmSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit();

      // Reset everything
      localStorage.setItem(resetFlag, "true");
      localStorage.removeItem(taskKey);
      sessionStorage.removeItem(answerKey);

      router.push("/ShowAllScores");
    } catch (error) {
      console.error("Error submitting:", error);
      alert("There was an error submitting your exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className={styles.header}>
      <Image src="/logo.png" alt="Logo" width={50} height={50} className={styles.logo} />
      <div className={styles.timercontainer}>
        <span className={styles.timer}>
          {time >= 60 ? (
            <>
              <span className={styles.orange}>{minutes}</span> minute{minutes > 1 ? "s" : ""}
            </>
          ) : (
            <>
              <span className={styles.red}>{seconds}</span> second{seconds > 1 ? "s" : ""}
            </>
          )}
        </span>
      </div>
      <button className={styles.submitbtn} onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
