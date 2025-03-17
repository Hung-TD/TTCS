import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ssnekclgnzucfkrfyeso.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmVrY2xnbnp1Y2ZrcmZ5ZXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTEwOTQsImV4cCI6MjA1NzU4NzA5NH0.SGH0v1pb7BdyZo4QjDu5AQDO38GcxokH27p9WqFRsTY";

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials are missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchExamQuestions() {
    const { data, error } = await supabase
        .from("exam_questions") // Đảm bảo tên bảng đúng
        .select("*");

    if (error) {
        console.error("Error fetching questions:", error.message || error);
        return [];
    }

    console.log("Fetched questions:", data);
    return data;
}

export async function uploadImage(file, fileName) {
    const filePath = `task1/${fileName}`; // Lưu vào thư mục task1
    const { data, error } = await supabase.storage
        .from("exam-images")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true, // Cho phép ghi đè file cũ cùng tên
        });

    // Lấy public URL của file trong task1
    const publicUrl = supabase.storage.from("exam-images").getPublicUrl(filePath);
    console.log("Image URL:", publicUrl);
    return publicUrl;
}
