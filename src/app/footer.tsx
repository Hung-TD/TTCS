import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function Footer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        {children}

        {/* Footer */}
        <footer className="footer">
          <div className="footer_detail">
            {/* Left side: Name & Description */}
            <div className="flex flex-col text-left">
              <p className="text_name">Trịnh Đăng Hùng</p>
              <p className="text_des">Nhà phát triển Web & AI Enthusiast</p>
            </div>

            {/* Right side: Links */}
            <div className="text_link">
              <a
                href="https://github.com/hung-example"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/hung-example"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Twitter (X)
              </a>
              <a
                href="mailto:hung@example.com"
                className="hover:underline"
              >
                Email
              </a>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <p className="text_date">© {new Date().getFullYear()} - All Rights Reserved</p>
        </footer>
      </body>
    </html>
  );
}
