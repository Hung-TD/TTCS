"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <button className={styles.navButton} onClick={() => router.push("/dashboard/activity")}>
          Activity
        </button>
        <button className={styles.navButton} onClick={() => router.push("/dashboard/student")}>
          Student
        </button>
        <button className={styles.navButton} onClick={() => router.push("/dashboard/test")}>
          Test
        </button>
      </nav>
    </aside>
  );
}