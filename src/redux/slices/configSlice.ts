import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchNavmedhaConfig, NavmedhaConfigData } from "@/services/api";

export const getLiveConfig = createAsyncThunk(
  "config/getLiveConfig",
  async (_, { rejectWithValue }) => {
    const res = await fetchNavmedhaConfig();
    if (res.success && res.data) {
      return res.data;
    }
    return rejectWithValue(res.message || "Failed to load live config");
  }
);

interface ConfigState {
  data: NavmedhaConfigData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  data: {
    editionName: "NAVMEDHA 2026",
    academicYear: "2026-2027",
    isLive: true,
    isPaid: true,
    entryFee: 9,
    upiId: "eklavyanavadya@upi",
    accountHolderName: "Eklavya Official",
    whatsappCommunityLink: "https://chat.whatsapp.com/eklavya",
    instagramPageHandle: "navmedha3.0",
    categories: {
      photography: true,
      artwork: true,
      writing: true,
      reels: true,
    },
  },
  isLoading: false,
  error: null,
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<NavmedhaConfigData>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLiveConfig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLiveConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getLiveConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
