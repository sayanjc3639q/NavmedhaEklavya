"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import styles from "./LastYearGallery.module.css";

const GALLERY_ITEMS = [
  { id: 1, img: "/assets/lastyear/1.jpeg", title: "Grand Felicitations", caption: "Honoring the young emerging artists of NAVMEDHA" },
  { id: 2, img: "/assets/lastyear/2.jpeg", title: "Certificate Distribution", caption: "Awarding official certificates & recognition shields" },
  { id: 3, img: "/assets/lastyear/3.jpeg", title: "Joy of Achievement", caption: "Smiles and celebration of creative excellence" },
  { id: 4, img: "/assets/lastyear/4.jpeg", title: "Prizes & Recognition", caption: "Encouraging young minds through festive hampers" },
  { id: 5, img: "/assets/lastyear/5.jpeg", title: "Artistic Moments", caption: "Memorable glimpses from the ceremony stage" },
  { id: 6, img: "/assets/lastyear/6.jpeg", title: "Celebrating Talent", caption: "Jury and organizers felicitating outstanding entries" },
  { id: 7, img: "/assets/lastyear/7.jpeg", title: "Cherished Memories", caption: "A gathering of devotion, art, and togetherness" },
  { id: 8, img: "/assets/lastyear/8.jpeg", title: "Festival of Expressions", caption: "Concluding the grand prize distribution ceremony" },
];

export function LastYearGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPullingOut, setIsPullingOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Helper to trigger card transition
  const goToCard = (nextIndex: number) => {
    setIsPullingOut(true);
    setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsPullingOut(false);
    }, 280);
  };

  const nextCard = () => {
    goToCard((activeIndex + 1) % GALLERY_ITEMS.length);
  };

  const prevCard = () => {
    goToCard((activeIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  };

  // Robust Auto-scroll timer that resets cleanly on user interaction
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setIsPullingOut(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
        setIsPullingOut(false);
      }, 280);
    }, 3200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex]);

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextCard();
    } else if (diff < -40) {
      prevCard();
    }
    touchStartXRef.current = null;
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      nextCard(); // Clicking center card pulls next
    } else {
      goToCard(index);
    }
  };

  return (
    <section id="gallery" className={styles.gallerySection}>
      <div className={styles.container}>
        <ScrollReveal variant="fade">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>✧ Nostalgia & Glories ✧</span>
            <h2 className={styles.sectionTitle}>Last Year Prize Distribution</h2>
            <p className={styles.sectionSubtitle}>
              A glimpse into the cherished moments, awards ceremony, and radiant smiles of NAVMEDHA winners.
            </p>
          </div>
        </ScrollReveal>

        {/* Poker Card Deck Container with Mobile Touch Swipe */}
        <div
          className={styles.deckWrapper}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.pokerDeck}>
            {GALLERY_ITEMS.map((item, idx) => {
              const total = GALLERY_ITEMS.length;
              let diff = (idx - activeIndex + total) % total;
              if (diff > total / 2) diff -= total; // allow negative wrapping for symmetrical fan

              const isActive = diff === 0;
              const absDiff = Math.abs(diff);

              // Calculate fan transform (rotation, translateX, translateY, zIndex)
              const rot = diff * 8; // degrees tilt
              const transX = diff * 85; // wider horizontal spread so photos on sides are clearly visible
              let transY = absDiff * 14 - (isActive ? 38 : 0); // lift top card
              let customScale = isActive ? 1.05 : Math.max(0.82, 1 - absDiff * 0.05);
              let customZIndex = 50 - absDiff;
              let customOpacity = absDiff > 3 ? 0 : Math.max(0.65, 1 - absDiff * 0.12);

              // Realistic Poker Pull-Out Animation when transitioning
              if (isActive && isPullingOut) {
                transY = -95; // Pull high out of the hand
                customScale = 1.12;
                customZIndex = 60;
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(idx)}
                  className={`${styles.framedCard} ${isActive ? styles.activeCard : ""} ${
                    isActive && isPullingOut ? styles.cardPullingOut : ""
                  }`}
                  style={{
                    transform: `translateX(${transX}px) translateY(${transY}px) rotate(${rot}deg) scale(${customScale})`,
                    zIndex: customZIndex,
                    opacity: customOpacity,
                    cursor: "pointer",
                  }}
                >
                  {/* Photo inside the decorative cutout frame */}
                  <div className={styles.photoContainer}>
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 300px, 460px"
                      className={styles.realPhoto}
                    />
                  </div>

                  {/* The Ornate Frame Layer Overlay */}
                  <div className={styles.frameOverlay}>
                    <Image
                      src="/assets/frame-window.png"
                      alt="Durga Puja Ornate Golden Frame"
                      fill
                      priority={idx === 0}
                      className={styles.frameImage}
                    />
                  </div>

                  {/* Card Deck Indicator Badge */}
                  {isActive && (
                    <div className={styles.cardIndicatorBadge}>
                      <span>{idx + 1} / {GALLERY_ITEMS.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Card Meta & Thumbnail Dots */}
        <div className={styles.activeCardInfo}>
          <h3 className={styles.currentTitle}>{GALLERY_ITEMS[activeIndex].title}</h3>
          <p className={styles.currentCaption}>{GALLERY_ITEMS[activeIndex].caption}</p>

          {/* Quick selector dots */}
          <div className={styles.dotDeck}>
            {GALLERY_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ""}`}
                aria-label={`Select frame ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


