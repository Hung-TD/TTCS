"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScoreDisplay from "./score_display";

const Page = () => {
  const searchParams = useSearchParams();
  console.log("🔍 Full searchParams:", searchParams.toString());

  // 🛠 Lấy đúng tham số ảnh & giải mã URL
  const encodedImageUrl = searchParams.get("image");
  const imageUrl = encodedImageUrl ? decodeURIComponent(encodedImageUrl) : null;
  console.log("📸 Decoded imageUrl:", imageUrl);

  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchScore = async () => {
      if (!imageUrl) {
        console.error("❌ Không có ảnh để chấm điểm.");
        setError("Không có ảnh để chấm điểm.");
        setLoading(false);
        return;
      }

      try {
        console.log("📥 Fetching image from:", imageUrl);
        const formData = new FormData();
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        formData.append("file", blob, "writing.png");

        console.log("📤 Sending to API...");
        const apiResponse = await fetch("http://127.0.0.1:8000/grade_image", {
          method: "POST",
          body: formData,
        });

        if (!apiResponse.ok) {
          throw new Error(`HTTP Error! Status: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        console.log("✅ Received score data:", data);
        setScore(data);
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [imageUrl]);

  if (loading) return <div>Loading score...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!score) return <div>No score data available.</div>;

  return (
    <div className="p-6">
      {imageUrl && <img src={imageUrl} alt="Submitted Writing" className="w-64 h-auto border rounded-lg mb-4" />}
      <ScoreDisplay score={score} />
    </div>
  );
};

export default Page;
