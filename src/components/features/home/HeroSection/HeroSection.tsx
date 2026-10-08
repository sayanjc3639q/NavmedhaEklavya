"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import { useAppSelector } from "@/redux/hooks";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const { data: configData } = useAppSelector((state) => state.config);
  const isShowcaseMode = configData?.isLive === false;

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
          {isShowcaseMode ? (
            <div className={styles.showcaseBannerBadge}>
              <span>✦</span> NAVMEDHA SHOWCASE MODE ACTIVE <span>✦</span>
            </div>
          ) : (
            <div className={styles.liveBannerBadge}>
              <span className={styles.pulseDot} /> REGISTRATIONS NOW OPEN FOR NAVMEDHA 2026
            </div>
          )}

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

        <ScrollReveal variant="fade" delay={1}>
          <p className={styles.heroSubtitle}>
            {isShowcaseMode ? (
              <>
                Where Devotion Meets Digital Expression. An exclusive celebration of
                Art, Reels, Photography, and Storytelling during the divine festival of Durga Puja.
                Registrations are currently closed — explore our showcase categories, themes, and festival memories!
              </>
            ) : (
              <>
                Where Devotion Meets Digital Expression. An exclusive celebration of
                Art, Reels, Photography, and Storytelling during the divine festival of Durga Puja.
                Submit your creative entry now!
              </>
            )}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={2}>
          <div className={styles.heroCtaGroup}>
            {isShowcaseMode ? (
              <>
                <Link href="/#categories" className="hero-btn">
                  <span>Explore Showcase</span>
                  <span>✦</span>
                </Link>
                <Link href="/#gallery" className="secondary-btn">
                  <span>Memories &amp; Gallery</span>
                  <span>↓</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/#categories" className="hero-btn">
                  <span>Explore &amp; Register</span>
                  <span>✦</span>
                </Link>
                <Link href="/#about" className="secondary-btn">
                  <span>About Navmedha</span>
                  <span>↓</span>
                </Link>
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
