/**
 * Navmedha API Service
 * Centralized HTTP client for interacting with the Eklavya backend.
 */

import { compressImageClient } from "./imageCompressor";

const PRIMARY_API = process.env.NEXT_PUBLIC_API_URL || "https://api.eklavyahithaldia.in";
const SECONDARY_API = process.env.NEXT_PUBLIC_API_URL_SECONDARY || "https://api2.eklavyahithaldia.in";

// In production, balance traffic across both Render instances (api & api2)
const API_NODES = (PRIMARY_API.includes("localhost") || PRIMARY_API.includes("127.0.0.1"))
  ? [PRIMARY_API]
  : [PRIMARY_API, SECONDARY_API];

let currentHostIndex = Math.floor(Math.random() * API_NODES.length);

function getNextApiHost(failedCurrent: boolean = false): string {
  if (failedCurrent && API_NODES.length > 1) {
    currentHostIndex = (currentHostIndex + 1) % API_NODES.length;
    console.warn(`[API Load Balancer] Failing over to healthy node: ${API_NODES[currentHostIndex]}`);
  }
  return API_NODES[currentHostIndex];
}

export interface NavmedhaConfigData {
  editionName: string;
  academicYear: string;
  isLive: boolean;
  startDate?: string;
  endDate?: string;
  isPaid: boolean;
  entryFee: number;
  upiId: string;
  upiQrImageUrl?: string;
  accountHolderName?: string;
  whatsappCommunityLink?: string;
  instagramPageHandle?: string;
  categories: {
    photography: boolean;
    artwork: boolean;
    writing: boolean;
    reels: boolean;
  };
  guidelines?: {
    photography?: string[];
    artwork?: string[];
    writing?: string[];
    reels?: string[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  url?: string; // Upload endpoints return url at top level
}

/**
 * Retrieve auth token from localStorage if user is authenticated
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("navmedha_token");
    if (raw) return raw;

    const userRaw = localStorage.getItem("navmedha_user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      return user.token || null;
    }
  } catch {}
  return null;
}

/**
 * Common fetch helper with credentials and headers
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // File uploads get a longer timeout (120s) since Cloudinary / Document uploads over mobile 4G can take time
  const isFileUpload = options.body instanceof FormData;
  const timeoutMs = isFileUpload ? 120_000 : 60_000;

  // Retry config: up to 3 retries across both server nodes (api and api2)
  const maxRetries = isFileUpload ? 3 : 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Pick current host or failover to the other node on retry
    const baseHost = getNextApiHost(attempt > 0);
    const url = `${baseHost}${endpoint}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        credentials: "omit",
        signal: controller.signal,
      });

      clearTimeout(timer);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // If server returned 502/503/504 (Render restarting), treat as retryable on other server
        if (res.status >= 502 && res.status <= 504 && attempt < maxRetries) {
          console.warn(`[API] Host ${baseHost} returned ${res.status}, failing over to backup node...`);
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        // Don't retry client errors (4xx) — they are intentional responses
        return {
          success: false,
          message: data?.message || `Request failed with status ${res.status}`,
          data: data?.data, // Forward entry details on 409 "already submitted" responses
        };
      }

      return data;
    } catch (err: any) {
      clearTimeout(timer);

      const isAbort = err?.name === "AbortError";
      const isNetworkError = err?.message === "Failed to fetch" || err?.message?.includes("NetworkError");
      const isRetryable = isAbort || isNetworkError;

      // If we have retries left AND it's a transient error, failover to next node and retry
      if (isRetryable && attempt < maxRetries) {
        // Backoff: 1.5s, 3s, 5s
        const backoffMs = attempt === 0 ? 1500 : (attempt === 1 ? 3000 : 5000);
        console.warn(`[API] Attempt ${attempt + 1} failed on ${baseHost} (${isAbort ? 'timeout' : 'network'}), failing over in ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      // Final attempt failed — return user-friendly message
      if (isAbort) {
        return {
          success: false,
          message: isFileUpload
            ? "Your upload timed out due to slow mobile internet. Please check your data connection, ensure the image is under 8 MB, and click submit again."
            : "Connection timed out. Please check your internet connection and try submitting again in a moment.",
        };
      }

      return {
        success: false,
        message: err?.message === "Failed to fetch"
          ? "Network connection issue detected. Please check your mobile internet or Wi-Fi and tap Submit again — your entered details are safe!"
          : (err?.message || "Server connection was interrupted. Please check your internet and tap Submit again."),
      };
    }
  }

  // Fallback (should never reach here)
  return { success: false, message: "Unexpected error. Please try again." };
}

// ─── NAVMEDHA API CALLS ──────────────────────────────────────────────────────

/**
 * Fetch live festival config (publicly accessible)
 */
export async function fetchNavmedhaConfig(): Promise<ApiResponse<NavmedhaConfigData>> {
  return fetchApi<NavmedhaConfigData>("/api/navmedha/config", {
    method: "GET",
    next: { revalidate: 60 } as any,
  });
}

/**
 * Upload payment receipt screenshot → Cloudinary
 */
export async function uploadPaymentReceipt(file: File): Promise<ApiResponse<{ url: string }>> {
  // Pre-compress payment screenshot so mobile camera uploads (often 3-10 MB) shrink to ~200-400 KB instantly
  const optimizedFile = await compressImageClient(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.8 });
  const formData = new FormData();
  formData.append("image", optimizedFile);

  return fetchApi<{ url: string }>("/api/upload/navmedha-payment", {
    method: "POST",
    body: formData,
  });
}

/**
 * Upload creative asset (photo / artwork / PDF) → Cloudinary
 */
export async function uploadCreativeAsset(file: File): Promise<ApiResponse<{ url: string }>> {
  // Pre-compress image files (Photography/Artworks) to fit under Meta limits and transmit within 1-2 seconds
  const optimizedFile = await compressImageClient(file, { maxWidth: 2048, maxHeight: 2048, quality: 0.85 });
  const formData = new FormData();
  formData.append("file", optimizedFile);

  return fetchApi<{ url: string }>("/api/upload/navmedha-media", {
    method: "POST",
    body: formData,
  });
}

/**
 * Upload reel video → Google Drive (via backend GDrive service)
 */
export async function uploadVideoToDrive(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append("video", file);

  return fetchApi<{ url: string }>("/api/upload/navmedha-video", {
    method: "POST",
    body: formData,
  });
}

/**
 * Submit Photography Entry
 */
export async function submitPhotoEntry(payload: any): Promise<ApiResponse<any>> {
  return fetchApi("/api/navmedha/submit/photo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Submit Artwork Entry
 */
export async function submitArtEntry(payload: any): Promise<ApiResponse<any>> {
  return fetchApi("/api/navmedha/submit/art", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Submit Writing Entry
 */
export async function submitWritingEntry(payload: any): Promise<ApiResponse<any>> {
  return fetchApi("/api/navmedha/submit/writing", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Submit Reel Entry
 */
export async function submitReelEntry(payload: any): Promise<ApiResponse<any>> {
  return fetchApi("/api/navmedha/submit/reel", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch My Submissions (requires auth)
 */
export async function fetchMySubmissions(): Promise<ApiResponse<any>> {
  return fetchApi("/api/navmedha/my-submissions", {
    method: "GET",
  });
}

/**
 * Fetch Current Authenticated User from Users collection
 */
export async function fetchCurrentUser(): Promise<ApiResponse<any>> {
  return fetchApi("/api/auth/me", {
    method: "GET",
  });
}

/**
 * Update User profile (academic details) directly on Users model
 */
export async function updateProfileOnServer(payload: {
  displayName?: string;
  department?: string;
  batch?: string;
  phone?: string;
  rollNumber?: string;
  college?: string;
}): Promise<ApiResponse<any>> {
  return fetchApi("/api/auth/update-profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Verify Google Credential token (in-app Google Sign In)
 */
export async function verifyGoogleCredential(credential: string): Promise<ApiResponse<any>> {
  return fetchApi("/api/auth/google/verify-credential", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

/**
 * Dev Helper: Sign in with Email & Password
 */
export async function loginWithEmailPassword(email: string, password: string): Promise<ApiResponse<any>> {
  return fetchApi("/api/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}


