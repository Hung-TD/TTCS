import { useRef, useState } from "react";
import styles from "./page.module.css"

export default function AutoExpandTextarea() {
  const [text, setText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.container}>
      <textarea
        ref={textAreaRef}
        className={styles.inputText}
        placeholder="Nhập bài viết của bạn..."
        value={text}
        onChange={handleInput}
        rows={3}
      />
      <div className={styles.wordCount}>{wordCount} từ</div>
    </div>
  );
}
