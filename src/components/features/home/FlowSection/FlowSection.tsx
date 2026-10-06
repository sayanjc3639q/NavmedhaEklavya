import Image from "next/image";
import { Palette, UploadCloud, Eye, Trophy } from "lucide-react";
import styles from "./FlowSection.module.css";

const TIMELINE_STEPS_FLOW = [
  {
    step: "01",
    title: "Create Your Masterpiece",
    desc: "Craft your artwork, film your reel, write your story, or click festive photographs.",
    icon: Palette,
    accent: "#b45309",
  },
  {
    step: "02",
    title: "Submit Online",
    desc: "Fill the dedicated category submission form with your entry details & cloud links.",
    icon: UploadCloud,
    accent: "#991b1b",
  },
  {
    step: "03",
    title: "Curation & Voting",
    desc: "Entries get featured in the virtual festival gallery for audience & jury review.",
    icon: Eye,
    accent: "#d97706",
  },
  {
    step: "04",
    title: "Prizes & Recognition",
    desc: "Win exciting hampers, digital certificates, cash prizes, and artist spotlights.",
    icon: Trophy,
    accent: "#78350f",
  },
];

export function FlowSection() {
  return (
    <section id="flow" className={styles.flowSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionKicker}>✧ Simple 4-Step Process ✧</span>
          <h2 className={styles.sectionTitle}>Event Flow & Participation</h2>
          <p className={styles.sectionSubtitle}>
            From ideation to grand recognition — here is how Navmedha works.
          </p>
        </div>

        <div className={styles.timelineGrid}>
          {TIMELINE_STEPS_FLOW.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div key={idx} className={styles.timelineCard}>
                <div className={styles.stepBadge}>{step.step}</div>
                <div className={styles.stepIconContainer}>
                  <IconComponent className={styles.stepLucideIcon} style={{ color: step.accent }} />
                </div>
                <h4 className={styles.timelineTitle}>{step.title}</h4>
                <p className={styles.timelineDesc}>{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dedicated Organised By NGO Section */}
        <div className={styles.organizedByWrapper}>
          <div className={styles.organizedCard}>
            <div className={styles.organizedLogoWrap}>
              <Image
                src="/assets/eklavyaicon.png"
                alt="Eklavya NGO"
                width={85}
                height={85}
                className={styles.eklavyaLogo}
              />
            </div>
            <div className={styles.organizedText}>
              <span className={styles.organizedKicker}>Organised & Powered By</span>
              <h3 className={styles.organizedTitle}>Eklavya Official</h3>
              <p className={styles.organizedDesc}>
                Empowering arts, culture, and youth creative potential through community initiatives and digital platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
