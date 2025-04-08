"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore"; // Cập nhật Firestore
import styles from "./account.module.css";
import Link from "next/link";
import Header from "../../HeaderLayout/page";

// Khai báo kiểu dữ liệu UserAccount
export interface UserAccount {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  phoneNumber?: string;
}

// Firestore instance
const db = getFirestore();

// Hàm lấy thông tin từ Firebase Auth
const getUserAccount = (user: any): UserAccount | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "Anonymous",
    photoURL: user.photoURL || "/avatar.jpg",
    createdAt: user.metadata?.creationTime || "Unknown",
    phoneNumber: user.phoneNumber || "Not provided", // Số điện thoại nếu có
  };
};

export default function Account() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserAccount | null>(null);

  // Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const account = getUserAccount(firebaseUser);
        setUser(account);
        setEditedUser(account);

        // Kiểm tra xem tài liệu người dùng đã tồn tại trong Firestore hay chưa
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          // Nếu chưa tồn tại, tạo tài liệu người dùng trong Firestore
          await setDoc(userRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Anonymous",
            photoURL: firebaseUser.photoURL || "/avatar.jpg",
            createdAt: firebaseUser.metadata.creationTime,
            phoneNumber: firebaseUser.phoneNumber || "Not provided",
          });
        }
      } else {
        setUser(null);
        setEditedUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Xử lý bật/tắt chế độ chỉnh sửa
  const handleEditToggle = () => setIsEditing(!isEditing);

  // Xử lý thay đổi dữ liệu trong form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedUser({
      ...editedUser!,
      [e.target.name]: e.target.value,
    });
  };

  // Xử lý lưu thông tin vào Firebase
  const handleSave = async () => {
    if (!auth.currentUser || !editedUser) return;

    try {
      // Cập nhật Display Name & Ảnh đại diện
      await updateProfile(auth.currentUser, {
        displayName: editedUser.displayName,
        photoURL: editedUser.photoURL,
      });

      // Cập nhật Email (yêu cầu xác thực lại nếu đã lâu chưa đăng nhập)
      if (editedUser.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, editedUser.email);
      }

      // Cập nhật số điện thoại vào Firestore (nếu bạn có sử dụng Firestore)
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        phoneNumber: editedUser.phoneNumber,
      });

      // Cập nhật vào state sau khi lưu thành công
      setUser(editedUser);
      setIsEditing(false);
      alert("Thông tin đã được cập nhật!");
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error);
      alert(`Cập nhật thất bại! Lỗi: ${error.message}`);
    }
  };

  return (
    <div className={styles.accountContainer}>
      <Header />
      <div className={styles.navbar}>
        <Link href="#" className={styles.navItem}>Score</Link>
        <Link href="#" className={styles.navItem}>Calendar</Link>
      </div>
      <div className={styles.profileSection}>
        <img src={user?.photoURL} alt="User Avatar" className={styles.avatar} />
        <div className={styles.userInfo}>
          {isEditing ? (
            <>
              <input
                type="text"
                name="displayName"
                value={editedUser?.displayName || ""}
                onChange={handleChange}
                className={styles.inputField}
              />
              <input
                type="email"
                name="email"
                value={editedUser?.email || ""}
                onChange={handleChange}
                className={styles.inputField}
              />
              <input
                type="tel"
                name="phoneNumber"
                value={editedUser?.phoneNumber || ""}
                onChange={handleChange}
                className={styles.inputField}
              />
            </>
          ) : (
            <>
              <h2 className={styles.userName}>{user?.displayName}</h2>
              <p className={styles.userDetail}>Email: {user?.email}</p>
              <p className={styles.userDetail}>Phone: {user?.phoneNumber}</p>
              <p className={styles.userDetail}>Account Created: {user?.createdAt}</p>
            </>
          )}
        </div>
      </div>
      <div className={styles.buttons}>
        {isEditing ? (
          <button className={styles.saveBtn} onClick={handleSave}>Save</button>
        ) : (
          <button className={styles.changeInfoBtn} onClick={handleEditToggle}>Change info</button>
        )}
      </div>
    </div>
  );
}
