import Image from "next/image";
import styles from "./tables.module.css";
import Header from "../../../components/HeaderLayout/page";
import Link from "next/link";
import "../../globals.css";

export default function TipPage() {
    return (
        <div className={styles.page}>
            <Header />
            <div className={styles.tipPage}>
                {/* Banner chính */}
                <div className={styles.content}>
                    <div className={styles.contenttext}>
                        <div className={styles.redBar}></div>
                        <div className={styles.text}>
                            <h1 className={styles.title}>
                                How to Write IELTS Writing Task 1 (Table) Based on Scoring Criteria
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Nội dung chính */}
                <div className={styles.extraContent}>
                    {/* Section 1 */}
                    <h2 className={styles.subtitle}>How to Write About Tables Effectively</h2>
                    <p className={styles.paragraph}>
                        A table is one of the most common visuals in IELTS Writing Task 1. It presents data in a structured format using rows and columns. 
                        To achieve a high score, you need to summarize the main trends, group similar information, and avoid listing all the numbers.
                    </p>

                    {/* Section 2 */}
                    <h3 className={styles.sectionTitle}>1. Understand the Task Requirements</h3>
                    <p className={styles.paragraph}>
                        The task will ask you to summarize the information by selecting and reporting the main features, and making comparisons where relevant. 
                        This means you must:
                    </p>
                    <ul className={styles.list}>
                        <li><strong>Select key features</strong> of the table</li>
                        <li><strong>Make relevant comparisons</strong> between data sets</li>
                        <li><strong>Avoid simply listing numbers</strong> without analysis</li>
                    </ul>

                    {/* Section 3 */}
                    <h3 className={styles.sectionTitle}>2. Organize Your Response</h3>
                    <p className={styles.paragraph}>Use a four-paragraph layout for clarity:</p>
                    <ul className={styles.list}>
                        <li><strong>Introduction</strong>: Paraphrase the task prompt</li>
                        <li><strong>Overview</strong>: Describe the general trends or notable features</li>
                        <li><strong>Body Paragraph 1</strong>: Highlight main group or changes</li>
                        <li><strong>Body Paragraph 2</strong>: Describe additional comparisons or categories</li>
                    </ul>

                    {/* Section 4 */}
                    <h3 className={styles.sectionTitle}>3. Write an Effective Overview</h3>
                    <p className={styles.paragraph}>
                        The overview is crucial. It should summarize the key patterns or outliers in the data without mentioning too many exact figures. 
                        Place it right after the introduction to guide the reader.
                    </p>

                    {/* Section 5 */}
                    <h3 className={styles.sectionTitle}>4. Use the Right Vocabulary</h3>
                    <p className={styles.paragraph}>Improve your lexical resource with appropriate terms:</p>
                    <ul className={styles.list}>
                        <li><strong>Verbs</strong>: increase, decrease, fluctuate, remain stable</li>
                        <li><strong>Nouns</strong>: an increase, a decrease, a fluctuation, stability</li>
                        <li><strong>Adjectives/Adverbs</strong>: significant, gradual, sharp, slight, dramatically, steadily</li>
                    </ul>

                    {/* Section 6 */}
                    <h3 className={styles.sectionTitle}>5. Use the Correct Tense</h3>
                    <p className={styles.paragraph}>Choose tenses based on the time period shown:</p>
                    <ul className={styles.list}>
                        <li><strong>Present simple</strong> – when no time reference is given</li>
                        <li><strong>Past simple</strong> – when the table refers to past years or events</li>
                    </ul>

                    {/* Section 7 */}
                    <h3 className={styles.sectionTitle}>6. Common Mistakes to Avoid</h3>
                    <ul className={styles.list}>
                        <li>Listing all numbers without comparison</li>
                        <li>Adding your opinion or information not shown in the data</li>
                        <li>Writing without clear structure or proper paragraphing</li>
                    </ul>

                    {/* Section 8 */}
                    <h3 className={styles.sectionTitle}>7. Sample Table Description</h3>
                    <p className={styles.paragraph}>
                        <strong>Introduction:</strong><br />
                        The table illustrates the number of international students enrolled in five Australian universities in 2020.
                    </p>
                    <p className={styles.paragraph}>
                        <strong>Overview:</strong><br />
                        Overall, the University of Melbourne had the highest number of international students, 
                        while the University of Adelaide had the lowest.
                    </p>
                    <p className={styles.paragraph}>
                        <strong>Details:</strong><br />
                        In 2020, the University of Melbourne enrolled 8,000 international students, significantly more than any other institution. 
                        The University of Sydney followed with 6,500 students, while the University of Queensland had 5,800. 
                        The University of New South Wales recorded 4,600 students, and the University of Adelaide had the fewest at 3,200.
                    </p>

                    {/* Optional: Navigation links to other chart types */}
                    <h3 className={styles.sectionTitle}>Explore Other Chart Types</h3>
                    <ul className={styles.list}>
                        <li><Link href="/TipPage/tables">Tables</Link></li>
                        <li><Link href="/graphs-processed">Graphs (Processed Data)</Link></li>
                        <li><Link href="/charts">Charts</Link></li>
                        <li><Link href="/processes">Processes</Link></li>
                        <li><Link href="/graphs-raw">Graphs (Raw Data)</Link></li>
                        <li><Link href="/maps">Maps</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
