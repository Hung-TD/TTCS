"use client";

import { useEffect, useRef, useState} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import "./homepage.css";
import Image from "next/image";
import { FaFileAlt, FaSearch, FaLightbulb, FaBookOpen } from "react-icons/fa"; 
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Calendar from "./Calendar/page";
import Footer from "./footer";
import Header from "./HeaderLayout/page"

gsap.registerPlugin(ScrollToPlugin);


export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = Array.from(container.children) as HTMLElement[];
    let currentSection = 0;
    let isScrolling = false;

    const smoothScroll = (targetY: number) => {
      isScrolling = true;
      gsap.to(window, {
        duration: 30, // 🔥 Cực kỳ chậm (30 giây)
        scrollTo: targetY,
        ease: "back.out(1.7)", // Chậm hơn power4.out
        onComplete: () => {
          setTimeout(() => (isScrolling = false), 1000); // Đợi 1s trước khi tiếp tục
        },
      });
    };

    const handleScroll = (event: WheelEvent) => {
      if (isScrolling) return;
      event.preventDefault();

      if (event.deltaY > 0 && currentSection < sections.length - 1) {
        currentSection++;
      } else if (event.deltaY < 0 && currentSection > 0) {
        currentSection--;
      }

      smoothScroll(sections[currentSection].offsetTop);
    };

    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Header /> {/* Gọi Header vào đây */}
      <section className={`${styles.section} ${styles.section1}`}>      {/* Heading Section */}
        <div className={styles.headingContainer}>
          <h1 className={styles.mainHeading}>Improve Your English Writing</h1>
          <p className={styles.subHeading}>Practice, analyze, and get expert feedback.</p>
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.signupButton}>Start now</button>
        </div>

        {/* Card Section */}
        <div className={styles.cardsContainer}>
          <div className={`${styles.card} ${styles.card1}`}>
            <img className={styles.image1} src="/homepage.jpg" alt="Exam" />
          </div>

          <div className={`${styles.card} ${styles.card2}`}>
            <p className={styles.textcard2}>
              <span className={styles.numtextcard2}>1000+</span> people do the test
            </p>
          </div>

          <div className={`${styles.card} ${styles.card3}`}>
            <p>Total exam</p>
            <p className={styles.numtextcard3}>1000+</p>
            <p className={styles.smallText}>with different topics</p>
          </div>

          <div className={`${styles.card} ${styles.card4}`}>
            <p className={styles.textcard4}>Practice with real exam topics.</p>
          </div>

          <div className={`${styles.card} ${styles.card5}`}>
            <Image className={styles.icon1} src="/icon/notebook.png" alt="Feedback Icon" width={30} height={30} />
            <p className={styles.textcard5}>Get expert feedback on your writing.</p>
          </div>
        </div>
        </section>
        {/* Section 2 - Hướng dẫn luyện tập */}
        <section className={`${styles.section} ${styles.section2}`}>
          <h2 className={styles.title_sec2}>🚀 Practice IELTS Writing Effectively</h2>
          <p className={styles.subtitle_sec2}>
            Improve your writing skills with our AI-powered scoring & in-depth analysis.
          </p>

          <div className={styles.grid_sec2}>
            {/* Left Column */}
            <div className={styles.column_sec2}>
              {/* Card 1 */}
              <div className={styles.card_sec2}>
                <FaFileAlt {...({ className: styles.icon_sec2 } as React.ComponentProps<typeof FaFileAlt>)} />
                <h3 className={styles.cardTitle_sec2}>Select the Right Topic</h3>
                <p className={styles.cardText_sec2}>
                  📜 Access 1000+ IELTS Task 1 & Task 2 topics to practice.
                </p>
              </div>

              {/* Card 2 */}
              <div className={styles.card_sec2}>
              <FaSearch {...({ className: styles.icon_sec2 } as React.ComponentProps<typeof FaFileAlt>)} />
              <h3 className={styles.cardTitle_sec2}>Instant Scoring</h3>
                <p className={styles.cardText_sec2}>
                  🔍 AI evaluates your writing based on 4 key IELTS scoring criteria.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.column_sec2}>
              {/* Card 3 */}
              <div className={styles.card_sec2}>
                <FaLightbulb {...({ className: styles.icon_sec2 } as React.ComponentProps<typeof FaFileAlt>)} />
                <h3 className={styles.cardTitle_sec2}>Error Analysis & Suggestions</h3>
                <p className={styles.cardText_sec2}>
                  🛠 Identify vocabulary & grammar mistakes with correction suggestions.
                </p>
              </div>

              {/* Card 4 */}
              <div className={styles.card_sec2}>
                <FaBookOpen {...({ className: styles.icon_sec2 } as React.ComponentProps<typeof FaFileAlt>)} />
                <h3 className={styles.cardTitle_sec2}>Compare with High Band Samples</h3>
                <p className={styles.cardText_sec2}>
                  📈 Learn from band 7.0+ sample essays to enhance your writing.
                </p>
              </div>
            </div>
          </div>
        </section>

        
        <section className={`${styles.section} ${styles.section3}`}>     
          <div className={styles.section3_content}>
              <h2>📅 Plan Your IELTS Writing Practice</h2>
              <p>Create a structured plan to improve your IELTS writing skills. Set goals, track progress, and stay consistent.</p>
              <button className={styles.section3_btn}>Start Planning Now</button>
          </div>

          <div className={styles.section3_calendar}>
            <Calendar />
          </div>
        </section>
        <section className={`${styles.section} ${styles.section4}`}>     
          <div className={styles.section4Content}>
          <h2>Boost Your IELTS Writing Score</h2>
          <p>
            Learn key strategies to improve your writing skills. Avoid common mistakes, 
            expand your vocabulary, and structure your essays effectively.
          </p>
          <button className={styles.section4Button}>Discover Writing Tips</button>
          </div>
        </section>
        <div className={`${styles.section} ${styles.footer_containter}`}>
          <Footer />
        </div>
        
    </div>
    
      
  );
}
