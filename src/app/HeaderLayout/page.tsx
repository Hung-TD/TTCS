"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../globals.module.css";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

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
      <Link href="/" className={styles.logoContainer}>
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
          <Link href="/TipPage" className={styles.navLink}>Tip</Link>
          <Link href="/PracPage" className={styles.navLink}>Practice</Link>
          <Link href="/exam" className={styles.navLink}>Exam</Link>
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
                <Link href="/account" className={styles.dropdownItem}>Account</Link>
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
    </header>
  );
}
