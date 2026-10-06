import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rollNumber: string;
  department: string;
  currentYear: string; // "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "Postgraduate" | "Other"
  mobileNumber: string;
  collegeName?: string;
  isAuthenticated: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("navmedha_user");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("navmedha_user", JSON.stringify(action.payload));
        } catch {}
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("navmedha_user", JSON.stringify(state.user));
          } catch {}
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("navmedha_user");
        } catch {}
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, updateProfile, logout } = authSlice.actions;

export default authSlice.reducer;
