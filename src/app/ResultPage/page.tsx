"use client";

import HeaderResult from "@/app/HeaderResult/header_result";
import "./resultpage.css";
import "../globals.css"

export default function ResultPage() {
    return (
      <>
        <HeaderResult />
        <hr className="divider" />  {/* Divider ngang */}
        <main className="result-body">
          <textarea className="result-textarea" placeholder="Nhập nội dung..." />
          <input className="result-input" type="text" placeholder="Nhập tiêu đề..." />
        </main>
      </>
    );
  }