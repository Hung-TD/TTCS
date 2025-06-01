"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "@/app/firebaseConfig";
import Sidebar from "../../../components/Sliderbar/Sidebar";
import Header from "../../../components/HeaderDashboard/Header";
import "./../../globals.css";

type ActivityLog = {
  action: string;
  details: string;
  timestamp: string;
};

export default function ActivityPage() {
  const [log, setLog] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      const q = query(collection(firestore, "activity_logs"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const logs: ActivityLog[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          action: data.action || "",
          details: data.details || "",
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate().toLocaleString()
            : data.timestamp || "",
        };
      });
      setLog(logs);
    }
    fetchLogs();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32 }}>
          <h2>Admin Activity Log</h2>
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
                {log.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8 }}>{item.timestamp}</td>
                    <td style={{ padding: 8 }}>{item.action}</td>
                    <td style={{ padding: 8 }}>{item.details}</td>
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