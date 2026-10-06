import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SubmissionPayload {
  category: "reels" | "photography" | "content" | "artworks";
  fullName: string;
  email: string;
  phone: string;
  instagramHandle: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileDataUrl?: string;
  paymentScreenshotName: string;
  paymentScreenshotDataUrl?: string;
  transactionId: string;
  followedEklavya: boolean;
  agreeToRules: boolean;
  userId?: string;
}

export interface SubmissionItem extends SubmissionPayload {
  id: string;
  submittedAt: string;
  status: "Under Review" | "Verified" | "Featured";
  certificateAvailable: boolean;
}

interface SubmissionState {
  submissions: SubmissionItem[];
  isSubmitting: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

const getInitialSubmissions = (): SubmissionItem[] => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("navmedha_submissions");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }
  return [];
};

const initialState: SubmissionState = {
  submissions: getInitialSubmissions(),
  isSubmitting: false,
  successMessage: null,
  errorMessage: null,
};

export const submissionSlice = createSlice({
  name: "submission",
  initialState,
  reducers: {
    submitStart: (state) => {
      state.isSubmitting = true;
      state.successMessage = null;
      state.errorMessage = null;
    },
    submitSuccess: (state, action: PayloadAction<SubmissionPayload>) => {
      state.isSubmitting = false;
      const newEntry: SubmissionItem = {
        ...action.payload,
        id: `NM-${Date.now().toString().slice(-6)}`,
        submittedAt: new Date().toISOString(),
        status: "Under Review",
        certificateAvailable: false,
      };
      state.submissions.unshift(newEntry);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("navmedha_submissions", JSON.stringify(state.submissions));
        } catch {}
      }
      state.successMessage = "Your submission has been successfully received for NAVMEDHA 2026!";
    },
    submitFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false;
      state.errorMessage = action.payload;
    },
    resetSubmissionStatus: (state) => {
      state.successMessage = null;
      state.errorMessage = null;
      state.isSubmitting = false;
    },
  },
});

export const {
  submitStart,
  submitSuccess,
  submitFailure,
  resetSubmissionStatus,
} = submissionSlice.actions;

export default submissionSlice.reducer;
