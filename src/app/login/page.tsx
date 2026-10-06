"use client";

import { useState, useEffect } from "react";
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
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginStart, loginSuccess, loginFailure } from "@/redux/slices/authSlice";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<"google" | "details">("google");
  const [googleData, setGoogleData] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  const [academicDetails, setAcademicDetails] = useState({
    rollNumber: "",
    department: "",
    currentYear: "1st Year",
    mobileNumber: "",
    collegeName: "Heritage Institute of Technology",
  });

  const [formError, setFormError] = useState<string | null>(null);

  // If already logged in, redirect to profile
  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  }, [user, router]);

  // Simulate Google Login Popup / Auth Handshake
  const handleGoogleAuth = () => {
    dispatch(loginStart());
    
    // Simulate real Google account OAuth popup
    setTimeout(() => {
      const mockGoogleAccount = {
        name: "Debolina Banerjee",
        email: "debolina.banerjee2026@gmail.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };
      setGoogleData(mockGoogleAccount);
      setStep("details");
    }, 900);
  };

  const handleFinalRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!academicDetails.rollNumber.trim()) {
      setFormError("Please enter your College / University Roll Number.");
      return;
    }
    if (!academicDetails.department.trim()) {
      setFormError("Please specify your Department / Stream (e.g. Computer Science, Arts, etc.)");
      return;
    }
    if (!academicDetails.mobileNumber.trim() || academicDetails.mobileNumber.length < 10) {
      setFormError("Please enter a valid 10-digit Mobile Number for WhatsApp & SMS updates.");
      return;
    }

    const fullProfile = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: googleData.name || "Festival Participant",
      email: googleData.email || "participant@navmedha.org",
      avatar: googleData.avatar,
      rollNumber: academicDetails.rollNumber,
      department: academicDetails.department,
      currentYear: academicDetails.currentYear,
      mobileNumber: academicDetails.mobileNumber,
      collegeName: academicDetails.collegeName,
      isAuthenticated: true,
    };

    dispatch(loginSuccess(fullProfile));
    router.push("/profile");
  };

  return (
    <main className={styles.loginPage}>
      <Navbar />

      <section className={styles.loginSection}>
        <div className={styles.loginContainer}>
          <div className={styles.cardHeaderArea}>
            <div className={styles.brandBadge}>
              <Image
                src="/assets/eklavyaicon.png"
                alt="Eklavya Logo"
                width={30}
                height={30}
              />
              <span>Eklavya Official ✕ NAVMEDHA</span>
            </div>
            <h1 className={styles.loginTitle}>Participant Portal</h1>
            <p className={styles.loginSubtitle}>
              Sign in to manage your submissions, track approval status, and claim your QR-verified Certificate of Appreciation.
            </p>
          </div>

          <div className={styles.loginCard}>
            {/* STEP 1: GOOGLE LOGIN */}
            {step === "google" && (
              <div className={styles.googleStep}>
                <div className={styles.festiveIconWrap}>
                  <Image
                    src="/assets/Loading icon.png"
                    alt="Festive Icon"
                    width={90}
                    height={90}
                    className="floating"
                  />
                </div>

                <div className={styles.stepTitleBox}>
                  <h2>Fast & Secure Access</h2>
                  <p>Continue with your Google account to get started</p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className={styles.googleBtn}
                >
                  <svg className={styles.googleSvg} viewBox="0 0 24 24" width="22" height="22">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>

                <div className={styles.benefitsList}>
                  <div className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>Instant MAR Points and Certificate synchronization</span>
                  </div>
                  <div className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>Live submission tracking & payment receipt record</span>
                  </div>
                  <div className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>Access to downloadable Sharadotsav Certificate</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: STUDENT & BASIC INFO FORM */}
            {step === "details" && (
              <form className={styles.detailsForm} onSubmit={handleFinalRegistration}>
                <div className={styles.verifiedGoogleHeader}>
                  <div className={styles.userBadge}>
                    <div className={styles.userAvatar}>
                      {googleData.name.charAt(0)}
                    </div>
                    <div className={styles.userMeta}>
                      <strong>{googleData.name}</strong>
                      <span>{googleData.email}</span>
                    </div>
                  </div>
                  <div className={styles.verifiedTag}>
                    <ShieldCheck size={14} />
                    <span>Google Verified</span>
                  </div>
                </div>

                <div className={styles.formPrompt}>
                  <h3>Complete Your Academic & Contact Profile</h3>
                  <p>This information is required for official Certificate generation & MAR points accrediting.</p>
                </div>

                {formError && (
                  <div className={styles.errorAlert}>
                    ⚠️ {formError}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>
                    <User size={16} /> Full Name (As in Official Records) *
                  </label>
                  <input
                    type="text"
                    value={googleData.name}
                    onChange={(e) => setGoogleData({ ...googleData, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <Hash size={16} /> Roll / Student ID No *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12621001045"
                      value={academicDetails.rollNumber}
                      onChange={(e) => setAcademicDetails({ ...academicDetails, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <Phone size={16} /> Mobile / WhatsApp No *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={academicDetails.mobileNumber}
                      onChange={(e) => setAcademicDetails({ ...academicDetails, mobileNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <Building2 size={16} /> Department / Stream *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engg."
                      value={academicDetails.department}
                      onChange={(e) => setAcademicDetails({ ...academicDetails, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <Calendar size={16} /> Current Studying Year *
                    </label>
                    <select
                      value={academicDetails.currentYear}
                      onChange={(e) => setAcademicDetails({ ...academicDetails, currentYear: e.target.value })}
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Postgraduate">Postgraduate / Masters</option>
                      <option value="School / General">School / General Public</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <GraduationCap size={16} /> College / University / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Heritage Institute of Technology / MAKAUT"
                    value={academicDetails.collegeName}
                    onChange={(e) => setAcademicDetails({ ...academicDetails, collegeName: e.target.value })}
                  />
                </div>

                <button type="submit" className="hero-btn" style={{ width: "100%", marginTop: "10px" }}>
                  <span>Save Profile & Enter Portal</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
