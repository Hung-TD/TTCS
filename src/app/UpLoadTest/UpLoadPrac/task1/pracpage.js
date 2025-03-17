import { useState, useEffect } from "react";
import { fetchExamQuestions, uploadImage } from "./supabaseClient";

export default function PracPage() {
    const [questions, setQuestions] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchExamQuestions().then(setQuestions);
    }, []);

    async function handleUpload() {
        if (!file) return;
        const fileUrl = await uploadImage(file, file.name);
        console.log("Uploaded:", fileUrl);
    }

    return (
        <div>
            <h1>Exam Questions</h1>
            {questions.map((q) => (
                <div key={q.id}>
                    <p>{q.question_text}</p>
                    {q.image_url && <img src={q.image_url} alt="Exam" />}
                </div>
            ))}
            
            <h2>Upload Image</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}
