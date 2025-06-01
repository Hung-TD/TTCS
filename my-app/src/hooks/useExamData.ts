import { useState, useEffect } from 'react';
import { fetchTask1ExamById, fetchTask2ExamById } from "@/services/examService";
import { saveExamToFirestore } from "@/services/examFirestoreService";

type TaskType = "task1" | "task2";

interface ExamData {
  id: number;
  title: string;
  description: string;
  issue: string;
  rules?: string;
  image_url?: string;
}

export function useExamData(id: string | number, taskType: TaskType = "task1") {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchExamData = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (taskType === "task1") {
          data = await fetchTask1ExamById(Number(id));
          setImageUrl(data?.image_url || null);
        } else {
          data = await fetchTask2ExamById(Number(id));
        }
        setExamData(data);
        await saveExamToFirestore(data, taskType);
      } catch (error: any) {
        console.error("Lỗi khi lấy đề thi:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [id, taskType]);

  return { examData, loading, imageUrl, error };
}