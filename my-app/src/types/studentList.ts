import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../app/firebaseConfig";

export type Student = {
  id?: string;
  username: string;
  email: string;
  registeredAt: string;
};

const studentCollection = collection(firestore, "students");

export async function getStudents(): Promise<Student[]> {
  try {
    const snapshot = await getDocs(studentCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, "id">),
    }));
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
}

export async function updateStudent(id: string, data: Partial<Omit<Student, "id">>): Promise<boolean> {
  try {
    const studentDoc = doc(firestore, "students", id);
    await updateDoc(studentDoc, data);
    return true;
  } catch (error) {
    console.error(`Failed to update student (${id}):`, error);
    return false;
  }
}

export async function deleteStudent(id: string): Promise<boolean> {
  try {
    const studentDoc = doc(firestore, "students", id);
    await deleteDoc(studentDoc);
    return true;
  } catch (error) {
    console.error(`Failed to delete student (${id}):`, error);
    return false;
  }
}
