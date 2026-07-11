import { configureStore, type EnhancedStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store: EnhancedStore = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;