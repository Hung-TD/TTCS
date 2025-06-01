"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/HeaderDashboard/Header";
import Sidebar from "../../../components/Sliderbar/Sidebar";
import { getStudents, Student, updateStudent, deleteStudent } from "../../../types/studentList";

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const data = await getStudents();
    setStudents(data);
    setLoading(false);
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id!);
    setEditUsername(student.username);
    setEditEmail(student.email);
  };

  const handleUpdate = async () => {
    if (editingId) {
      await updateStudent(editingId, {
        username: editUsername,
        email: editEmail,
      });
      setEditingId(null);
      fetchStudents();
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this student?");
    if (confirm) {
      await deleteStudent(id);
      fetchStudents();
    }
  };

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
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Registered At</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td style={tdStyle}>
                      {editingId === student.id ? (
                        <input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                        />
                      ) : (
                        student.username
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingId === student.id ? (
                        <input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      ) : (
                        student.email
                      )}
                    </td>
                    <td style={tdStyle}>
                      {student.registeredAt
                        ? new Date(student.registeredAt).toLocaleString()
                        : "—"}
                    </td>
                    <td style={tdStyle}>
                      {editingId === student.id ? (
                        <>
                          <button onClick={handleUpdate}>💾 Save</button>
                          <button onClick={() => setEditingId(null)}>❌ Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(student)}>✏️ Edit</button>
                          <button onClick={() => handleDelete(student.id!)}>🗑️ Delete</button>
                        </>
                      )}
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
