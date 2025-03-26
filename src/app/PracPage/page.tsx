"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter để điều hướng
import { createClient } from "@supabase/supabase-js"; // Import Supabase
import "./pracpage.css"; 
import "../globals.css"
import Header from "../HeaderLayout/page";

const coverImage = "/bookcover1.PNG";

// Kết nối Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PracticePage() {
  const router = useRouter(); // Khởi tạo router
  const [examList, setExamList] = useState<any[]>([]); // State lưu danh sách bài thi
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách bài thi từ Supabase
  useEffect(() => {
    const fetchExamList = async () => {
      const { data, error } = await supabase.from("task1").select("id, title");

      if (error) {
        console.error("❌ Lỗi khi lấy danh sách bài thi:", error.message);
      } else {
        setExamList(data || []);
      }
      setLoading(false);
    };

    fetchExamList();
  }, []);

  return (
    <div className="container">
      <Header />
      {/* Sidebar */}
      <div className="sidebar">
        <button className="task-button">Task 1</button>
        <button className="task-button">Task 2</button>
      </div>

      {/* Wrapper để căn giữa nội dung */}
      <div className="content-wrapper">
        <div className="card-container">
          {loading ? (
            <p>Đang tải danh sách bài thi...</p>
          ) : examList.length === 0 ? (
            <p>Không có bài thi nào!</p>
          ) : (
            examList.map((exam) => (
              <div 
                key={exam.id} 
                className="card"
                onClick={() => router.push(`/exam/${exam.id}`)} // Điều hướng tới trang bài thi
              >
                <div className="card-box">
                  <img src={coverImage} alt="Task Cover" className="cover-image" />
                </div>
                <p className="task-title">{exam.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
