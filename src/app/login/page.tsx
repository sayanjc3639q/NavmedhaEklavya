"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Phone, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Hash, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginStart, updateProfile } from "@/redux/slices/authSlice";
import { updateProfileOnServer } from "@/services/api";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { Footer } from "@/components/layout/Footer/Footer";
import styles from "./page.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const initialStep = searchParams.get("step") === "details" || (user && (!user.rollNumber || !user.mobileNumber))
    ? "details"
    : "google";

  const [step, setStep] = useState<"google" | "details">(initialStep);
  const [isSaving, setIsSaving] = useState(false);

  /*
  // Dev email/password login state (Commented out for production)
  const [authMode, setAuthMode] = useState<"google" | "email">("google");
  const [devEmail, setDevEmail] = useState("");
  const [devPassword, setDevPassword] = useState("");
  const [devLoginLoading, setDevLoginLoading] = useState(false);
  */

  const [googleData, setGoogleData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  const [academicDetails, setAcademicDetails] = useState({
    rollNumber: user?.rollNumber || "",
    department: user?.department || "",
    currentYear: user?.currentYear || "1st Year",
    mobileNumber: user?.mobileNumber || "",
    collegeName: user?.collegeName || "Heritage Institute of Technology",
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Sync Google user if logged in
  useEffect(() => {
    if (user) {
      setGoogleData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      });
      setAcademicDetails((prev) => ({
        ...prev,
        rollNumber: user.rollNumber || prev.rollNumber,
        department: user.department || prev.department,
        currentYear: user.currentYear || prev.currentYear,
        mobileNumber: user.mobileNumber || prev.mobileNumber,
        collegeName: user.collegeName || prev.collegeName,
      }));

      // If user already has rollNumber and mobileNumber, send directly to profile
      if (user.rollNumber && user.mobileNumber && searchParams.get("step") !== "details") {
        router.push("/profile");
      } else {
        setStep("details");
      }
    }
  }, [user, router, searchParams]);

  // Real Google Login Flow (Hits backend Google OAuth with returnTo)
  const handleGoogleAuth = () => {
    dispatch(loginStart());
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const returnTo = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    window.location.href = `${apiBase}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  /*
  // Dev Email & Password Login Handler (Commented out for production)
  const handleDevEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setDevLoginLoading(true);

    try {
      const res = await loginWithEmailPassword(devEmail, devPassword);
      if (res.success && res.token) {
        localStorage.setItem("navmedha_token", res.token);
        const userRes = await fetchCurrentUser();
        if (userRes.success && userRes.data) {
          const u = userRes.data;
          dispatch(
            loginSuccess({
              id: u._id,
              name: u.displayName || u.name,
              email: u.email,
              avatar: u.profilePic || u.photo || "",
              rollNumber: u.rollNumber || "",
              department: u.department || "",
              currentYear: u.batch || "1st Year",
              mobileNumber: u.phone || "",
              collegeName: u.college || "Heritage Institute of Technology",
              role: u.role || "user",
              token: res.token,
              isAuthenticated: true,
            })
          );

          if (!u.rollNumber || !u.phone) {
            setStep("details");
          } else {
            router.push("/profile");
          }
        } else {
          router.push("/profile");
        }
      } else {
        setFormError(res.message || "Invalid email or password");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to sign in with email");
    } finally {
      setDevLoginLoading(false);
    }
  };
  */

  const handleFinalRegistration = async (e: React.FormEvent) => {
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

    setIsSaving(true);

    try {
      // Write directly to the original central Users collection
      const res = await updateProfileOnServer({
        displayName: googleData.name,
        rollNumber: academicDetails.rollNumber,
        department: academicDetails.department,
        batch: academicDetails.currentYear,
        phone: academicDetails.mobileNumber,
        college: academicDetails.collegeName,
      });

      if (res.success) {
        dispatch(
          updateProfile({
            rollNumber: academicDetails.rollNumber,
            department: academicDetails.department,
            currentYear: academicDetails.currentYear,
            mobileNumber: academicDetails.mobileNumber,
            collegeName: academicDetails.collegeName,
          })
        );
        router.push("/profile");
      } else {
        setFormError(res.message || "Failed to save profile to central server");
      }
    } catch (err: any) {
      setFormError(err.message || "Network error while saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.loginCard}>
      {/* STEP 1: AUTHENTICATION (GOOGLE / DEV EMAIL) */}
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
            <h2>Festival Portal Access</h2>
            <p>Sign in with your Eklavya credentials to continue</p>
          </div>

          {formError && (
            <div className={styles.errorAlert} style={{ width: "100%" }}>
              ⚠️ {formError}
            </div>
          )}

          {/* Google Auth — Primary Production Login */}
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
            <span>{isLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
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

      {/* STEP 2: STUDENT & ACADEMIC INFO FORM */}
      {step === "details" && (
        <form className={styles.detailsForm} onSubmit={handleFinalRegistration}>
          <div className={styles.verifiedGoogleHeader}>
            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                {googleData.name ? googleData.name.charAt(0) : "U"}
              </div>
              <div className={styles.userMeta}>
                <strong>{googleData.name || "Fest Participant"}</strong>
                <span>{googleData.email}</span>
              </div>
            </div>
            <div className={styles.verifiedTag}>
              <ShieldCheck size={14} />
              <span>Account Verified</span>
            </div>
          </div>

          <div className={styles.formPrompt}>
            <h3>Complete Your Academic &amp; Contact Profile</h3>
            <p>This information is stored on your central Eklavya profile for MAR points and certificate records.</p>
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
                placeholder="e.g. CSE, IT, ECE, Other"
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
              placeholder="e.g. Heritage Institute of Technology"
              value={academicDetails.collegeName}
              onChange={(e) => setAcademicDetails({ ...academicDetails, collegeName: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="hero-btn"
            style={{ width: "100%", marginTop: "10px", opacity: isSaving ? 0.7 : 1 }}
          >
            <span>{isSaving ? "Saving to Central Server..." : "Save Profile & Enter Portal"}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
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
              Sign in with your central Eklavya account to submit entries, track status, and receive certificates.
            </p>
          </div>

          <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading portal...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
