import { configureStore } from "@reduxjs/toolkit";
import submissionReducer from "./slices/submissionSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    submission: submissionReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
