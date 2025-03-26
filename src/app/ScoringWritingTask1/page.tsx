"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScoreDisplay from "./score_display";

const API_URL = "http://127.0.0.1:8000/analyze_latest_exam"; // API lấy dữ liệu mới nhất

const Page = () => {
  const searchParams = useSearchParams();
  console.log("🔍 Full searchParams:", searchParams.toString());

  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchScore = async () => {
      try {
        console.log("📡 Fetching latest exam analysis...");
        const response = await fetch(API_URL, { method: "GET" });

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Received score data:", data);

        setScore(data.score);
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [searchParams]);

  if (loading) return <div>Loading score...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!score) return <div>No score data available.</div>;

  return (
    <div className="p-6">
      <ScoreDisplay score={score} />
    </div>
  );
};

export default Page;
