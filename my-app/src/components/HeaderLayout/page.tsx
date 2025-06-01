"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../../app/globals.module.css";
import { useEffect, useState } from "react";
import { auth } from "../../app/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/Login");
  };

  return (
    <header className={styles.header}>
      <Link href="/HomePage" className={styles.logoContainer}>
        <Image
          src="/logo.png"
          alt="Logo"
          width={50}
          height={50}
          className={styles.logo}
        />
      </Link>
      <nav className={styles.navbar}>
        <div className={styles.navLinks}>
          <Link href="/TipPage/MainTip" className={styles.navLink}>Tip</Link>
          <Link href="/PracPage/task1" className={styles.navLink}>Practice</Link>
          <div
            onClick={() => setShowExamModal(true)}
            className={styles.navLink}
            style={{ cursor: "pointer" }}
          >
            Exam
          </div>
        </div>
        {user ? (
          <div
            className={styles.userMenu}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <Image
              src="/avatar.jpg"
              alt="User Avatar"
              width={40}
              height={40}
              className={styles.avatar}
            />
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <Link href="/Account/AccountPage" className={styles.dropdownItem}>Account</Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link className={styles.containerButton} href="/SignUp">
            Sign Up
          </Link>
        )}
      </nav>

      {/* Modal xác nhận bắt đầu Exam */}
      {showExamModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Ready for the Mock Test?</h2>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>You will have 60 minutes to complete the test.</li>
              <li>Make sure you are in a quiet environment.</li>
              <li>Once started, you cannot pause the test.</li>
              <li>Your answers will be saved automatically.</li>
            </ul>
            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={() => {
                  setShowExamModal(false);
                  router.push("/MockTestPage/task1");
                }}
              >
                Start Test
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowExamModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
