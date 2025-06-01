import { getFirestore, doc, getDoc } from "firebase/firestore";

export async function getUserScores(userId: string) {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? userDoc.data() : null;
}