import { createSlice } from "@reduxjs/toolkit";

const getStoredUser = () => {
  try {
    const u = localStorage.getItem("user") || sessionStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();

const initialState = {
  user: initialUser,
  accessToken: null, // Purely in-memory access token (XSS safe)
  role: initialUser?.role || localStorage.getItem("role") || sessionStorage.getItem("role") || null,
  isAuthenticated: Boolean(initialUser),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, accessToken, role } = action.payload || {};
      const validToken = accessToken || token;
      
      if (validToken && !validToken.includes("authenticated-user-token")) {
        state.accessToken = validToken;
        state.isAuthenticated = true;
        // Clean up legacy persistent tokens from storage to enforce in-memory security
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      }
      
      if (user) {
        state.user = user;
        state.role = user.role || role || state.role;
        
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("user", JSON.stringify(user));

        if (user.id) {
          localStorage.setItem("id", user.id);
          sessionStorage.setItem("id", user.id);
          localStorage.setItem("userId", user.id);
          sessionStorage.setItem("userId", user.id);
        }
        if (user.role) {
          localStorage.setItem("role", user.role);
          sessionStorage.setItem("role", user.role);
          localStorage.setItem("userRole", user.role);
          sessionStorage.setItem("userRole", user.role);
        }
        if (user.name) {
          localStorage.setItem("name", user.name);
          sessionStorage.setItem("name", user.name);
          localStorage.setItem("userName", user.name);
          sessionStorage.setItem("userName", user.name);
        }
      }
      
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Preserve rememberedEmail if present
      const rememberedEmail = localStorage.getItem("rememberedEmail");
      const rememberedRememberMe = localStorage.getItem("rememberMe");

      localStorage.clear();
      sessionStorage.clear();

      if (rememberedEmail) localStorage.setItem("rememberedEmail", rememberedEmail);
      if (rememberedRememberMe) localStorage.setItem("rememberMe", rememberedRememberMe);
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;

