"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.navBrand} onClick={closeSidebar}>
          <Image
            src="/assets/navmedha-logo.png"
            alt="Navmedha Logo"
            width={180}
            height={50}
            style={{ width: "auto", height: "45px" }}
            priority
            className={styles.navLogoImg}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navLinks}>
          <Link href="/#about" className={styles.navLink}>About</Link>
          <Link href="/#categories" className={styles.navLink}>Categories</Link>
          <Link href="/#prizes" className={styles.navLink}>Prizes & MAR</Link>
          <Link href="/#gallery" className={styles.navLink}>Memories</Link>
          <Link href="/#mascots" className={styles.navLink}>Theme</Link>
          <Link href="/#rules" className={styles.navLink}>Rules</Link>
          <Link href="/#flow" className={styles.navLink}>Event Flow</Link>
        </nav>

        {/* Desktop Login Button */}
        <div className={styles.desktopActions}>
          <Link href="/#categories" className="hero-btn" style={{ padding: "8px 24px", fontSize: "0.95rem" }}>
            Login
          </Link>
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
          <Image
            src="/assets/navmedha-logo.png"
            alt="Navmedha Logo"
            width={140}
            height={40}
            style={{ width: "auto", height: "36px" }}
          />
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
            <span>Memories</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#mascots" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>Theme & Vahanas</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#rules" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>Rules</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
          <Link href="/#flow" className={styles.sidebarLink} onClick={closeSidebar}>
            <span>Event Flow</span>
            <ArrowRight size={16} className={styles.linkArrow} />
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            href="/#categories"
            className="hero-btn"
            style={{ width: "100%", justifyContent: "center", padding: "12px 24px", fontSize: "1rem" }}
            onClick={closeSidebar}
          >
            Login / Participate
          </Link>
          <p className={styles.sidebarCredit}>Powered by Eklavya Foundation</p>
        </div>
      </aside>
    </header>
  );
}

