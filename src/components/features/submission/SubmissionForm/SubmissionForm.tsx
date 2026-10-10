"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Upload, 
  Check, 
  Copy, 
  CheckCheck, 
  ArrowLeft, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  AlertCircle,
  FileCheck2,
  Sparkles,
  Lock,
  Trophy,
  Award,
  ExternalLink
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  submitStart,
  submitSuccess,
  submitFailure,
  resetSubmissionStatus,
} from "@/redux/slices/submissionSlice";
import { CategoryConfig } from "@/config/categories";
import { getLiveConfig } from "@/redux/slices/configSlice";
import {
  uploadCreativeAsset,
  uploadVideoToDrive,
  uploadPaymentReceipt,
  submitPhotoEntry,
  submitArtEntry,
  submitWritingEntry,
  submitReelEntry,
} from "@/services/api";
import styles from "./SubmissionForm.module.css";

interface Props {
  category: CategoryConfig;
}

export function SubmissionForm({ category }: Props) {
  const dispatch = useAppDispatch();
  const { isSubmitting, successMessage, errorMessage } = useAppSelector(
    (state) => state.submission
  );
  const { user } = useAppSelector((state) => state.auth);
  const { data: configData } = useAppSelector((state) => state.config);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(getLiveConfig());
  }, [dispatch]);

  // Sync user details to form when auth state hydrates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.mobileNumber || "",
      }));
    }
  }, [user]);

  const [step, setStep] = useState<1 | 2>(1);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.mobileNumber || "",
    instagramHandle: "",
    theme: category.themes[0]?.name || "",
    title: "",
    description: "",
    transactionId: "",
    followedEklavya: false,
    agreeToRules: false,
  });

  // Direct File Upload State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Payment Screenshot State
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [isDraggingPayment, setIsDraggingPayment] = useState(false);
  const paymentInputRef = useRef<HTMLInputElement>(null);

  // Local Validation Errors
  const [stepError, setStepError] = useState<string | null>(null);

  // Payment QR Options State
  const QR_OPTIONS = [
    {
      id: "kousani",
      name: "Kousani Banerjee",
      upiId: "ibanerjee150@oksbi",
      image: "/assets/QRa/qr-kousani.jpeg",
    },
    {
      id: "abhinav",
      name: "Abhinav Maiti",
      upiId: "abhinavmaiti01@okaxis",
      image: "/assets/QRa/qr-abhinav.jpeg",
    },
  ];
  const [selectedQrIndex, setSelectedQrIndex] = useState(0);

  const activeQr = QR_OPTIONS[selectedQrIndex];
  const UPI_ID = activeQr.upiId;
  const ENTRY_FEE = 9;
  const rawHandle = "eklavyaofficial_";
  const cleanHandle = "eklavyaofficial_";
  const INSTAGRAM_URL = `https://www.instagram.com/${cleanHandle}`;

  const handleCopyUpi = (upiToCopy: string = UPI_ID) => {
    navigator.clipboard.writeText(upiToCopy);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleMediaSelect = (file: File) => {
    // Check max size
    const maxBytes = category.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setStepError(`File size exceeds limit (${category.maxSizeMB} MB). Please choose a smaller file.`);
      return;
    }

    setStepError(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;

        // For photography and artwork: Validate Instagram aspect ratio (4:5 = 0.80 to 1.91:1)
        if (category.id === "photography" || category.id === "artworks") {
          const img = new window.Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            // Strict Meta Instagram feed bounds with small 0.01 tolerance
            if (ratio < 0.79 || ratio > 1.92) {
              setMediaFile(null);
              setMediaPreview(null);
              if (mediaInputRef.current) mediaInputRef.current.value = "";
              setStepError(
                `⚠️ Aspect Ratio Error: Your image is ${img.width}×${img.height} (ratio ${ratio.toFixed(2)}:1). ` +
                `Instagram requires photos and artworks to have an aspect ratio between 4:5 (0.80 portrait) and 1.91:1 (landscape). ` +
                `Please crop your image to a standard 4:5 portrait, 1:1 square, or 16:9 landscape before uploading.`
              );
              return;
            }

            setStepError(null);
            setMediaFile(file);
            setMediaPreview(result);
          };
          img.src = result;
        } else {
          setMediaFile(file);
          setMediaPreview(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setMediaFile(file);
      setMediaPreview(null);
    }
  };

  const handlePaymentScreenshotSelect = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setStepError("Payment screenshot should be under 15 MB.");
      return;
    }
    setStepError(null);
    setPaymentScreenshot(file);

    const reader = new FileReader();
    reader.onload = (e) => setPaymentPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (!formData.theme) {
      setStepError("Please select a theme for your submission.");
      return;
    }

    if (!mediaFile) {
      setStepError(`Please upload your ${category.title} file before proceeding.`);
      return;
    }

    if (!formData.followedEklavya) {
      setStepError(`Please follow @${cleanHandle} on Instagram and check the verification box to proceed.`);
      return;
    }

    setStep(2);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (!mediaFile) {
      setStepError(`Please upload your ${category.title} file in Step 1.`);
      setStep(1);
      return;
    }

    if (!paymentScreenshot) {
      setStepError("Please upload your payment screenshot / transaction confirmation.");
      return;
    }

    if (!formData.transactionId.trim()) {
      setStepError("Please enter your UPI / Bank Transaction ID (UTR / Reference No).");
      return;
    }

    if (!formData.agreeToRules) {
      setStepError("Please confirm agreement to the competition rules and originality guidelines.");
      return;
    }

    dispatch(submitStart());

    const currentMedia = mediaFile;
    const currentPayment = paymentScreenshot;

    try {
      // ── Step A: Upload creative asset ──
      // Reels go to Google Drive; Everything else goes to Cloudinary
      let mediaUrl = "";

      if (mediaFile) {
        const mediaRes = category.id === "reels"
          ? await uploadVideoToDrive(mediaFile)
          : await uploadCreativeAsset(mediaFile);

        if (!mediaRes.success || !mediaRes.url) {
          dispatch(submitFailure(mediaRes.message || "Failed to upload your creative file. Please try again."));
          return;
        }
        mediaUrl = mediaRes.url;
      }

      // ── Step B: Upload payment screenshot to Cloudinary ──
      const payRes = await uploadPaymentReceipt(currentPayment);
      if (!payRes.success || !payRes.url) {
        dispatch(submitFailure(payRes.message || "Failed to upload payment screenshot. Please try again."));
        return;
      }
      const paymentUrl = payRes.url;

      // ── Step C: Build common participant fields from user profile ──
      const commonPayload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: user?.collegeName || "Heritage Institute of Technology",
        department: user?.department || "CSE",
        year: user?.currentYear || "3rd Year",
        rollNumber: user?.rollNumber || "",
        utrNumber: formData.transactionId.trim(),
        paymentScreenshotUrl: paymentUrl,
        theme: formData.theme,
      };

      // ── Step D: Call the right category-specific submit endpoint ──
      let submitRes;

      switch (category.id) {
        case "photography":
          submitRes = await submitPhotoEntry({
            ...commonPayload,
            photoUrl: mediaUrl,
            caption: formData.description,
          });
          break;

        case "artworks":
          submitRes = await submitArtEntry({
            ...commonPayload,
            artworkUrl: mediaUrl,
            titleOfArtwork: formData.title,
            artType: "Other",
            description: formData.description,
          });
          break;

        case "content":
          submitRes = await submitWritingEntry({
            ...commonPayload,
            titleOfPiece: formData.title,
            genre: "Other",
            language: "English",
            content: formData.description.trim() || undefined,
            documentPdfUrl: mediaUrl || undefined,
          });
          break;

        case "reels":
          submitRes = await submitReelEntry({
            ...commonPayload,
            reelTitle: formData.title,
            reelGenre: "Other Creative",
            videoDriveLink: mediaUrl,
            instagramHandle: formData.instagramHandle,
            caption: formData.description,
          });
          break;

        default:
          dispatch(submitFailure("Unknown category. Please refresh and try again."));
          return;
      }

      if (!submitRes.success) {
        dispatch(submitFailure(submitRes.message || "Submission failed. Please try again."));
        return;
      }

      // ── Step E: Dispatch success to Redux ──
      dispatch(
        submitSuccess({
          category: category.id,
          theme: formData.theme,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          instagramHandle: formData.instagramHandle,
          title: formData.title,
          description: formData.description,
          fileName: currentMedia?.name || "file-submission",
          fileSize: currentMedia?.size || 0,
          fileType: currentMedia?.type || "application/octet-stream",
          fileDataUrl: mediaPreview || undefined,
          paymentScreenshotName: currentPayment.name,
          paymentScreenshotDataUrl: paymentPreview || undefined,
          transactionId: formData.transactionId,
          followedEklavya: formData.followedEklavya,
          agreeToRules: formData.agreeToRules,
          userId: user?.id,
        })
      );
    } catch (err: any) {
      dispatch(submitFailure(err?.message || "An unexpected error occurred. Please check your connection and try again."));
    }
  };

  if (successMessage) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <Image
              src="/assets/giftsicon.png"
              alt="Success"
              width={140}
              height={140}
              className="floating"
            />
          </div>
          <h3 className={styles.successTitle}>Entry Successfully Registered!</h3>
          <p className={styles.successMessage}>{successMessage}</p>
          
          <div className={styles.submittedDetails}>
            <div className={styles.detailRow}>
              <span>Category:</span>
              <strong>{category.bengaliTitle} {category.subtitle}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Selected Theme:</span>
              <strong style={{ color: "#991b1b" }}>{formData.theme}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Masterpiece Title:</span>
              <strong>{formData.title}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Participant:</span>
              <strong>{formData.fullName}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Uploaded Asset:</span>
              <strong>{mediaFile?.name} ({(Number(mediaFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Transaction Ref (UTR):</span>
              <strong>{formData.transactionId}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Organized By:</span>
              <strong style={{ color: "#b45309" }}>Eklavya Official ✕ NAVMEDHA</strong>
            </div>
          </div>

          {/* ─── WhatsApp Official Group Invitation ─── */}
          <div className={styles.whatsappCard}>
            <div className={styles.whatsappIconCircle}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <div className={styles.whatsappContent}>
              <h4 className={styles.whatsappTitle}>Join Official WhatsApp Group! 📢</h4>
              <p className={styles.whatsappDesc}>
                Join our official participant community for real-time updates regarding Instagram release dates, jury reviews, and result announcements.
              </p>
              <a
                href="https://chat.whatsapp.com/ECXFW1shYLq68Gi7pvlTf0"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <span>💬 Join WhatsApp Group</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className={styles.successActions}>
            <button
              onClick={() => {
                dispatch(resetSubmissionStatus());
                setStep(1);
                setFormData({
                  fullName: "",
                  email: "",
                  phone: "",
                  instagramHandle: "",
                  theme: category.themes[0]?.name || "",
                  title: "",
                  description: "",
                  transactionId: "",
                  followedEklavya: false,
                  agreeToRules: false,
                });
                setMediaFile(null);
                setMediaPreview(null);
                setPaymentScreenshot(null);
                setPaymentPreview(null);
              }}
              className="secondary-btn"
            >
              Submit Another Entry
            </button>
            <Link href="/" className="hero-btn">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if portal is in Showcase Mode or if this category is closed
  const categoryKey =
    category.id === "artworks"
      ? "artwork"
      : category.id === "content"
      ? "writing"
      : category.id;

  const isPortalClosed = configData ? configData.isLive === false : false;
  const isCategoryDisabled =
    configData?.categories &&
    typeof (configData.categories as any)[categoryKey] === "boolean"
      ? !(configData.categories as any)[categoryKey]
      : false;

  const isShowcaseActive = isPortalClosed || isCategoryDisabled;

  // Prevent SSR hydration mismatch between unauthenticated server HTML and authenticated client state
  if (!mounted) {
    return (
      <div className={styles.formContainer} style={{ minHeight: "360px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <p style={{ fontSize: "14px", fontWeight: 500 }}>Loading entry form...</p>
        </div>
      </div>
    );
  }

  // ── Authentication Guard: Must login before registering ──
  if (!user && !isShowcaseActive) {
    return (
      <div className={styles.loginRequiredCard}>
        <div className={styles.loginRequiredHeader}>
          <div className={styles.loginRequiredIconWrap}>
            <Lock size={40} />
          </div>
          <h2 className={styles.loginRequiredTitle}>Login Required</h2>
          <p className={styles.loginRequiredSubtitle}>
            You must be logged in to register for <strong>{category.title}</strong> at NAVMEDHA 2026.
          </p>
        </div>

        <div className={styles.loginRequiredBanner}>
          <ShieldCheck size={22} />
          <div>
            <h4>Why do I need to login?</h4>
            <p>
              Your Eklavya account links your submissions, tracks payment verification,
              and enables certificate generation with QR verification after results.
            </p>
          </div>
        </div>

        <div className={styles.loginRequiredPerks}>
          <div className={styles.loginRequiredPerkItem}>
            <Trophy size={18} />
            <span>Submit entries & track status</span>
          </div>
          <div className={styles.loginRequiredPerkItem}>
            <Award size={18} />
            <span>Get verified digital certificates</span>
          </div>
          <div className={styles.loginRequiredPerkItem}>
            <Sparkles size={18} />
            <span>Featured on Official Instagram</span>
          </div>
        </div>

        <div className={styles.loginRequiredActions}>
          <Link
            href={`/login?redirect=${encodeURIComponent(`/submission/${category.id}`)}`}
            className="hero-btn"
            style={{ width: "100%", justifyContent: "center", fontSize: "1.05rem" }}
          >
            <span>Sign in with Google to Continue</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/" className="secondary-btn" style={{ width: "100%", justifyContent: "center" }}>
            <span>Return to Homepage</span>
          </Link>
        </div>

        <p className={styles.loginRequiredNote}>
          ✦ You'll be redirected right back here after signing in.
        </p>
      </div>
    );
  }

  if (isShowcaseActive) {
    return (
      <div className={styles.showcaseCard}>
        <div className={styles.showcaseHeader}>
          <div className={styles.showcaseKicker}>
            <Sparkles size={16} />
            <span>NAVMEDHA SHOWCASE MODE ACTIVE</span>
          </div>
          <h2 className={styles.showcaseTitle}>{category.title} Showcase</h2>
          <p className={styles.showcaseSubtitle}>
            {isCategoryDisabled && !isPortalClosed
              ? `Submissions for ${category.title} are currently closed for this edition. Other categories may still be open.`
              : "Registrations for NAVMEDHA 2026 are currently closed. The portal is in Showcase Mode celebrating creative excellence!"}
          </p>
        </div>

        <div className={styles.showcaseStatusBanner}>
          <div className={styles.showcaseLockIcon}>
            <Lock size={22} />
          </div>
          <div className={styles.showcaseStatusText}>
            <h4>Registrations Closed</h4>
            <p>
              No new submissions or payment uploads are being accepted right now.
              Evaluation by the official jury and certificate preparation is underway.
            </p>
          </div>
        </div>

        <div className={styles.showcasePerksGrid}>
          <div className={styles.showcasePerkItem}>
            <div className={styles.perkIconWrap}>
              <Trophy size={20} />
            </div>
            <div>
              <h5>Official Recognition</h5>
              <p>Top artworks, reels, and writings will be awarded official certificates, trophies, and festive hampers.</p>
            </div>
          </div>

          <div className={styles.showcasePerkItem}>
            <div className={styles.perkIconWrap}>
              <Award size={20} />
            </div>
            <div>
              <h5>Verified Certificates</h5>
              <p>Official Eklavya NAVMEDHA digital certificates with QR verification.</p>
            </div>
          </div>

          <div className={styles.showcasePerkItem}>
            <div className={styles.perkIconWrap}>
              <ExternalLink size={20} />
            </div>
            <div>
              <h5>Featured on Instagram</h5>
              <p>Curated participant creations are showcased across our official social channels.</p>
            </div>
          </div>
        </div>

        <div className={styles.showcaseNoteBox}>
          <p>
            ✦ <strong>Explore Guidelines on the Left:</strong> You can review the official
            themes, format specifications, and evaluation criteria in the sidebar to see what this category celebrates.
          </p>
        </div>

        <div className={styles.showcaseActions}>
          <Link href="/#categories" className="hero-btn">
            <span>Explore Other Categories</span>
            <span>✦</span>
          </Link>
          <a
            href="https://www.instagram.com/navmedha3.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
          >
            <span>Visit @navmedha3.0 on Instagram</span>
            <ExternalLink size={16} />
          </a>
          <Link href="/#gallery" className="secondary-btn">
            <span>Hall of Memories</span>
            <span>↓</span>
          </Link>
          {user && (
            <Link href="/profile" className="secondary-btn">
              <span>My Profile &amp; Submissions</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {/* ─── FORM HEADER ─── */}
      <div className={styles.formHeader}>
        <h2>Participant Entry Form</h2>
        <p>Fill in all the required details to lock your spot in NAVMEDHA 2026.</p>
      </div>

      {/* ─── 2-STEP PROGRESS BAR ─── */}
      <div className={styles.wizardProgress}>
        <div className={`${styles.wizardStep} ${step === 1 ? styles.wizardActive : styles.wizardCompleted}`}>
          <div className={styles.wizardBadge}>
            {step > 1 ? <Check size={16} /> : "1"}
          </div>
          <div className={styles.wizardInfo}>
            <span className={styles.wizardStepNum}>STEP 1</span>
            <span className={styles.wizardStepTitle}>Artwork & Participant Info</span>
          </div>
        </div>

        <div className={styles.wizardDivider} />

        <div className={`${styles.wizardStep} ${step === 2 ? styles.wizardActive : ""}`}>
          <div className={styles.wizardBadge}>2</div>
          <div className={styles.wizardInfo}>
            <span className={styles.wizardStepNum}>STEP 2</span>
            <span className={styles.wizardStepTitle}>Payment & Final Verification</span>
          </div>
        </div>
      </div>

      {(stepError || errorMessage) && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{stepError || errorMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 1: DETAILS, DIRECT MEDIA UPLOAD & FOLLOW
      ══════════════════════════════════════════════════ */}
      {step === 1 && (
        <form className={styles.submitForm} onSubmit={handleStep1Next}>
          <div className={styles.formSectionHeader}>
            <h3 className={styles.formSectionTitle}>1. Participant Details</h3>
            <p className={styles.formSectionDesc}>Provide your accurate contact information for certificate & prize dispatch.</p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Debolina Banerjee"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="e.g. debolina@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Phone / WhatsApp Number *</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Instagram Handle (@username) *</label>
              <input
                type="text"
                placeholder="@your_handle"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formSectionHeader} style={{ marginTop: "10px" }}>
            <h3 className={styles.formSectionTitle}>2. Entry & Artwork Details</h3>
            <p className={styles.formSectionDesc}>Select your category theme and provide your masterpiece details.</p>
          </div>

          <div className={styles.formGroup}>
            <label>Select Category Theme *</label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              required
              className={styles.themeSelect}
            >
              {category.themes.map((th, idx) => (
                <option key={idx} value={th.name}>
                  {idx + 1}. {th.name} — {th.desc}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              {category.id === "content" ? "Title of Your Written Piece *" : "Title of Your Masterpiece *"}
            </label>
            <input
              type="text"
              placeholder={category.id === "content"
                ? "e.g. Agomoni: Memories of Maa’s Arrival"
                : "e.g. Agomoni: The Divine Radiance of Maa"}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Story / Concept Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Describe the inspiration, techniques, or narrative behind your submission..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Direct File Dropzone */}
          <div className={styles.formGroup}>
            <label>
              Direct File Upload * ({category.acceptedFormats} • Max {category.maxSizeMB} MB)
            </label>
            
            <div
              className={`${styles.dropzone} ${isDraggingMedia ? styles.dropzoneActive : ""} ${mediaFile ? styles.dropzoneFilled : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragLeave={() => setIsDraggingMedia(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingMedia(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleMediaSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => mediaInputRef.current?.click()}
            >
              <input
                type="file"
                ref={mediaInputRef}
                style={{ display: "none" }}
                accept={
                  category.id === "reels"
                    ? "video/mp4"
                    : category.id === "photography"
                    ? "image/jpeg,image/png,image/jpg"
                    : category.id === "content"
                    ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : "image/jpeg,image/png,image/jpg"
                }
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleMediaSelect(e.target.files[0]);
                  }
                }}
              />

              {!mediaFile ? (
                <div className={styles.dropzoneEmpty}>
                  <div className={styles.dropzoneIconWrap}>
                    <Upload className={styles.uploadIcon} />
                  </div>
                  <p className={styles.dropzoneTitle}>
                    Drag & Drop your {category.title} file here, or <span>Browse Files</span>
                  </p>
                  <p className={styles.dropzoneHint}>
                    Direct upload — Supported: {category.acceptedFormats} (Max {category.maxSizeMB}MB)
                    {(category.id === "photography" || category.id === "artworks") && (
                      <span style={{ display: "block", marginTop: "6px", color: "#f59e0b", fontWeight: 600, fontSize: "0.85em" }}>
                        📐 Instagram Aspect Ratio: Must be between 4:5 (portrait) and 1.91:1 (landscape). 1:1, 4:5, 16:9 recommended.
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <div className={styles.dropzonePreview}>
                  {mediaPreview ? (
                    <div className={styles.imgPreviewWrap}>
                      <img src={mediaPreview} alt="Preview" className={styles.imgThumb} />
                    </div>
                  ) : (
                    <FileCheck2 className={styles.fileIcon} size={40} />
                  )}
                  <div className={styles.fileDetails}>
                    <p className={styles.fileName}>{mediaFile.name}</p>
                    <p className={styles.fileSize}>{(mediaFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission</p>
                  </div>
                  <button
                    type="button"
                    className={styles.changeFileBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      mediaInputRef.current?.click();
                    }}
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mandatory Instagram Follow Check Box */}
          <div className={styles.followBox}>
            <div className={styles.followHeader}>
              <div className={styles.instaBadge}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>Mandatory Rule</span>
              </div>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.followLinkBtn}
              >
                Follow @{cleanHandle} ↗
              </a>
            </div>
            <p className={styles.followDesc}>
              To qualify for competition judging, certificate issuance, and live winner announcements, participants must follow our official community handle on Instagram.
            </p>
            <label className={styles.checkboxLabel} style={{ marginTop: "8px" }}>
              <input
                type="checkbox"
                checked={formData.followedEklavya}
                onChange={(e) => setFormData({ ...formData, followedEklavya: e.target.checked })}
                required
              />
              <span className={styles.checkboxText}>
                <strong>I have followed @{cleanHandle} on Instagram</strong> and entered my handle above for verification.
              </span>
            </label>
          </div>

          <div className={styles.formSubmitBtnWrap}>
            <button type="submit" className="hero-btn" style={{ width: "100%", fontSize: "1.05rem" }}>
              <span>Proceed to Step 2: Payment & Final Submit</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 2: PAYMENT (QR / UPI ID) & SS SUBMISSION
      ══════════════════════════════════════════════════ */}
      {step === 2 && (
        <form className={styles.submitForm} onSubmit={handleSubmitFinal}>
          <div className={styles.paymentIntro}>
            <div className={styles.paymentBadge}>
              <QrCode size={20} />
              <span>Step 2 of 2: Registration Fee</span>
            </div>
            <h3 className={styles.formSectionTitle}>Registration & Entry Fee Payment</h3>
            <p className={styles.formSectionDesc}>
              {ENTRY_FEE > 0
                ? `Scan the QR code or copy the official UPI ID to pay the nominal entry fee (₹${ENTRY_FEE} per entry). Upload your payment screenshot and transaction reference below.`
                : "Entry for this edition is Free! Please complete the verification below to register your submission."}
            </p>
          </div>

          {/* Payment Card with QR & UPI Copy */}
          <div className={styles.paymentCard}>
            <div className={styles.qrSide}>
              {/* QR Option Tabs */}
              <div className={styles.qrTabs}>
                {QR_OPTIONS.map((qr, idx) => (
                  <button
                    key={qr.id}
                    type="button"
                    className={`${styles.qrTabBtn} ${selectedQrIndex === idx ? styles.qrTabBtnActive : ""}`}
                    onClick={() => setSelectedQrIndex(idx)}
                  >
                    QR {idx + 1}
                  </button>
                ))}
              </div>

              <div className={styles.qrFrame}>
                <div className={styles.qrCodeWrapper}>
                  <img
                    src={activeQr.image}
                    alt={`${activeQr.name} UPI QR Code`}
                    className={styles.realQrImage}
                  />
                  <span className={styles.qrBadge}>Scan to Pay ₹{ENTRY_FEE}</span>
                </div>
              </div>
            </div>

            <div className={styles.upiSide}>
              <div className={styles.feeTag}>
                <span>Registration Fee:</span>
                <strong>{ENTRY_FEE > 0 ? `₹${ENTRY_FEE} / Entry` : "FREE ENTRY"}</strong>
              </div>

              <div className={styles.upiBox}>
                <span className={styles.upiLabel}>
                  Account Holder: <strong>{activeQr.name}</strong>
                </span>
                <div className={styles.upiValueWrap}>
                  <code className={styles.upiCode}>{activeQr.upiId}</code>
                  <button
                    type="button"
                    onClick={() => handleCopyUpi(activeQr.upiId)}
                    className={styles.copyBtn}
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <CheckCheck size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy UPI
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.paymentAppsNotice}>
                <span>Accepted via: GPay • PhonePe • Paytm • BHIM • Amazon Pay</span>
              </div>
            </div>
          </div>

          {/* Payment Screenshot Dropzone */}
          <div className={styles.formGroup}>
            <label>Upload Payment Screenshot (SS) *</label>
            <div
              className={`${styles.dropzone} ${isDraggingPayment ? styles.dropzoneActive : ""} ${paymentScreenshot ? styles.dropzoneFilled : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPayment(true);
              }}
              onDragLeave={() => setIsDraggingPayment(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPayment(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handlePaymentScreenshotSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => paymentInputRef.current?.click()}
            >
              <input
                type="file"
                ref={paymentInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePaymentScreenshotSelect(e.target.files[0]);
                  }
                }}
              />

              {!paymentScreenshot ? (
                <div className={styles.dropzoneEmpty}>
                  <div className={styles.dropzoneIconWrap}>
                    <Upload className={styles.uploadIcon} />
                  </div>
                  <p className={styles.dropzoneTitle}>
                    Drag & Drop your payment screenshot, or <span>Browse Image</span>
                  </p>
                  <p className={styles.dropzoneHint}>Upload JPG, PNG receipt screenshot showing successful payment</p>
                </div>
              ) : (
                <div className={styles.dropzonePreview}>
                  {paymentPreview && (
                    <div className={styles.imgPreviewWrap}>
                      <img src={paymentPreview} alt="Payment SS" className={styles.imgThumb} />
                    </div>
                  )}
                  <div className={styles.fileDetails}>
                    <p className={styles.fileName}>{paymentScreenshot.name}</p>
                    <p className={styles.fileSize}>
                      {(paymentScreenshot.size / 1024).toFixed(1)} KB • Screenshot Attached
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.changeFileBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      paymentInputRef.current?.click();
                    }}
                  >
                    Change SS
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transaction UTR / Ref Number */}
          <div className={styles.formGroup}>
            <label>UPI Transaction ID / UTR / Reference Number *</label>
            <input
              type="text"
              placeholder="e.g. 428198274918 (12-digit UTR from your UPI receipt)"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              required
            />
            <span className={styles.inputHelp}>
              Enter the 12-digit UTR/Ref number visible in your payment receipt for instant auto-matching.
            </span>
          </div>

          {/* Final Originality Checkbox */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.agreeToRules}
                onChange={(e) => setFormData({ ...formData, agreeToRules: e.target.checked })}
                required
              />
              <span className={styles.checkboxText}>
                I confirm that this is my original creative work adhering to the guidelines of NAVMEDHA 2026 & Eklavya Official.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className={styles.stepActionsRow}>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              <ArrowLeft size={16} />
              <span>Back to Step 1</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="hero-btn"
              style={{ flex: 2, fontSize: "1.05rem", opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <span>Submitting Your Entry...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Complete Final Submission 𑁍</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
