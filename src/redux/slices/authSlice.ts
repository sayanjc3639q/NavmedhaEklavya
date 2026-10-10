import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchCurrentUser, updateProfileOnServer } from "@/services/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rollNumber: string;
  department: string;
  currentYear: string;
  mobileNumber: string;
  collegeName?: string;
  role?: string;
  token?: string;
  isAuthenticated: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("navmedha_token");
    if (!token) return null;

    const res = await fetchCurrentUser();
    if (res.success && res.data) {
      const u = res.data;
      const profile: UserProfile = {
        id: u._id,
        name: u.displayName || u.name,
        email: u.email,
        avatar: u.profilePic || u.photo || "",
        rollNumber: u.rollNumber || "",
        department: u.department || "",
        currentYear: u.batch || "1st Year",
        mobileNumber: u.phone || "",
        collegeName: u.college || "Haldia Institute of Technology",
        role: u.role || "user",
        token: token,
        isAuthenticated: true,
      };
      return profile;
    }
    return rejectWithValue(res.message || "Session expired");
  }
);

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("navmedha_user");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
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
          if (action.payload.token) {
            localStorage.setItem("navmedha_token", action.payload.token);
          }
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
          localStorage.removeItem("navmedha_token");
          localStorage.removeItem("navmedha_submissions");
        } catch {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("navmedha_user", JSON.stringify(action.payload));
            } catch {}
          }
        }
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.isLoading = false;
        // token expired or invalid
        state.user = null;
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("navmedha_token");
            localStorage.removeItem("navmedha_user");
          } catch {}
        }
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, updateProfile, logout } = authSlice.actions;

export default authSlice.reducer;
