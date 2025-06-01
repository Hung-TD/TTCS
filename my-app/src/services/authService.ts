import { auth, firestore } from "@/app/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function signUpWithEmail(username: string, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(firestore, "students", user.uid), {
    email: user.email,
    username: username,
    registeredAt: new Date().toISOString(),
  });
  return user;
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}