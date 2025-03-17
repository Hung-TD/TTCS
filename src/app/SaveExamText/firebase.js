import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import firebaseConfig from "../../../examtextConfig"; // Import cấu hình Firebase từ examtextConfig.js

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
const db = getDatabase(app);
  
// Hàm lưu dữ liệu vào Firebase
const saveText = (text) => {
  return set(ref(db, "texts/myText"), {
    content: text,
    timestamp: Date.now(),
  });
};

// Export tất cả trong một lần duy nhất
export { db, ref, set, onValue, saveText };
