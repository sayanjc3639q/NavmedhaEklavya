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
            <h4>Helpline & Support</h4>
            <div className={styles.supportSection}>
              <span className={styles.supportLabel}>Technical Support</span>
              <div className={styles.helplineList}>
                <a href="tel:+917363932735" className={styles.helplineLink}>
                  <span>Sayan:</span> +91 73639 32735
                </a>
                <a href="tel:+918420478357" className={styles.helplineLink}>
                  <span>Priyanshu:</span> +91 84204 78357
                </a>
              </div>
            </div>

            <div className={styles.supportSection}>
              <span className={styles.supportLabel}>Non-Technical Support</span>
              <div className={styles.helplineList}>
                <a href="tel:+917439391640" className={styles.helplineLink}>
                  <span>Kousani:</span> +91 74393 91640
                </a>
                <a href="tel:+919733140677" className={styles.helplineLink}>
                  <span>Sampriti:</span> +91 97331 40677
                </a>
              </div>
            </div>

            <div className={styles.socialInfo}>
              <p>
                Instagram:{" "}
                <a
                  href="https://www.instagram.com/navmedha3.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.instagramLink}
                >
                  @navmedha3.0
                </a>
              </p>
            </div>
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
