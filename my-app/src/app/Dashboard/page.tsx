"use client";
import Header from "../../components/HeaderDashboard/Header";
import Sidebar from "../../components/Sliderbar/Sidebar";
import "./../globals.css";
import { useEffect } from "react";
import { logActivity } from "../../types/activityLogger";

export default function DashboardPage() {
  useEffect(() => {
    logActivity("Access Dashboard");
  }, []);
  return (
    <div style={{  display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32 }}>
          <h2>Welcome to the Dashboard!</h2>
          <p>Select an option from the sidebar.</p>
        </main>
      </div>
    </div>
  );
}