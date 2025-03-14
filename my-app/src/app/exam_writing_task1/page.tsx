"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import AutoExpandTextarea from "./AutoExpandTextarea";


export default function ExamPage() {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    // Gọi API để lấy ảnh ngẫu nhiên
    fetch("/api/random-image")
      .then((res) => res.json())
      .then((data) => setImageSrc(data.image));
  }, []);

  return (
    <div className={styles.mainPage}>
      {/* Hiển thị ảnh đề bài nếu đã load xong */}
      <div className={styles.imgContainer}>
        {imageSrc ? (
          <>
            <Image src={imageSrc} alt="Đề thi IELTS" width={500} height={500} className={styles.imageTest}/>
          </>
        ) : (
          <p>Đang tải đề thi...</p>
        )}
      </div>

      {/* Ô nhập bài viết */}
      <div className={styles.textContainer}>
        <AutoExpandTextarea />
      </div>
    </div>

  );
}
