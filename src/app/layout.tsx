import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Header */}
        <header className="custom-header">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={50} 
              height={50} 
              className="custom-logo cursor-pointer"
            />
          </Link>
          <h1 className="heading">IELTS Writing Web</h1>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
