"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import { useAppSelector } from "@/redux/hooks";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const { data: configData } = useAppSelector((state) => state.config);
  const { user } = useAppSelector((state) => state.auth);
  const isLive = configData?.isLive ?? true;

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBgWrapper}>
        <Image
          src="/assets/herobackgroung.png"
          alt="Navmedha Durga Puja Festive Background"
          fill
          priority
          quality={100}
          className={styles.heroBgImage}
        />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroContent}>
        <ScrollReveal variant="scale">
          <div className={styles.heroLogoMain}>
            <Image
              src="/assets/NAVMEDHA 3.png"
              alt="NAVMEDHA"
              width={650}
              height={200}
              style={{ width: "100%", maxWidth: "620px", height: "auto" }}
              priority
              className={styles.heroLogoImg}
            />
          </div>
        </ScrollReveal>

        {/* Dynamic Status Pill when in Showcase Mode */}
        {!isLive && (
          <ScrollReveal variant="fade" delay={1}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 18px",
                borderRadius: "999px",
                background: "rgba(245, 158, 11, 0.2)",
                border: "1px solid rgba(245, 158, 11, 0.45)",
                color: "#fde68a",
                fontSize: "0.82rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "10px auto 14px",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
              }}
            >
              <span>✦</span>
              <span>Festival Showcase Mode • Submissions Closed</span>
              <span>✦</span>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal variant="fade" delay={1}>
          <p className={styles.heroSubtitle}>
            {isLive ? (
              "Where Devotion Meets Digital Expression. An exclusive celebration of Art, Reels, Photography, and Storytelling during the divine festival of Durga Puja."
            ) : (
              "Relive the grand confluence of Art, Reels, Photography, and Storytelling during Durga Puja. Submissions have concluded—explore our celebrated memories & showcased creations below!"
            )}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={2}>
          <div className={styles.heroCtaGroup}>
            {isLive ? (
              <>
                <Link href="/#categories" className="hero-btn">
                  <span>Explore Categories</span>
                  <span>✦</span>
                </Link>
                <Link href="/#about" className="secondary-btn">
                  <span>About Navmedha</span>
                  <span>↓</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/#gallery" className="hero-btn">
                  <span>Explore Showcase &amp; Memories</span>
                  <span>✦</span>
                </Link>
                {user ? (
                  <Link href="/profile" className="secondary-btn">
                    <span>My Profile &amp; Certificates</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <Link href="/#about" className="secondary-btn">
                    <span>About Navmedha</span>
                    <span>↓</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
