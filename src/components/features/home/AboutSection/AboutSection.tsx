import Image from "next/image";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import styles from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.container}>
        <ScrollReveal variant="scale">
          <div className={styles.aboutCard}>
            <div className={styles.aboutIconContainer}>
              <Image
                src="/assets/greeticon.png"
                alt="Greeting"
                width={220}
                height={220}
                className="floating"
              />
            </div>
            <div className={styles.aboutText}>
              <span className={styles.sectionKicker}>✧ Welcome to the Celebration ✧</span>
              <h2 className={styles.sectionTitle}>Welcome to NAVMEDHA</h2>
              <p>
                As the autumn air fills with the fragrant aroma of Shiuli flowers and the majestic reverberation of Dhak, <strong>Navmedha</strong> invites artists, storytellers, photographers, and video creators across the globe to showcase their creative genius.
              </p>
              <p>
                Whether you portray Maa Durga through vibrant digital canvas brushstrokes, capture the untold moments of pandal artisans, or pen your most cherished festival memories—Navmedha is your grand stage.
              </p>
              <div className={styles.aboutHighlights}>
                <div className={styles.highlightItem}>
                  <strong>🏆 ₹50,000+</strong>
                  <span>Total Prize Pool & Goodies</span>
                </div>
                <div className={styles.highlightItem}>
                  <strong>🌍 Global Entry</strong>
                  <span>Open to all age groups</span>
                </div>
                <div className={styles.highlightItem}>
                  <strong>📜 Verified E-Certificates</strong>
                  <span>For all valid participants</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
