import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "@/app/firebaseConfig";

type TaskType = "task1" | "task2";

interface BaseExamPayload {
  exam_id: number;
  title: string;
  description: string;
  description_title: string;
  issue: string;
  rules: string;
  updated_at: string;
}

interface Task1ExamPayload extends BaseExamPayload {
  image_url: string;
}

type ExamPayload = BaseExamPayload & {
  image_url?: string;
}

export async function saveExamToFirestore(examData: any, taskType: TaskType) {
  const firestore = getFirestore(app);
  const collectionName = `${taskType}_exams`;
  const examRef = doc(firestore, collectionName, examData.id.toString());
  const examDoc = await getDoc(examRef);

  const examPayload: ExamPayload = {
    exam_id: examData.id,
    title: examData.title,
    description: examData.description,
    description_title: examData.description_title,
    issue: examData.issue || "",
    rules: examData.rules || "",
    updated_at: new Date().toISOString()
  };

  if (taskType === "task1" && examData.image_url) {
    examPayload.image_url = examData.image_url;
  }

  if (!examDoc.exists()) {
    await setDoc(examRef, {
      ...examPayload,
      created_at: new Date().toISOString(),
      status: "active",
      type: taskType
    } as any); // Type assertion for setDoc
  } else {
    await updateDoc(examRef, examPayload as { [key: string]: any }); // Type assertion for updateDoc
  }
}