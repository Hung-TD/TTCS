import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/app/firebaseConfig";

export async function getUserGoalsAndNotes(userId: string) {
  const userRef = doc(firestore, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      goals: data.goals || {},
      notes: data.notes || {},
    };
  }
  return { goals: {}, notes: {} };
}

export async function saveUserGoalAndNote(userId: string, date: string, goal: string, note: string) {
  const userRef = doc(firestore, "users", userId);
  const updates: any = {};
  if (goal && goal !== "no_goal") {
    updates[`goals.${date}`] = goal;
  } else {
    updates[`goals.${date}`] = null;
  }
  if (note && note.trim() !== "") {
    updates[`notes.${date}`] = note.trim();
  } else {
    updates[`notes.${date}`] = null;
  }
  await updateDoc(userRef, updates);
}