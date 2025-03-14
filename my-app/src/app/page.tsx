"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>IELTS Writing</h1>
        <div className="btn_task1"> 
          <button 
            className={styles.button} 
            onClick={() => router.push("/exam_writing_task1")}
          >
            Generate đề thi IELTS Writing Task 1
          </button>
        </div>
        <div className="btn_task2"> 
          <button 
            className={styles.button} 
            onClick={() => router.push("/exam_writing_task1")}
          >
            Generate đề thi IELTS Writing Task 2
          </button>
        </div>
        
      </main>
    </div>
  );
}
