"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "../../../types/activityLogger";
import Header from "../../../components/HeaderDashboard/Header";
import Sidebar from "../../../components/Sliderbar/Sidebar";
import "./../../globals.css";
import PracPage from "c:/Users/PC/my-app/src/app/UpLoadTest/UpLoadPrac/task1/pracpage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestListPage() {
  const [taskType, setTaskType] = useState<"task1" | "task2">("task1");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editTest, setEditTest] = useState<any>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    const { error } = await supabase.from(taskType).delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      setTests(tests.filter((t) => t.id !== id));
      await logActivity("Xoá test", `ID: ${id}, taskType: ${taskType}`);
    }
  };

  const handleEdit = (id: number) => {
    const test = tests.find((t) => t.id === id);
    setEditTest({ ...test, taskType });
    setModalMode("edit");
    setShowAddModal(true);
    logActivity("Sửa test", `ID: ${id}, taskType: ${taskType}`);
  };

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from(taskType)
        .select("*")
        .order("id", { ascending: false });
      if (error) {
        setTests([]);
        alert("Error fetching tests: " + error.message);
      } else {
        setTests(data || []);
      }
      setLoading(false);
    };
    fetchTests();
  }, [taskType]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32, position: "relative" }}>
          <h2 style={{ marginBottom: 24 }}>Test List</h2>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <button
              style={{
                marginRight: 20,
                padding: "8px 24px",
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(34,197,94,0.08)"
              }}
              onClick={() => {
                setModalMode("add");
                setEditTest(null);
                setShowAddModal(true);
              }}
            >
              + Add
            </button>
            <button
              style={{
                marginRight: 12,
                padding: "8px 20px",
                background: taskType === "task1" ? "#2563eb" : "#e0e7ef",
                color: taskType === "task1" ? "#fff" : "#222",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer"
              }}
              onClick={() => setTaskType("task1")}
            >
              Task 1
            </button>
            <button
              style={{
                padding: "8px 20px",
                background: taskType === "task2" ? "#2563eb" : "#e0e7ef",
                color: taskType === "task2" ? "#fff" : "#222",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer"
              }}
              onClick={() => setTaskType("task2")}
            >
              Task 2
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {tests.length === 0 ? (
                <p>No tests found.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tests.map((test) => (
                    <li
                      key={test.id}
                      style={{
                        background: "#f8fafc",
                        marginBottom: 12,
                        padding: "0 24px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(37,99,235,0.06)",
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                        overflow: "hidden",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
                        <span style={{ fontWeight: 700, color: "#2563eb", minWidth: 40 }}>#{test.id}</span>
                        <span
                          style={{
                            color: "#333",
                            fontSize: 15,
                            flex: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 250 // Limit width to 250px (adjust as needed)
                          }}
                        >
                          {test.issue || <span style={{ color: "#aaa" }}>No issue</span>}
                        </span>
                        {test.image_url && (
                          <img
                            src={test.image_url}
                            alt="Test"
                            style={{ maxHeight: 40, maxWidth: 80, borderRadius: 6, marginLeft: 12 }}
                          />
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={{
                            padding: "6px 14px",
                            background: "#38b6ff",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                          onClick={() => handleEdit(test.id)}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            padding: "6px 14px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                          onClick={() => handleDelete(test.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Modal overlay */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: 32,
              minWidth: 400,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
          >
            <button
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "transparent",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#2563eb"
              }}
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            {/* Pass correct taskType for add/edit */}
            <PracPage
              taskType={modalMode === "edit" && editTest ? editTest.taskType : taskType}
              mode={modalMode}
              editTest={editTest}
              onClose={() => setShowAddModal(false)}
              onSuccess={async () => {
                setShowAddModal(false);
                setEditTest(null);
                setModalMode("add");
                await logActivity("Thêm test", `taskType: ${taskType}, thông tin: ...`);
                // Optionally, refresh the test list here
                // fetchTests();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}