"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import "./pracpage.css"; 
import "../globals.css"
import Footer from "../../components/Footer/footer";
import Header from "../../components/HeaderLayout/page";
import { fetchTask2ExamList } from "@/services/examService";

const coverImage = "/bookcover1.PNG";

// Kết nối Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Số bài trên mỗi trang
const ITEMS_PER_PAGE = 8;

export default function PracticePage() {
  const router = useRouter();
  const [examList, setExamList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại

  // Gọi API lấy danh sách bài thi từ Supabase
  useEffect(() => {
    const fetchExamList = async () => {
      try {
        const data = await fetchTask2ExamList();
        setExamList(data);
      } catch (error: any) {
        console.error("❌ Lỗi khi lấy danh sách bài thi:", error.message);
      }
      setLoading(false);
    };

    fetchExamList();
  }, []);

  // Tính tổng số trang
  const totalPages = Math.ceil(examList.length / ITEMS_PER_PAGE);

  // Lọc bài theo trang
  const currentItems = examList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };  

  return (
    <div className="container">
      <Header />
      <div className="container_mainpage">
        {/* Sidebar */}
        <div className="sidebar">
          <button className="task-button">Task 1</button>
          <button className="task-button">Task 2</button>
        </div>
    
        {/* Wrapper để căn giữa nội dung */}
        <div className="content-wrapper">
          {/* Danh sách đề thi */}
          {/* Danh sách đề thi - chỉ hiển thị 8 bài theo trang */}
          <div className="card-container">
            {loading ? (
              <p>Đang tải danh sách bài thi...</p>
            ) : currentItems.length === 0 ? (
              <p>Không có bài thi nào!</p>
            ) : (
              currentItems.map((exam) => ( // Chỉ hiển thị các bài trong trang hiện tại
                <div 
                  key={exam.id} 
                  className="card"
                  onClick={() => router.push(`/exam/${exam.id}`)}
                >
                  <div className="card-box">
                    <img src={coverImage} alt="Task Cover" className="cover-image" />
                  </div>
                  <p className="task-title">{exam.title}</p>
                  <p className="task-subtitle">Test {exam.id}</p> {/* Thêm ID từ Supabase */}
                </div>
              ))
            )}
          </div>

    
          {/* Nút chuyển trang - Đặt ngay dưới danh sách đề thi */}
          <div className="pagination">
            <button 
              className="pagination-button" 
              onClick={prevPage} 
              disabled={currentPage === 1}
            >
              ◀
            </button>
            
            <span className="pagination-info">
              Page {currentPage} / {totalPages}
            </span>
            
            <button 
              className="pagination-button" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
  
}
