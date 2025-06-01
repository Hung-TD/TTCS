"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./account.module.css";
import Link from "next/link";
import Header from "../../../components/HeaderLayout/page";
import "../../globals.css";
import {
  UserAccount,
  getUserAccount,
  ensureUserDoc,
  updateUserProfile,
} from "@/services/accountService";

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
        await ensureUserDoc(firebaseUser);
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
    if (!editedUser) return;
    try {
      await updateUserProfile(editedUser);
      setUser(editedUser);
      setIsEditing(false);
      alert("Thông tin đã được cập nhật!");
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error);
      alert(`Cập nhật thất bại! Lỗi: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.accountContainer}>
      <div className={styles.navbar}>
        <Link href="./ScorePage" className={styles.navItem}>Score</Link>
        <Link href="./CalendarPage" className={styles.navItem}>Calendar</Link>
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
    </div>
    
  );
}
