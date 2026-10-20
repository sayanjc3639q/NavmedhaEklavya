/**
 * Navmedha API Service
 * Centralized HTTP client for interacting with the Eklavya backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const url = `${API_BASE}${endpoint}`;
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

  // Retry config: up to 3 retries for transient failures (Render restarts, mobile packet drops)
  const maxRetries = isFileUpload ? 3 : 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
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

      // If we have retries left AND it's a transient error, wait and retry
      if (isRetryable && attempt < maxRetries) {
        // Backoff: 2s, 4s, 7s
        const backoffMs = attempt === 0 ? 2000 : (attempt === 1 ? 4000 : 7000);
        console.warn(`[API] Attempt ${attempt + 1} failed (${isAbort ? 'timeout' : 'network'}), retrying in ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      // Final attempt failed — return user-friendly message
      if (isAbort) {
        return {
          success: false,
          message: isFileUpload
            ? "Server is currently experiencing a huge rush of submissions and your upload timed out. Please don't worry — keep your details ready and try submitting again after 15-20 minutes."
            : "Server is experiencing high traffic right now. Please wait 15-20 minutes and try submitting again.",
        };
      }

      return {
        success: false,
        message: err?.message === "Failed to fetch"
          ? "Our submission server is currently experiencing heavy participant rush and high traffic. Please don't worry — your details are safe. Please wait 15-20 minutes and try submitting again!"
          : (err?.message || "Server is experiencing heavy registration traffic. Please try submitting again after 15-20 minutes."),
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
 * Upload payment screenshot
 */
export async function uploadPaymentReceipt(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append("image", file);

  return fetchApi<{ url: string }>("/api/upload/navmedha-payment", {
    method: "POST",
    body: formData,
  });
}

/**
 * Upload creative asset (photo / artwork / PDF) → Cloudinary
 */
export async function uploadCreativeAsset(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append("file", file);

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


