"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Kết nối Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadExam() {
  const router = useRouter();
  const [issue, setIssue] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Xử lý khi chọn ảnh
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    }
  };

  // Xử lý tải ảnh lên Supabase Storage và lấy URL
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `task1/${fileName}`;

    // 🛠 **Sửa lỗi bucket "images" thành "exam-images"**
    const { error } = await supabase.storage.from("exam-images").upload(filePath, imageFile);

    if (error) {
      console.error("Lỗi khi tải ảnh:", error.message);
      return null;
    }

    // 🛠 **Sửa lỗi lấy public URL**
    const { data } = supabase.storage.from("exam-images").getPublicUrl(filePath);
    return data.publicUrl; // Lấy đúng URL
  };

  // Xử lý đăng bài
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const imageUrl = await uploadImage(); // Upload ảnh trước
  
    if (!imageUrl) {
      alert("❌ Lỗi khi tải ảnh!");
      setLoading(false);
      return;
    }
  
    // Giá trị cố định cho title và description
    const fixedTitle = "IELTS Task 1";

    const fixedDescription = "You should spend about 20 minutes on this task.";
    
    const rules = "You should write at least 150 words.";
    // Thêm dữ liệu vào database
    const { data, error } = await supabase
      .from("task1")
      .insert([{ 
        title: fixedTitle, 
        description: fixedDescription, 
        image_url: imageUrl,
        issue: issue,
        rules:rules
      }]);
  
    setLoading(false);
  
    if (error) {
      alert("❌ Lỗi khi đăng bài: " + error.message);
    } else {
      alert("✅ Đăng bài thành công!");
      router.push("/exam");
    }
  };
  

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">📌 Đăng bài Task 1</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <input 
          type="text" 
          placeholder="Nhập issue..." 
          value={issue} 
          onChange={(e) => setIssue(e.target.value)} 
        />
        <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 rounded" required />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Đang đăng..." : "Đăng bài"}
        </button>
      </form>
    </div>
  );
}
