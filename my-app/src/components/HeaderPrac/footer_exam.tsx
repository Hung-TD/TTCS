"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./footer_exam.module.css";

export default function FooterExam() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={styles.footer}>
      <button
        className={`${styles.switchBtn} ${pathname.endsWith("/task1") ? styles.active : ""}`}
        onClick={() => router.push("/MockTestPage/task1")}
        disabled={pathname.endsWith("/task1")}
      >
        Task 1
      </button>
      <button
        className={`${styles.switchBtn} ${pathname.endsWith("/task2") ? styles.active : ""}`}
        onClick={() => router.push("/MockTestPage/task2")}
        disabled={pathname.endsWith("/task2")}
      >
        Task 2
      </button>
    </div>
  );
}