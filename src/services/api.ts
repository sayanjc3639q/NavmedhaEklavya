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

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "omit",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || `Request failed with status ${res.status}`,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error. Please check your internet connection.",
    };
  }
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

  return fetchApi<{ url: string }>("/api/upload/payment", {
    method: "POST",
    body: formData,
  });
}

/**
 * Upload creative asset (photo / artwork / PDF)
 */
export async function uploadCreativeAsset(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append("image", file);

  return fetchApi<{ url: string }>("/api/upload/donation-proof", {
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
