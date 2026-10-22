"use client";

import { useState, useEffect, useCallback } from "react";
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
  Lock,
  RefreshCw,
  PlayCircle,
  Image as ImageIcon,
  Edit3,
  X
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, checkAuthSession, updateProfile } from "@/redux/slices/authSlice";
import { fetchMySubmissions, updateProfileOnServer, getMyNavmedhaCertificates } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import styles from "./page.module.css";

interface NormalizedEntry {
  id: string;
  entryNumber: string;
  category: "photography" | "artworks" | "content" | "reels";
  categoryLabel: string;
  title: string;
  description?: string;
  content?: string;
  mediaUrl?: string;
  paymentStatus: "Pending" | "Verified" | "Rejected";
  utrNumber?: string;
  paymentScreenshotUrl?: string;
  instagramStatus?: string;
  submittedAt: string;
}

const DEPARTMENT_OPTIONS = [
  "CSE",
  "CSE-DS",
  "CSE-CS",
  "CSE-AIML",
  "ECE",
  "EE",
  "CHE",
  "AEIE",
  "ME",
  "IT",
  "BT",
  "AGE",
  "CE",
  "FT",
  "Other",
];

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { submissions: localSubmissions } = useAppSelector((state) => state.submission);

  const [activeTab, setActiveTab] = useState<"submissions" | "certificate" | "details">("submissions");
  const [selectedSubmissionForCert, setSelectedSubmissionForCert] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [backendSubmissions, setBackendSubmissions] = useState<NormalizedEntry[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    rollNumber: "",
    department: "CSE",
    currentYear: "1st Year",
    mobileNumber: "",
    collegeName: "Haldia Institute of Technology",
  });
  const [customDept, setCustomDept] = useState("");

  const openEditModal = () => {
    if (!user) return;
    const isKnown = DEPARTMENT_OPTIONS.includes(user.department || "");
    setEditForm({
      name: user.name || "",
      rollNumber: user.rollNumber || "",
      department: isKnown ? (user.department || "CSE") : "Other",
      currentYear: user.currentYear || "1st Year",
      mobileNumber: user.mobileNumber || "",
      collegeName: user.collegeName || "Haldia Institute of Technology",
    });
    setCustomDept(!isKnown ? (user.department || "") : "");
    setEditError(null);
    setEditSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccessMsg(null);

    const finalDept = editForm.department === "Other"
      ? (customDept.trim() || "Other")
      : (editForm.department.trim() || "Other");

    if (!editForm.name.trim()) {
      setEditError("Full name is required.");
      return;
    }
    if (!editForm.rollNumber.trim()) {
      setEditError("Roll number is required.");
      return;
    }
    if (!editForm.mobileNumber.trim() || editForm.mobileNumber.length < 10) {
      setEditError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateProfileOnServer({
        displayName: editForm.name.trim(),
        rollNumber: editForm.rollNumber.trim(),
        department: finalDept,
        batch: editForm.currentYear,
        phone: editForm.mobileNumber.trim(),
        college: editForm.collegeName.trim(),
      });

      if (res.success) {
        dispatch(
          updateProfile({
            name: editForm.name.trim(),
            rollNumber: editForm.rollNumber.trim(),
            department: finalDept,
            currentYear: editForm.currentYear,
            mobileNumber: editForm.mobileNumber.trim(),
            collegeName: editForm.collegeName.trim(),
          })
        );
        setEditSuccessMsg("Profile updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccessMsg(null);
        }, 1200);
      } else {
        setEditError(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setEditError(err.message || "Network error while updating profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    dispatch(checkAuthSession());
  }, [dispatch]);

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setBackendSubmissions([]);
      return;
    }
    setIsLoadingSubmissions(true);
    setSubmissionError(null);

    try {
      const res = await fetchMySubmissions();
      if (res.success && res.data) {
        const normalized: NormalizedEntry[] = [];

        // 1. Photography
        if (Array.isArray(res.data.photo)) {
          res.data.photo.forEach((p: any) => {
            normalized.push({
              id: p._id,
              entryNumber: p.entryNumber || `NM26-PH-${p._id?.slice(-3)}`,
              category: "photography",
              categoryLabel: "Photography",
              title: p.caption || "Festival Moments",
              description: p.cameraOrDevice ? `Shot on: ${p.cameraOrDevice}` : undefined,
              mediaUrl: p.photoUrl,
              paymentStatus: p.paymentStatus || "Pending",
              utrNumber: p.utrNumber,
              paymentScreenshotUrl: p.paymentScreenshotUrl,
              instagramStatus: p.instagramStatus,
              submittedAt: p.createdAt || new Date().toISOString(),
            });
          });
        }

        // 2. Artworks
        if (Array.isArray(res.data.art)) {
          res.data.art.forEach((a: any) => {
            normalized.push({
              id: a._id,
              entryNumber: a.entryNumber || `NM26-AR-${a._id?.slice(-3)}`,
              category: "artworks",
              categoryLabel: "Artwork",
              title: a.titleOfArtwork || "Creative Artwork",
              description: a.artType ? `Type: ${a.artType}${a.description ? ` • ${a.description}` : ""}` : a.description,
              mediaUrl: a.artworkUrl,
              paymentStatus: a.paymentStatus || "Pending",
              utrNumber: a.utrNumber,
              paymentScreenshotUrl: a.paymentScreenshotUrl,
              submittedAt: a.createdAt || new Date().toISOString(),
            });
          });
        }

        // 3. Writing
        if (Array.isArray(res.data.writing)) {
          res.data.writing.forEach((w: any) => {
            normalized.push({
              id: w._id,
              entryNumber: w.entryNumber || `NM26-CW-${w._id?.slice(-3)}`,
              category: "content",
              categoryLabel: "Writing & Poetry",
              title: w.titleOfPiece || "Literary Piece",
              description: `${w.genre || "Creative"} • ${w.language || "English"}`,
              content: w.content,
              mediaUrl: w.documentPdfUrl,
              paymentStatus: w.paymentStatus || "Pending",
              utrNumber: w.utrNumber,
              paymentScreenshotUrl: w.paymentScreenshotUrl,
              submittedAt: w.createdAt || new Date().toISOString(),
            });
          });
        }

        // 4. Reels
        if (Array.isArray(res.data.reels)) {
          res.data.reels.forEach((r: any) => {
            normalized.push({
              id: r._id,
              entryNumber: r.entryNumber || `NM26-RL-${r._id?.slice(-3)}`,
              category: "reels",
              categoryLabel: "Reel / Short Video",
              title: r.reelTitle || "Reel Masterpiece",
              description: `${r.reelGenre || "Creative"}${r.instagramHandle ? ` • @${r.instagramHandle.replace("@", "")}` : ""}`,
              mediaUrl: r.videoDriveLink,
              paymentStatus: r.paymentStatus || "Pending",
              utrNumber: r.utrNumber,
              paymentScreenshotUrl: r.paymentScreenshotUrl,
              submittedAt: r.createdAt || new Date().toISOString(),
            });
          });
        }

        // Sort descending by submission date
        normalized.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setBackendSubmissions(normalized);
      }
    } catch (err: any) {
      setSubmissionError(err?.message || "Failed to load submissions from server.");
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [user]);

  const loadCertificates = useCallback(async () => {
    if (!user) return;
    setIsLoadingCertificates(true);
    try {
      const res = await getMyNavmedhaCertificates();
      if (res.success && Array.isArray(res.data)) {
        setIssuedCertificates(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch Navmedha certificates:", err);
    } finally {
      setIsLoadingCertificates(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubmissions();
    loadCertificates();
  }, [loadSubmissions, loadCertificates]);

  // If user is not logged in, show prompt or sample login view
  const handleLogout = () => {
    setBackendSubmissions([]);
    dispatch(logout());
    dispatch(clearSubmissions());
    router.push("/login");
  };

  // Convert local submissions to NormalizedEntry format for guest preview mode only
  const localNormalized: NormalizedEntry[] = localSubmissions.map((s) => ({
    id: s.id,
    entryNumber: s.id,
    category: s.category,
    categoryLabel: s.category === "photography" ? "Photography" : s.category === "artworks" ? "Artwork" : s.category === "content" ? "Writing & Poetry" : "Reel",
    title: s.title,
    description: s.description,
    paymentStatus: (s.status === "Verified" ? "Verified" : "Pending") as any,
    utrNumber: s.transactionId,
    submittedAt: s.submittedAt,
  }));

  // For logged-in users, ALWAYS use their verified backend submissions from their account.
  // Never show another account's cached local submissions.
  const displaySubmissions: NormalizedEntry[] = user 
    ? backendSubmissions 
    : [];

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
    collegeName: "Haldia Institute of Technology",
    isAuthenticated: false,
  };

  const getStatusBadge = (status: "Pending" | "Verified" | "Rejected") => {
    switch (status) {
      case "Verified":
        return (
          <span className={styles.statusBadgeVerified}>
            <CheckCircle size={13} />
            <span>Verified & Approved</span>
          </span>
        );
      case "Rejected":
        return (
          <span className={styles.statusBadgeRejected}>
            <AlertCircle size={13} />
            <span>Needs Correction</span>
          </span>
        );
      case "Pending":
      default:
        return (
          <span className={styles.statusBadgeReview}>
            <Clock size={13} />
            <span>Payment Under Review</span>
          </span>
        );
    }
  };

  if (!mounted) {
    return (
      <main className={styles.profilePage}>
        <Navbar />
        <section className={styles.profileSection}>
          <div className={styles.container}>
            <div style={{ minHeight: "450px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#92400e" }}>
                <p style={{ fontSize: "15px", fontWeight: 600 }}>Loading profile details...</p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

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
                  <span>{currentUser.department}</span> • <span>{currentUser.collegeName || "Haldia Institute of Technology"}</span> • <span>Roll: {currentUser.rollNumber}</span>
                </p>
                <div className={styles.contactPills}>
                  <span className={styles.pill}><Mail size={13} /> {currentUser.email}</span>
                  <span className={styles.pill}><Phone size={13} /> {currentUser.mobileNumber}</span>
                </div>
              </div>

              {user && (
                <div className={styles.bannerActions}>
                  <button onClick={openEditModal} className={styles.editProfileBtn} title="Edit Profile Details">
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
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
              <span>You are viewing in preview mode. <Link href="/login"><strong>Sign in with Google</strong></Link> to view and manage your verified festival entries permanently.</span>
            </div>
          )}

          {/* ─── NAVIGATION TABS ─── */}
          <div className={styles.profileTabs}>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`${styles.tabBtn} ${activeTab === "submissions" ? styles.tabActive : ""}`}
            >
              <FileText size={18} />
              <span>My Submissions ({displaySubmissions.length})</span>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#78350f", fontWeight: 600 }}>
                  Showing your official NAVMEDHA entries and verification progress
                </p>
                {user && (
                  <button 
                    onClick={loadSubmissions} 
                    disabled={isLoadingSubmissions}
                    className={styles.refreshBtn}
                    title="Refresh submission statuses"
                  >
                    <RefreshCw size={14} className={isLoadingSubmissions ? "spinning" : ""} />
                    <span>{isLoadingSubmissions ? "Updating..." : "Refresh Status"}</span>
                  </button>
                )}
              </div>

              {displaySubmissions.length === 0 ? (
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
                  {displaySubmissions.map((entry) => (
                    <div key={entry.id} className={styles.submissionCard}>
                      <div className={styles.cardTopRow}>
                        <span className={styles.categoryBadge}>
                          {entry.categoryLabel.toUpperCase()}
                        </span>
                        {getStatusBadge(entry.paymentStatus)}
                      </div>

                      <h3 className={styles.submissionTitle}>{entry.title}</h3>
                      {entry.description && (
                        <p className={styles.submissionDesc}>{entry.description}</p>
                      )}

                      {/* Visual Media Preview if Photo or Artwork */}
                      {(entry.category === "photography" || entry.category === "artworks") && entry.mediaUrl && (
                        <div className={styles.mediaThumbnailWrap}>
                          <Image
                            src={entry.mediaUrl}
                            alt={entry.title}
                            fill
                            unoptimized
                            className={styles.mediaThumbnail}
                            sizes="(max-width: 768px) 100vw, 360px"
                          />
                        </div>
                      )}

                      {/* Text content snippet for writing */}
                      {entry.category === "content" && entry.content && (
                        <div className={styles.contentSnippet}>
                          {entry.content.slice(0, 240)}
                          {entry.content.length > 240 ? "..." : ""}
                        </div>
                      )}

                      {/* File / Link Reference */}
                      <div className={styles.fileMetaCard}>
                        <div className={styles.fileIconWrap}>
                          {entry.category === "reels" ? (
                            <PlayCircle size={20} />
                          ) : (entry.category === "photography" || entry.category === "artworks") ? (
                            <ImageIcon size={20} />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>
                        <div className={styles.fileMetaText}>
                          <strong>Entry Code: {entry.entryNumber}</strong>
                          {entry.mediaUrl ? (
                            <a
                              href={entry.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.viewMediaLink}
                            >
                              <span>
                                {entry.category === "reels" 
                                  ? "Watch on Google Drive" 
                                  : entry.category === "content" 
                                    ? "Open Attached PDF" 
                                    : "View High-Res Artwork"}
                              </span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span>Text Submission Stored in Database</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.entryFooter}>
                        <div className={styles.footerDetail}>
                          <span>Txn Ref (UTR):</span>
                          <code>{entry.utrNumber || "Verified"}</code>
                        </div>
                        <div className={styles.footerDetail}>
                          <span>Submitted:</span>
                          <code>{new Date(entry.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</code>
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
              {/* ── Loading skeleton while certificates are being fetched ── */}
              {isLoadingCertificates && (
                <div className={styles.certCardSection} style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", color: "var(--accent-primary, #a855f7)", marginBottom: "0.75rem" }} />
                  <p style={{ color: "var(--text-secondary, #94a3b8)", fontSize: "0.95rem" }}>Loading your certificates…</p>
                </div>
              )}

              {/* ── Live Issued Certificates ── */}
              {!isLoadingCertificates && issuedCertificates.length > 0 && (
                <div className={styles.certCardSection}>
                  <div className={styles.certStatusBanner} style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))", borderColor: "rgba(34,197,94,0.3)" }}>
                    <div className={styles.lockIconWrap} style={{ background: "rgba(34,197,94,0.15)" }}>
                      <CheckCircle size={28} style={{ color: "#22c55e" }} />
                    </div>
                    <div className={styles.certStatusText}>
                      <h3 style={{ color: "#22c55e" }}>🎉 Your Certificates Are Ready!</h3>
                      <p>
                        Official <strong>QR-Verifiable Certificates of Appreciation</strong> issued by <strong>Eklavya Official ✕ NAVMEDHA</strong> are now available for high-res download.
                      </p>
                    </div>
                  </div>

                  {/* Certificate cards grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem", marginTop: "1.5rem" }}>
                    {issuedCertificates.map((cert: any, idx: number) => {
                      const reg = cert.registration || {};
                      const categoryLabel =
                        cert.registrationModel === "navmedha_photos" ? "Photography" :
                        cert.registrationModel === "navmedha_artwork" ? "Artwork" :
                        cert.registrationModel === "navmedha_writing" ? "Writing & Poetry" :
                        cert.registrationModel === "navmedha_reel" ? "Reel / Short Video" :
                        "Participation";
                      const entryTitle =
                        reg.caption || reg.titleOfArtwork || reg.titleOfPiece || reg.reelTitle || categoryLabel;

                      return (
                        <div
                          key={cert._id || idx}
                          style={{
                            background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(59,130,246,0.05))",
                            border: "1px solid rgba(168,85,247,0.18)",
                            borderRadius: "1rem",
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(168,85,247,0.15)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                        >
                          {/* Category badge */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "999px",
                              background: "rgba(168,85,247,0.15)",
                              color: "#c084fc",
                            }}>{categoryLabel}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)" }}>
                              {cert.verification_code ? `#${cert.verification_code.slice(0, 8).toUpperCase()}` : ""}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary, #f1f5f9)" }}>
                            {entryTitle}
                          </h4>

                          {/* Participant details */}
                          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.5 }}>
                            {reg.name || currentUser.name} {reg.department ? `• ${reg.department}` : ""} {reg.rollNumber ? `• ${reg.rollNumber}` : ""}
                          </p>

                          {/* Certificate thumbnail preview with cache-busting for regenerated certs */}
                          {cert.certificate?.url && (
                            <div style={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: "1.414 / 1",
                              borderRadius: "0.6rem",
                              overflow: "hidden",
                              border: "1px solid rgba(255,255,255,0.08)",
                              marginTop: "0.25rem",
                            }}>
                              <Image
                                src={`${cert.certificate.url}${cert.updatedAt ? `?v=${new Date(cert.updatedAt).getTime()}` : ''}`}
                                alt={`Certificate - ${categoryLabel}`}
                                fill
                                unoptimized
                                style={{ objectFit: "cover" }}
                                sizes="(max-width: 768px) 100vw, 320px"
                              />
                            </div>
                          )}

                          {/* Download button */}
                          <a
                            href={`${cert.certificate?.url}${cert.updatedAt ? `?v=${new Date(cert.updatedAt).getTime()}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                              marginTop: "0.5rem",
                              padding: "0.7rem 1.25rem",
                              borderRadius: "0.6rem",
                              background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: "0.88rem",
                              textDecoration: "none",
                              transition: "opacity 0.2s ease, transform 0.15s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                          >
                            <Download size={16} />
                            Download Certificate
                          </a>

                          {/* Issue / Update date */}
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted, #64748b)" }}>
                            {cert.updatedAt && cert.updatedAt !== cert.createdAt
                              ? `Updated: ${new Date(cert.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                              : `Issued: ${new Date(cert.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.certNoteFooter}>
                    <CheckCircle size={16} className={styles.noteIcon} />
                    <span>
                      These QR-verified e-certificates are suitable for university MAR (Mandatory Additional Requirements) activity submissions.
                    </span>
                  </div>
                </div>
              )}

              {/* ── No certificates yet — show locked placeholder ── */}
              {!isLoadingCertificates && issuedCertificates.length === 0 && (
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
                              for active participation & artistic excellence in the category of <strong>{displaySubmissions[0]?.category?.toUpperCase() || "CREATIVE EXPRESSION"}</strong> during the festive festival confluence of Durga Puja 2026.
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
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 3: ACADEMIC DETAILS
          ══════════════════════════════════════════════════ */}
          {activeTab === "details" && (
            <div className={styles.tabContent}>
              <div className={styles.detailsCard}>
                <div className={styles.detailsHeader}>
                  <div className={styles.detailsHeaderRow}>
                    <div>
                      <h3>Student Profile &amp; Institutional Information</h3>
                      <p>Used for official communications, winner notifications, and certificate issuance.</p>
                    </div>
                    {user && (
                      <button onClick={openEditModal} className={styles.cardEditBtn}>
                        <Edit3 size={15} />
                        <span>Edit Details</span>
                      </button>
                    )}
                  </div>
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
                    <strong className={styles.infoValue}>{currentUser.collegeName || "Haldia Institute of Technology"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── EDIT PROFILE MODAL ─── */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile Information</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsEditModalOpen(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #f87171", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "0.88rem", fontWeight: 600 }}>
                ⚠️ {editError}
              </div>
            )}

            {editSuccessMsg && (
              <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "0.88rem", fontWeight: 600 }}>
                ✓ {editSuccessMsg}
              </div>
            )}

            <form className={styles.modalForm} onSubmit={handleSaveProfile}>
              <div className={styles.modalFormGroup}>
                <label><User size={15} /> Full Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Priyanshu Singha Roy"
                  required
                />
              </div>

              <div className={styles.modalFormRow}>
                <div className={styles.modalFormGroup}>
                  <label><Hash size={15} /> College / Class Roll No *</label>
                  <input
                    type="text"
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    placeholder="e.g. 23/ECE/107"
                    required
                  />
                </div>
                <div className={styles.modalFormGroup}>
                  <label><Phone size={15} /> Mobile / WhatsApp No *</label>
                  <input
                    type="tel"
                    value={editForm.mobileNumber}
                    onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div className={styles.modalFormGroup}>
                  <label><Building2 size={15} /> Department / Stream *</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    required
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {editForm.department === "Other" && (
                    <input
                      type="text"
                      placeholder="Specify your department"
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      style={{ marginTop: "6px" }}
                      required
                    />
                  )}
                </div>
                <div className={styles.modalFormGroup}>
                  <label><Calendar size={15} /> Studying Year *</label>
                  <select
                    value={editForm.currentYear}
                    onChange={(e) => setEditForm({ ...editForm, currentYear: e.target.value })}
                    required
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate / Masters</option>
                    <option value="School / General">School / General Public</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFormGroup}>
                <label><GraduationCap size={15} /> College / University / Organization</label>
                <input
                  type="text"
                  value={editForm.collegeName}
                  onChange={(e) => setEditForm({ ...editForm, collegeName: e.target.value })}
                  placeholder="e.g. Haldia Institute of Technology"
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelModalBtn}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveModalBtn}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
