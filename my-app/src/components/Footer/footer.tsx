import styles from "./footer.module.css";
import Image from "next/image";
import logo from "/public/logo.png"; // Đường dẫn logo
import "../../app/globals.css"; // Đảm bảo có các style chung

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Logo & Description */}
        <div className={styles.brand}>
          <Image src={logo} alt="Logo" className={styles.logo} />
          <p className={styles.name}>Trịnh Đăng Hùng</p>
          <p className={styles.des}>Nhà phát triển Web & AI Enthusiast</p>
        </div>

        {/* Company Section */}
        <div className={styles.section}>
          <h3>Company</h3>
          <ul>
            <li><a href="/about">About Me</a></li>
            <li><a href="/projects">Projects</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Technologies */}
        <div className={styles.section}>
          <h3>Technologies</h3>
          <ul>
            <li>React & Next.js</li>
            <li>Machine Learning</li>
            <li>Computer Vision</li>
            <li>Blockchain & Web3</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className={styles.section}>
          <h3>Get in Touch</h3>
          <ul>
            <li><a href="mailto:hung@example.com">Email: hung@example.com</a></li>
            <li><a href="https://github.com/hung-example" target="_blank">GitHub</a></li>
            <li><a href="https://twitter.com/hung-example" target="_blank">Twitter (X)</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Trịnh Đăng Hùng - All Rights Reserved</p>
      </div>
    </footer>
  );
}
