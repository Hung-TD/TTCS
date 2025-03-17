import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
