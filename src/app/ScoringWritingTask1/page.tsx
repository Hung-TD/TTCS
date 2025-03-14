"use client";

import React, { useEffect, useState } from "react";
import ScoreDisplay from "./score_display";

const Page = () => {
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/grade_text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "your text here" }), // Truyền nội dung cần chấm điểm
    })
      .then((response) => response.json())
      .then((data) => {
        setScore(data); // Cập nhật state với dữ liệu nhận được
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading score...</div>;
  }

  if (!score) {
    return <div>Failed to fetch score.</div>;
  }

  return <ScoreDisplay score={score.score} />; // Chỉ truyền phần score vào component
};

export default Page;
