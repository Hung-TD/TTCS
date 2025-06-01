"use client";

import React, { useEffect, useState } from "react";
import styles from "./show_all_scores.module.css";
import Header from "../../components/HeaderLayout/page";

interface ScoreType {
  "Grammatical Range & Accuracy"?: number;
  "Coherence & Cohesion"?: number;
  "Lexical Resource"?: number;
  "Task Achievement"?: number;
}

const fetchScore = async (apiUrl: string): Promise<ScoreType | null> => {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error("Error fetching score:", error);
    return null;
  }
};

const ShowAllScores: React.FC = () => {
  const [task1Score, setTask1Score] = useState<ScoreType | null>(null);
  const [task2Score, setTask2Score] = useState<ScoreType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      const task1 = await fetchScore("http://127.0.0.1:8000/analyze_latest_exam");
      const task2 = await fetchScore("http://127.0.0.1:8000/analyze_latest_task2");
      setTask1Score(task1);
      setTask2Score(task2);
      setLoading(false);
    };

    loadScores();
  }, []);

  const renderScore = (score: ScoreType | null, taskName: string) => {
    if (!score) return <div>Không có dữ liệu cho {taskName}.</div>;

    const grammar = score["Grammatical Range & Accuracy"] ?? 0;
    const cohesion = score["Coherence & Cohesion"] ?? 0;
    const lexical = score["Lexical Resource"] ?? 0;
    const task = score["Task Achievement"] ?? 0;
    const overall = ((grammar + cohesion + lexical + task) / 4).toFixed(1);

    return (
      <div className={styles.taskContainer}>
        <h2 className={styles.taskTitle}>{taskName}</h2>
        <ul className={styles.scoreList}>
          <li><strong>Grammatical Range & Accuracy:</strong> {grammar}</li>
          <li><strong>Coherence & Cohesion:</strong> {cohesion}</li>
          <li><strong>Lexical Resource:</strong> {lexical}</li>
          <li><strong>Task Achievement:</strong> {task}</li>
        </ul>
        <div className={styles.overallScore}>Overall Score: {overall}</div>
      </div>
    );
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        {renderScore(task1Score, "Task 1")}
        {renderScore(task2Score, "Task 2")}
      </div>
    </div>
  );
};

export default ShowAllScores;
