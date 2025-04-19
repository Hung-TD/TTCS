"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  doc,
  getFirestore,
  updateDoc,
  setDoc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../firebaseConfig";

interface Entry {
  content: string;
  timestamp: string;
}

const Page = () => {
  const searchParams = useSearchParams();
  const taskParam = searchParams.get("task");
  const [ScoreDisplay, setScoreDisplay] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [studentResponse, setStudentResponse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const taskType = taskParam === "2" ? "2" : "1";

  const API_URL =
    taskType === "2"
      ? "http://127.0.0.1:8000/analyze_latest_task2"
      : "http://127.0.0.1:8000/analyze_latest_exam";

  const dbPath =
    taskType === "2" ? "exam_writing_task2" : "exam_writing_task1";

  useEffect(() => {
    const loadComponent = async () => {
      const component =
        taskType === "2"
          ? await import("./Task2/score_display")
          : await import("./Task1/score_display");

      setScoreDisplay(() => component.default);
    };

    loadComponent();
  }, [taskType]);

  useEffect(() => {
    const fetchScoreAndResponse = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok)
          throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        const fetchedScore = data.score;
        setScore(fetchedScore);

        const user = auth.currentUser;
        if (!user) throw new Error("Chưa đăng nhập");

        const userId = user.uid;
        const db = getFirestore();
        const userRef = doc(db, "users", userId);
        const timestamp = new Date();
        const overallScore = (
          (fetchedScore["Grammatical Range & Accuracy"] +
            fetchedScore["Coherence & Cohesion"] +
            fetchedScore["Lexical Resource"] +
            fetchedScore["Task Achievement"]) / 4
        ).toFixed(1);

        const newEntry = {
          grammaticalRangeAccuracy:
            fetchedScore["Grammatical Range & Accuracy"] ?? 0,
          coherenceCohesion: fetchedScore["Coherence & Cohesion"] ?? 0,
          lexicalResource: fetchedScore["Lexical Resource"] ?? 0,
          taskAchievement: fetchedScore["Task Achievement"] ?? 0,
          overallScore: parseFloat(overallScore),
          timestamp: timestamp.toISOString(),
          task: taskType,
        };

        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(
            userRef,
            {
              allTimeScores: [newEntry],
              last30DaysScores: [newEntry],
              lastScore: newEntry,
            },
            { merge: true }
          );
        } else {
          await updateDoc(userRef, {
            allTimeScores: arrayUnion(newEntry),
            last30DaysScores: arrayUnion(newEntry),
            lastScore: newEntry,
          });
        }

        const dbRealtime = getDatabase();
        const dbRef = ref(dbRealtime, dbPath);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const allEntries = snapshot.val();
          const entriesArray = Object.values(allEntries) as Entry[];
          const latestEntry = entriesArray
            .filter((entry: any) => entry.timestamp && entry.content)
            .sort(
              (a: any, b: any) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )[0];

          const studentAnswer = latestEntry?.content || "Không có nội dung.";
          setStudentResponse(studentAnswer);
        } else {
          setStudentResponse("Không tìm thấy bài làm.");
        }
      } catch (error) {
        console.error("❌ Lỗi:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScoreAndResponse();
  }, [taskType, API_URL, dbPath]);

  if (loading) return <div>Đang chấm điểm...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!score || !ScoreDisplay)
    return <div>Không tìm thấy dữ liệu điểm hoặc component.</div>;

  return (
    <div className="p-6">
      <ScoreDisplay score={score} studentResponse={studentResponse} />
    </div>
  );
};

export default Page;
