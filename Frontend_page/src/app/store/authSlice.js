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
  active_role: initialUser?.active_role || localStorage.getItem("active_role") || sessionStorage.getItem("active_role") || "user",
  role: initialUser?.active_role || localStorage.getItem("active_role") || "user",
  isAuthenticated: Boolean(initialUser),
  loading: Boolean(initialUser), // Start loading if a previous session exists so routes await token refresh
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, accessToken, role, active_role } = action.payload || {};
      const validToken = accessToken || token;
      
      if (validToken && !validToken.includes("authenticated-user-token")) {
        state.accessToken = validToken;
        state.isAuthenticated = true;
        // Clean up legacy persistent tokens from storage to enforce in-memory security
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      }

      // If a role or active_role is passed (e.g. during workspace switch), immediately sync it
      if (active_role || role) {
        const cleanRole = String(active_role || role).toLowerCase();
        state.active_role = cleanRole;
        state.role = cleanRole;
        if (state.user) {
          state.user = { ...state.user, active_role: cleanRole };
        }
        localStorage.setItem("active_role", cleanRole);
        sessionStorage.setItem("active_role", cleanRole);
        localStorage.setItem("role", cleanRole);
        sessionStorage.setItem("role", cleanRole);
      }
      
      if (user) {
        state.user = { ...state.user, ...user };
        const currentActiveRole = active_role || role || user.active_role || (user.roles && user.roles[0]) || state.active_role || "user";
        state.active_role = String(currentActiveRole).toLowerCase();
        state.role = state.active_role;
        state.user.active_role = state.active_role;
        
        localStorage.setItem("user", JSON.stringify(state.user));
        sessionStorage.setItem("user", JSON.stringify(state.user));

        if (user.id) {
          localStorage.setItem("id", user.id);
          sessionStorage.setItem("id", user.id);
          localStorage.setItem("userId", user.id);
          sessionStorage.setItem("userId", user.id);
        }
        if (currentActiveRole) {
          localStorage.setItem("role", state.role);
          sessionStorage.setItem("role", state.role);
          localStorage.setItem("userRole", state.role);
          sessionStorage.setItem("userRole", state.role);
        }
        if (Array.isArray(user.roles)) {
          localStorage.setItem("roles", JSON.stringify(user.roles));
          sessionStorage.setItem("roles", JSON.stringify(user.roles));
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

