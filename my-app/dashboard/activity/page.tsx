"use client";
import { useEffect, useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { getActivityLog, logActivity } from "./activityLogger";

export default function ActivityPage() {
  const [log, setLog] = useState<{ timestamp: string; action: string; details?: string }[]>([]);
  const [action, setAction] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    setLog(getActivityLog());
  }, []);

  // Add activity handler
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;
    logActivity(action, details);
    setLog(getActivityLog());
    setAction("");
    setDetails("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32 }}>
          <h2>Admin Activity Log</h2>
          {/* Add Activity Form */}
          <form onSubmit={handleAddActivity} style={{ marginBottom: 32, display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Action"
              value={action}
              onChange={e => setAction(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 120 }}
              required
            />
            <input
              type="text"
              placeholder="Details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 200 }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 20px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Add Activity
            </button>
          </form>
          {/* Activity Table */}
          {log.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Time</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Action</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 8 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry, idx) => (
                  <tr key={idx}>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{entry.timestamp}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{entry.action}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{entry.details || "-"}</td>
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