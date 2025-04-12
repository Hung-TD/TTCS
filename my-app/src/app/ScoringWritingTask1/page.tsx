"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScoreDisplay from "./score_display";
import { doc, getFirestore, updateDoc, setDoc, getDoc, arrayUnion } from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database"; // Import các hàm Firebase Realtime Database
import { auth } from "../firebaseConfig"; // Giả sử bạn có firebase auth setup

const API_URL = "http://127.0.0.1:8000/analyze_latest_exam";

interface Entry {
  content: string;
}

const Page = () => {
  const searchParams = useSearchParams();
  const [score, setScore] = useState<any>(null);
  const [studentResponse, setStudentResponse] = useState<string>(""); // Đảm bảo là chuỗi rỗng thay vì null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchScoreAndResponse = async () => {
      try {
        // Lấy điểm từ API
        const response = await fetch(API_URL, { method: "GET" });
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        const fetchedScore = data.score;
        setScore(fetchedScore);

        // 🔐 Lấy ID người dùng hiện tại
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
          grammaticalRangeAccuracy: fetchedScore["Grammatical Range & Accuracy"] ?? 0,
          coherenceCohesion: fetchedScore["Coherence & Cohesion"] ?? 0,
          lexicalResource: fetchedScore["Lexical Resource"] ?? 0,
          taskAchievement: fetchedScore["Task Achievement"] ?? 0,
          overallScore: parseFloat(overallScore),
          timestamp: timestamp.toISOString(),
        };

        // 🔥 Lưu vào Firestore
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            allTimeScores: [newEntry],
            last30DaysScores: [newEntry],
            lastScore: newEntry,
          }, { merge: true });
        } else {
          await updateDoc(userRef, {
            allTimeScores: arrayUnion(newEntry),
            last30DaysScores: arrayUnion(newEntry),
            lastScore: newEntry,
          });
        }

        // Lấy bài làm từ Firebase Realtime Database
        const dbRealtime = getDatabase();
        const dbRef = ref(dbRealtime, "exam_writing_task1");
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const allEntries = snapshot.val();

          // Chuyển về mảng và sắp xếp theo timestamp giảm dần
          const entriesArray = Object.values(allEntries) as Entry[];
          const latestEntry = entriesArray
            .filter((entry: any) => entry.timestamp && entry.content) // lọc entry hợp lệ
            .sort(
              (a: any, b: any) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0]; // lấy entry mới nhất

          const studentAnswer = latestEntry?.content || "Không có nội dung.";
          setStudentResponse(studentAnswer);
        } else {
          setStudentResponse("Không tìm thấy bài làm.");
        }
        
      } catch (error) {
        console.error("❌ Lỗi:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchScoreAndResponse();
  }, [searchParams]);

  if (loading) return <div>Loading score...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!score) return <div>No score data available.</div>;

  return (
    <div className="p-6">
      <ScoreDisplay score={score} studentResponse={studentResponse} />
    </div>
  );
};

export default Page;
