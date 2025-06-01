import { auth } from "@/app/firebaseConfig";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, getFirestore } from "firebase/firestore";

export interface UserAccount {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  phoneNumber?: string;
}

const db = getFirestore();

export function getUserAccount(user: any): UserAccount | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "Anonymous",
    photoURL: user.photoURL || "/avatar.jpg",
    createdAt: user.metadata?.creationTime || "Unknown",
    phoneNumber: user.phoneNumber || "Not provided",
  };
}

export async function ensureUserDoc(firebaseUser: any) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || "Anonymous",
      photoURL: firebaseUser.photoURL || "/avatar.jpg",
      createdAt: firebaseUser.metadata.creationTime,
      phoneNumber: firebaseUser.phoneNumber || "Not provided",
    });
  }
}

export async function updateUserProfile(editedUser: UserAccount) {
  if (!auth.currentUser) return;
  await updateProfile(auth.currentUser, {
    displayName: editedUser.displayName,
    photoURL: editedUser.photoURL,
  });
  if (editedUser.email !== auth.currentUser.email) {
    await updateEmail(auth.currentUser, editedUser.email);
  }
  const userRef = doc(db, "users", auth.currentUser.uid);
  await updateDoc(userRef, {
    phoneNumber: editedUser.phoneNumber,
  });
}