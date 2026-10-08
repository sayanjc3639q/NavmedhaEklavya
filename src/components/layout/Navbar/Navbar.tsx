"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { checkAuthSession } from "@/redux/slices/authSlice";
import { getLiveConfig } from "@/redux/slices/configSlice";
import styles from "./Navbar.module.css";

export function Navbar() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { data: configData } = useAppSelector((state) => state.config);
  const isLive = configData?.isLive ?? true;

  useEffect(() => {
    setMounted(true);
    dispatch(checkAuthSession());
    dispatch(getLiveConfig());
  }, [dispatch]);

  // Track scroll past the hero section (~350px - 500px)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 220) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check initial scroll
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : styles.navbarTransparent}`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.navBrand} onClick={closeSidebar}>
          <div className={styles.brandGroup}>
            <Image
              src="/assets/eklavyaicon.png"
              alt="Eklavya Logo"
              width={42}
              height={42}
              className={styles.eklavyaNavLogo}
            />
            <span className={styles.brandCross}>✕</span>
            <Image
              src="/assets/navmedha-logo.png"
              alt="Navmedha Logo"
              width={160}
              height={45}
              style={{ width: "auto", height: "40px" }}
              priority
              className={styles.navLogoImg}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navLinks}>
          <Link href="/#about" className={styles.navLink}>About</Link>
          <Link href="/#categories" className={styles.navLink}>Categories</Link>
          <Link href="/#prizes" className={styles.navLink}>Prizes & MAR</Link>
          <Link href="/#gallery" className={styles.navLink}>{isLive ? "Memories" : "Showcase & Memories"}</Link>
          <Link href="/#mascots" className={styles.navLink}>Theme</Link>
        </nav>

        {/* Desktop Login / Profile Button */}
        <div className={styles.desktopActions}>
          {mounted && user ? (
            <Link 
              href="/profile" 
              className="hero-btn" 
              style={{ padding: "8px 20px", fontSize: "0.92rem", gap: "8px" }}
            >
              <User size={16} />
              <span>{user.name.split(" ")[0]}&apos;s Profile</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="hero-btn" 
              style={{ padding: "8px 22px", fontSize: "0.95rem" }}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className={styles.hamburgerIcon} /> : <Menu className={styles.hamburgerIcon} />}
        </button>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropActive : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Mobile Slide-in Drawer */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Mobile navigation"
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brandGroup}>
            <Image
              src="/assets/eklavyaicon.png"
              alt="Eklavya Logo"
              width={34}
              height={34}
              className={styles.eklavyaNavLogo}
            />
            <span className={styles.brandCross}>✕</span>
            <Image
              src="/assets/navmedha-logo.png"
              alt="Navmedha Logo"
              width={130}
              height={36}
              style={{ width: "auto", height: "32px" }}
            />
          </div>
          <button
            onClick={closeSidebar}
            className={styles.closeBtn}
            aria-label="Close navigation"
          >
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/#about" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>About</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#categories" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>Categories</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#prizes" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>Prizes & MAR</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#gallery" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>{isLive ? "Memories" : "Showcase & Memories"}</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#mascots" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>Theme & Vahanas</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          {mounted && user && (
            <Link href="/profile" className={styles.sidebarLink} onClick={closeSidebar}>
              <span>My Profile & Certificate</span>
              <ArrowRight size={16} className={styles.linkArrow} />
            </Link>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          {mounted && user ? (
            <Link
              href="/profile"
              className="hero-btn"
              style={{ width: "100%", justifyContent: "center", padding: "12px 24px", fontSize: "1rem", gap: "8px" }}
              onClick={closeSidebar}
            >
              <User size={18} />
              <span>View My Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hero-btn"
              style={{ width: "100%", justifyContent: "center", padding: "12px 24px", fontSize: "1rem" }}
              onClick={closeSidebar}
            >
              Login / Register
            </Link>
          )}
          <p className={styles.sidebarCredit}>Powered by Eklavya Official</p>
        </div>
      </aside>
    </header>
  );
}

