import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Image
              src="/assets/navmedha-logo.png"
              alt="Navmedha Logo"
              width={260}
              height={75}
              style={{ width: "auto", height: "60px" }}
              className={styles.footerLogoImg}
            />
            <p className={styles.footerTagline}>
              Celebrating devotion, art, and cultural memories through digital creative confluence.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/#about">About Navmedha</Link></li>
              <li><Link href="/#categories">Competition Categories</Link></li>
              <li><Link href="/#flow">Event Schedule</Link></li>
              <li><Link href="/#rules">Submission Rules</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Categories</h4>
            <ul>
              <li><Link href="/submission/reels">Reels & Motion</Link></li>
              <li><Link href="/submission/photography">Puja Photography</Link></li>
              <li><Link href="/submission/content">Creative Writing & Blogs</Link></li>
              <li><Link href="/submission/artworks">Digital & Hand Art</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Contact & Support</h4>
            <p>Email: contact@navmedha.org</p>
            <p>Instagram: @navmedha_official</p>
            <p className={`${styles.festiveBlessing} font-bengali`}>🌸 শারদীয়ার প্রীতি ও শুভেচ্ছা 🌸</p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 NAVMEDHA. All Rights Reserved. Rights reserved to Eklavya Official. Crafted with devotion for <span className={`${styles.bengaliHighlight} font-bengali`}>শারদোৎসব</span>.</p>
        </div>
      </div>
    </footer>
  );
}
