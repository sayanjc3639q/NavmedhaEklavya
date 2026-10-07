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
              <h2 className={styles.sectionTitle}>WELCOME TO NAVMEDHA</h2>
              <p>
                The shiuli has started to fall, and somewhere a dhaki is already warming up. Every year, this season stirs something in us.
              </p>
              <p>
                <strong>Navmedha</strong> is where those quiet feelings finally find a voice.
              </p>
              <p>
                Whether you capture Maa Durga in a stroke of paint, the sweep of a lens, a fleeting reel, or lines written from the heart. However you carry her presence within you, bring it to life here.
              </p>
              <div className={styles.aboutHighlights}>
                <div className={styles.highlightItem}>
                  <strong>🏆 Trophies & Hampers</strong>
                  <span>Cash prizes for winners</span>
                </div>
                <div className={styles.highlightItem}>
                  <strong>🎓 MAR Points</strong>
                  <span>For college students</span>
                </div>
                <div className={styles.highlightItem}>
                  <strong>📜 Signed Certificates</strong>
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
