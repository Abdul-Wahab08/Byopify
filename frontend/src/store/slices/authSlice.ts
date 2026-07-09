import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/types";

interface AuthState {
    userData: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    userData: null,
    isAuthenticated: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.userData = action.payload;
            state.isAuthenticated = true
        },
        logout: (state) => {
            state.userData = null;
            state.isAuthenticated = false
        }
    }

})

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;