"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./homepage.module.css";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("home_reloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("home_reloaded", "true");
      window.location.reload();
    } else {
      sessionStorage.removeItem("home_reloaded"); // Xóa để reload lần sau
      setIsLoaded(true);
    }
  }, []);
  if (!isLoaded) return null; 
  return (
    <div className={styles.page}>
      {/* Heading Section */}
      <div className={styles.headingContainer}>
        <h1 className={styles.mainHeading}>Improve Your English Writing</h1>
        <p className={styles.subHeading}>Practice, analyze, and get expert feedback.</p>
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.signupButton}>Start now</button>
      </div>

      {/* Card Section */}
      <div className={styles.cardsContainer}>
        {/* Card 1 - Image */}
        <div className={`${styles.card} ${styles.card1}`}>
          <img className={styles.image1} src="/homepage.jpg" alt="Exam" />
        </div>

        {/* Card 2 - Green Text */}
        <div className={`${styles.card} ${styles.card2}`}>
          <p className={styles.textcard2}>
            <span className={styles.numtextcard2}>1000+</span> people do the test
          </p>
        </div>

        {/* Card 3 - White Text */}
        <div className={`${styles.card} ${styles.card3}`}>
          <p>Total exam</p>
          <p className={styles.numtextcard3}>1000+</p>
          <p className={styles.smallText}>with different topics</p>
        </div>

        {/* Card 4 - Dark Card */}
        <div className={`${styles.card} ${styles.card4}`}>
          <p className={styles.textcard4}>Practice with real exam topics.</p>
        </div>

        {/* Card 5 - Icon and Text */}
        <div className={`${styles.card} ${styles.card5}`}>
          <Image className={styles.icon1} src="/icon/notebook.png" alt="Feedback Icon" width={30} height={30} />
          <p className={styles.textcard5}>Get expert feedback on your writing.</p>
        </div>
      </div>
    </div>
  );
}
