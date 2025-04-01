import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Auth
import { getDatabase } from "firebase/database"; // Nếu dùng Realtime Database
import { getFirestore } from "firebase/firestore"; // Nếu dùng Firestore
import { getStorage } from "firebase/storage";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA5-MjdeShpChqTjo3UDpT-0CgLOA5WzKE",
  authDomain: "examstore-e30ac.firebaseapp.com",
  projectId: "examstore-e30ac",
  storageBucket: "examstore-e30ac.appspot.com",
  messagingSenderId: "70581115404",
  appId: "1:70581115404:web:082971e0dc35d12a2cac29",
  measurementId: "G-E8W65NZ24N",
  databaseURL: "https://examstore-e30ac-default-rtdb.firebaseio.com/",
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Auth
const auth = getAuth(app); // <-- Đảm bảo đã có dòng này

// Khởi tạo Database (nếu cần)
const db = getDatabase(app); 
const firestore = getFirestore(app);
const storage = getStorage(app);

// Export để sử dụng trong các file khác
export { app, auth, db, firestore, storage };
