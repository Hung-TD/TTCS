// Simple activity logger for admin actions

import { firestore } from "@/app/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

type Activity = {
  timestamp: string;
  action: string;
  details?: string;
};

const activityLog: Activity[] = [];

export async function logActivity(action: string, details?: string) {
  try {
    await addDoc(collection(firestore, "activity_logs"), {
      action,
      details: details || "",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Lỗi ghi log hoạt động:", error);
  }
}

export function getActivityLog() {
  return activityLog;
}