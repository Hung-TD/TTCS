"use client";
import React from "react";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div>
        <div className={styles.title}>
          IELTS Writing Dashboard
        </div>
        <div className={styles.subtitle}>
          Practice & manage your IELTS Writing Task 1 & Task 2
        </div>
      </div>
    </header>
  );
}