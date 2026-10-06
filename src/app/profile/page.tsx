"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Hash, 
  Award, 
  FileText, 
  Clock, 
  CheckCircle, 
  Download, 
  Eye, 
  LogOut, 
  PlusCircle, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Lock
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import styles from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { submissions } = useAppSelector((state) => state.submission);

  const [activeTab, setActiveTab] = useState<"submissions" | "certificate" | "details">("submissions");
  const [selectedSubmissionForCert, setSelectedSubmissionForCert] = useState<string | null>(null);

  // If user is not logged in, show prompt or sample login view
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  // Filter submissions by current user or show all user's submissions
  const userSubmissions = user 
    ? submissions.filter((s) => !s.userId || s.userId === user.id || s.email === user.email)
    : submissions;

  // Fallback demo user if visiting directly without logging in
  const currentUser = user || {
    id: "USR-SAMPLE",
    name: "Debolina Banerjee",
    email: "debolina.banerjee2026@gmail.com",
    avatar: "",
    rollNumber: "12621001045",
    department: "Computer Science & Engineering",
    currentYear: "3rd Year",
    mobileNumber: "+91 98765 43210",
    collegeName: "Heritage Institute of Technology",
    isAuthenticated: false,
  };

  return (
    <main className={styles.profilePage}>
      <Navbar />

      <section className={styles.profileSection}>
        <div className={styles.container}>
          {/* ─── USER PROFILE HEADER BANNER ─── */}
          <div className={styles.profileBanner}>
            <div className={styles.bannerGlow} />
            <div className={styles.bannerContent}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatarInitials}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className={styles.onlineBadge} />
              </div>

              <div className={styles.userMainInfo}>
                <div className={styles.nameRow}>
                  <h1 className={styles.userName}>{currentUser.name}</h1>
                  <span className={styles.verifiedStudentBadge}>
                    <GraduationCap size={14} />
                    <span>{currentUser.currentYear}</span>
                  </span>
                </div>
                <p className={styles.userMetaLine}>
                  <span>{currentUser.department}</span> • <span>{currentUser.collegeName || "Heritage Institute of Technology"}</span> • <span>Roll: {currentUser.rollNumber}</span>
                </p>
                <div className={styles.contactPills}>
                  <span className={styles.pill}><Mail size={13} /> {currentUser.email}</span>
                  <span className={styles.pill}><Phone size={13} /> {currentUser.mobileNumber}</span>
                </div>
              </div>

              {user && (
                <div className={styles.bannerActions}>
                  <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!user && (
            <div className={styles.demoNotice}>
              <AlertCircle size={18} />
              <span>You are viewing in preview mode. <Link href="/login"><strong>Sign in with Google</strong></Link> to save your academic details and entries permanently.</span>
            </div>
          )}

          {/* ─── NAVIGATION TABS ─── */}
          <div className={styles.profileTabs}>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`${styles.tabBtn} ${activeTab === "submissions" ? styles.tabActive : ""}`}
            >
              <FileText size={18} />
              <span>My Submissions ({userSubmissions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("certificate")}
              className={`${styles.tabBtn} ${activeTab === "certificate" ? styles.tabActive : ""}`}
            >
              <Award size={18} />
              <span>Sharadotsav Certificate</span>
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`${styles.tabBtn} ${activeTab === "details" ? styles.tabActive : ""}`}
            >
              <User size={18} />
              <span>Academic Details</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════
              TAB 1: SUBMISSIONS LIST
          ══════════════════════════════════════════════════ */}
          {activeTab === "submissions" && (
            <div className={styles.tabContent}>
              {userSubmissions.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrap}>
                    <Image
                      src="/assets/giftsicon.png"
                      alt="No Submissions"
                      width={120}
                      height={120}
                      className="floating"
                    />
                  </div>
                  <h3>No Entries Submitted Yet</h3>
                  <p>Choose your creative category (Reels, Photography, Writing, or Artworks) and submit to compete for awards and MAR points.</p>
                  <Link href="/#categories" className="hero-btn" style={{ marginTop: "16px" }}>
                    <span>Explore Categories & Submit</span>
                    <Sparkles size={16} />
                  </Link>
                </div>
              ) : (
                <div className={styles.submissionsGrid}>
                  {userSubmissions.map((entry) => (
                    <div key={entry.id} className={styles.submissionCard}>
                      <div className={styles.cardTopRow}>
                        <span className={styles.categoryBadge}>
                          {entry.category.toUpperCase()}
                        </span>
                        <span className={styles.statusBadgeReview}>
                          <Clock size={13} />
                          <span>{entry.status || "Under Review"}</span>
                        </span>
                      </div>

                      <h3 className={styles.submissionTitle}>{entry.title}</h3>
                      {entry.description && (
                        <p className={styles.submissionDesc}>{entry.description}</p>
                      )}

                      <div className={styles.fileMetaCard}>
                        <div className={styles.fileIconWrap}>
                          <FileText size={20} />
                        </div>
                        <div className={styles.fileMetaText}>
                          <strong>{entry.fileName || "Uploaded Creative Masterpiece"}</strong>
                          <span>{entry.fileSize ? `${(entry.fileSize / (1024 * 1024)).toFixed(2)} MB` : "Attached file"} • Verified</span>
                        </div>
                      </div>

                      <div className={styles.entryFooter}>
                        <div className={styles.footerDetail}>
                          <span>Txn Ref (UTR):</span>
                          <code>{entry.transactionId || "Verified"}</code>
                        </div>
                        <div className={styles.footerDetail}>
                          <span>Reg ID:</span>
                          <code>{entry.id}</code>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          onClick={() => {
                            setSelectedSubmissionForCert(entry.id);
                            setActiveTab("certificate");
                          }}
                          className={styles.viewCertBtn}
                        >
                          <Award size={15} />
                          <span>Check Certificate Status</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 2: FESTIVAL CERTIFICATE PORTAL
          ══════════════════════════════════════════════════ */}
          {activeTab === "certificate" && (
            <div className={styles.tabContent}>
              <div className={styles.certCardSection}>
                <div className={styles.certStatusBanner}>
                  <div className={styles.lockIconWrap}>
                    <Lock size={28} className={styles.lockIcon} />
                  </div>
                  <div className={styles.certStatusText}>
                    <h3>Certificate Unlocks After Festival Finale</h3>
                    <p>
                      Official <strong>QR-Verifiable Certificates of Appreciation</strong> issued by <strong>Eklavya Official ✕ NAVMEDHA</strong> will be published and available for high-res download once the grand Sharadotsav voting and jury curation concludes on <strong>October 30, 2026</strong>.
                    </p>
                  </div>
                </div>

                {/* Interactive Certificate Mock Preview */}
                <div className={styles.certPreviewWrapper}>
                  <div className={styles.certPaper}>
                    <div className={styles.certBorderOuter}>
                      <div className={styles.certBorderInner}>
                        <div className={styles.certHeader}>
                          <div className={styles.certLogoRow}>
                            <Image
                              src="/assets/eklavyaicon.png"
                              alt="Eklavya"
                              width={48}
                              height={48}
                            />
                            <span className={styles.certCross}>✕</span>
                            <Image
                              src="/assets/navmedha-logo.png"
                              alt="Navmedha"
                              width={150}
                              height={40}
                              style={{ width: "auto", height: "34px" }}
                            />
                          </div>
                          <span className={styles.certKicker}>NAVMEDHA 2026 • SHARADOTSAV ART CONFLUENCE</span>
                          <h2 className={styles.certTitle}>Certificate of Appreciation</h2>
                        </div>

                        <div className={styles.certBody}>
                          <p className={styles.certBodyText}>This is proudly presented to</p>
                          <h3 className={styles.certRecipient}>{currentUser.name}</h3>
                          <p className={styles.certRollMeta}>
                            Roll No: <strong>{currentUser.rollNumber}</strong> • Dept: <strong>{currentUser.department}</strong>
                          </p>
                          <p className={styles.certRecognitionText}>
                            for active participation & artistic excellence in the category of <strong>{userSubmissions[0]?.category?.toUpperCase() || "CREATIVE EXPRESSION"}</strong> during the festive festival confluence of Durga Puja 2026.
                          </p>
                        </div>

                        <div className={styles.certSignatures}>
                          <div className={styles.certSignBlock}>
                            <div className={styles.digitalSign}>Sayan Chakraborty</div>
                            <span className={styles.signLine} />
                            <span className={styles.signRole}>Convenor, NAVMEDHA</span>
                          </div>

                          <div className={styles.certSealWrap}>
                            <div className={styles.certSeal}>
                              <Image
                                src="/assets/giftsicon.png"
                                alt="Official Seal"
                                width={50}
                                height={50}
                              />
                            </div>
                            <span className={styles.sealText}>QR VERIFIED</span>
                          </div>

                          <div className={styles.certSignBlock}>
                            <div className={styles.digitalSign}>President, Eklavya</div>
                            <span className={styles.signLine} />
                            <span className={styles.signRole}>Eklavya Official</span>
                          </div>
                        </div>

                        <div className={styles.certWatermark}>
                          <span>PENDING EVENT CONCLUSION • CERTIFICATE WILL UNLOCK POST RESULTS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.certNoteFooter}>
                  <CheckCircle size={16} className={styles.noteIcon} />
                  <span>
                    Once unlocked, this verified e-certificate includes a scannable QR code suitable for university MAR (Mandatory Additional Requirements) activity submissions.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 3: ACADEMIC DETAILS
          ══════════════════════════════════════════════════ */}
          {activeTab === "details" && (
            <div className={styles.tabContent}>
              <div className={styles.detailsCard}>
                <div className={styles.detailsHeader}>
                  <h3>Student Profile & Institutional Information</h3>
                  <p>Used for official communications, winner notifications, and certificate issuance.</p>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Full Name:</span>
                    <strong className={styles.infoValue}>{currentUser.name}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email Address:</span>
                    <strong className={styles.infoValue}>{currentUser.email}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Roll / Student ID:</span>
                    <strong className={styles.infoValue}>{currentUser.rollNumber}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Department:</span>
                    <strong className={styles.infoValue}>{currentUser.department}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Studying Year:</span>
                    <strong className={styles.infoValue}>{currentUser.currentYear}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Mobile Number:</span>
                    <strong className={styles.infoValue}>{currentUser.mobileNumber}</strong>
                  </div>
                  <div className={styles.infoItem} style={{ gridColumn: "1 / -1" }}>
                    <span className={styles.infoLabel}>Institution / College:</span>
                    <strong className={styles.infoValue}>{currentUser.collegeName || "Heritage Institute of Technology"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
