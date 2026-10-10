"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES_CONFIG } from "@/config/categories";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import { useAppSelector } from "@/redux/hooks";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./CategoryShowcase.module.css";

export function CategoryShowcase() {
  const categoriesList = Object.values(CATEGORIES_CONFIG);
  const { data: configData } = useAppSelector((state) => state.config);
  const isShowcaseMode = configData?.isLive === false;

  return (
    <section id="categories" className={styles.categoriesSection}>
      <div className={styles.container}>
        <ScrollReveal variant="fade">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>
              {isShowcaseMode ? "✧ Festival Showcase & Categories ✧" : "✧ Express Your Devotion ✧"}
            </span>
            <h2 className={styles.sectionTitle}>Event Categories</h2>
            <p className={styles.sectionSubtitle}>
              {isShowcaseMode
                ? "Explore our 4 creative verticals, themes, and past brilliance. NAVMEDHA is currently in Showcase Mode — celebrate the spirit of Durga Puja!"
                : "Some remember Pujo with their eyes, some with their hands, some with words. Find yours."}
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.categoryList}>
          {categoriesList.map((cat, index) => {
            const isEven = index % 2 === 1;
            return (
              <ScrollReveal
                key={cat.id}
                variant={isEven ? "slide-right" : "slide-left"}
              >
                <div
                  className={`${styles.categoryRowItem} ${isEven ? styles.categoryRowReverse : ""}`}
                >
                  <div className={styles.categoryIllustrationWrap}>
                    <Image
                      src={cat.icon}
                      alt={cat.title}
                      width={320}
                      height={320}
                      className={styles.categoryIllustration}
                    />
                  </div>
                  <div className={styles.categoryBody}>
                    <div className={styles.catBadgeWrap}>
                      <span className={styles.catBadge}>Category {cat.categoryNumber}</span>
                      {isShowcaseMode && (
                        <span className={styles.catShowcaseBadge}>✦ Showcase Mode</span>
                      )}
                    </div>
                    <h3 className={styles.catTitle}>{cat.bengaliTitle}</h3>
                    <span className={styles.catSub}>{cat.subtitle}</span>
                    {cat.tagline && <p className={styles.catTagline}>"{cat.tagline}"</p>}
                    <p className={styles.catDesc}>{cat.description}</p>
                    
                    {/* Themes list preview */}
                    <div className={styles.themesWrap}>
                      <span className={styles.themesLabel}>Themes:</span>
                      <ul className={styles.themesList}>
                        {cat.themes.map((theme, tIdx) => (
                          <li key={tIdx}>
                            <strong>{tIdx + 1}. {theme.name}:</strong> <span>{theme.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={`/submission/${cat.id}`} className={styles.catBtn}>
                      <span className={styles.btnGlowSweep} />
                      {isShowcaseMode ? (
                        <>
                          <Sparkles size={18} className={styles.btnIcon} />
                          <span>Explore Showcase &amp; Guidelines</span>
                          <ArrowRight size={18} className={styles.btnArrowIcon} />
                        </>
                      ) : (
                        <>
                          <span className={styles.btnSparkleTag}>✦</span>
                          <span>View Guidelines &amp; Submit Entry</span>
                          <ArrowRight size={18} className={styles.btnArrowIcon} />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
