import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES_CONFIG } from "@/config/categories";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import { PatternSeparator } from "@/components/common/PatternSeparator/PatternSeparator";
import { SubmissionForm } from "@/components/features/submission/SubmissionForm/SubmissionForm";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return [
    { category: "reels" },
    { category: "photography" },
    { category: "content" },
    { category: "artworks" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: catId } = await params;
  const category = CATEGORIES_CONFIG[catId];

  if (!category) {
    return {
      title: "Category Not Found | NAVMEDHA",
    };
  }

  return {
    title: `Submit to ${category.title} | NAVMEDHA 2026`,
    description: `Submit your creative entry for ${category.title} - ${category.subtitle} at NAVMEDHA Durga Puja Art Confluence.`,
  };
}

export default async function SubmissionCategoryPage({ params }: PageProps) {
  const { category: catId } = await params;
  const category = CATEGORIES_CONFIG[catId];

  if (!category) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <Navbar />

      {/* ─── CATEGORY HERO HEADER ─── */}
      <section className={styles.categoryHero}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> <span>/</span> <Link href="/#categories">Categories</Link> <span>/</span> <strong>{category.title}</strong>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.kicker}>✧ Category {category.categoryNumber} Submission ✧</span>
              <h1 className={styles.heroTitle}>{category.bengaliTitle}</h1>
              <p className={styles.heroSubtitle}>{category.subtitle}</p>
              {category.tagline && <p className={styles.heroTagline}>"{category.tagline}"</p>}
              <p className={styles.heroDescription}>{category.description}</p>
            </div>

            <div className={styles.heroIllustrationWrap}>
              <Image
                src={category.icon}
                alt={category.title}
                width={280}
                height={280}
                priority
                className={styles.heroIllustration}
              />
            </div>
          </div>
        </div>
      </section>

      <PatternSeparator />

      {/* ─── GUIDELINES & SUBMISSION FORM ─── */}
      <section className={styles.submissionSection}>
        <div className={styles.container}>
          <div className={styles.submissionLayout}>
            {/* Left Column: Themes & Guidelines & Specs */}
            <aside className={styles.guidelinesSidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>🎨 Category Themes</h3>
                <p className={styles.themesInfo}>Choose 1 theme for your entry:</p>
                <ul className={styles.sidebarThemesList}>
                  {category.themes.map((th, idx) => (
                    <li key={idx}>
                      <strong>{idx + 1}. {th.name}:</strong> <span>{th.desc}</span>
                    </li>
                  ))}
                </ul>

                <h3 className={styles.sidebarTitle} style={{ marginTop: "24px" }}>📋 Guidelines</h3>
                <ul className={styles.guidelinesList}>
                  {category.guidelines.map((item, idx) => (
                    <li key={idx}>
                      <span className={styles.checkIcon}>✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.specsBox}>
                  <div className={styles.specItem}>
                    <strong>Accepted Formats:</strong>
                    <span>{category.acceptedFormats}</span>
                  </div>
                  <div className={styles.specItem}>
                    <strong>Max File Size:</strong>
                    <span>{category.maxSizeMB} MB</span>
                  </div>
                  <div className={styles.specItem}>
                    <strong>Verification:</strong>
                    <span>Raw files may be requested</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Redux-powered Form */}
            <div className={styles.formWrapper}>
              <div className={styles.formHeader}>
                <h2>Participant Entry Form</h2>
                <p>Fill in all the required details to lock your spot in NAVMEDHA 2026.</p>
              </div>

              <SubmissionForm category={category} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
