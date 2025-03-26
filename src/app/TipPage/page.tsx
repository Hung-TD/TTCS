import Image from "next/image";
import styles from "./tippage.module.css";
import Header from "../HeaderLayout/page";
import Link from "next/link";
import "../globals.css";

export default function TipPage() {
    return (
        <div className={styles.page}>
            <Header />
            <div className={styles.tipPage}>
                {/* Phần chính (Hình + Tiêu đề) */}
                <div className={styles.content}>
                    <div className={styles.contenttext}>
                        <div className={styles.redBar}></div> {/* Thanh đỏ bên trái */}
                        <div className={styles.text}>
                            <h1 className={styles.title}>
                                Types of Questions in the IELTS Academic Writing Test
                            </h1>
                            <p className={styles.description}>
                                Learn about the types of questions you may encounter in the IELTS Academic Writing test.
                                Add these question types to your study plan to ensure the best possible preparation.
                            </p>
                        </div>
                    </div>
                    
            </div>

                {/* Nội dung bên dưới hình */}
                <div className={styles.extraContent}>
                    <h2 className={styles.subtitle}>Overview of the Academic Writing Test</h2>
                    <p className={styles.paragraph}>
                        The IELTS Academic Writing test consists of two tasks. The questions typically cover
                        topics of general interest and are suitable for candidates planning to study at
                        undergraduate or postgraduate levels, or seeking professional registration.
                        Both tasks require a formal writing style.
                    </p>

                    <h3 className={styles.sectionTitle}>Task 1</h3>
                    <p className={styles.paragraph}>
                        You will be given a graph, table, chart, or diagram and asked to describe, summarize,
                        or explain the information in your own words. You may need to describe data trends,
                        stages of a process, how something works, or an object or event.
                    </p>

                    <h3 className={styles.sectionTitle}>Task 2</h3>
                    <p className={styles.paragraph}>
                        You will be required to write an essay expressing an opinion, argument, or discussion
                        on a given topic. Support your ideas with relevant examples from your knowledge and experience.
                    </p>

                    {/* Nội dung mới thêm vào */}
                    <h2 className={styles.subtitle}>Summarizing Data from Charts</h2>
                    <p className={styles.paragraph}>
                        In the IELTS Academic Writing Task 1, you will be given a chart, which visually presents information.
                        You may receive one or multiple charts. These visual representations can be in the form of:
                    </p>
                    <ul className={styles.list}>
                        <li><Link href="/tables">Tables</Link></li>
                        <li><Link href="/graphs-processed">Graphs displaying processed data</Link></li>
                        <li><Link href="/charts">Charts</Link></li>
                        <li><Link href="/processes">Processes</Link></li>
                        <li><Link href="/graphs-raw">Graphs displaying raw data</Link></li>
                        <li><Link href="/maps">Maps</Link></li>
                    </ul>
                    <p className={styles.paragraph}>
                        You will also be given instructions to summarize the information by selecting and reporting
                        key features and making comparisons where relevant. This task requires transforming visual
                        information into a written format.
                    </p>
                    <p className={styles.paragraph}>
                        To successfully complete this task, you need to:
                    </p>
                    <ul className={styles.list}>
                        <li>Write an introduction</li>
                        <li>Write an overview (summarizing what you see)</li>
                        <li>Present and highlight key features with figures (data)</li>
                    </ul>
                    <p className={styles.paragraph}>
                        You must write at least 150 words, and your response should be a full piece of writing
                        without bullet points or notes.
                    </p>
                </div>
            </div>
        </div>
    );
}
