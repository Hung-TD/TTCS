import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fetch Task 1
export async function fetchExamQuestions() {
  const { data, error } = await supabase
    .from("task1")
    .select("*");
  if (error) throw error;
  return data;
}

// Fetch Task 2
export async function fetchExamQuestionsTask2() {
  const { data, error } = await supabase
    .from("task2")
    .select("*");
  if (error) throw error;
  return data;
}

export async function uploadImage(file, fileName) {
    const filePath = `task1/${fileName}`;
    const { data, error } = await supabase.storage
        .from("exam-images")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
        });

    const publicUrl = supabase.storage.from("exam-images").getPublicUrl(filePath);
    console.log("Image URL:", publicUrl);
    return publicUrl;
}

// Insert Task 1
export async function insertTask1Question({ image_url, issue, description_title }) {
  const { data, error } = await supabase
    .from("task1")
    .insert([
      {
        title: "IELTS Task 1",
        description: "You should spend about 20 minutes on this task.",
        rules: "You should write at least 150 words.",
        image_url,
        issue,
        description_title
      }
    ]);
  if (error) throw error;
  return data;
}

// Insert Task 2
export async function insertTask2Question({ title, issue, description_title }) {
    // Chỉ truyền đúng các trường có trong bảng task2
    return await supabase.from("task2").insert([
        { title, issue, description_title }
    ]);
}

// Update Task 1
export async function updateTask1Fields(id, fields) {
  const { data, error } = await supabase
    .from("task1")
    .update(fields)
    .eq("id", id);
  if (error) throw error;
  return data;
}

// Update Task 2
export async function updateTask2Fields(id, fields) {
  const { data, error } = await supabase
    .from("task2")
    .update(fields)
    .eq("id", id);
  if (error) throw error;
  return data;
}

