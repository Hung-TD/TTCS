import { collection, addDoc, getDocs } from "firebase/firestore";
import { firestore } from "../../firebaseConfig"; // Đường dẫn phù hợp với vị trí file của bạn

export type Student = {
  id?: string;
  username: string;
  email: string;
  registeredAt: string;
};

const studentCollection = collection(firestore, "students");

export async function addStudent(username: string, email: string) {
  const newStudent: Omit<Student, "id"> = {
    username,
    email,
    registeredAt: new Date().toISOString(),
  };
  const docRef = await addDoc(studentCollection, newStudent);
  return { id: docRef.id, ...newStudent };
}

export async function getStudents(): Promise<Student[]> {
  const snapshot = await getDocs(studentCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Student, "id">),
  }));
}
