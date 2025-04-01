"use client";

import Image from "next/image";
import styles from "./header_result.module.css";

export default function HeaderResult() {
  return (
    <div className={styles.header}>
      {/* Logo bên trái */}
      <div className={styles.logoContainer}>
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </div>

      {/* Tiêu đề căn giữa */}
      <div className={styles.titleContainer}>
        <div className={styles.title}>RESULT</div>
      </div>

      {/* Nút Back bên phải */}
      <button className={styles.backButton}>Back</button>
      
    </div>
  );
}
