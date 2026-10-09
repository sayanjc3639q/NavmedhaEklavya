"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess } from "@/redux/slices/authSlice";
import { fetchCurrentUser } from "@/services/api";

function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [statusText, setStatusText] = useState("Securing festival session...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/login?error=no_token");
      return;
    }

    localStorage.setItem("navmedha_token", token);
    setStatusText("Fetching your Eklavya profile...");

    fetchCurrentUser().then((res) => {
      if (res.success && res.data) {
        const u = res.data;
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
            token: token,
            isAuthenticated: true,
          })
        );

        // If academic details are missing, send them to fill academic details
        const redirectParam = searchParams.get("redirect");
        const nextUrl = redirectParam || "/profile";
        if (!u.rollNumber || !u.phone) {
          router.push(`/login?step=details${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ""}`);
        } else {
          router.push(nextUrl);
        }
      } else {
        router.push("/login?error=fetch_failed");
      }
    });
  }, [searchParams, router, dispatch]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-parchment, #fcf8f0)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "400px", padding: "40px", borderRadius: "24px", background: "rgba(255, 255, 255, 0.9)", boxShadow: "0 10px 40px rgba(180, 83, 9, 0.12)" }}>
        <div style={{ marginBottom: "20px" }}>
          <Image
            src="/assets/Loading icon.png"
            alt="Loading"
            width={90}
            height={90}
            className="floating"
          />
        </div>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", color: "#78350f", marginBottom: "8px", fontSize: "1.3rem" }}>
          Connecting to Eklavya...
        </h3>
        <p style={{ color: "#78350f", opacity: 0.8, fontSize: "0.95rem" }}>{statusText}</p>
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fcf8f0",
          }}
        >
          <p style={{ color: "#78350f" }}>Authenticating with Eklavya Server...</p>
        </div>
      }
    >
      <OAuthHandler />
    </Suspense>
  );
}
