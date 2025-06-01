import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebaseConfig from "./examtextConfig";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Hàm upload file
const uploadFile = async (file) => {
  if (!file) return;

  const storageRef = ref(storage, `uploads/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at", downloadURL);
        resolve(downloadURL);
      }
    );
  });
};

export { uploadFile };
