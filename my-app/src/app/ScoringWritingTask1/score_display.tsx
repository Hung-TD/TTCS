import React, { useEffect, useState } from "react";
import styles from "./scoreDisplay.module.css";
import Header from "../HeaderLayout/page";

interface ScoreProps {
  score?: {
    "Grammatical Range & Accuracy"?: number;
    "Coherence & Cohesion"?: number;
    "Lexical Resource"?: number;
    "Task Achievement"?: number;
  };
  studentResponse: string;
}

// Function to call LanguageTool API and return corrected text
const checkGrammar = async (text: string): Promise<{ correctedText: string, matches: any[] }> => {
  const formData = new URLSearchParams();
  formData.append("text", text);
  formData.append("language", "en-US");

  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    console.error("❌ Failed to fetch corrections from LanguageTool");
    return { correctedText: text, matches: [] };
  }

  const result = await response.json();
  return {
    correctedText: text, // vẫn giữ nguyên gốc
    matches: result.matches || [],
  };
};


const highlightMistakes = (text: string, matches: any[]) => {
  if (!matches.length) return text;

  const parts = [];
  let lastIndex = 0;

  matches
    .sort((a: any, b: any) => a.offset - b.offset)
    .forEach((match, index) => {
      const start = match.offset;
      const end = match.offset + match.length;
      const replacement = match.replacements[0]?.value;

      // Text trước lỗi
      if (start > lastIndex) {
        parts.push(<span key={`text-${index}`}>{text.slice(lastIndex, start)}</span>);
      }

      // Lỗi được highlight
      parts.push(
        <span
          key={`mistake-${index}`}
          style={{ textDecoration: "underline", textDecorationColor: "red", cursor: "pointer" }}
          title={`Suggestion: ${replacement}`}
        >
          {text.slice(start, end)}
        </span>
      );

      lastIndex = end;
    });

  // Phần còn lại sau lỗi cuối cùng
  if (lastIndex < text.length) {
    parts.push(<span key="last-text">{text.slice(lastIndex)}</span>);
  }

  return parts;
};

const getSynonymsFromDatamuse = async (word: string): Promise<string[]> => {
  try {
    const res = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
    const data = await res.json();
    return data.map((item: any) => item.word);
  } catch (error) {
    console.error("Error fetching from Datamuse:", error);
    return [];
  }
};

const upgradeSimpleWords = async (text: string): Promise<(string | JSX.Element)[]> => {
  const words = text.split(/\b/); // Tách từ giữ nguyên dấu câu

  const upgradedWords = await Promise.all(
    words.map(async (word, idx) => {
      const lower = word.toLowerCase();
      const isWord = /^[a-zA-Z]+$/.test(lower);

      if (isWord) {
        const synonyms = await getSynonymsFromDatamuse(lower);
        const highBand = synonyms.find(
          (w) =>
            w.length > word.length + 2 && // Ưu tiên từ dài hơn
            !w.includes(" ") &&
            /^[a-zA-Z]+$/.test(w)
        );
        if (highBand) {
          return (
            <span
              key={`syn-${idx}`}
              style={{ color: "green", fontWeight: "bold" }}
              title={`Original: ${word}`}
            >
              {highBand}
            </span>
          );
        }
      }
      return word;
    })
  );

  return upgradedWords;
};


const ScoreDisplay: React.FC<ScoreProps> = ({ score, studentResponse }) => {
  const [grammarMatches, setGrammarMatches] = useState<any[]>([]);
  const [enhancedResponse, setEnhancedResponse] = useState<(string | JSX.Element)[]>([]);

  useEffect(() => {
    const runCheck = async () => {
      const result = await checkGrammar(studentResponse);
      setGrammarMatches(result.matches);
  
      const upgraded = await upgradeSimpleWords(studentResponse);
      setEnhancedResponse(upgraded);
    };
    runCheck();
  }, [studentResponse]);
  

  const grammar = score?.["Grammatical Range & Accuracy"] ?? 0;
  const cohesion = score?.["Coherence & Cohesion"] ?? 0;
  const lexical = score?.["Lexical Resource"] ?? 0;
  const task = score?.["Task Achievement"] ?? 0;
  const overallScore = ((grammar + cohesion + lexical + task) / 4).toFixed(1);

  return (
    <div className={styles.container}>
      <Header />
      <div className={`${styles.mainContent} ${styles.contentWithHeader}`}>
        <h2 className={styles.title}>IELTS Writing Task 1 Assessment</h2>

        <div className={styles.responseSection}>
          <h3 className={styles.responseTitle}>Student Response (grammar issues):</h3>
          <p className={styles.responseText}>
            {highlightMistakes(studentResponse, grammarMatches)}
          </p>

          <h3 className={styles.responseTitle}>Upgraded Vocabulary (suggested):</h3>
          <p className={styles.responseText}>
            {enhancedResponse}
          </p>
        </div>


        <h3 className={styles.title}>Score Breakdown</h3>
        <ul>
          <li className={styles.scoreItem}><strong>Grammatical Range & Accuracy:</strong> {grammar}</li>
          <li className={styles.scoreItem}><strong>Coherence & Cohesion:</strong> {cohesion}</li>
          <li className={styles.scoreItem}><strong>Lexical Resource:</strong> {lexical}</li>
          <li className={styles.scoreItem}><strong>Task Achievement:</strong> {task}</li>
        </ul>
        <div className={styles.overallScore}>Overall Score: {overallScore}</div>
      </div>
    </div>
  );
};


export default ScoreDisplay;
