"use client";

import { useEffect, useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { getStudents, Student } from "./studentList";

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      const data = await getStudents();
      setStudents(data);
      setLoading(false);
    }
    fetchStudents();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32 }}>
          <h2>📋 Registered Students</h2>

          {loading ? (
            <p>Loading...</p>
          ) : students.length === 0 ? (
            <p>No students registered yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td style={tdStyle}>{student.id}</td>
                    <td style={tdStyle}>{student.username || "—"}</td>
                    <td style={tdStyle}>{student.email || "—"}</td>
                    <td style={tdStyle}>
                      {student.registeredAt
                        ? new Date(student.registeredAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}

// Reusable styles
const thStyle = {
  borderBottom: "1px solid #ccc",
  textAlign: "left" as const,
  padding: 8,
  backgroundColor: "#f5f5f5",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: 8,
};
