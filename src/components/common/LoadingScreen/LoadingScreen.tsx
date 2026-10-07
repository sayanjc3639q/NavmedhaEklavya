"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./LoadingScreen.module.css";

const CRITICAL_ASSETS = [
  "/assets/Loading icon.png",
  "/assets/NAVMEDHA 3.png",
  "/assets/herobackgroung.png",
  "/assets/eklavyaicon.png",
  "/assets/navmedha-logo.png",
  "/assets/gifts-transparent.png",
  "/assets/greeticon.png",
  "/assets/photographyicon.png",
  "/assets/reelsmakingicon.png",
  "/assets/contentwrittingicon.png",
  "/assets/artworkicon.png",
  "/assets/frame-window.png",
  "/assets/peacockicon.png",
  "/assets/lionicon.png",
  "/assets/owlcion.png",
  "/assets/gooseicon.png",
  "/assets/raticon.png",
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if session already loaded so users don't wait on fast inner page transitions
    const hasSeenLoader = sessionStorage.getItem("navmedha_preloader_seen");
    if (hasSeenLoader) {
      setShouldRender(false);
      return;
    }

    // Preload all critical image assets in background
    CRITICAL_ASSETS.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    const TOTAL_DURATION_MS = 4000; // Minimum 4 seconds load animation
    const startTime = performance.now();

    let animationFrameId: number;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / TOTAL_DURATION_MS, 1);
      
      // Smooth cubic ease-out pacing
      const easedProgress = Math.round(
        (1 - Math.pow(1 - rawProgress, 2.2)) * 100
      );

      setProgress(easedProgress);

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setTimeout(() => {
          setIsLoaded(true);
          sessionStorage.setItem("navmedha_preloader_seen", "true");
          setTimeout(() => setShouldRender(false), 700);
        }, 400);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!shouldRender) return null;

  return (
    <aside
      className={`${styles.preloaderWrapper} ${isLoaded ? styles.preloaderFadeOut : ""}`}
      aria-label="Loading NAVMEDHA festive experience"
      aria-busy={!isLoaded}
    >
      <div className={styles.loaderCenterBox}>
        {/* Festive Loading Icon */}
        <div className={styles.iconContainer}>
          <Image
            src="/assets/Loading icon.png"
            alt="NAVMEDHA Festive Emblem"
            width={160}
            height={160}
            priority
            className={styles.loadingEmblem}
          />
        </div>

        {/* Branding & Subtitle */}
        <div className={styles.brandTextBox}>
          <span className={styles.festivalKicker}>✧ শারদোৎসব ২০২৬ ✧</span>
          <h2 className={styles.brandTitle}>NAVMEDHA</h2>
          <p className={styles.brandSubtitle}>Where Devotion Meets Digital Expression</p>
        </div>

        {/* ─── TRISUL PROGRESS BAR ─── */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress}%` }}
            />
            {/* The Moving Golden Trishul Head indicator */}
            <div
              className={styles.trishulHead}
              style={{ left: `${progress}%` }}
            >
              {/* Detailed SVG Trishul (Trident) */}
              <svg
                viewBox="0 0 32 32"
                className={styles.trishulSvg}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Center Sharp Prong */}
                <path
                  d="M16 2L18.5 9H13.5L16 2Z"
                  fill="#991b1b"
                  stroke="#fbbf24"
                  strokeWidth="1.2"
                />
                <line x1="16" y1="9" x2="16" y2="28" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Left Curved Prong */}
                <path
                  d="M7 6C7 13 13 14 15 14"
                  stroke="#991b1b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path d="M6 5L9 9H4L6 5Z" fill="#fbbf24" stroke="#78350f" strokeWidth="0.8" />

                {/* Right Curved Prong */}
                <path
                  d="M25 6C25 13 19 14 17 14"
                  stroke="#991b1b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path d="M26 5L29 9H24L26 5Z" fill="#fbbf24" stroke="#78350f" strokeWidth="0.8" />

                {/* Central Binding Ring & Damru accent */}
                <circle cx="16" cy="14" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                <line x1="12" y1="18" x2="20" y2="18" stroke="#fbbf24" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          <div className={styles.progressMetaRow}>
            <span className={styles.loadingStatusText}>
              {progress < 40
                ? "Preparing Festive Canvas..."
                : progress < 80
                ? "Loading Devotional Assets..."
                : progress < 100
                ? "Entering the Confluence..."
                : "Welcome to NAVMEDHA!"}
            </span>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
