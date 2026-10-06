import Image from "next/image";
import { Trophy, Award, GraduationCap, Globe, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/common/ScrollReveal/ScrollReveal";
import styles from "./PrizesSection.module.css";

const RECOGNITION_PERKS = [
  {
    icon: Trophy,
    title: "Cash Awards & Festive Hampers",
    tag: "Top Winners",
    accent: "#b45309",
    description:
      "Grand cash prizes for 1st, 2nd & 3rd place winners across all 4 categories, accompanied by exclusive festive gift hampers & memorabilia.",
  },
  {
    icon: GraduationCap,
    title: "MAR Points Accreditation",
    tag: "College Students",
    accent: "#991b1b",
    description:
      "Eligible university and college students will be awarded official MAR (Mandatory Additional Requirements) activity points on submitting valid entries.",
  },
  {
    icon: Award,
    title: "Verified Certificate of Recognition",
    tag: "All Participants",
    accent: "#c2410c",
    description:
      "Every valid participant receives an authentic, QR-verifiable Certificate of Appreciation issued by Eklavya Official & NAVMEDHA.",
  },
  {
    icon: Globe,
    title: "Global Gallery Spotlight",
    tag: "Featured Artists",
    accent: "#78350f",
    description:
      "Winning artworks, reels, and stories will be permanently showcased on NAVMEDHA digital publications and social media reach of 50K+ audience.",
  },
];

export function PrizesSection() {
  return (
    <section id="prizes" className={styles.prizesSection}>
      <div className={styles.container}>
        <ScrollReveal variant="fade">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionKicker}>✧ Rewards & Recognition ✧</span>
            <h2 className={styles.sectionTitle}>Prizes, MAR Points & Honors</h2>
            <p className={styles.sectionSubtitle}>
              Your hard work, devotion, and creativity deserve celebration and academic recognition.
            </p>
          </div>
        </ScrollReveal>

        {/* Featured Showcase with the Festive Gift Asset */}
        <ScrollReveal variant="scale">
          <div className={styles.heroRewardCard}>
            <div className={styles.heroRewardImgWrap}>
              <Image
                src="/assets/gifts-transparent.png"
                alt="Navmedha Grand Prizes & Festive Hampers"
                width={360}
                height={360}
                className={styles.giftsHeroImg}
              />
            </div>
            <div className={styles.heroRewardText}>
              <span className={styles.heroRewardBadge}>🏆 ₹50,000+ Total Prize Pool</span>
              <h3 className={styles.heroRewardHeading}>Grand Sharadotsav Accolades</h3>
              <p className={styles.heroRewardDesc}>
                Participate in your favorite category—Reels, Photography, Content Writing, or Artworks—to compete for top honors, national digital recognition, and prestigious awards curated for the season of Durga Puja.
              </p>
              <ul className={styles.rewardBullets}>
                <li>
                  <CheckCircle2 className={styles.bulletIcon} />
                  <span>Category Winner Trophies & Cash Grants</span>
                </li>
                <li>
                  <CheckCircle2 className={styles.bulletIcon} />
                  <span>Direct MAR Points eligibility for university activity records</span>
                </li>
                <li>
                  <CheckCircle2 className={styles.bulletIcon} />
                  <span>Signed Certificates of Excellence & National feature spotlight</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* 4-Pillar Grid */}
        <div className={styles.perksGrid}>
          {RECOGNITION_PERKS.map((perk, idx) => {
            const IconComp = perk.icon;
            return (
              <ScrollReveal key={idx} variant="fade" delay={(idx % 3) as 0 | 1 | 2}>
                <div className={styles.perkCard}>
                  <div className={styles.perkHeader}>
                    <div className={styles.perkIconWrap} style={{ background: `${perk.accent}15` }}>
                      <IconComp className={styles.perkIcon} style={{ color: perk.accent }} />
                    </div>
                    <span className={styles.perkTag} style={{ borderColor: perk.accent, color: perk.accent }}>
                      {perk.tag}
                    </span>
                  </div>
                  <h4 className={styles.perkTitle}>{perk.title}</h4>
                  <p className={styles.perkDesc}>{perk.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
