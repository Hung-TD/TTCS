// Simple activity logger for admin actions

type Activity = {
  timestamp: string;
  action: string;
  details?: string;
};

const activityLog: Activity[] = [];

export function logActivity(action: string, details?: string) {
  const entry: Activity = {
    timestamp: new Date().toISOString(),
    action,
    details,
  };
  activityLog.push(entry);
  // For now, just log to console. Replace with API call or storage as needed.
  console.log("Admin Activity:", entry);
}

export function getActivityLog() {
  return activityLog;
}