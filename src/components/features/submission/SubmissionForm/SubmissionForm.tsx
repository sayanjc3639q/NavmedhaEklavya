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
  FileCheck2
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

  useEffect(() => {
    dispatch(getLiveConfig());
  }, [dispatch]);

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
  const [mediaDimensions, setMediaDimensions] = useState<{
    width: number;
    height: number;
    aspectRatio: number;
    ratioLabel: string;
    isValidForInstagram: boolean;
  } | null>(null);
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
    setMediaDimensions(null);
    setMediaFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string;
        setMediaPreview(resultUrl);

        // Aspect Ratio & Dimensions check for Photography & Artworks
        if (category.id === "photography" || category.id === "artworks") {
          const img = new window.Image();
          img.onload = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const ratio = w / h; // width / height

            // Instagram Feed limits:
            // Tallest allowed: 4:5 = 0.80 (tolerance 0.78)
            // Widest allowed: 1.91:1 = 1.91 (tolerance 1.93)
            if (ratio < 0.78) {
              setStepError(
                `⚠️ Instagram Framing Error: Your image is too tall (${w}×${h}px, vertical ratio ${(h / w).toFixed(2)}:1). Instagram feed only supports up to 4:5 Portrait (0.80). Images taller than 4:5 (like 9:16 mobile story shots) will get cut off at the top and bottom on Instagram. Please crop your photo to 4:5 Portrait (1080×1350px) or 1:1 Square before uploading.`
              );
              setMediaFile(null);
              setMediaPreview(null);
              setMediaDimensions(null);
              if (mediaInputRef.current) mediaInputRef.current.value = "";
              return;
            }

            if (ratio > 1.93) {
              setStepError(
                `⚠️ Instagram Framing Error: Your image is too wide (${w}×${h}px, horizontal ratio ${ratio.toFixed(2)}:1). Instagram feed only supports up to 1.91:1 Landscape. Ultra-wide/panorama photos will get cropped on the sides. Please crop your photo to 16:9 or 1:1 Square before uploading.`
              );
              setMediaFile(null);
              setMediaPreview(null);
              setMediaDimensions(null);
              if (mediaInputRef.current) mediaInputRef.current.value = "";
              return;
            }

            let label = "1:1 Square";
            if (Math.abs(ratio - 0.8) <= 0.08) label = "4:5 Portrait (Recommended)";
            else if (Math.abs(ratio - 1.0) <= 0.08) label = "1:1 Square (Recommended)";
            else if (ratio < 1.0) label = `${(h / w).toFixed(2)}:1 Vertical`;
            else if (Math.abs(ratio - 1.77) <= 0.1) label = "16:9 Landscape";
            else label = `${ratio.toFixed(2)}:1 Landscape`;

            setMediaDimensions({
              width: w,
              height: h,
              aspectRatio: ratio,
              ratioLabel: label,
              isValidForInstagram: true,
            });
          };
          img.src = resultUrl;
        }
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
      setMediaDimensions(null);
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

  if (configData && configData.isLive === false) {
    return (
      <div className={styles.successContainer}>
        <div
          className={styles.successCard}
          style={{
            borderColor: "rgba(245, 158, 11, 0.4)",
            background: "linear-gradient(135deg, rgba(254, 243, 199, 0.3) 0%, rgba(255, 255, 255, 0.95) 100%)",
          }}
        >
          <div className={styles.successIconWrap}>
            <Image
              src="/assets/giftsicon.png"
              alt="Showcase"
              width={130}
              height={130}
              className="floating"
            />
          </div>
          <div
            style={{
              display: "inline-block",
              background: "rgba(217, 119, 6, 0.15)",
              color: "#b45309",
              padding: "4px 14px",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            🔒 Submissions Concluded
          </div>
          <h3 className={styles.successTitle} style={{ color: "#78350f" }}>
            Registrations for {category.title} are Closed
          </h3>
          <p className={styles.successMessage} style={{ maxWidth: "560px", margin: "0 auto 24px" }}>
            The active registration phase for <strong>NAVMEDHA 2026</strong> has officially concluded. The portal is now in <strong>Showcase Mode</strong>. Thank you to all the enthusiastic participants!
          </p>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px dashed rgba(217, 119, 6, 0.35)",
              borderRadius: "12px",
              padding: "16px",
              margin: "16px auto 28px",
              maxWidth: "500px",
              textAlign: "left",
              fontSize: "0.88rem",
              color: "#451a03",
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>🌟 Already submitted your entry?</p>
            <p style={{ margin: 0, color: "#78350f", fontSize: "0.82rem", lineHeight: 1.5 }}>
              You can track your submission status, review your uploaded work, and check your official <strong>Certificate of Appreciation</strong> in your profile.
            </p>
          </div>

          <div
            className={styles.successActions}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}
          >
            <Link href="/#gallery" className="hero-btn" style={{ textDecoration: "none" }}>
              <span>Explore Showcase Gallery</span>
              <span>✦</span>
            </Link>
            <Link href="/profile" className="secondary-btn" style={{ textDecoration: "none" }}>
              <span>My Profile &amp; Certificates</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className={styles.formContainer}>
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

            {/* Instagram Framing Guidelines Notice for Photography & Artwork */}
            {(category.id === "photography" || category.id === "artworks") && (
              <div className={styles.framingNotice}>
                <div className={styles.framingNoticeHeader}>
                  <span className={styles.framingNoticeIcon}>📸</span>
                  <strong>Instagram Framing Guidelines (Feed Fit)</strong>
                </div>
                <p className={styles.framingNoticeText}>
                  To ensure your submission displays without being cropped or having its edges cut on our Instagram showcase:
                </p>
                <ul className={styles.framingList}>
                  <li>
                    <strong>Preferred Framing:</strong> <strong>4:5 Portrait</strong> (1080 × 1350 px) or <strong>1:1 Square</strong> (1080 × 1080 px).
                  </li>
                  <li>
                    <strong>Allowed Limits:</strong> Aspect ratio must be between <strong>4:5</strong> (vertical) and <strong>1.91:1</strong> (landscape).
                  </li>
                  <li>
                    <strong>⚠️ Disallowed:</strong> Full-screen <strong>9:16 mobile camera shots</strong> are rejected by the portal because Instagram crops and cuts the top & bottom. Please crop your photo to 4:5 or 1:1 before uploading.
                  </li>
                </ul>
              </div>
            )}
            
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
                    {mediaDimensions && (
                      <div className={styles.dimensionBadge}>
                        <Check size={13} />
                        <span>
                          {mediaDimensions.width} × {mediaDimensions.height} px • {mediaDimensions.ratioLabel} (Instagram Fit Verified)
                        </span>
                      </div>
                    )}
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
