"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./globals.module.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode, useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/Login");
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Ẩn header ở trang SignUp & Login */}
        {isClient && !loading && pathname !== "/SignUp" && pathname !== "/Login" && (
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
                <Link href="/tips" className={styles.navLink}>Tip</Link>
                <Link href="/practice" className={styles.navLink}>Practice</Link>
                <Link href="/exam" className={styles.navLink}>Exam</Link>
              </div>
              {user ? (
                <div className={styles.userMenu}>
                  <Image 
                    src="/avatar-placeholder.png"
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className={styles.avatar}
                  />
                  <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                </div>
              ) : (
                <Link className={styles.containerButton} href="/SignUp">
                  <button className={styles.btn}>Sign Up</button>
                </Link>
              )}
            </nav>
          </header>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}
