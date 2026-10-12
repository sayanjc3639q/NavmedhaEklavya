"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Sparkles, ArrowRight } from "lucide-react";
import styles from "./MobileStickyBar.module.css";

export function MobileStickyBar() {
  const pathname = usePathname();
  const { data: configData } = useAppSelector((state) => state.config);
  const isShowcaseMode = configData?.isLive === false;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on home or info pages, hide when already on submission form or login
    if (pathname.startsWith("/submission") || pathname.startsWith("/login")) {
      setVisible(false);
      return;
    }

    const handleScroll = () => {
      // Show after user scrolls past the top 200px
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (isShowcaseMode || !visible) {
    return null;
  }

  return (
    <div className={styles.stickyBarWrapper}>
      <div className={styles.stickyBarContainer}>
        <div className={styles.infoCol}>
          <span className={styles.pulseDot} />
          <div>
            <div className={styles.barTitle}>Navmedha 2026 Live</div>
            <div className={styles.barSubtitle}>Reg Fee: Only ₹8 / category</div>
          </div>
        </div>

        <Link href="/#categories" className={styles.actionBtn}>
          <Sparkles size={15} />
          <span>Register Now</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
