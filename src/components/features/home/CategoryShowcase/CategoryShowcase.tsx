"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES_CONFIG } from "@/config/categories";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import { useAppSelector } from "@/redux/hooks";
import styles from "./CategoryShowcase.module.css";

export function CategoryShowcase() {
  const categoriesList = Object.values(CATEGORIES_CONFIG);
  const { data: configData } = useAppSelector((state) => state.config);
  const isLive = configData?.isLive ?? true;

  return (
    <section id="categories" className={styles.categoriesSection}>
      <div className={styles.container}>
        <ScrollReveal variant="fade">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>
              {isLive ? "✧ Showcase Your Talent ✧" : "✧ Festival Domains ✧"}
            </span>
            <h2 className={styles.sectionTitle}>Event Categories</h2>
            <p className={styles.sectionSubtitle}>
              {isLive
                ? "Choose your creative medium and let your devotion & artistic expression shine."
                : "Explore the creative domains celebrated during this festive edition."}
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
                    <div className={styles.catBadge}>Category 0{index + 1}</div>
                    <h3 className={styles.catTitle}>{cat.title}</h3>
                    <span className={styles.catSub}>{cat.subtitle}</span>
                    <p className={styles.catDesc}>{cat.description}</p>
                    <Link
                      href={isLive ? `/submission/${cat.id}` : "/#gallery"}
                      className={styles.catBtn}
                    >
                      {isLive ? "Submit in this Category →" : "Showcase Mode • View Memories →"}
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
